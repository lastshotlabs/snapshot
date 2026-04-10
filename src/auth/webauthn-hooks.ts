import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import type { WritableAtom } from "jotai";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "../auth/storage";
import type {
  AuthUser,
  WebAuthnRegisterOptionsResponse,
  WebAuthnRegisterBody,
  WebAuthnCredential,
  PasskeyLoginOptionsBody,
  PasskeyLoginOptionsResponse,
  PasskeyLoginVars,
  LoginResult,
  LoginResponse,
  MfaChallenge,
} from "../types";
import { isMfaChallenge } from "../types";
import type { AuthContract } from "../auth/contract";

const WEBAUTHN_CREDENTIALS_KEY = ["auth", "webauthn", "credentials"] as const;

interface WebAuthnHooksConfig {
  auth?: "cookie" | "token";
  mfaPath?: string;
  homePath?: string;
}

interface WebAuthnHooksOptions {
  api: ApiClient;
  storage: TokenStorage;
  config: WebAuthnHooksConfig;
  contract: AuthContract;
  pendingMfaChallengeAtom: WritableAtom<
    MfaChallenge | null,
    [MfaChallenge | null],
    void
  >;
  onLoginSuccess?: () => void;
}

/**
 * Create WebAuthn and passkey hooks bound to a single snapshot instance.
 */
export function createWebAuthnHooks({
  api,
  storage,
  config,
  contract,
  pendingMfaChallengeAtom,
  onLoginSuccess,
}: WebAuthnHooksOptions) {
  function useWebAuthnRegisterOptions() {
    return useMutation<WebAuthnRegisterOptionsResponse, ApiError, void>({
      mutationFn: () =>
        api.post<WebAuthnRegisterOptionsResponse>(
          contract.endpoints.webauthnRegisterOptions,
          {},
        ),
    });
  }

  function useWebAuthnRegister() {
    const queryClient = useQueryClient();
    return useMutation<{ message: string }, ApiError, WebAuthnRegisterBody>({
      mutationFn: (body) =>
        api.post<{ message: string }>(
          contract.endpoints.webauthnRegister,
          body,
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: WEBAUTHN_CREDENTIALS_KEY });
      },
    });
  }

  function useWebAuthnCredentials() {
    const { data, isLoading, isError } = useQuery<
      { credentials: WebAuthnCredential[] },
      ApiError
    >({
      queryKey: WEBAUTHN_CREDENTIALS_KEY,
      queryFn: () =>
        api.get<{ credentials: WebAuthnCredential[] }>(
          contract.endpoints.webauthnCredentials,
        ),
    });
    return { credentials: data?.credentials ?? [], isLoading, isError };
  }

  function useWebAuthnRemoveCredential() {
    const queryClient = useQueryClient();
    return useMutation<{ message: string }, ApiError, string>({
      mutationFn: (credentialId) =>
        api.delete<{ message: string }>(
          contract.webauthnRemoveCredential(credentialId),
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: WEBAUTHN_CREDENTIALS_KEY });
      },
    });
  }

  function useWebAuthnDisable() {
    return useMutation<{ message: string }, ApiError, void>({
      mutationFn: () =>
        api.delete<{ message: string }>(contract.endpoints.webauthnDisable, {}),
    });
  }

  function usePasskeyLoginOptions() {
    return useMutation<
      PasskeyLoginOptionsResponse,
      ApiError,
      PasskeyLoginOptionsBody
    >({
      mutationFn: (body) =>
        api.post<PasskeyLoginOptionsResponse>(
          contract.endpoints.passkeyLoginOptions,
          body,
        ),
    });
  }

  function usePasskeyLogin() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const setMfaChallenge = useSetAtom(pendingMfaChallengeAtom);
    return useMutation<LoginResult, ApiError, PasskeyLoginVars>({
      mutationFn: async ({ redirectTo: _, ...body }) => {
        const response = await api.post<LoginResponse>(
          contract.endpoints.passkeyLogin,
          body,
        );
        if (response.mfaRequired && response.mfaToken && response.mfaMethods) {
          return {
            mfaToken: response.mfaToken,
            mfaMethods: response.mfaMethods,
          };
        }
        if (config.auth !== "cookie" && response.token) {
          storage.set(response.token);
          if (response.refreshToken) {
            storage.setRefreshToken(response.refreshToken);
          }
        }
        return api.get<AuthUser>(contract.endpoints.me);
      },
      onSuccess: (result, vars) => {
        if (isMfaChallenge(result)) {
          setMfaChallenge({
            mfaToken: result.mfaToken,
            mfaMethods: result.mfaMethods,
          });
          if (config.mfaPath) navigate({ to: config.mfaPath });
          return;
        }
        queryClient.setQueryData(["auth", "me"], result);
        onLoginSuccess?.();
        const to = vars.redirectTo ?? config.homePath;
        if (to) navigate({ to });
      },
    });
  }

  return {
    useWebAuthnRegisterOptions,
    useWebAuthnRegister,
    useWebAuthnCredentials,
    useWebAuthnRemoveCredential,
    useWebAuthnDisable,
    usePasskeyLoginOptions,
    usePasskeyLogin,
  };
}
