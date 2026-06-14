import { redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import { warnOnce } from "../auth/warnings";
import type { AuthUser } from "../types";
import type { AuthContract } from "../auth/contract";

/**
 * Stable query key under which `useUser()` and the route guards cache the
 * authenticated user. Exported so apps can invalidate, seed, or read the
 * cache directly (e.g. after a profile update or server-side state change
 * that should force a refresh).
 */
export const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface RouterContext {
  context: { queryClient: QueryClient };
}

interface LoaderConfig {
  loginPath?: string;
  homePath?: string;
  onUnauthenticated?: () => void;
  staleTime?: number;
}

/**
 * Shape returned by `protect()` / `guest()`. Spread into a route definition:
 *
 * ```ts
 * export const Route = createFileRoute('/_app/settings')({
 *   ...snapshot.protect(),
 *   component: SettingsLayout,
 * });
 * ```
 *
 * `beforeLoad` is typed as `never` here so it satisfies TanStack Router's
 * strict per-route `beforeLoad` signature regardless of which route id is
 * being registered. The runtime function still receives the standard
 * `{ context: { queryClient } }` payload from the router.
 */
export interface RouteGuardFragment {
  beforeLoad: never;
}

/**
 * Create router before-load guards bound to a single snapshot instance.
 */
export function createLoaders(
  config: LoaderConfig,
  api: ApiClient,
  contract: AuthContract,
) {
  const staleTime = config.staleTime ?? 5 * 60 * 1000;

  async function fetchUser(queryClient: QueryClient): Promise<AuthUser | null> {
    // Fast path: return cached data synchronously if it's still fresh.
    // This avoids an async tick that would trigger the router's "pending" state
    // on every navigation, and prevents redundant /auth/me requests.
    const cached = queryClient.getQueryState<AuthUser | null>(AUTH_QUERY_KEY);
    if (cached?.data !== undefined && cached.dataUpdatedAt > 0) {
      const age = Date.now() - cached.dataUpdatedAt;
      if (age < staleTime) return cached.data;
    }

    try {
      return await queryClient.ensureQueryData<AuthUser | null>({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
          try {
            return await api.get<AuthUser>(contract.endpoints.me);
          } catch {
            return null;
          }
        },
        staleTime,
      });
    } catch {
      return null;
    }
  }

  async function protectedBeforeLoad({
    context,
  }: RouterContext): Promise<void> {
    const user = await fetchUser(context.queryClient);

    if (!user) {
      config.onUnauthenticated?.();

      if (!config.loginPath) {
        warnOnce(
          "protectedBeforeLoad:no-loginPath",
          "[snapshot] protectedBeforeLoad: no login route configured. Pass `loginPath` to createSnapshot.",
        );
        return;
      }

      throw redirect({ to: config.loginPath });
    }
  }

  async function guestBeforeLoad({ context }: RouterContext): Promise<void> {
    const user = await fetchUser(context.queryClient);

    if (user) {
      if (!config.homePath) {
        warnOnce(
          "guestBeforeLoad:no-homePath",
          "[snapshot] guestBeforeLoad: no home route configured. Pass `homePath` to createSnapshot.",
        );
        return;
      }

      throw redirect({ to: config.homePath });
    }
  }

  /**
   * Typed factory for protected routes. Returns a fragment that slots into
   * `createFileRoute(...)({...})` without caller casts:
   *
   * ```ts
   * export const Route = createFileRoute('/_app/settings')({
   *   ...protect(),
   *   component: SettingsLayout,
   * });
   * ```
   */
  function protect(): RouteGuardFragment {
    // The cast lives here so consumers never have to write it. TanStack
    // Router's per-route `beforeLoad` signature is highly generic; `never` is
    // assignable to any specific signature, so the spread satisfies all routes.
    return { beforeLoad: protectedBeforeLoad as never };
  }

  /** Typed factory for guest-only routes. Mirror of `protect()`. */
  function guest(): RouteGuardFragment {
    return { beforeLoad: guestBeforeLoad as never };
  }

  return { protectedBeforeLoad, guestBeforeLoad, protect, guest };
}
