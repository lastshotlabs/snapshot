// snapshot/src/ssr/action-client.ts
// Client-side stub implementation for server actions.
//
// NOTE: This module must be exported from src/ssr/index.ts.
// Phase 20 creates this file; Phase 21 adds the export to index.ts.
// Export: export { __callServerAction__ } from './action-client';

/** Endpoint that handles all server action invocations. @internal */
const ACTION_ENDPOINT = "/_snapshot/action";

/**
 * Called by server action stubs in the client bundle.
 *
 * Routes the call to `POST /_snapshot/action` on the server and returns the
 * action's result. Handles three response shapes from the server:
 *
 * - `{ result }` — returned as-is to the caller
 * - `{ error }` — throws `Error(message)`
 * - `{ redirect }` — navigates via `window.location.href`
 *
 * When the first argument is a `FormData` instance the request is sent as a
 * raw `FormData` body (for `<form action={serverFn}>` usage). Otherwise the
 * call is serialised as JSON.
 *
 * @param action - The exported function name from the action module.
 * @param module - The module name (relative to the server actions directory).
 * @param args   - Arguments to forward to the server function.
 * @returns The value returned by the server function.
 *
 * @throws {Error} When the server returns an `{ error }` response.
 *
 * @example
 * ```ts
 * // Generated client stub — do not write this manually.
 * import { __callServerAction__ } from '@lastshotlabs/snapshot/ssr';
 * export async function createPost(...args: unknown[]) {
 *   return __callServerAction__('createPost', 'posts', args);
 * }
 * ```
 */
export async function __callServerAction__(
  action: string,
  module: string,
  args: unknown[],
): Promise<unknown> {
  const firstArg = args[0];
  const isFormData = firstArg instanceof FormData;

  let body: BodyInit;
  const headers: HeadersInit = {};

  if (isFormData) {
    // FormData carries its own Content-Type boundary — do not set it manually.
    // The server identifies this as a progressive-enhancement call and returns
    // a redirect rather than JSON.
    const fd = new FormData();
    fd.append("_module", module);
    fd.append("_action", action);
    // Copy all fields from the original FormData.
    firstArg.forEach((value, key) => {
      fd.append(key, value);
    });
    body = fd;
  } else {
    body = JSON.stringify({ module, action, args });
    (headers as Record<string, string>)["content-type"] = "application/json";
  }

  const res = await fetch(ACTION_ENDPOINT, {
    method: "POST",
    headers,
    body,
  });

  // Form-mode responses are redirects (30x) and carry no JSON body.
  if (res.redirected || (res.status >= 300 && res.status < 400)) {
    if (typeof window !== "undefined") {
      window.location.href = res.url || ACTION_ENDPOINT;
    }
    return undefined;
  }

  const json = (await res.json()) as
    | { result: unknown }
    | { error: string }
    | { redirect: string };

  if ("redirect" in json) {
    if (typeof window !== "undefined") {
      window.location.href = json.redirect;
    }
    return undefined;
  }

  if ("error" in json) {
    throw new Error(json.error);
  }

  return json.result;
}
