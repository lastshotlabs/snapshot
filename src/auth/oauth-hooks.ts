import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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

  /** Build the full OAuth login URL for a given provider, including any configured query params. */
  function getOAuthUrl(provider: OAuthProvider): string {
    const providerConfig = config.providers?.[provider];
    const target = resolveProviderTarget(provider);
    return appendProviderQuery(contract.oauthUrl(target), providerConfig);
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
   * `POST /auth/oauth/exchange`, then hydrates the auth cache and navigates to the
   * configured home path.
   */
  function useOAuthExchange() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
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
        if (config.homePath) navigate({ to: config.homePath });
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
