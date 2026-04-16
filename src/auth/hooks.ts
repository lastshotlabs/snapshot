import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import type { WritableAtom } from "jotai";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type {
  AuthUser,
  LoginVars,
  LoginResult,
  LoginResponse,
  LogoutVars,
  RegisterVars,
  ForgotPasswordBody,
  MfaChallenge,
} from "../types";
import { isMfaChallenge } from "../types";
import type { AuthContract } from "../auth/contract";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

interface AuthHooksConfig {
  auth?: "cookie" | "token";
  staleTime?: number;
  loginPath?: string;
  homePath?: string;
  mfaPath?: string;
  onLogoutSuccess?: () => void;
}

interface AuthHooksOptions {
  api: ApiClient;
  storage: TokenStorage;
  config: AuthHooksConfig;
  contract: AuthContract;
  pendingMfaChallengeAtom: WritableAtom<
    MfaChallenge | null,
    [MfaChallenge | null],
    void
  >;
  onLoginSuccess?: () => void; // called by createSnapshot to trigger WS/SSE reconnect
  onLogoutSuccess?: () => void; // called by createSnapshot to trigger SSE close
}

/**
 * Create auth-related hooks bound to a single snapshot instance.
 */
export function createAuthHooks({
  api,
  storage,
  config,
  contract,
  pendingMfaChallengeAtom,
  onLoginSuccess,
  onLogoutSuccess,
}: AuthHooksOptions) {
  /** Fetch the current authenticated user via the `me` endpoint. Returns null when logged out or on error. */
  function useUser() {
    const {
      data: user = null,
      isLoading,
      isError,
    } = useQuery<AuthUser | null, ApiError>({
      queryKey: AUTH_QUERY_KEY,
      queryFn: async () => {
        try {
          const raw = await api.get<Record<string, unknown>>(
            contract.endpoints.me,
            { suppressUnauthenticated: true },
          );
          if (!raw) return null;
          const idValue = raw[contract.userIdField] ?? raw["id"];
          return { ...raw, id: String(idValue) } as AuthUser;
        } catch {
          return null;
        }
      },
      staleTime: config.staleTime ?? 5 * 60 * 1000,
      retry: false,
    });
    return { user, isLoading, isError };
  }

  /** Log in with credentials, handling MFA challenges, token storage, and post-login navigation. */
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

  /** Log out the current user, clear tokens and query cache, and navigate to the login path. */
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

  /** Register a new user, store auth tokens, fetch the created user, and navigate to the home path. */
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

  /** Send a forgot-password request to the server for the given email. */
  function useForgotPassword() {
    return useMutation<void, ApiError, ForgotPasswordBody>({
      mutationFn: (body) =>
        api.post<void>(contract.endpoints.forgotPassword, body),
    });
  }

  return { useUser, useLogin, useLogout, useRegister, useForgotPassword };
}
