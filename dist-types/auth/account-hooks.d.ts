import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type { ResetPasswordBody, VerifyEmailBody, ResendVerificationBody, SetPasswordBody, DeleteAccountBody, RefreshTokenBody, RefreshTokenResponse, Session } from "../types";
import type { AuthContract } from "../auth/contract";
interface AccountHooksConfig {
    loginPath?: string;
}
interface AccountHooksOptions {
    api: ApiClient;
    storage: TokenStorage;
    config: AccountHooksConfig;
    contract: AuthContract;
    onUnauthenticated?: () => void;
    queryClient: QueryClient;
}
/**
 * Create account-management hooks bound to a single snapshot instance.
 */
export declare function createAccountHooks({ api, storage, config, contract, onUnauthenticated, queryClient: qc, }: AccountHooksOptions): {
    useResetPassword: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, ResetPasswordBody, unknown>;
    useVerifyEmail: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, VerifyEmailBody, unknown>;
    useResendVerification: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, ResendVerificationBody, unknown>;
    useSetPassword: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, SetPasswordBody, unknown>;
    useDeleteAccount: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, void | DeleteAccountBody, unknown>;
    useCancelDeletion: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, void, unknown>;
    useRefreshToken: () => import("@tanstack/react-query").UseMutationResult<RefreshTokenResponse, ApiError, void | RefreshTokenBody, unknown>;
    useSessions: () => {
        sessions: Session[];
        isLoading: boolean;
        isError: boolean;
    };
    useRevokeSession: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, string, unknown>;
};
export {};
