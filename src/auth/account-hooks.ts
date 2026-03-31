import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { AuthContract } from "../auth/contract";
import type {
  DeleteAccountBody,
  MagicLinkRequestBody,
  MagicLinkVerifyBody,
  ReauthVerifyBody,
  ReauthVerifyResponse,
  RefreshTokenBody,
  RefreshTokenResponse,
  ResendVerificationBody,
  ResetPasswordBody,
  Session,
  SetPasswordBody,
  VerifyEmailBody,
} from "../types";
import type { TokenStorage } from "./storage";

interface AccountHooksOptions {
  api: ApiClient;
  storage: TokenStorage;
  config: { loginPath?: string };
  contract: AuthContract;
  onUnauthenticated?: () => void;
  queryClient: QueryClient;
}

export function createAccountHooks({
  api,
  storage,
  config,
  contract,
  onUnauthenticated,
  queryClient: qc,
}: AccountHooksOptions) {
  function useResetPassword() {
    return useMutation<{ message: string }, ApiError, ResetPasswordBody>({
      mutationFn: (body) => api.post<{ message: string }>(contract.endpoints.resetPassword, body),
    });
  }

  function useVerifyEmail() {
    return useMutation<{ message: string }, ApiError, VerifyEmailBody>({
      mutationFn: (body) => api.post<{ message: string }>(contract.endpoints.verifyEmail, body),
    });
  }

  function useResendVerification() {
    return useMutation<{ message: string }, ApiError, ResendVerificationBody>({
      mutationFn: (body) =>
        api.post<{ message: string }>(contract.endpoints.resendVerification, body),
    });
  }

  function useSetPassword() {
    return useMutation<{ message: string }, ApiError, SetPasswordBody>({
      mutationFn: (body) => api.post<{ message: string }>(contract.endpoints.setPassword, body),
    });
  }

  function useDeleteAccount() {
    const navigate = useNavigate();
    return useMutation<void, ApiError, DeleteAccountBody | void>({
      mutationFn: (body) => api.delete<void>(contract.endpoints.deleteAccount, body ?? {}),
      onSuccess: () => {
        storage.clear();
        storage.clearRefreshToken();
        qc.clear();
        onUnauthenticated?.();
        if (config.loginPath) navigate({ to: config.loginPath });
      },
    });
  }

  function useCancelDeletion() {
    return useMutation<{ message: string }, ApiError, void>({
      mutationFn: () => api.post<{ message: string }>(contract.endpoints.cancelDeletion, {}),
    });
  }

  function useRefreshToken() {
    return useMutation<RefreshTokenResponse, ApiError, RefreshTokenBody | void>({
      mutationFn: (body) => api.post<RefreshTokenResponse>(contract.endpoints.refresh, body ?? {}),
      onSuccess: (data) => {
        storage.set(data.token);
        if (data.refreshToken) {
          storage.setRefreshToken(data.refreshToken);
        }
      },
    });
  }

  function useSessions() {
    const { data, isLoading, isError } = useQuery<{ sessions: Session[] }, ApiError>({
      queryKey: ["auth", "sessions"],
      queryFn: () => api.get<{ sessions: Session[] }>(contract.endpoints.sessions),
    });
    return { sessions: data?.sessions ?? [], isLoading, isError };
  }

  function useRevokeSession() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, string>({
      mutationFn: (sessionId) => api.delete<void>(contract.sessionRevoke(sessionId), {}),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
      },
    });
  }

  function useMagicLinkRequest() {
    return useMutation<{ message: string }, ApiError, MagicLinkRequestBody>({
      mutationFn: (body) =>
        api.post<{ message: string }>(contract.endpoints.magicLinkRequest, body),
    });
  }

  function useMagicLinkVerify() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation<{ token: string }, ApiError, MagicLinkVerifyBody>({
      mutationFn: (body) => api.post<{ token: string }>(contract.endpoints.magicLinkVerify, body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        if (config.loginPath) navigate({ to: "/" });
      },
    });
  }

  function useReauthVerify() {
    return useMutation<ReauthVerifyResponse, ApiError, ReauthVerifyBody>({
      mutationFn: (body) => api.post<ReauthVerifyResponse>(contract.endpoints.reauthVerify, body),
    });
  }

  return {
    useResetPassword,
    useVerifyEmail,
    useResendVerification,
    useSetPassword,
    useDeleteAccount,
    useCancelDeletion,
    useRefreshToken,
    useSessions,
    useRevokeSession,
    useMagicLinkRequest,
    useMagicLinkVerify,
    useReauthVerify,
  };
}
