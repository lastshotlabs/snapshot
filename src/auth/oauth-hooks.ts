import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type {
  AuthUser,
  OAuthProvider,
  OAuthExchangeBody,
  OAuthExchangeResponse,
} from "../types";
import type { AuthContract } from "../auth/contract";
import { navigateToPath } from "./navigation";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface OAuthHooksConfig {
  auth?: "cookie" | "token";
  homePath?: string;
  providers?: Record<
    string,
    {
      type:
        | "google"
        | "github"
        | "microsoft"
        | "apple"
        | "facebook"
        | "discord"
        | "custom";
      clientId?: string;
      scopes?: string[];
      callbackPath?: string;
      name?: string;
    }
  >;
}

interface OAuthHooksOptions {
  api: ApiClient;
  storage: TokenStorage;
  config: OAuthHooksConfig;
  contract: AuthContract;
  onLoginSuccess?: () => void;
}

/**
 * Create OAuth-related hooks bound to a single snapshot instance.
 */
export function createOAuthHooks({
  api,
  storage,
  config,
  contract,
  onLoginSuccess,
}: OAuthHooksOptions) {
  /** Resolve a provider key to its canonical OAuth provider target using config overrides. */
  function resolveProviderTarget(provider: OAuthProvider): OAuthProvider {
    const providerConfig = config.providers?.[provider];
    if (!providerConfig) {
      return provider;
    }

    if (providerConfig.type === "custom") {
      return (providerConfig.name ?? provider) as OAuthProvider;
    }

    return providerConfig.type as OAuthProvider;
  }

  /** Append client_id, scope, and redirect_uri query params from provider config to a URL. */
  function appendProviderQuery(
    url: string,
    providerConfig:
      | {
          clientId?: string;
          scopes?: string[];
          callbackPath?: string;
        }
      | undefined,
  ): string {
    if (!providerConfig) {
      return url;
    }

    const hasQueryValues =
      !!providerConfig.clientId ||
      (providerConfig.scopes?.length ?? 0) > 0 ||
      !!providerConfig.callbackPath;
    if (!hasQueryValues || typeof URL === "undefined") {
      return url;
    }

    const origin =
      typeof window !== "undefined" &&
      window.location.origin &&
      window.location.origin !== "null"
        ? window.location.origin
        : "http://localhost";
    const parsed = new URL(url, origin);

    if (providerConfig.clientId) {
      parsed.searchParams.set("client_id", providerConfig.clientId);
    }
    if (providerConfig.scopes && providerConfig.scopes.length > 0) {
      parsed.searchParams.set("scope", providerConfig.scopes.join(" "));
    }
    if (providerConfig.callbackPath) {
      parsed.searchParams.set("redirect_uri", providerConfig.callbackPath);
    }

    return parsed.toString();
  }

  /**
   * Build the full OAuth login URL for a given provider.
   *
   * Pass `opts.returnTo` to override the api's configured post-login
   * redirect with a per-flow target — typically used by an admin or
   * other secondary origin that shares the same OAuth client as the
   * primary app and needs the callback to come back to its own origin.
   * The api validates the value against its `allowedRedirectUrls` at
   * flow start; an unallowed value falls back silently to the default.
   */
  function getOAuthUrl(
    provider: OAuthProvider,
    opts?: { returnTo?: string },
  ): string {
    const providerConfig = config.providers?.[provider];
    const target = resolveProviderTarget(provider);
    const base = appendProviderQuery(contract.oauthUrl(target), providerConfig);
    if (!opts?.returnTo) return base;
    if (typeof URL === "undefined") return base;
    const origin =
      typeof window !== "undefined" &&
      window.location.origin &&
      window.location.origin !== "null"
        ? window.location.origin
        : "http://localhost";
    const parsed = new URL(base, origin);
    parsed.searchParams.set("return_to", opts.returnTo);
    return parsed.toString();
  }

  /** Build the OAuth account-linking URL for a given provider, including any configured query params. */
  function getLinkUrl(provider: OAuthProvider): string {
    const providerConfig = config.providers?.[provider];
    const target = resolveProviderTarget(provider);
    return appendProviderQuery(contract.oauthLinkUrl(target), providerConfig);
  }

  /**
   * Execute the Bunshot one-time OAuth code exchange.
   *
   * The provider callback redirects the browser back to the app with a short-lived
   * authorization `code`. Snapshot exchanges that code via
   * `POST /auth/oauth/exchange`, then hydrates the auth cache and (by default)
   * navigates to the configured home path.
   *
   * Pass `{ navigateOnSuccess: false }` to suppress the auto-navigate. The
   * mutation still mints the session and hydrates the auth cache, but
   * navigation is left entirely to the caller. Use this when the caller
   * needs to make a post-exchange decision before deciding where to go —
   * for example, an admin callback page that checks a permission grant
   * and either navigates to the admin home or logs the user out and
   * shows a "not authorized" panel. With the default auto-navigate the
   * user lands on the destination *before* the decision can resolve,
   * defeating the gate.
   */
  function useOAuthExchange(opts?: { navigateOnSuccess?: boolean }) {
    const queryClient = useQueryClient();
    const navigateOnSuccess = opts?.navigateOnSuccess !== false;
    return useMutation<OAuthExchangeResponse, ApiError, OAuthExchangeBody>({
      mutationFn: (body) =>
        api.post<OAuthExchangeResponse>(contract.endpoints.oauthExchange, body),
      onSuccess: async (data) => {
        if (config.auth !== "cookie" && data.token) {
          storage.set(data.token);
          if (data.refreshToken) {
            storage.setRefreshToken(data.refreshToken);
          }
        }
        const user = await api.get<AuthUser>(contract.endpoints.me);
        queryClient.setQueryData(AUTH_QUERY_KEY, user);
        onLoginSuccess?.();
        if (navigateOnSuccess) navigateToPath(config.homePath);
      },
    });
  }

  /** Unlink an OAuth provider from the current user's account and invalidate the auth cache. */
  function useOAuthUnlink() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, OAuthProvider>({
      mutationFn: (provider) =>
        api.delete<void>(contract.oauthUnlink(provider), {}),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      },
    });
  }

  return {
    getOAuthUrl,
    getLinkUrl,
    useOAuthExchange,
    useOAuthUnlink,
  };
}
