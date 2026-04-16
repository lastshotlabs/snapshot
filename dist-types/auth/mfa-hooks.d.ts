import type { WritableAtom } from "jotai";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type { AuthUser, MfaChallenge, MfaMethod, MfaVerifyBody, MfaSetupResponse, MfaVerifySetupBody, MfaVerifySetupResponse, MfaDisableBody, MfaRecoveryCodesBody, MfaRecoveryCodesResponse, MfaEmailOtpEnableResponse, MfaEmailOtpVerifySetupBody, MfaEmailOtpDisableBody, MfaResendBody } from "../types";
import type { AuthContract } from "../auth/contract";
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
    pendingMfaChallengeAtom: WritableAtom<MfaChallenge | null, [
        MfaChallenge | null
    ], void>;
    onLoginSuccess?: () => void;
}
/**
 * Create MFA-related hooks bound to a single snapshot instance.
 */
export declare function createMfaHooks({ api, storage, config, contract, pendingMfaChallengeAtom, onLoginSuccess, }: MfaHooksOptions): {
    useMfaVerify: () => import("@tanstack/react-query").UseMutationResult<AuthUser, ApiError, Omit<MfaVerifyBody, "mfaToken">, unknown>;
    useMfaSetup: () => import("@tanstack/react-query").UseMutationResult<MfaSetupResponse, ApiError, void, unknown>;
    useMfaVerifySetup: () => import("@tanstack/react-query").UseMutationResult<MfaVerifySetupResponse, ApiError, MfaVerifySetupBody, unknown>;
    useMfaDisable: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, MfaDisableBody, unknown>;
    useMfaRecoveryCodes: () => import("@tanstack/react-query").UseMutationResult<MfaRecoveryCodesResponse, ApiError, MfaRecoveryCodesBody, unknown>;
    useMfaEmailOtpEnable: () => import("@tanstack/react-query").UseMutationResult<MfaEmailOtpEnableResponse, ApiError, void, unknown>;
    useMfaEmailOtpVerifySetup: () => import("@tanstack/react-query").UseMutationResult<MfaVerifySetupResponse, ApiError, MfaEmailOtpVerifySetupBody, unknown>;
    useMfaEmailOtpDisable: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, MfaEmailOtpDisableBody, unknown>;
    useMfaResend: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, MfaResendBody, unknown>;
    useMfaMethods: () => {
        methods: MfaMethod[] | null;
        isLoading: boolean;
        isError: boolean;
    };
};
export {};
