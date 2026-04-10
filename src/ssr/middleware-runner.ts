import { ACTION_TYPES, type ActionConfig } from "../ui/actions/types";
import { registerSsrMiddlewareWorkflowActions } from "../ui/workflows/builtins";
import { runWorkflow } from "../ui/workflows/engine";
import type { WorkflowMap } from "../ui/workflows/types";
import type { CompiledManifest } from "../ui/manifest/types";
import type { SSRMiddlewareContext } from "./middleware-context";

interface MiddlewareDeclaration {
  match?: string;
  workflow: string;
}

/**
 * Input arguments for the manifest SSR middleware runner.
 */
export interface RunManifestSsrMiddlewareOptions {
  /** Compiled manifest. */
  manifest: CompiledManifest;
  /** Request URL (absolute). */
  url: string;
  /** Request pathname. */
  pathname: string;
  /** HTTP method. */
  method: string;
  /** Request headers. */
  requestHeaders?: Record<string, string>;
  /** Route params for the matched route. */
  params: Record<string, string>;
  /** Parsed query string values. */
  query: Record<string, string>;
  /** Manifest workflow map. */
  workflows?: WorkflowMap;
}

function normalizePath(pathname: string): string {
  if (!pathname) {
    return "/";
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compilePathPattern(pattern: string): RegExp {
  const normalized = normalizePath(pattern);
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) {
    return /^\/$/;
  }

  let expression = "^";
  segments.forEach((segment, index) => {
    const last = index === segments.length - 1;
    if (segment === "**") {
      expression += last ? "(?:/.*)?": "/.*";
      return;
    }

    expression += "/";
    if (segment === "*") {
      expression += "[^/]+";
      return;
    }
    if (segment.startsWith(":") && segment.length > 1) {
      const name = segment.slice(1).replace(/[^a-zA-Z0-9_$]/g, "_");
      expression += `(?<${name}>[^/]+)`;
      return;
    }
    expression += escapeRegex(segment);
  });

  expression += "$";
  return new RegExp(expression);
}

function matchesPath(pattern: string | undefined, pathname: string): boolean {
  if (!pattern) {
    return true;
  }
  return compilePathPattern(pattern).test(normalizePath(pathname));
}

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  const cookies: Record<string, string> = {};
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    if (!rawName) {
      continue;
    }
    cookies[rawName] = rawValueParts.join("=");
  }
  return cookies;
}

function readNested(source: unknown, path: string): unknown {
  if (!path) {
    return source;
  }
  const segments = path.split(".").filter(Boolean);
  let cursor: unknown = source;
  for (const segment of segments) {
    if (!cursor || typeof cursor !== "object") {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}

function resolveValue(value: unknown, context: Record<string, unknown>): unknown {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "from" in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>)["from"] === "string"
  ) {
    return readNested(context, String((value as Record<string, unknown>)["from"]));
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, context));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        resolveValue(nested, context),
      ]),
    );
  }

  return value;
}

function readDeclaredMiddleware(
  manifest: CompiledManifest,
): MiddlewareDeclaration[] {
  const raw = manifest.raw as Record<string, unknown>;
  const ssr = raw["ssr"];
  if (!ssr || typeof ssr !== "object") {
    return [];
  }

  const middleware = (ssr as Record<string, unknown>)["middleware"];
  if (!Array.isArray(middleware)) {
    return [];
  }

  return middleware.filter(
    (entry): entry is MiddlewareDeclaration =>
      Boolean(entry) &&
      typeof entry === "object" &&
      typeof (entry as Record<string, unknown>)["workflow"] === "string",
  );
}

/**
 * Execute `manifest.ssr.middleware` workflows in declaration order.
 */
export async function runManifestSsrMiddleware(
  options: RunManifestSsrMiddlewareOptions,
): Promise<SSRMiddlewareContext> {
  registerSsrMiddlewareWorkflowActions();

  const headers = Object.fromEntries(
    Object.entries(options.requestHeaders ?? {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  );

  const context: SSRMiddlewareContext = {
    request: {
      url: options.url,
      pathname: options.pathname,
      method: options.method,
      headers,
      cookies: parseCookieHeader(headers["cookie"]),
      params: options.params,
      query: options.query,
    },
    response: {
      headers: {},
    },
  };

  const middleware = readDeclaredMiddleware(options.manifest);
  const workflows = options.workflows ?? {};

  for (const declaration of middleware) {
    if (!matchesPath(declaration.match, options.pathname)) {
      continue;
    }

    const definition = workflows[declaration.workflow];
    if (!definition) {
      throw new Error(
        `SSR middleware references missing workflow "${declaration.workflow}". Add it to manifest.workflows.`,
      );
    }

    await runWorkflow(definition, {
      workflows,
      context: {
        ssr: context,
      },
      resolveValue,
      executeAction: async (action: ActionConfig): Promise<void> => {
        if (ACTION_TYPES.includes(action.type)) {
          throw new Error(
            `Action "${action.type}" is not supported in SSR middleware workflows.`,
          );
        }
      },
    });

    if (
      context.response.halt ||
      context.response.redirect ||
      context.response.rewrite
    ) {
      break;
    }
  }

  return context;
}
