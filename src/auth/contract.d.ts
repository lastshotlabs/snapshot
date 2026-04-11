import type { OAuthProvider } from "../types";
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
export interface AuthHeaders {
    userToken: string;
    csrf: string;
}
export interface AuthContract {
    endpoints: AuthEndpoints;
    sessionRevoke: (id: string) => string;
    webauthnRemoveCredential: (id: string) => string;
    oauthUrl: (provider: OAuthProvider) => string;
    oauthLinkUrl: (provider: OAuthProvider) => string;
    oauthUnlink: (provider: OAuthProvider) => string;
    headers: AuthHeaders;
    csrfCookieName: string;
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
}
export declare function defaultContract(apiUrl: string): AuthContract;
/**
 * Merge a partial auth contract override with the built-in defaults.
 *
 * @param apiUrl - Base API URL used to derive absolute auth URLs
 * @param partial - Partial contract override from bootstrap or manifest config
 * @returns The merged auth contract
 */
export declare function mergeContract(apiUrl: string, partial?: AuthContractConfig): AuthContract;
