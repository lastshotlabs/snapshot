/**
 * Request/response context available to manifest SSR middleware workflows.
 */
export interface SSRMiddlewareContext {
    /** Read-only request information exposed to middleware workflows. */
    readonly request: {
        /** Full request URL. */
        url: string;
        /** Request pathname only. */
        pathname: string;
        /** HTTP method. */
        method: string;
        /** Lower-cased request headers. */
        headers: Readonly<Record<string, string>>;
        /** Parsed request cookies. */
        cookies: Readonly<Record<string, string>>;
        /** Resolved route params for the current pathname. */
        params: Readonly<Record<string, string>>;
        /** Parsed query string values. */
        query: Readonly<Record<string, string>>;
    };
    /** Mutable response state written by SSR middleware actions. */
    response: {
        /** Override response status. */
        status?: number;
        /** Response headers to append or override. */
        headers: Record<string, string>;
        /** Redirect target. Mutually exclusive with `rewrite`. */
        redirect?: {
            url: string;
            permanent: boolean;
        };
        /** Rewrite target path. Mutually exclusive with `redirect`. */
        rewrite?: string;
        /** Halt middleware execution and skip route rendering. */
        halt?: boolean;
    };
}
