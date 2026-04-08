import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import type { WritableAtom } from "jotai";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type {
  AuthUser,
  LoginBody,
  LoginVars,
  LoginResult,
  LoginResponse,
  LogoutVars,
  RegisterBody,
  RegisterVars,
  ForgotPasswordBody,
  MfaChallenge,
  SnapshotConfig,
} from "../types";
import { isMfaChallenge } from "../types";
import type { AuthContract } from "../auth/contract";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface AuthHooksOptions {
  api: ApiClient;
  storage: TokenStorage;
  config: Pick<
    SnapshotConfig,
    | "auth"
    | "staleTime"
    | "onUnauthenticated"
    | "loginPath"
    | "homePath"
    | "mfaPath"
    | "onLogoutSuccess"
  >;
  contract: AuthContract;
  pendingMfaChallengeAtom: WritableAtom<
    MfaChallenge | null,
    [MfaChallenge | null],
    void
  >;
  onLoginSuccess?: () => void; // called by createSnapshot to trigger WS/SSE reconnect
  onLogoutSuccess?: () => void; // called by createSnapshot to trigger SSE close
}

export function createAuthHooks({
  api,
  storage,
  config,
  contract,
  pendingMfaChallengeAtom,
  onLoginSuccess,
  onLogoutSuccess,
}: AuthHooksOptions) {
  function useUser() {
    const {
      data: user = null,
      isLoading,
      isError,
    } = useQuery<AuthUser | null, ApiError>({
      queryKey: AUTH_QUERY_KEY,
      queryFn: async () => {
        try {
          return await api.get<AuthUser>(contract.endpoints.me);
        } catch {
          return null;
        }
      },
      staleTime: config.staleTime ?? 5 * 60 * 1000,
      retry: false,
    });
    return { user, isLoading, isError };
  }

  function useLogin() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const setMfaChallenge = useSetAtom(pendingMfaChallengeAtom);
    return useMutation<LoginResult, ApiError, LoginVars>({
      mutationFn: async ({ redirectTo: _, ...body }) => {
        const res = await api.post<LoginResponse>(
          contract.endpoints.login,
          body,
        );

        // MFA challenge — do NOT store token or fetch /auth/me
        if (res.mfaRequired) {
          return { mfaToken: res.mfaToken!, mfaMethods: res.mfaMethods ?? [] };
        }

        if (config.auth !== "cookie") {
          if (res.token) {
            storage.set(res.token);
          }
          if (res.refreshToken) {
            storage.setRefreshToken(res.refreshToken);
          }
        }
        // Fetch the canonical user object
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
        queryClient.setQueryData(AUTH_QUERY_KEY, result);
        onLoginSuccess?.();
        const to = vars.redirectTo ?? config.homePath;
        if (to) navigate({ to });
      },
    });
  }

  function useLogout() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const setMfaChallenge = useSetAtom(pendingMfaChallengeAtom);

    function localCleanup(vars: LogoutVars | void) {
      setMfaChallenge(null);
      storage.clear();
      storage.clearRefreshToken();
      queryClient.clear();
      config.onLogoutSuccess?.();
      onLogoutSuccess?.(); // transport-level cleanup hook (e.g. SSE close)
      const to =
        (vars as LogoutVars | undefined)?.redirectTo ?? config.loginPath;
      if (to) navigate({ to });
    }

    return useMutation<void, ApiError, LogoutVars | void>({
      mutationFn: (vars) => {
        if ((vars as LogoutVars | undefined)?.force) return Promise.resolve();
        return api.post<void>(contract.endpoints.logout, {});
      },
      onSuccess: (_data, vars) => localCleanup(vars),
    });
  }

  function useRegister() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    return useMutation<AuthUser, ApiError, RegisterVars>({
      mutationFn: async ({ redirectTo: _, ...body }) => {
        const res = await api.post<Record<string, unknown>>(
          contract.endpoints.register,
          body,
        );
        if (config.auth !== "cookie") {
          if (res && typeof res["token"] === "string") {
            storage.set(res["token"]);
          }
          if (typeof res["refreshToken"] === "string") {
            storage.setRefreshToken(res["refreshToken"]);
          }
        }
        return api.get<AuthUser>(contract.endpoints.me);
      },
      onSuccess: (user, vars) => {
        queryClient.setQueryData(AUTH_QUERY_KEY, user);
        onLoginSuccess?.();
        const to = vars.redirectTo ?? config.homePath;
        if (to) navigate({ to });
      },
    });
  }

  function useForgotPassword() {
    return useMutation<void, ApiError, ForgotPasswordBody>({
      mutationFn: (body) =>
        api.post<void>(contract.endpoints.forgotPassword, body),
    });
  }

  return { useUser, useLogin, useLogout, useRegister, useForgotPassword };
}
