import type { SseConnectionStatus } from "./sse/manager";

// ── Auth types ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface ForgotPasswordBody {
  email: string;
}

export type LoginVars = LoginBody & { redirectTo?: string };
export type RegisterVars = RegisterBody & { redirectTo?: string };
export interface LogoutVars {
  redirectTo?: string;
  force?: boolean;
}

// ── MFA types ────────────────────────────────────────────────────────────────

export type MfaMethod = "totp" | "emailOtp" | "webauthn";

/** Raw login response shape from bunshot (includes MFA fields) */
export interface LoginResponse {
  token: string;
  userId: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
  mfaMethods?: MfaMethod[];
}

/** Returned by useLogin when mfaRequired is true */
export interface MfaChallenge {
  mfaToken: string;
  mfaMethods: MfaMethod[];
}

/** useLogin resolves to either a user or an MFA challenge */
export type LoginResult = AuthUser | MfaChallenge;

export function isMfaChallenge(result: LoginResult): result is MfaChallenge {
  return "mfaToken" in result && !("id" in result);
}

export interface MfaVerifyBody {
  mfaToken: string;
  code?: string;
  method?: MfaMethod;
  webauthnResponse?: unknown;
}

export interface MfaSetupResponse {
  secret: string;
  uri: string;
}
export interface MfaVerifySetupBody {
  code: string;
}
export interface MfaVerifySetupResponse {
  message: string;
  recoveryCodes: string[];
}
export interface MfaDisableBody {
  code: string;
}
export interface MfaRecoveryCodesBody {
  code: string;
}
export interface MfaRecoveryCodesResponse {
  recoveryCodes: string[];
}
export interface MfaEmailOtpEnableResponse {
  message: string;
  setupToken: string;
}
export interface MfaEmailOtpVerifySetupBody {
  setupToken: string;
  code: string;
}
export interface MfaEmailOtpDisableBody {
  code?: string;
  password?: string;
}
export interface MfaResendBody {
  mfaToken: string;
}
export interface MfaMethodsResponse {
  methods: MfaMethod[];
}

// ── Magic link types ─────────────────────────────────────────────────────────

export interface MagicLinkRequestBody {
  email: string;
}

export interface MagicLinkVerifyBody {
  token: string;
}

// ── Step-up auth types ───────────────────────────────────────────────────────

export interface ReauthVerifyBody {
  password?: string;
  code?: string;
  method?: MfaMethod;
}

export interface ReauthVerifyResponse {
  verified: boolean;
  reauthToken: string;
}

// ── Account types ─────────────────────────────────────────────────────────────

export interface ResetPasswordBody {
  token: string;
  password: string;
}
export interface VerifyEmailBody {
  token: string;
}
export interface ResendVerificationBody {
  email: string;
}
export interface SetPasswordBody {
  password: string;
  currentPassword?: string;
}
export interface DeleteAccountBody {
  password?: string;
}
export interface RefreshTokenBody {
  refreshToken?: string;
}
export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  userId: string;
}
export interface Session {
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
  isActive: boolean;
}

// ── OAuth types ───────────────────────────────────────────────────────────────

export type OAuthProvider = "google" | "apple" | "microsoft" | "github";

// ── WebAuthn types ────────────────────────────────────────────────────────────

export interface WebAuthnRegisterOptionsResponse {
  options: unknown;
  registrationToken: string;
}
export interface WebAuthnRegisterBody {
  registrationToken: string;
  attestationResponse: unknown;
  name?: string;
}
export interface WebAuthnCredential {
  credentialId: string;
  name?: string;
  createdAt: number;
  transports?: string[];
}
export interface WebAuthnRemoveBody {
  credentialId: string;
}

// ── Passkey types (passwordless first-factor login) ───────────────────────

export interface PasskeyLoginOptionsBody {
  identifier?: string;
}
export interface PasskeyLoginOptionsResponse {
  options: unknown;
  passkeyToken: string;
}
export interface PasskeyLoginBody {
  passkeyToken: string;
  assertionResponse: unknown;
}
export type PasskeyLoginVars = PasskeyLoginBody & { redirectTo?: string };

// ── API client types ──────────────────────────────────────────────────────────

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// ── SSE types ─────────────────────────────────────────────────────────────────

export interface SseEndpointConfig {
  withCredentials?: boolean;
  onConnected?: () => void;
  onError?: (e: Event) => void;
  onClosed?: () => void;
}

/** Return type of useSSE(endpoint) */
export interface SseHookResult {
  status: SseConnectionStatus;
}

/** Return type of useSseEvent<T>(endpoint, event) */
export interface SseEventHookResult<T> {
  data: T | null;
  status: SseConnectionStatus;
}

// ── WebSocket types ───────────────────────────────────────────────────────────

export interface SocketHook<TEvents = Record<string, unknown>> {
  isConnected: boolean;
  send: (type: string, payload: unknown) => void;
  subscribe: (room: string) => void;
  unsubscribe: (room: string) => void;
  getRooms: () => string[];
  on: <K extends keyof TEvents>(event: K, handler: (data: TEvents[K]) => void) => void;
  off: <K extends keyof TEvents>(event: K, handler: (data: TEvents[K]) => void) => void;
  reconnect: () => void;
}

// ── Auth error formatting ──────────────────────────────────────────────────

export type AuthErrorContext =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email";

export interface AuthErrorConfig {
  verbose?: boolean;
  messages?: Partial<Record<AuthErrorContext, string>>;
  format?: (error: ApiError, context: AuthErrorContext) => string;
}

// ── Community notification types ──────────────────────────────────────────────

export type CommunityNotificationType = "reply" | "mention" | "ban";

export interface CommunityNotification {
  id: string;
  userId: string;
  type: CommunityNotificationType;
  targetId: string;
  actorId?: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string; // ISO string (serialized from Date)
  tenantId?: string;
}

export interface UseCommunityNotificationsOpts {
  /** Base URL for community notification routes. Default: '/community/notifications' */
  apiBase?: string;
}

export interface UseCommunityNotificationsResult {
  notifications: CommunityNotification[];
  unreadCount: number;
  isConnected: boolean;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}
