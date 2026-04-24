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
/**
 * Minimal authenticated user shape returned by Snapshot auth hooks.
 */
export interface AuthUser {
    id: string;
    email: string;
    [key: string]: unknown;
}
/**
 * Credentials posted to the login endpoint.
 */
export interface LoginBody {
    email: string;
    password: string;
}
/**
 * Registration payload posted to the register endpoint.
 */
export interface RegisterBody {
    email: string;
    password: string;
    [key: string]: unknown;
}
/**
 * Request body for the forgot-password endpoint.
 */
export interface ForgotPasswordBody {
    email: string;
}
/**
 * Login variables accepted by `useLogin()`.
 */
export type LoginVars = LoginBody & {
    redirectTo?: string;
};
/**
 * Registration variables accepted by `useRegister()`.
 */
export type RegisterVars = RegisterBody & {
    redirectTo?: string;
};
/**
 * Logout options accepted by `useLogout()`.
 */
export interface LogoutVars {
    redirectTo?: string;
    force?: boolean;
}
/**
 * MFA method identifiers supported by Snapshot's auth contract.
 */
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
/**
 * Narrow a login result to the MFA challenge branch.
 */
export declare function isMfaChallenge(result: LoginResult): result is MfaChallenge;
/**
 * Request body for verifying an MFA challenge.
 */
export interface MfaVerifyBody {
    mfaToken: string;
    code?: string;
    method?: MfaMethod;
    webauthnResponse?: unknown;
}
/**
 * Setup payload returned when provisioning TOTP MFA.
 */
export interface MfaSetupResponse {
    secret: string;
    uri: string;
}
/**
 * Verification body for confirming an MFA setup flow.
 */
export interface MfaVerifySetupBody {
    code: string;
}
/**
 * Response returned after successful MFA setup verification.
 */
export interface MfaVerifySetupResponse {
    message: string;
    recoveryCodes: string[];
}
/**
 * Request body for disabling MFA.
 */
export interface MfaDisableBody {
    code: string;
}
/**
 * Request body for regenerating recovery codes.
 */
export interface MfaRecoveryCodesBody {
    code: string;
}
/**
 * Recovery codes returned by the auth API.
 */
export interface MfaRecoveryCodesResponse {
    recoveryCodes: string[];
}
/**
 * Response returned when email OTP MFA setup begins.
 */
export interface MfaEmailOtpEnableResponse {
    message: string;
    setupToken: string;
}
/**
 * Request body for confirming email OTP MFA setup.
 */
export interface MfaEmailOtpVerifySetupBody {
    setupToken: string;
    code: string;
}
/**
 * Request body for disabling email OTP MFA.
 */
export interface MfaEmailOtpDisableBody {
    code?: string;
    password?: string;
}
/**
 * Request body for resending an MFA challenge.
 */
export interface MfaResendBody {
    mfaToken: string;
}
/**
 * Response listing the enabled MFA methods for the current user.
 */
export interface MfaMethodsResponse {
    methods: MfaMethod[];
}
/**
 * Request body for completing a password reset flow.
 */
export interface ResetPasswordBody {
    token: string;
    password: string;
}
/**
 * Request body for confirming email verification.
 */
export interface VerifyEmailBody {
    token: string;
}
/**
 * Request body for sending a new verification email.
 */
export interface ResendVerificationBody {
    email: string;
}
/**
 * Request body for setting or rotating an account password.
 */
export interface SetPasswordBody {
    password: string;
    currentPassword?: string;
}
/**
 * Request body for deleting the current account.
 */
export interface DeleteAccountBody {
    password?: string;
}
/**
 * Request body for refreshing auth tokens.
 */
export interface RefreshTokenBody {
    refreshToken?: string;
}
/**
 * Token refresh response returned by the auth API.
 */
export interface RefreshTokenResponse {
    token: string;
    refreshToken?: string;
    userId: string;
}
/**
 * Active session metadata returned by session-management hooks.
 */
export interface Session {
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: number;
    lastActiveAt: number;
    expiresAt: number;
    isActive: boolean;
}
/** OAuth provider identifier used by auth URL helpers and OAuth hooks. */
export type OAuthProvider = "google" | "apple" | "microsoft" | "github" | "facebook" | "discord" | (string & {});
/**
 * Request body for exchanging an OAuth callback code.
 */
export interface OAuthExchangeBody {
    code: string;
}
/**
 * Tokens returned after a successful OAuth exchange.
 */
export interface OAuthExchangeResponse {
    token: string;
    userId: string;
    email?: string;
    refreshToken?: string;
}
/**
 * Response returned when requesting WebAuthn registration options.
 */
export interface WebAuthnRegisterOptionsResponse {
    options: unknown;
    registrationToken: string;
}
/**
 * Request body for registering a WebAuthn credential.
 */
export interface WebAuthnRegisterBody {
    registrationToken: string;
    attestationResponse: unknown;
    name?: string;
}
/**
 * Registered WebAuthn credential metadata.
 */
export interface WebAuthnCredential {
    credentialId: string;
    name?: string;
    createdAt: number;
    transports?: string[];
}
/**
 * Request body for removing a WebAuthn credential.
 */
export interface WebAuthnRemoveBody {
    credentialId: string;
}
/**
 * Request body for retrieving passkey login options.
 */
export interface PasskeyLoginOptionsBody {
    identifier?: string;
}
/**
 * Response returned when beginning a passkey login flow.
 */
export interface PasskeyLoginOptionsResponse {
    options: unknown;
    passkeyToken: string;
}
/**
 * Request body for completing a passkey login.
 */
export interface PasskeyLoginBody {
    passkeyToken: string;
    assertionResponse: unknown;
}
/**
 * Passkey login variables accepted by `usePasskeyLogin()`.
 */
export type PasskeyLoginVars = PasskeyLoginBody & {
    redirectTo?: string;
};
/**
 * Optional overrides for individual API client requests.
 */
export interface RequestOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
    suppressUnauthenticated?: boolean;
}
/**
 * Per-endpoint SSE behavior configuration.
 */
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
    reconnectOnLogin?: boolean;
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
/**
 * Realtime websocket control surface returned by `useSocket()`.
 */
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
/**
 * Auth UI contexts that can provide custom error messaging.
 */
export type AuthErrorContext = "login" | "register" | "forgot-password" | "reset-password" | "verify-email";
/**
 * Optional configuration for auth error formatting.
 */
export interface AuthErrorConfig {
    verbose?: boolean;
    messages?: Partial<Record<AuthErrorContext, string>>;
    format?: (error: ApiError, context: AuthErrorContext) => string;
}
/**
 * Community notification types surfaced by Snapshot's notification helpers.
 */
export type CommunityNotificationType = "reply" | "mention" | "ban";
/**
 * Normalized notification shape used by `useCommunityNotifications()`.
 */
export interface CommunityNotification {
    id: string;
    userId: string;
    type: CommunityNotificationType;
    targetId: string;
    actorId?: string;
    read: boolean;
    data?: Record<string, unknown>;
    createdAt: string;
    tenantId?: string;
}
/**
 * Options for the community notifications hook.
 */
export interface UseCommunityNotificationsOpts {
    /** Base URL for community notification routes. Default: '/community/notifications' */
    apiBase?: string;
}
/**
 * Return shape of `useCommunityNotifications()`.
 */
export interface UseCommunityNotificationsResult {
    notifications: CommunityNotification[];
    unreadCount: number;
    isConnected: boolean;
    markRead(id: string): Promise<void>;
    markAllRead(): Promise<void>;
}
/**
 * Bootstrap configuration for `createSnapshot()`.
 */
/**
 * Bootstrap configuration for `createSnapshot()`.
 *
 * @example
 * ```ts
 * const snap = createSnapshot({
 *   apiUrl: 'https://api.example.com',
 *   manifest: myManifest,
 * });
 * ```
 */
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
/**
 * Runtime surface returned by `createSnapshot()`.
 */
export interface SnapshotInstance<TWSEvents extends Record<string, unknown> = Record<string, unknown>> {
    /** Bootstrap values used to create this snapshot instance. */
    bootstrap: {
        env?: Record<string, string | undefined>;
        bearerToken?: string;
    };
    /** Fetch the current authenticated user. Returns null when logged out. */
    useUser: () => {
        user: AuthUser | null;
        isLoading: boolean;
        isError: boolean;
    };
    /** Post credentials and log in. Returns an MFA challenge instead of a user when MFA is required. */
    useLogin: () => UseMutationResult<LoginResult, ApiError, LoginVars>;
    /** Clear the session, tokens, and query cache. Navigates to the login route on success. */
    useLogout: () => UseMutationResult<void, ApiError, LogoutVars | void>;
    /** Create a new account. Auto-logs in on success when the backend allows it. */
    useRegister: () => UseMutationResult<AuthUser, ApiError, RegisterVars>;
    /** Send a password-reset email to the given address. */
    useForgotPassword: () => UseMutationResult<void, ApiError, ForgotPasswordBody>;
    /** Open and manage a WebSocket connection. Returns connection state and send/close helpers. */
    useSocket: () => SocketHook<TWSEvents>;
    /** Subscribe to a WebSocket room. Returns whether the subscription is active. */
    useRoom: (room: string) => {
        isSubscribed: boolean;
    };
    /** Listen for a specific event on a WebSocket room. The handler fires on each matching message. */
    useRoomEvent: <T>(room: string, event: string, handler: (data: T) => void) => void;
    /** Read and toggle the current color theme (light/dark). */
    useTheme: () => {
        theme: "light" | "dark";
        toggle: () => void;
        set: (t: "light" | "dark") => void;
    };
    /** Read the pending MFA challenge set by a login that returned `mfaRequired: true`. */
    usePendingMfaChallenge: () => MfaChallenge | null;
    /** Verify an MFA code against the pending challenge. Resolves to the authenticated user on success. */
    useMfaVerify: () => UseMutationResult<AuthUser, ApiError, Omit<MfaVerifyBody, "mfaToken">>;
    /** Begin TOTP MFA provisioning. Returns a secret and QR URI for authenticator apps. */
    useMfaSetup: () => UseMutationResult<MfaSetupResponse, ApiError, void>;
    /** Confirm TOTP MFA setup by verifying a code from the authenticator app. */
    useMfaVerifySetup: () => UseMutationResult<MfaVerifySetupResponse, ApiError, MfaVerifySetupBody>;
    /** Disable MFA for the current user. Requires a valid code or recovery code. */
    useMfaDisable: () => UseMutationResult<{
        message: string;
    }, ApiError, MfaDisableBody>;
    /** Regenerate MFA recovery codes. Returns the new codes. */
    useMfaRecoveryCodes: () => UseMutationResult<MfaRecoveryCodesResponse, ApiError, MfaRecoveryCodesBody>;
    /** Begin email OTP MFA enrollment. Sends a verification code to the user's email. */
    useMfaEmailOtpEnable: () => UseMutationResult<MfaEmailOtpEnableResponse, ApiError, void>;
    /** Confirm email OTP MFA setup by verifying the emailed code. */
    useMfaEmailOtpVerifySetup: () => UseMutationResult<MfaVerifySetupResponse, ApiError, MfaEmailOtpVerifySetupBody>;
    /** Disable email OTP MFA for the current user. */
    useMfaEmailOtpDisable: () => UseMutationResult<{
        message: string;
    }, ApiError, MfaEmailOtpDisableBody>;
    /** Resend the MFA challenge code (email OTP or SMS). */
    useMfaResend: () => UseMutationResult<{
        message: string;
    }, ApiError, MfaResendBody>;
    /** List MFA methods currently enabled for the authenticated user. */
    useMfaMethods: () => {
        methods: MfaMethod[] | null;
        isLoading: boolean;
        isError: boolean;
    };
    /** Type-narrowing guard: returns true when a login result is an MFA challenge. */
    isMfaChallenge: typeof isMfaChallenge;
    /** Complete a password reset using the token from the reset email. */
    useResetPassword: () => UseMutationResult<{
        message: string;
    }, ApiError, ResetPasswordBody>;
    /** Confirm the user's email address using a verification token. */
    useVerifyEmail: () => UseMutationResult<{
        message: string;
    }, ApiError, VerifyEmailBody>;
    /** Request a new verification email for the current user. */
    useResendVerification: () => UseMutationResult<{
        message: string;
    }, ApiError, ResendVerificationBody>;
    /** Set or rotate the account password. Requires the current password or a reset token. */
    useSetPassword: () => UseMutationResult<{
        message: string;
    }, ApiError, SetPasswordBody>;
    /** Schedule the current account for deletion. */
    useDeleteAccount: () => UseMutationResult<void, ApiError, DeleteAccountBody | void>;
    /** Cancel a pending account deletion before the grace period expires. */
    useCancelDeletion: () => UseMutationResult<{
        message: string;
    }, ApiError, void>;
    /** Refresh the current access and refresh tokens. */
    useRefreshToken: () => UseMutationResult<RefreshTokenResponse, ApiError, RefreshTokenBody | void>;
    /** List all active sessions for the authenticated user. */
    useSessions: () => {
        sessions: Session[];
        isLoading: boolean;
        isError: boolean;
    };
    /** Revoke a session by its ID. Logs out that device. */
    useRevokeSession: () => UseMutationResult<void, ApiError, string>;
    /** Exchange an OAuth callback code for session tokens. Called after the provider redirects back. */
    useOAuthExchange: () => UseMutationResult<OAuthExchangeResponse, ApiError, OAuthExchangeBody>;
    /** Remove an OAuth provider link from the current account. */
    useOAuthUnlink: () => UseMutationResult<void, ApiError, OAuthProvider>;
    /** Build the redirect URL for starting an OAuth login flow with the given provider. */
    getOAuthUrl: (provider: OAuthProvider) => string;
    /** Build the redirect URL for linking an OAuth provider to the current account. */
    getLinkUrl: (provider: OAuthProvider) => string;
    /** Request WebAuthn registration options (challenge, relying party info) from the server. */
    useWebAuthnRegisterOptions: () => UseMutationResult<WebAuthnRegisterOptionsResponse, ApiError, void>;
    /** Complete WebAuthn credential registration with the attestation response from the authenticator. */
    useWebAuthnRegister: () => UseMutationResult<{
        message: string;
    }, ApiError, WebAuthnRegisterBody>;
    /** List all registered WebAuthn credentials for the current user. */
    useWebAuthnCredentials: () => {
        credentials: WebAuthnCredential[];
        isLoading: boolean;
        isError: boolean;
    };
    /** Remove a registered WebAuthn credential by its ID. */
    useWebAuthnRemoveCredential: () => UseMutationResult<{
        message: string;
    }, ApiError, string>;
    /** Disable WebAuthn for the current user and remove all registered credentials. */
    useWebAuthnDisable: () => UseMutationResult<{
        message: string;
    }, ApiError, void>;
    /** Request passkey login options (challenge) from the server to start a passwordless login. */
    usePasskeyLoginOptions: () => UseMutationResult<PasskeyLoginOptionsResponse, ApiError, PasskeyLoginOptionsBody>;
    /** Complete a passkey login with the assertion response from the authenticator. */
    usePasskeyLogin: () => UseMutationResult<LoginResult, ApiError, PasskeyLoginVars>;
    /** Format an API error into a user-facing auth error message using optional per-context overrides. */
    formatAuthError: (error: ApiError, context: AuthErrorContext) => string;
    /** Connect to a server-sent events endpoint. Returns connection status and a close function. */
    useSSE(endpoint: string): SseHookResult;
    /** Subscribe to a named event on an SSE endpoint. Returns the latest payload and connection status. */
    useSseEvent<T = unknown>(endpoint: string, event: string): SseEventHookResult<T>;
    /** Register a callback for a named SSE event. Returns an unsubscribe function. */
    onSseEvent(endpoint: string, event: string, handler: (payload: unknown) => void): () => void;
    /** Subscribe to real-time community notifications via SSE. Requires an `/__sse/notifications` endpoint. */
    useCommunityNotifications(opts?: UseCommunityNotificationsOpts): UseCommunityNotificationsResult;
    /** List community containers with optional pagination. */
    useContainers: CommunityHooks["useContainers"];
    /** Fetch a single container by ID. */
    useContainer: CommunityHooks["useContainer"];
    /** Create a new community container. */
    useCreateContainer: CommunityHooks["useCreateContainer"];
    /** Update a container's metadata. */
    useUpdateContainer: CommunityHooks["useUpdateContainer"];
    /** Delete a container and its contents. */
    useDeleteContainer: CommunityHooks["useDeleteContainer"];
    /** List threads in a container with pagination and optional filters. */
    useContainerThreads: CommunityHooks["useContainerThreads"];
    /** Fetch a single thread by ID. */
    useContainerThread: CommunityHooks["useContainerThread"];
    /** Create a new thread in a container. */
    useCreateThread: CommunityHooks["useCreateThread"];
    /** Update a thread's content or metadata. */
    useUpdateThread: CommunityHooks["useUpdateThread"];
    /** Delete a thread. */
    useDeleteThread: CommunityHooks["useDeleteThread"];
    /** Publish a draft thread, making it visible to other users. */
    usePublishThread: CommunityHooks["usePublishThread"];
    /** Lock a thread to prevent new replies. */
    useLockThread: CommunityHooks["useLockThread"];
    /** Pin a thread to the top of its container. */
    usePinThread: CommunityHooks["usePinThread"];
    /** Unpin a previously pinned thread. */
    useUnpinThread: CommunityHooks["useUnpinThread"];
    /** List replies in a thread with pagination. */
    useThreadReplies: CommunityHooks["useThreadReplies"];
    /** Fetch a single reply by ID. */
    useReply: CommunityHooks["useReply"];
    /** Post a new reply to a thread. */
    useCreateReply: CommunityHooks["useCreateReply"];
    /** Update a reply's content. */
    useUpdateReply: CommunityHooks["useUpdateReply"];
    /** Delete a reply. */
    useDeleteReply: CommunityHooks["useDeleteReply"];
    /** List reactions on a thread. */
    useThreadReactions: CommunityHooks["useThreadReactions"];
    /** List reactions on a reply. */
    useReplyReactions: CommunityHooks["useReplyReactions"];
    /** Add an emoji reaction to a thread. */
    useAddThreadReaction: CommunityHooks["useAddThreadReaction"];
    /** Remove an emoji reaction from a thread. */
    useRemoveThreadReaction: CommunityHooks["useRemoveThreadReaction"];
    /** Add an emoji reaction to a reply. */
    useAddReplyReaction: CommunityHooks["useAddReplyReaction"];
    /** Remove an emoji reaction from a reply. */
    useRemoveReplyReaction: CommunityHooks["useRemoveReplyReaction"];
    /** List members of a container with pagination. */
    useContainerMembers: CommunityHooks["useContainerMembers"];
    /** List moderators of a container. */
    useContainerModerators: CommunityHooks["useContainerModerators"];
    /** List owners of a container. */
    useContainerOwners: CommunityHooks["useContainerOwners"];
    /** Add a user as a member of a container. */
    useAddMember: CommunityHooks["useAddMember"];
    /** Remove a member from a container. */
    useRemoveMember: CommunityHooks["useRemoveMember"];
    /** Promote a member to moderator. */
    useAssignModerator: CommunityHooks["useAssignModerator"];
    /** Remove moderator role from a user. */
    useRemoveModerator: CommunityHooks["useRemoveModerator"];
    /** Promote a member to owner. */
    useAssignOwner: CommunityHooks["useAssignOwner"];
    /** Remove owner role from a user. */
    useRemoveOwner: CommunityHooks["useRemoveOwner"];
    /** List notifications for the current user with pagination. */
    useNotifications: CommunityHooks["useNotifications"];
    /** Get the count of unread notifications. */
    useNotificationsUnreadCount: CommunityHooks["useNotificationsUnreadCount"];
    /** Mark a single notification as read. */
    useMarkNotificationRead: CommunityHooks["useMarkNotificationRead"];
    /** Mark all notifications as read. */
    useMarkAllNotificationsRead: CommunityHooks["useMarkAllNotificationsRead"];
    /** List moderation reports with pagination. */
    useReports: CommunityHooks["useReports"];
    /** Fetch a single report by ID. */
    useReport: CommunityHooks["useReport"];
    /** File a moderation report against a thread or reply. */
    useCreateReport: CommunityHooks["useCreateReport"];
    /** Resolve a moderation report with an action (e.g., warn, delete). */
    useResolveReport: CommunityHooks["useResolveReport"];
    /** Dismiss a moderation report without taking action. */
    useDismissReport: CommunityHooks["useDismissReport"];
    /** List banned users with pagination. */
    useBans: CommunityHooks["useBans"];
    /** Check whether a specific user is banned. */
    useCheckBan: CommunityHooks["useCheckBan"];
    /** Ban a user from a container or globally. */
    useCreateBan: CommunityHooks["useCreateBan"];
    /** Remove a ban, restoring the user's access. */
    useRemoveBan: CommunityHooks["useRemoveBan"];
    /** Full-text search across threads. */
    useSearchThreads: CommunityHooks["useSearchThreads"];
    /** Full-text search across replies. */
    useSearchReplies: CommunityHooks["useSearchReplies"];
    /** List webhook endpoints with pagination. */
    useWebhookEndpoints: WebhookHooks["useWebhookEndpoints"];
    /** Fetch a single webhook endpoint by ID. */
    useWebhookEndpoint: WebhookHooks["useWebhookEndpoint"];
    /** Create a new webhook endpoint. */
    useCreateWebhookEndpoint: WebhookHooks["useCreateWebhookEndpoint"];
    /** Update an existing webhook endpoint's URL, events, or status. */
    useUpdateWebhookEndpoint: WebhookHooks["useUpdateWebhookEndpoint"];
    /** Delete a webhook endpoint. */
    useDeleteWebhookEndpoint: WebhookHooks["useDeleteWebhookEndpoint"];
    /** List delivery attempts for a webhook endpoint. */
    useWebhookDeliveries: WebhookHooks["useWebhookDeliveries"];
    /** Fetch a single delivery record by ID. */
    useWebhookDelivery: WebhookHooks["useWebhookDelivery"];
    /** Send a test delivery through a webhook endpoint. */
    useTestWebhookEndpoint: WebhookHooks["useTestWebhookEndpoint"];
    /** Low-level API client bound to this snapshot instance. */
    api: ApiClient;
    /** Token storage used for session persistence (access + refresh tokens). */
    tokenStorage: TokenStorage;
    /** TanStack Query client shared across all hooks in this snapshot instance. */
    queryClient: QueryClient;
    /** Access the WebSocket connection manager. Returns null when WebSocket is not configured. */
    useWebSocketManager: () => WebSocketManager<TWSEvents> | null;
    /** Route guard that redirects unauthenticated users to the login page. Use as a `beforeLoad` handler. */
    protectedBeforeLoad: (ctx: {
        context: {
            queryClient: QueryClient;
        };
    }) => Promise<void>;
    /** Route guard that redirects authenticated users away from guest-only pages. Use as a `beforeLoad` handler. */
    guestBeforeLoad: (ctx: {
        context: {
            queryClient: QueryClient;
        };
    }) => Promise<void>;
    /** React provider that wraps children with the TanStack QueryClientProvider for this instance. */
    QueryProvider: React.FC<{
        children: React.ReactNode;
    }>;
    /** Config-driven ManifestApp component, available when `manifest` is provided in config. */
    ManifestApp?: React.ComponentType;
}
