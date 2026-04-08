import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type {
  SnapshotConfig,
  AuthUser,
  OAuthProvider,
  OAuthExchangeBody,
  OAuthExchangeResponse,
} from "../types";
import type { AuthContract } from "../auth/contract";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface OAuthHooksOptions {
  api: ApiClient;
  storage: TokenStorage;
  config: Pick<SnapshotConfig, "auth" | "homePath">;
  contract: AuthContract;
  onLoginSuccess?: () => void;
}

export function createOAuthHooks({
  api,
  storage,
  config,
  contract,
  onLoginSuccess,
}: OAuthHooksOptions) {
  function getOAuthUrl(provider: OAuthProvider): string {
    return contract.oauthUrl(provider);
  }

  function getLinkUrl(provider: OAuthProvider): string {
    return contract.oauthLinkUrl(provider);
  }

  /**
   * @deprecated Legacy OAuth code exchange. In the default Bunshot + snapshot browser
   * OAuth flow, Bunshot establishes the session cookie server-side during the provider
   * callback and redirects back with only success/error status. No client-side exchange
   * is needed. This hook will be removed in the next major version.
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
