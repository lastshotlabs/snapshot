import type { WritableAtom } from "jotai";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "../auth/storage";
import type { WebAuthnRegisterOptionsResponse, WebAuthnRegisterBody, WebAuthnCredential, PasskeyLoginOptionsBody, PasskeyLoginOptionsResponse, PasskeyLoginVars, LoginResult, MfaChallenge } from "../types";
import type { AuthContract } from "../auth/contract";
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
    pendingMfaChallengeAtom: WritableAtom<MfaChallenge | null, [
        MfaChallenge | null
    ], void>;
    onLoginSuccess?: () => void;
}
/**
 * Create WebAuthn and passkey hooks bound to a single snapshot instance.
 */
export declare function createWebAuthnHooks({ api, storage, config, contract, pendingMfaChallengeAtom, onLoginSuccess, }: WebAuthnHooksOptions): {
    useWebAuthnRegisterOptions: () => import("@tanstack/react-query").UseMutationResult<WebAuthnRegisterOptionsResponse, ApiError, void, unknown>;
    useWebAuthnRegister: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, WebAuthnRegisterBody, unknown>;
    useWebAuthnCredentials: () => {
        credentials: WebAuthnCredential[];
        isLoading: boolean;
        isError: boolean;
    };
    useWebAuthnRemoveCredential: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, string, unknown>;
    useWebAuthnDisable: () => import("@tanstack/react-query").UseMutationResult<{
        message: string;
    }, ApiError, void, unknown>;
    usePasskeyLoginOptions: () => import("@tanstack/react-query").UseMutationResult<PasskeyLoginOptionsResponse, ApiError, PasskeyLoginOptionsBody, unknown>;
    usePasskeyLogin: () => import("@tanstack/react-query").UseMutationResult<LoginResult, ApiError, PasskeyLoginVars, unknown>;
};
export {};
