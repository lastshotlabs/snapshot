import type { OAuthProvider } from "../types";
/**
 * Relative auth endpoint paths used by Snapshot's built-in auth hooks.
 */
export interface AuthEndpoints {
    me: string;
    login: string;
    logout: string;
    register: string;
    forgotPassword: string;
    refresh: string;
    resetPassword: string;
    verifyEmail: string;
    resendVerification: string;
    setPassword: string;
    deleteAccount: string;
    cancelDeletion: string;
    sessions: string;
    mfaVerify: string;
    mfaSetup: string;
    mfaVerifySetup: string;
    mfaDisable: string;
    mfaRecoveryCodes: string;
    mfaEmailOtpEnable: string;
    mfaEmailOtpVerifySetup: string;
    mfaEmailOtpDisable: string;
    mfaResend: string;
    mfaMethods: string;
    webauthnRegisterOptions: string;
    webauthnRegister: string;
    webauthnCredentials: string;
    webauthnDisable: string;
    passkeyLoginOptions: string;
    passkeyLogin: string;
    oauthExchange: string;
    oauthStart: string;
    oauthCallback: string;
}
/**
 * Header names Snapshot sends for session and CSRF-aware auth requests.
 */
export interface AuthHeaders {
    userToken: string;
    csrf: string;
}
/**
 * Full auth contract used by `createSnapshot()` to build auth URLs and requests.
 */
export interface AuthContract {
    endpoints: AuthEndpoints;
    sessionRevoke: (id: string) => string;
    webauthnRemoveCredential: (id: string) => string;
    oauthUrl: (provider: OAuthProvider) => string;
    oauthLinkUrl: (provider: OAuthProvider) => string;
    oauthUnlink: (provider: OAuthProvider) => string;
    headers: AuthHeaders;
    csrfCookieName: string;
    /** Field in the /me response to use as the canonical user ID. Defaults to "userId" (bunshot default). */
    userIdField: string;
}
/**
 * Partial auth contract overrides.
 */
export interface AuthContractConfig {
    endpoints?: Partial<AuthEndpoints>;
    sessionRevoke?: (id: string) => string;
    webauthnRemoveCredential?: (id: string) => string;
    oauthUrl?: (provider: OAuthProvider) => string;
    oauthLinkUrl?: (provider: OAuthProvider) => string;
    oauthUnlink?: (provider: OAuthProvider) => string;
    headers?: Partial<AuthHeaders>;
    csrfCookieName?: string;
    userIdField?: string;
}
/**
 * Create the built-in auth contract for a given API base URL.
 */
export declare function defaultContract(apiUrl: string): AuthContract;
/**
 * Merge a partial auth contract override with the built-in defaults.
 *
 * @param apiUrl - Base API URL used to derive absolute auth URLs
 * @param partial - Partial contract override from bootstrap or manifest config
 * @returns The merged auth contract
 */
export declare function mergeContract(apiUrl: string, partial?: AuthContractConfig): AuthContract;
