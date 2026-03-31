// ── Core ─────────────────────────────────────────────────────────────────────
export { createSnapshot } from "./create-snapshot";
export { ApiError } from "./api/error";

// ── Plugin system ────────────────────────────────────────────────────────────
export type {
  SnapshotPlugin,
  SnapshotPluginContext,
  SnapshotCallbacks,
  SnapshotCoreConfig,
  SnapshotCorePrimitives,
  SnapshotInstance,
  PluginHooks,
  MergePluginHooks,
} from "./plugins/types";

// ── Plugin factories ─────────────────────────────────────────────────────────
export { createAuthPlugin } from "./plugins/auth-plugin";
export type { AuthPluginConfig, AuthPluginHooks } from "./plugins/auth-plugin";

export { createWsPlugin } from "./plugins/ws-plugin";
export type { WsPluginConfig, WsPluginHooks } from "./plugins/ws-plugin";

export { createSsePlugin } from "./plugins/sse-plugin";
export type { SsePluginConfig, SsePluginHooks } from "./plugins/sse-plugin";

export { createCommunityPlugin } from "./plugins/community-plugin";
export type { CommunityPluginConfig, CommunityPluginHooks } from "./plugins/community-plugin";

export { createWebhookPlugin } from "./plugins/webhook-plugin";

export { createPushPlugin } from "./plugins/push-plugin";
export type { PushPluginConfig, PushPluginHooks } from "./plugins/push-plugin";

// ── Auth types ───────────────────────────────────────────────────────────────
export { isMfaChallenge } from "./types";
export { formatAuthError, createAuthErrorFormatter } from "./auth/error-format";
export { defaultContract, mergeContract } from "./auth/contract";

export type {
  AuthUser,
  LoginBody,
  LoginVars,
  LoginResult,
  LoginResponse,
  RegisterBody,
  RegisterVars,
  LogoutVars,
  ForgotPasswordBody,
  RequestOptions,
  SocketHook,
  MfaMethod,
  MfaChallenge,
  MfaVerifyBody,
  MfaSetupResponse,
  MfaVerifySetupBody,
  MfaVerifySetupResponse,
  MfaDisableBody,
  MfaRecoveryCodesBody,
  MfaRecoveryCodesResponse,
  MfaEmailOtpEnableResponse,
  MfaEmailOtpVerifySetupBody,
  MfaEmailOtpDisableBody,
  MfaResendBody,
  MfaMethodsResponse,
  ResetPasswordBody,
  VerifyEmailBody,
  ResendVerificationBody,
  SetPasswordBody,
  DeleteAccountBody,
  RefreshTokenBody,
  RefreshTokenResponse,
  Session,
  MagicLinkRequestBody,
  MagicLinkVerifyBody,
  ReauthVerifyBody,
  ReauthVerifyResponse,
  OAuthProvider,
  WebAuthnRegisterOptionsResponse,
  WebAuthnRegisterBody,
  WebAuthnCredential,
  PasskeyLoginOptionsBody,
  PasskeyLoginOptionsResponse,
  PasskeyLoginBody,
  PasskeyLoginVars,
  AuthErrorContext,
  AuthErrorConfig,
  SseEndpointConfig,
  SseHookResult,
  SseEventHookResult,
  CommunityNotification,
  CommunityNotificationType,
  UseCommunityNotificationsOpts,
  UseCommunityNotificationsResult,
} from "./types";

export type { TokenStorage } from "./auth/storage";
export type { ApiClient, ApiClientConfig } from "./api/client";
export type { WebSocketManager } from "./ws/manager";
export type { SseConnectionStatus } from "./sse/manager";
export type { AuthContract, AuthContractConfig, AuthEndpoints, AuthHeaders } from "./auth/contract";
export { usePushNotifications } from "./push/hook";
export type { UsePushNotificationsOpts, UsePushNotificationsResult, PushState } from "./push/hook";

// ── Community types ──────────────────────────────────────────────────────────
export { communityContract } from "./community/contract";
export type {
  ContainerResponse,
  CreateContainerBody,
  UpdateContainerBody,
  ThreadResponse,
  CreateThreadBody,
  UpdateThreadBody,
  ReplyResponse,
  CreateReplyBody,
  UpdateReplyBody,
  ReactionBody,
  ReportBody,
  ReportResponse,
  ResolveReportBody,
  BanBody,
  BanResponse,
  BanCheckResponse,
  NotificationResponse,
  PaginatedResponse,
  CommunitySearchParams,
  SearchResponse,
  ListParams,
  ThreadListParams,
  ReplyListParams,
} from "./community/types";
export type { CommunityHooks } from "./community/hooks";

// ── Webhook types ────────────────────────────────────────────────────────────
export { webhooksContract } from "./webhooks/contract";
export type {
  WebhookEndpointResponse,
  CreateWebhookEndpointBody,
  UpdateWebhookEndpointBody,
  WebhookDeliveryResponse,
  ListWebhookEndpointsParams,
  ListWebhookDeliveriesParams,
  TestWebhookBody,
} from "./webhooks/types";
export type { WebhookHooks } from "./webhooks/hooks";
