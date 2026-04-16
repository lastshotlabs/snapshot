import type { SSRMiddlewareContext } from "../../../ssr/middleware-context";
type SsrActionContext = {
    input?: {
        ssr?: SSRMiddlewareContext;
    };
};
/**
 * Set the HTTP status on the middleware response.
 */
export declare function setStatus(config: {
    status: number;
}, ctx: SsrActionContext): void;
/**
 * Set an HTTP redirect on the middleware response.
 */
export declare function redirect(config: {
    url: string;
    permanent?: boolean;
}, ctx: SsrActionContext): void;
/**
 * Set a route rewrite on the middleware response.
 */
export declare function rewrite(config: {
    url: string;
}, ctx: SsrActionContext): void;
/**
 * Set a response header on the middleware response.
 */
export declare function setHeader(config: {
    name: string;
    value: string;
}, ctx: SsrActionContext): void;
/**
 * Halt middleware execution and skip route rendering.
 */
export declare function halt(_config: Record<string, never>, ctx: SsrActionContext): void;
export {};
