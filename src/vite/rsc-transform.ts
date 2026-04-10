// snapshot/src/vite/rsc-transform.ts
// Vite plugin that handles React Server Component boundaries.
//
// 'use client' in a server build → replace module with a client reference stub.
// 'use client' in a client build → leave the module unchanged (ships to browser).
//
// Manifest generation (generateBundle, server build only):
//   Collects all files that had 'use client' and maps their exports to chunk names.
//   The result is written to rsc-manifest.json in the output directory.

import path from 'node:path';
import type { Plugin } from 'vite';
import {
  buildComponentId,
  hasUseClientDirective,
} from '../ssr/rsc';

// ─── AST-free export scanner ──────────────────────────────────────────────────
// Reuses the same pattern as server-actions.ts — regex scanning over the common
// export forms emitted by TypeScript. Full parser not required here because
// 'use client' files should contain only component exports.

const EXPORT_FUNCTION_RE = /^export\s+(?:async\s+)?function\s+([\w$]+)\s*[(<]/gm;
const EXPORT_CONST_RE = /^export\s+const\s+([\w$]+)\s*/gm;
const EXPORT_CLASS_RE = /^export\s+(?:abstract\s+)?class\s+([\w$]+)\s*[{<(]/gm;
const EXPORT_DEFAULT_RE = /^export\s+default\s+/m;

interface OutputChunkShape {
  type: 'chunk';
  facadeModuleId?: string | null;
  moduleIds: string[];
  fileName: string;
  code: string;
}

interface OutputAssetShape {
  type: 'asset';
}

type OutputBundleShape = Record<string, OutputChunkShape | OutputAssetShape>;

/**
 * Collect all named exports from a source file.
 * Includes function declarations, const declarations, and class declarations.
 *
 * @internal
 */
function extractNamedExports(code: string): string[] {
  const names = new Set<string>();

  let m: RegExpExecArray | null;

  EXPORT_FUNCTION_RE.lastIndex = 0;
  while ((m = EXPORT_FUNCTION_RE.exec(code)) !== null) {
    if (m[1]) names.add(m[1]);
  }

  EXPORT_CONST_RE.lastIndex = 0;
  while ((m = EXPORT_CONST_RE.exec(code)) !== null) {
    if (m[1]) names.add(m[1]);
  }

  EXPORT_CLASS_RE.lastIndex = 0;
  while ((m = EXPORT_CLASS_RE.exec(code)) !== null) {
    if (m[1]) names.add(m[1]);
  }

  return Array.from(names);
}

// ─── Chunk URL resolver ───────────────────────────────────────────────────────

/**
 * Given a file ID and the Rollup output bundle, return the file name of the
 * output chunk that was generated for this module.
 *
 * @internal
 */
function resolveChunkFileName(
  fileId: string,
  bundle: OutputBundleShape,
): string | undefined {
  for (const output of Object.values(bundle)) {
    if (output.type !== 'chunk') continue;
    if (
      output.facadeModuleId === fileId ||
      output.moduleIds.includes(fileId)
    ) {
      return output.fileName;
    }
  }
  return undefined;
}

// ─── Relative path helpers ────────────────────────────────────────────────────

/**
 * Convert an absolute file ID to a project-root-relative forward-slash path.
 * If the file is not under the project root, returns the absolute path as-is.
 *
 * @internal
 */
function toRelativePath(fileId: string, projectRoot: string): string {
  const rel = path.relative(projectRoot, fileId);
  return rel.replace(/\\/g, '/');
}

// ─── Server-side client reference stub ───────────────────────────────────────

/**
 * Generate a server-side stub for a `'use client'` module.
 *
 * Each export is replaced with a `createClientReference()` call so the server
 * knows to serialize this component as a client reference in the RSC flight
 * payload rather than rendering it inline.
 *
 * @internal
 */
function buildServerStub(
  relativePath: string,
  namedExports: string[],
  hasDefault: boolean,
): string {
  const lines: string[] = [
    `// Auto-generated RSC server stub — do not edit.`,
    `// Source: ${relativePath}`,
    `import { createClientReference } from 'react-server-dom-webpack/server';`,
    '',
  ];

  for (const name of namedExports) {
    const id = buildComponentId(relativePath, name);
    lines.push(`export const ${name} = createClientReference(${JSON.stringify(id)});`);
  }

  if (hasDefault) {
    const id = buildComponentId(relativePath, 'default');
    lines.push(`export default createClientReference(${JSON.stringify(id)});`);
  }

  return lines.join('\n');
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

/**
 * Vite plugin that handles `'use client'` directive boundaries for RSC.
 *
 * **Server builds** (`isSsrBuild: true`, `react-server` export condition):
 * - Files containing `'use client'` are replaced with a lightweight stub that
 *   calls `createClientReference()` from `react-server-dom-webpack/server` for
 *   each export. The server bundle never contains the real component code.
 *
 * **Client builds** (`isSsrBuild: false`):
 * - Files containing `'use client'` are left unchanged. The real component code
 *   ships to the browser and hydrates normally.
 *
 * **RSC manifest** (server build, `generateBundle` hook):
 * - After the server bundle is assembled, all files that were transformed are
 *   mapped to their output chunk URLs and written as `rsc-manifest.json` to the
 *   server output directory. The snapshot SSR middleware loads this manifest and
 *   passes it to `renderPage()` via `RscOptions`.
 *
 * @returns A Vite `Plugin` object. Add via `snapshotSsr({ rsc: true })`.
 */
export function rscTransform(): Plugin {
  // Closure-owned state — not module-level. Rule 7.
  let projectRoot = process.cwd();
  let isSsrBuild = false;
  let outDir = 'dist/server';

  /**
   * Map from absolute file ID → relative path, for every file that was
   * transformed (i.e. had a 'use client' directive) during this build.
   */
  const clientFiles = new Map<string, string>();

  return {
    name: 'snapshot-rsc-transform',

    configResolved(resolvedConfig) {
      projectRoot = resolvedConfig.root;
      isSsrBuild = !!resolvedConfig.build?.ssr;
      outDir = resolvedConfig.build?.outDir ?? (isSsrBuild ? 'dist/server' : 'dist/client');
    },

    transform(code: string, id: string) {
      // Only transform TypeScript/JavaScript source files.
      if (!/\.[cm]?[jt]sx?$/.test(id)) return null;
      // Skip virtual modules and node_modules.
      if (id.includes('\0') || id.includes('/node_modules/')) return null;

      if (!hasUseClientDirective(code)) return null;

      const relativePath = toRelativePath(id, projectRoot);

      // Track every 'use client' file regardless of build type.
      clientFiles.set(id, relativePath);

      if (!isSsrBuild) {
        // Client build: ship real component code unchanged.
        return null;
      }

      // Server build: replace with a client reference stub.
      const namedExports = extractNamedExports(code);
      const hasDefault = EXPORT_DEFAULT_RE.test(code);

      if (namedExports.length === 0 && !hasDefault) {
        // No exports detected — emit a minimal stub to avoid bundling client code.
        return {
          code: `// RSC client reference stub — no exports detected in ${relativePath}`,
          map: null,
        };
      }

      return {
        code: buildServerStub(relativePath, namedExports, hasDefault),
        map: null,
      };
    },

    generateBundle(_options, bundle) {
      // Only write the RSC manifest from the server build.
      // The client build's bundle does not need a manifest — the server reads it.
      if (!isSsrBuild) return;
      if (clientFiles.size === 0) return;

      const components: Record<string, string> = {};
      const outputBundle = bundle as OutputBundleShape;

      for (const [fileId, relativePath] of clientFiles) {
        const chunkFileName = resolveChunkFileName(fileId, outputBundle);

        // Named exports from source code.
        // We re-read from the bundle's module graph where possible, but fall
        // back to an empty set if the module was fully replaced by the stub.
        const namedExports: string[] = [];
        let hasDefault = false;

        // Inspect the stub we emitted during transform to discover export names.
        // The stub contains lines like:
        //   export const Foo = createClientReference('...');
        //   export default createClientReference('...');
        // We scan these to rebuild the export list without reparsing the original.
        const chunk = Object.values(outputBundle).find(
          (output): output is OutputChunkShape =>
            output.type === 'chunk' &&
            (output.facadeModuleId === fileId || output.moduleIds.includes(fileId)),
        );

        if (chunk) {
          const NAMED_STUB_RE = /^export\s+const\s+([\w$]+)\s*=/gm;
          let m: RegExpExecArray | null;
          NAMED_STUB_RE.lastIndex = 0;
          while ((m = NAMED_STUB_RE.exec(chunk.code)) !== null) {
            if (m[1]) namedExports.push(m[1]);
          }
          hasDefault = /\bexport\s+default\b/.test(chunk.code);
        }

        const chunkUrl = chunkFileName ?? `assets/${path.basename(relativePath)}`;

        for (const name of namedExports) {
          const id = buildComponentId(relativePath, name);
          components[id] = chunkUrl;
        }
        if (hasDefault) {
          const id = buildComponentId(relativePath, 'default');
          components[id] = chunkUrl;
        }
      }

      const manifestJson = JSON.stringify({ components }, null, 2);

      this.emitFile({
        type: 'asset',
        fileName: 'rsc-manifest.json',
        source: manifestJson,
      });
    },
  };
}
