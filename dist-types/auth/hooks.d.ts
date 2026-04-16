import type { WritableAtom } from "jotai";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type { AuthUser, LoginVars, LoginResult, LogoutVars, RegisterVars, ForgotPasswordBody, MfaChallenge } from "../types";
import type { AuthContract } from "../auth/contract";
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
    pendingMfaChallengeAtom: WritableAtom<MfaChallenge | null, [
        MfaChallenge | null
    ], void>;
    onLoginSuccess?: () => void;
    onLogoutSuccess?: () => void;
}
/**
 * Create auth-related hooks bound to a single snapshot instance.
 */
export declare function createAuthHooks({ api, storage, config, contract, pendingMfaChallengeAtom, onLoginSuccess, onLogoutSuccess, }: AuthHooksOptions): {
    useUser: () => {
        user: AuthUser | null;
        isLoading: boolean;
        isError: boolean;
    };
    useLogin: () => import("@tanstack/react-query").UseMutationResult<LoginResult, ApiError, LoginVars, unknown>;
    useLogout: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, void | LogoutVars, unknown>;
    useRegister: () => import("@tanstack/react-query").UseMutationResult<AuthUser, ApiError, RegisterVars, unknown>;
    useForgotPassword: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, ForgotPasswordBody, unknown>;
};
export {};
