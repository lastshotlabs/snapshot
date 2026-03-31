import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import type { ApiClient } from "../api/client";
import type { AuthContract } from "../auth/contract";
import { warnOnce } from "../auth/warnings";
import type { AuthUser } from "../types";

interface RouterContext {
  context: { queryClient: QueryClient };
}

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface LoaderConfig {
  loginPath?: string;
  homePath?: string;
  forbiddenPath?: string;
  onUnauthenticated?: () => void;
  staleTime?: number;
}

export function createLoaders(config: LoaderConfig, api: ApiClient, contract: AuthContract) {
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

  async function protectedBeforeLoad({ context }: RouterContext): Promise<void> {
    const user = await fetchUser(context.queryClient);

    if (!user) {
      config.onUnauthenticated?.();

      if (!config.loginPath) {
        warnOnce(
          "protectedBeforeLoad:no-loginPath",
          "[snapshot] protectedBeforeLoad: no loginPath configured. Set loginPath in createSnapshot config.",
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
          "[snapshot] guestBeforeLoad: no homePath configured. Set homePath in createSnapshot config.",
        );
        return;
      }

      throw redirect({ to: config.homePath });
    }
  }

  return { protectedBeforeLoad, guestBeforeLoad };
}
