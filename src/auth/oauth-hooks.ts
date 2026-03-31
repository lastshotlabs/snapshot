import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { AuthContract } from "../auth/contract";
import type { OAuthProvider } from "../types";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface OAuthHooksOptions {
  api: ApiClient;
  contract: AuthContract;
}

export function createOAuthHooks({ api, contract }: OAuthHooksOptions) {
  function getOAuthUrl(provider: OAuthProvider): string {
    return contract.oauthUrl(provider);
  }

  function getLinkUrl(provider: OAuthProvider): string {
    return contract.oauthLinkUrl(provider);
  }

  function useOAuthUnlink() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, OAuthProvider>({
      mutationFn: (provider) => api.delete<void>(contract.oauthUnlink(provider), {}),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      },
    });
  }

  return {
    getOAuthUrl,
    getLinkUrl,
    useOAuthUnlink,
  };
}
