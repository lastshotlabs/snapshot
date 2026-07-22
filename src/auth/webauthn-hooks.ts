import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { navigateToPath } from "./navigation";

const WEBAUTHN_CREDENTIALS_KEY = ["auth", "webauthn", "credentials"] as const;

interface WebAuthnHooksConfig {
  auth?: "cookie" | "token";
  mfaPath?: string;
  homePath?: string;
  webauthn?: {
    rpId?: string;
    rpName?: string;
    attestation?: "none" | "indirect" | "direct";
  };
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
  /** Fetch WebAuthn registration options (challenge, RP config) from the server. */
  function useWebAuthnRegisterOptions() {
    return useMutation<WebAuthnRegisterOptionsResponse, ApiError, void>({
      mutationFn: () =>
        api.post<WebAuthnRegisterOptionsResponse>(
          contract.endpoints.webauthnRegisterOptions,
          {
            ...(config.webauthn?.rpId ? { rpId: config.webauthn.rpId } : null),
            ...(config.webauthn?.rpName
              ? { rpName: config.webauthn.rpName }
              : null),
            ...(config.webauthn?.attestation
              ? { attestation: config.webauthn.attestation }
              : null),
          },
        ),
    });
  }

  /** Complete WebAuthn registration by sending the attestation response and refresh the credentials cache. */
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

  /** Query the user's registered WebAuthn credentials from the server. */
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

  /** Remove a specific WebAuthn credential by ID and invalidate the credentials cache. */
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

  /** Disable WebAuthn for the current user's account entirely. */
  function useWebAuthnDisable() {
    return useMutation<{ message: string }, ApiError, void>({
      mutationFn: () =>
        api.delete<{ message: string }>(contract.endpoints.webauthnDisable, {}),
    });
  }

  /** Request passkey login options (challenge and allowed credentials) from the server. */
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

  /** Authenticate with a passkey assertion, handling MFA challenges, token storage, and post-login navigation. */
  function usePasskeyLogin() {
    const queryClient = useQueryClient();
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
            webauthnOptions: response.webauthnOptions,
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
            webauthnOptions: result.webauthnOptions,
          });
          navigateToPath(config.mfaPath);
          return;
        }
        queryClient.setQueryData(["auth", "me"], result);
        onLoginSuccess?.();
        const to = vars.redirectTo ?? config.homePath;
        navigateToPath(to);
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
