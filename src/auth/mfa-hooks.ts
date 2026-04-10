import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import type { WritableAtom } from "jotai";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type {
  AuthUser,
  LoginResponse,
  MfaChallenge,
  MfaMethod,
  MfaVerifyBody,
  MfaSetupResponse,
  MfaVerifySetupBody,
  MfaVerifySetupResponse,
  MfaDisableBody,
  MfaRecoveryCodesBody,
  MfaRecoveryCodesResponse,
  MfaEmailOtpEnableResponse,
  MfaEmailOtpVerifySetupBody,
  MfaEmailOtpDisableBody,
  MfaResendBody,
  MfaMethodsResponse,
} from "../types";
import type { AuthContract } from "../auth/contract";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface MfaHooksConfig {
  auth?: "cookie" | "token";
  homePath?: string;
  staleTime?: number;
  mfa?: {
    issuer?: string;
    period?: number;
    methods?: Array<"totp" | "email" | "sms" | "webauthn">;
  };
}

interface MfaHooksOptions {
  api: ApiClient;
  storage: TokenStorage;
  config: MfaHooksConfig;
  contract: AuthContract;
  pendingMfaChallengeAtom: WritableAtom<
    MfaChallenge | null,
    [MfaChallenge | null],
    void
  >;
  onLoginSuccess?: () => void;
}

/**
 * Create MFA-related hooks bound to a single snapshot instance.
 */
export function createMfaHooks({
  api,
  storage,
  config,
  contract,
  pendingMfaChallengeAtom,
  onLoginSuccess,
}: MfaHooksOptions) {
  function useMfaVerify() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const pendingChallenge = useAtomValue(pendingMfaChallengeAtom);
    const setMfaChallenge = useSetAtom(pendingMfaChallengeAtom);
    return useMutation<AuthUser, ApiError, Omit<MfaVerifyBody, "mfaToken">>({
      mutationFn: async (body: Omit<MfaVerifyBody, "mfaToken">) => {
        if (!pendingChallenge) throw new Error("No pending MFA challenge");
        const res = await api.post<LoginResponse>(
          contract.endpoints.mfaVerify,
          {
            ...body,
            mfaToken: pendingChallenge.mfaToken,
          },
        );
        if (config.auth !== "cookie" && res.token) {
          storage.set(res.token);
          if (res.refreshToken) {
            storage.setRefreshToken(res.refreshToken);
          }
        }
        return api.get<AuthUser>(contract.endpoints.me);
      },
      onSuccess: (user) => {
        setMfaChallenge(null);
        queryClient.setQueryData(AUTH_QUERY_KEY, user);
        onLoginSuccess?.();
        if (config.homePath) navigate({ to: config.homePath });
      },
    });
  }

  function useMfaSetup() {
    return useMutation<MfaSetupResponse, ApiError, void>({
      mutationFn: () =>
        api.post<MfaSetupResponse>(contract.endpoints.mfaSetup, {
          ...(config.mfa?.issuer ? { issuer: config.mfa.issuer } : null),
          ...(config.mfa?.period ? { period: config.mfa.period } : null),
          ...(config.mfa?.methods ? { methods: config.mfa.methods } : null),
        }),
    });
  }

  function useMfaVerifySetup() {
    return useMutation<MfaVerifySetupResponse, ApiError, MfaVerifySetupBody>({
      mutationFn: (body) =>
        api.post<MfaVerifySetupResponse>(
          contract.endpoints.mfaVerifySetup,
          body,
        ),
    });
  }

  function useMfaDisable() {
    return useMutation<{ message: string }, ApiError, MfaDisableBody>({
      mutationFn: (body) =>
        api.delete<{ message: string }>(contract.endpoints.mfaDisable, body),
    });
  }

  function useMfaRecoveryCodes() {
    return useMutation<
      MfaRecoveryCodesResponse,
      ApiError,
      MfaRecoveryCodesBody
    >({
      mutationFn: (body) =>
        api.post<MfaRecoveryCodesResponse>(
          contract.endpoints.mfaRecoveryCodes,
          body,
        ),
    });
  }

  function useMfaEmailOtpEnable() {
    return useMutation<MfaEmailOtpEnableResponse, ApiError, void>({
      mutationFn: () =>
        api.post<MfaEmailOtpEnableResponse>(
          contract.endpoints.mfaEmailOtpEnable,
          {},
        ),
    });
  }

  function useMfaEmailOtpVerifySetup() {
    return useMutation<
      MfaVerifySetupResponse,
      ApiError,
      MfaEmailOtpVerifySetupBody
    >({
      mutationFn: (body) =>
        api.post<MfaVerifySetupResponse>(
          contract.endpoints.mfaEmailOtpVerifySetup,
          body,
        ),
    });
  }

  function useMfaEmailOtpDisable() {
    return useMutation<{ message: string }, ApiError, MfaEmailOtpDisableBody>({
      mutationFn: (body) =>
        api.delete<{ message: string }>(
          contract.endpoints.mfaEmailOtpDisable,
          body,
        ),
    });
  }

  function useMfaResend() {
    return useMutation<{ message: string }, ApiError, MfaResendBody>({
      mutationFn: (body) =>
        api.post<{ message: string }>(contract.endpoints.mfaResend, body),
    });
  }

  function useMfaMethods() {
    const {
      data: methods = null,
      isLoading,
      isError,
    } = useQuery<MfaMethod[] | null, ApiError>({
      queryKey: ["auth", "mfa", "methods"],
      queryFn: async () => {
        try {
          const res = await api.get<MfaMethodsResponse>(
            contract.endpoints.mfaMethods,
          );
          return res.methods;
        } catch {
          return null;
        }
      },
      staleTime: config.staleTime ?? 5 * 60 * 1000,
      retry: false,
    });
    return { methods, isLoading, isError };
  }

  return {
    useMfaVerify,
    useMfaSetup,
    useMfaVerifySetup,
    useMfaDisable,
    useMfaRecoveryCodes,
    useMfaEmailOtpEnable,
    useMfaEmailOtpVerifySetup,
    useMfaEmailOtpDisable,
    useMfaResend,
    useMfaMethods,
  };
}
