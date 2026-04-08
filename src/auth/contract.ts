import type { OAuthProvider } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Factory ───────────────────────────────────────────────────────────────────

export function defaultContract(apiUrl: string): AuthContract {
  const base = apiUrl.replace(/\/$/, "");
  return {
    endpoints: {
      me: "/auth/me",
      login: "/auth/login",
      logout: "/auth/logout",
      register: "/auth/register",
      forgotPassword: "/auth/forgot-password",
      refresh: "/auth/refresh",
      resetPassword: "/auth/reset-password",
      verifyEmail: "/auth/verify-email",
      resendVerification: "/auth/resend-verification",
      setPassword: "/auth/set-password",
      deleteAccount: "/auth/me",
      cancelDeletion: "/auth/cancel-deletion",
      sessions: "/auth/sessions",
      mfaVerify: "/auth/mfa/verify",
      mfaSetup: "/auth/mfa/setup",
      mfaVerifySetup: "/auth/mfa/verify-setup",
      mfaDisable: "/auth/mfa",
      mfaRecoveryCodes: "/auth/mfa/recovery-codes",
      mfaEmailOtpEnable: "/auth/mfa/email-otp/enable",
      mfaEmailOtpVerifySetup: "/auth/mfa/email-otp/verify-setup",
      mfaEmailOtpDisable: "/auth/mfa/email-otp",
      mfaResend: "/auth/mfa/resend",
      mfaMethods: "/auth/mfa/methods",
      webauthnRegisterOptions: "/auth/mfa/webauthn/register-options",
      webauthnRegister: "/auth/mfa/webauthn/register",
      webauthnCredentials: "/auth/mfa/webauthn/credentials",
      webauthnDisable: "/auth/mfa/webauthn",
      passkeyLoginOptions: "/auth/passkey/login-options",
      passkeyLogin: "/auth/passkey/login",
      oauthExchange: "/auth/oauth/exchange",
    },
    sessionRevoke: (id) => `/auth/sessions/${id}`,
    webauthnRemoveCredential: (id) => `/auth/mfa/webauthn/credentials/${id}`,
    oauthUrl: (provider) => `${base}/auth/${provider}`,
    oauthLinkUrl: (provider) => `${base}/auth/${provider}/link`,
    oauthUnlink: (provider) => `/auth/${provider}/link`,
    headers: {
      userToken: "x-user-token",
      csrf: "x-csrf-token",
    },
    csrfCookieName: "csrf_token",
  };
}

export function mergeContract(
  apiUrl: string,
  partial?: AuthContractConfig,
): AuthContract {
  const def = defaultContract(apiUrl);
  if (!partial) return def;
  return {
    endpoints: { ...def.endpoints, ...partial.endpoints },
    sessionRevoke: partial.sessionRevoke ?? def.sessionRevoke,
    webauthnRemoveCredential:
      partial.webauthnRemoveCredential ?? def.webauthnRemoveCredential,
    oauthUrl: partial.oauthUrl ?? def.oauthUrl,
    oauthLinkUrl: partial.oauthLinkUrl ?? def.oauthLinkUrl,
    oauthUnlink: partial.oauthUnlink ?? def.oauthUnlink,
    headers: { ...def.headers, ...partial.headers },
    csrfCookieName: partial.csrfCookieName ?? def.csrfCookieName,
  };
}
