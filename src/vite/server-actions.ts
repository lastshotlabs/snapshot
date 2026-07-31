// snapshot/src/vite/server-actions.ts
// Vite plugin that transforms files containing a top-level 'use server' directive.
//
// Server build (isSsrBuild): leaves the file unchanged — server functions execute
//   with their real implementations.
// Client build: replaces each exported function with a stub that calls
//   __callServerAction__ at runtime, routing the invocation to the server over HTTP.

import path from "node:path";
import type { Plugin } from "vite";

// ─── AST-free export scanner ──────────────────────────────────────────────────
// We avoid pulling in a full parser (acorn/babel) as a hard dependency.
// The scanner handles the common patterns emitted by TypeScript:
//   export async function foo(...)
//   export function foo(...)
//   export const foo = async (...) =>
// Arrow function exports are less common in server action files (they are written
// by app authors who tend to write `export async function`), but we handle both.

const EXPORT_FUNCTION_RE =
  /^export\s+(?:async\s+)?function\s+([\w$]+)\s*[(<]/gm;

const EXPORT_CONST_ARROW_RE =
  /^export\s+const\s+([\w$]+)\s*=\s*(?:async\s*)?\(/gm;

/**
 * Extract all exported function names from source code.
 * Uses regex scanning — sufficient for `'use server'` files which should
 * contain only exported pure functions.
 *
 * @internal
 */
function extractExportedFunctions(code: string): string[] {
  const names = new Set<string>();

  let m: RegExpExecArray | null;

  EXPORT_FUNCTION_RE.lastIndex = 0;
  while ((m = EXPORT_FUNCTION_RE.exec(code)) !== null) {
    if (m[1]) names.add(m[1]);
  }

  EXPORT_CONST_ARROW_RE.lastIndex = 0;
  while ((m = EXPORT_CONST_ARROW_RE.exec(code)) !== null) {
    if (m[1]) names.add(m[1]);
  }

  return Array.from(names);
}

// ─── Module name inference ────────────────────────────────────────────────────

/**
 * Infer the module name from the file path.
 *
 * The module name is the path of the file relative to the project root,
 * without its extension. Forward slashes are used regardless of platform.
 *
 * Examples:
 *   `/project/server/actions/posts.ts`  → `server/actions/posts`
 *   `/project/server/actions/users.ts`  → `server/actions/users`
 *
 * @internal
 */
function inferModuleName(fileId: string, projectRoot: string): string {
  const rel = path.relative(projectRoot, fileId);
  // Strip extension.
  const withoutExt = rel.replace(/\.[^.]+$/, "");
  // Normalise to forward slashes.
  return withoutExt.replace(/\\/g, "/");
}

// ─── Client stub generator ────────────────────────────────────────────────────

/**
 * Generate the client-side module that replaces a `'use server'` file.
 *
 * Each exported function becomes a stub that forwards the call to the server
 * via `__callServerAction__`.
 *
 * @internal
 */
function buildClientStub(exportNames: string[], moduleName: string): string {
  const stubs = exportNames
    .map(
      (name) =>
        `export async function ${name}(...args) {\n` +
        `  return __callServerAction__(${JSON.stringify(name)}, ${JSON.stringify(moduleName)}, args);\n` +
        `}`,
    )
    .join("\n\n");

  return [
    `import { __callServerAction__ } from '@lastshotlabs/snapshot/ssr';`,
    "",
    stubs,
  ].join("\n");
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

/**
 * Vite plugin that transforms files marked with the `'use server'` directive.
 *
 * **Server build** (`isSsrBuild: true`): the original module is left unchanged
 * so server functions execute with their real implementations.
 *
 * **Client build**: each exported function is replaced with a lightweight stub
 * that calls `__callServerAction__()` at runtime. The full server-side code is
 * never included in the client bundle.
 *
 * The module name embedded in the stub is inferred from the file path relative
 * to the Vite project root. It must match the module name registered in
 * `slingshot-ssr`'s server action registry.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { snapshotSsr } from '@lastshotlabs/snapshot/vite'
 *
 * export default defineConfig({
 *   plugins: [snapshotSsr()], // serverActionsTransform() is included automatically
 * })
 * ```
 *
 * @returns A Vite `Plugin` object.
 */
export function serverActionsTransform(): Plugin {
  let projectRoot = process.cwd();
  let isSsrBuild = false;

  return {
    name: "snapshot-server-actions",

    configResolved(resolvedConfig) {
      projectRoot = resolvedConfig.root;
      // `build.ssr` is truthy for `vite build --ssr` invocations.
      // It can be a boolean or a string entry point — any truthy value means SSR build.
      isSsrBuild = !!resolvedConfig.build?.ssr;
    },

    transform(code: string, id: string) {
      // Only transform TypeScript/JavaScript source files.
      if (!/\.[cm]?[jt]sx?$/.test(id)) return null;
      // Virtual modules and node_modules are excluded.
      if (id.includes("\0") || id.includes("/node_modules/")) return null;

      // Check for 'use server' directive at the top of the file.
      // The directive must appear before any other code (only comments/whitespace allowed before it).
      const trimmed = code.trimStart();
      const hasDirective =
        trimmed.startsWith("'use server'") ||
        trimmed.startsWith('"use server"');

      if (!hasDirective) return null;

      // Server build: keep the original source unchanged.
      if (isSsrBuild) return null;

      // Client build: replace all exported functions with stubs.
      const exportNames = extractExportedFunctions(code);
      if (exportNames.length === 0) {
        // Nothing to stub — return an empty module to avoid bundling server code.
        return {
          code: `// 'use server' — no exported functions found`,
          map: null,
        };
      }

      const moduleName = inferModuleName(id, projectRoot);
      const stubCode = buildClientStub(exportNames, moduleName);

      return {
        code: stubCode,
        map: null, // No source map — the generated code has no meaningful source positions.
      };
    },
  };
}
