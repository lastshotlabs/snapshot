import type { SSRMiddlewareContext } from "../../../ssr/middleware-context";

type SsrActionContext = {
  input?: {
    ssr?: SSRMiddlewareContext;
  };
};

function requireSsrContext(
  actionName: string,
  ctx: SsrActionContext,
): SSRMiddlewareContext {
  const ssr = ctx.input?.ssr;
  if (!ssr) {
    throw new Error(
      `Action "${actionName}" requires SSR context. It can only be called from manifest.ssr.middleware workflows.`,
    );
  }

  return ssr;
}

/**
 * Set the HTTP status on the middleware response.
 */
export function setStatus(
  config: { status: number },
  ctx: SsrActionContext,
): void {
  const ssr = requireSsrContext("set-status", ctx);
  ssr.response.status = config.status;
}

/**
 * Set an HTTP redirect on the middleware response.
 */
export function redirect(
  config: { url: string; permanent?: boolean },
  ctx: SsrActionContext,
): void {
  const ssr = requireSsrContext("redirect", ctx);
  if (ssr.response.rewrite) {
    throw new Error(
      'Cannot set redirect because rewrite is already set for this middleware run.',
    );
  }

  ssr.response.redirect = {
    url: config.url,
    permanent: Boolean(config.permanent),
  };
}

/**
 * Set a route rewrite on the middleware response.
 */
export function rewrite(config: { url: string }, ctx: SsrActionContext): void {
  const ssr = requireSsrContext("rewrite", ctx);
  if (ssr.response.redirect) {
    throw new Error(
      'Cannot set rewrite because redirect is already set for this middleware run.',
    );
  }

  ssr.response.rewrite = config.url;
}

/**
 * Set a response header on the middleware response.
 */
export function setHeader(
  config: { name: string; value: string },
  ctx: SsrActionContext,
): void {
  const ssr = requireSsrContext("set-header", ctx);
  ssr.response.headers[config.name] = config.value;
}

/**
 * Halt middleware execution and skip route rendering.
 */
export function halt(_config: Record<string, never>, ctx: SsrActionContext): void {
  const ssr = requireSsrContext("halt", ctx);
  ssr.response.halt = true;
}
