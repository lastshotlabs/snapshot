import type { UseMutationResult, QueryClient } from "@tanstack/react-query";
import type React from "react";
import type { ApiClient } from "./api/client";
import type { ApiError } from "./api/error";
import type { TokenStorage } from "./auth/storage";
import type { WebSocketManager } from "./ws/manager";
import type { SseConnectionStatus } from "./sse/manager";
import type { ManifestConfig } from "./ui/manifest/types";
import type { CommunityHooks } from "./community/hooks";
import type { WebhookHooks } from "./webhooks/hooks";

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

/** OAuth provider identifier used by auth URL helpers and OAuth hooks. */
export type OAuthProvider =
  | "google"
  | "apple"
  | "microsoft"
  | "github"
  | "facebook"
  | "discord"
  | (string & {});
export interface OAuthExchangeBody {
  code: string;
}
export interface OAuthExchangeResponse {
  token: string;
  userId: string;
  email?: string;
  refreshToken?: string;
}

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
  suppressUnauthenticated?: boolean;
}

// ── SSE types ─────────────────────────────────────────────────────────────────

export interface SseEndpointConfig {
  withCredentials?: boolean;
  onConnected?: () => void;
  onError?: (e: Event) => void;
  onClosed?: () => void;
}

/**
 * SSE configuration. Each key is an endpoint path that must start with `/__sse/`.
 * The value is per-endpoint options. One EventSource is created per endpoint.
 *
 * reconnectOnLogin: whether to reconnect all endpoints on login success (default true).
 */
export interface SseConfig {
  endpoints: Record<string, SseEndpointConfig>;
  reconnectOnLogin?: boolean; // default true
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
  on: <K extends keyof TEvents>(
    event: K,
    handler: (data: TEvents[K]) => void,
  ) => void;
  off: <K extends keyof TEvents>(
    event: K,
    handler: (data: TEvents[K]) => void,
  ) => void;
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

// ── Config ────────────────────────────────────────────────────────────────────

export interface SnapshotConfig {
  /** API base URL for this snapshot instance. */
  apiUrl: string;
  /** Optional environment source used to resolve `{ env: "..." }` manifest refs. */
  env?: Record<string, string | undefined>;
  /**
   * Static API credential. Not a user session token. Do not use in browser
   * deployments - emits a runtime warning in browser contexts.
   */
  bearerToken?: string;
  /** The frontend manifest for the running app. */
  manifest: ManifestConfig;
  /** Optional plugins to register custom components, groups, and setup hooks. */
  plugins?: import("./plugin").SnapshotPlugin[];
}

// ── Instance ──────────────────────────────────────────────────────────────────

export interface SnapshotInstance<
  TWSEvents extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Bootstrap values used to create this snapshot instance. */
  bootstrap: {
    env?: Record<string, string | undefined>;
    bearerToken?: string;
  };
  // High-level hooks
  useUser: () => {
    user: AuthUser | null;
    isLoading: boolean;
    isError: boolean;
  };
  useLogin: () => UseMutationResult<LoginResult, ApiError, LoginVars>;
  useLogout: () => UseMutationResult<void, ApiError, LogoutVars | void>;
  useRegister: () => UseMutationResult<AuthUser, ApiError, RegisterVars>;
  useForgotPassword: () => UseMutationResult<
    void,
    ApiError,
    ForgotPasswordBody
  >;
  useSocket: () => SocketHook<TWSEvents>;
  useRoom: (room: string) => { isSubscribed: boolean };
  useRoomEvent: <T>(
    room: string,
    event: string,
    handler: (data: T) => void,
  ) => void;
  useTheme: () => {
    theme: "light" | "dark";
    toggle: () => void;
    set: (t: "light" | "dark") => void;
  };

  // MFA hooks
  usePendingMfaChallenge: () => MfaChallenge | null;
  useMfaVerify: () => UseMutationResult<
    AuthUser,
    ApiError,
    Omit<MfaVerifyBody, "mfaToken">
  >;
  useMfaSetup: () => UseMutationResult<MfaSetupResponse, ApiError, void>;
  useMfaVerifySetup: () => UseMutationResult<
    MfaVerifySetupResponse,
    ApiError,
    MfaVerifySetupBody
  >;
  useMfaDisable: () => UseMutationResult<
    { message: string },
    ApiError,
    MfaDisableBody
  >;
  useMfaRecoveryCodes: () => UseMutationResult<
    MfaRecoveryCodesResponse,
    ApiError,
    MfaRecoveryCodesBody
  >;
  useMfaEmailOtpEnable: () => UseMutationResult<
    MfaEmailOtpEnableResponse,
    ApiError,
    void
  >;
  useMfaEmailOtpVerifySetup: () => UseMutationResult<
    MfaVerifySetupResponse,
    ApiError,
    MfaEmailOtpVerifySetupBody
  >;
  useMfaEmailOtpDisable: () => UseMutationResult<
    { message: string },
    ApiError,
    MfaEmailOtpDisableBody
  >;
  useMfaResend: () => UseMutationResult<
    { message: string },
    ApiError,
    MfaResendBody
  >;
  useMfaMethods: () => {
    methods: MfaMethod[] | null;
    isLoading: boolean;
    isError: boolean;
  };
  isMfaChallenge: typeof isMfaChallenge;

  // Account hooks
  useResetPassword: () => UseMutationResult<
    { message: string },
    ApiError,
    ResetPasswordBody
  >;
  useVerifyEmail: () => UseMutationResult<
    { message: string },
    ApiError,
    VerifyEmailBody
  >;
  useResendVerification: () => UseMutationResult<
    { message: string },
    ApiError,
    ResendVerificationBody
  >;
  useSetPassword: () => UseMutationResult<
    { message: string },
    ApiError,
    SetPasswordBody
  >;
  useDeleteAccount: () => UseMutationResult<
    void,
    ApiError,
    DeleteAccountBody | void
  >;
  useCancelDeletion: () => UseMutationResult<
    { message: string },
    ApiError,
    void
  >;
  useRefreshToken: () => UseMutationResult<
    RefreshTokenResponse,
    ApiError,
    RefreshTokenBody | void
  >;
  useSessions: () => {
    sessions: Session[];
    isLoading: boolean;
    isError: boolean;
  };
  useRevokeSession: () => UseMutationResult<void, ApiError, string>;

  // OAuth hooks
  useOAuthExchange: () => UseMutationResult<
    OAuthExchangeResponse,
    ApiError,
    OAuthExchangeBody
  >;
  useOAuthUnlink: () => UseMutationResult<void, ApiError, OAuthProvider>;
  getOAuthUrl: (provider: OAuthProvider) => string;
  getLinkUrl: (provider: OAuthProvider) => string;

  // WebAuthn hooks
  useWebAuthnRegisterOptions: () => UseMutationResult<
    WebAuthnRegisterOptionsResponse,
    ApiError,
    void
  >;
  useWebAuthnRegister: () => UseMutationResult<
    { message: string },
    ApiError,
    WebAuthnRegisterBody
  >;
  useWebAuthnCredentials: () => {
    credentials: WebAuthnCredential[];
    isLoading: boolean;
    isError: boolean;
  };
  useWebAuthnRemoveCredential: () => UseMutationResult<
    { message: string },
    ApiError,
    string
  >;
  useWebAuthnDisable: () => UseMutationResult<
    { message: string },
    ApiError,
    void
  >;
  usePasskeyLoginOptions: () => UseMutationResult<
    PasskeyLoginOptionsResponse,
    ApiError,
    PasskeyLoginOptionsBody
  >;
  usePasskeyLogin: () => UseMutationResult<
    LoginResult,
    ApiError,
    PasskeyLoginVars
  >;

  // Auth error formatting
  formatAuthError: (error: ApiError, context: AuthErrorContext) => string;

  // SSE — per-endpoint hooks
  useSSE(endpoint: string): SseHookResult;
  useSseEvent<T = unknown>(
    endpoint: string,
    event: string,
  ): SseEventHookResult<T>;
  onSseEvent(
    endpoint: string,
    event: string,
    handler: (payload: unknown) => void,
  ): () => void;

  // Community notifications (requires sse.endpoints containing /__sse/notifications)
  useCommunityNotifications(
    opts?: UseCommunityNotificationsOpts,
  ): UseCommunityNotificationsResult;

  // Community hooks (always available)
  useContainers: CommunityHooks["useContainers"];
  useContainer: CommunityHooks["useContainer"];
  useCreateContainer: CommunityHooks["useCreateContainer"];
  useUpdateContainer: CommunityHooks["useUpdateContainer"];
  useDeleteContainer: CommunityHooks["useDeleteContainer"];
  useContainerThreads: CommunityHooks["useContainerThreads"];
  useContainerThread: CommunityHooks["useContainerThread"];
  useCreateThread: CommunityHooks["useCreateThread"];
  useUpdateThread: CommunityHooks["useUpdateThread"];
  useDeleteThread: CommunityHooks["useDeleteThread"];
  usePublishThread: CommunityHooks["usePublishThread"];
  useLockThread: CommunityHooks["useLockThread"];
  usePinThread: CommunityHooks["usePinThread"];
  useUnpinThread: CommunityHooks["useUnpinThread"];
  useThreadReplies: CommunityHooks["useThreadReplies"];
  useReply: CommunityHooks["useReply"];
  useCreateReply: CommunityHooks["useCreateReply"];
  useUpdateReply: CommunityHooks["useUpdateReply"];
  useDeleteReply: CommunityHooks["useDeleteReply"];
  useThreadReactions: CommunityHooks["useThreadReactions"];
  useReplyReactions: CommunityHooks["useReplyReactions"];
  useAddThreadReaction: CommunityHooks["useAddThreadReaction"];
  useRemoveThreadReaction: CommunityHooks["useRemoveThreadReaction"];
  useAddReplyReaction: CommunityHooks["useAddReplyReaction"];
  useRemoveReplyReaction: CommunityHooks["useRemoveReplyReaction"];
  useContainerMembers: CommunityHooks["useContainerMembers"];
  useContainerModerators: CommunityHooks["useContainerModerators"];
  useContainerOwners: CommunityHooks["useContainerOwners"];
  useAddMember: CommunityHooks["useAddMember"];
  useRemoveMember: CommunityHooks["useRemoveMember"];
  useAssignModerator: CommunityHooks["useAssignModerator"];
  useRemoveModerator: CommunityHooks["useRemoveModerator"];
  useAssignOwner: CommunityHooks["useAssignOwner"];
  useRemoveOwner: CommunityHooks["useRemoveOwner"];
  useNotifications: CommunityHooks["useNotifications"];
  useNotificationsUnreadCount: CommunityHooks["useNotificationsUnreadCount"];
  useMarkNotificationRead: CommunityHooks["useMarkNotificationRead"];
  useMarkAllNotificationsRead: CommunityHooks["useMarkAllNotificationsRead"];
  useReports: CommunityHooks["useReports"];
  useReport: CommunityHooks["useReport"];
  useCreateReport: CommunityHooks["useCreateReport"];
  useResolveReport: CommunityHooks["useResolveReport"];
  useDismissReport: CommunityHooks["useDismissReport"];
  useBans: CommunityHooks["useBans"];
  useCheckBan: CommunityHooks["useCheckBan"];
  useCreateBan: CommunityHooks["useCreateBan"];
  useRemoveBan: CommunityHooks["useRemoveBan"];
  useSearchThreads: CommunityHooks["useSearchThreads"];
  useSearchReplies: CommunityHooks["useSearchReplies"];

  // Webhook hooks (always available)
  useWebhookEndpoints: WebhookHooks["useWebhookEndpoints"];
  useWebhookEndpoint: WebhookHooks["useWebhookEndpoint"];
  useCreateWebhookEndpoint: WebhookHooks["useCreateWebhookEndpoint"];
  useUpdateWebhookEndpoint: WebhookHooks["useUpdateWebhookEndpoint"];
  useDeleteWebhookEndpoint: WebhookHooks["useDeleteWebhookEndpoint"];
  useWebhookDeliveries: WebhookHooks["useWebhookDeliveries"];
  useWebhookDelivery: WebhookHooks["useWebhookDelivery"];
  useTestWebhookEndpoint: WebhookHooks["useTestWebhookEndpoint"];

  // Primitives for composition
  api: ApiClient;
  tokenStorage: TokenStorage;
  queryClient: QueryClient;
  useWebSocketManager: () => WebSocketManager<TWSEvents> | null;

  // Routing
  protectedBeforeLoad: (ctx: {
    context: { queryClient: QueryClient };
  }) => Promise<void>;
  guestBeforeLoad: (ctx: {
    context: { queryClient: QueryClient };
  }) => Promise<void>;

  // Scaffold component
  QueryProvider: React.FC<{ children: React.ReactNode }>;

  /** Config-driven ManifestApp component, available when `manifest` is provided in config. */
  ManifestApp?: React.ComponentType;
}
