/**
 * @lastshotlabs/snapshot
 *
 * Public SDK entry point for Snapshot. Exposes the runtime factory, core
 * types, auth/community/webhook primitives, and code-first helpers used by
 * downstream apps and framework tooling.
 */
export { createSnapshot } from "./create-snapshot";
export { ApiError } from "./api/error";
export { registerClient, getRegisteredClient } from "./api/client";
export { isMfaChallenge } from "./types";
export { formatAuthError, createAuthErrorFormatter } from "./auth/error-format";
/**
 * Stable query key under which `useUser()` and the route guards cache the
 * authenticated user. Apps can use this to invalidate, seed, or read the
 * cache directly (e.g. after a profile update or external auth state change).
 */
export { AUTH_QUERY_KEY } from "./routing/loaders";
export type {
  SnapshotConfig,
  SnapshotInstance,
  SnapshotAuthConfig,
  SnapshotCacheConfig,
  SnapshotMfaConfig,
  SnapshotOAuthProviderConfig,
  SnapshotSessionConfig,
  SnapshotWebAuthnConfig,
  SnapshotWebSocketConfig,
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
  OAuthProvider,
  OAuthExchangeBody,
  OAuthExchangeResponse,
  WebAuthnRegisterOptionsResponse,
  WebAuthnRegisterBody,
  WebAuthnCredential,
  PasskeyLoginOptionsBody,
  PasskeyLoginOptionsResponse,
  PasskeyLoginBody,
  PasskeyLoginVars,
  AuthErrorContext,
  AuthErrorConfig,
} from "./types";

export type { TokenStorage } from "./auth/storage";
export type { WebSocketManager } from "./ws/manager";
export type { SseConnectionStatus } from "./sse/manager";
export type {
  SseConfig,
  SseEndpointConfig,
  SseHookResult,
  SseEventHookResult,
} from "./types";
export type {
  AuthContract,
  AuthContractConfig,
  AuthEndpoints,
  AuthHeaders,
} from "./auth/contract";
export { defaultContract, mergeContract } from "./auth/contract";
export { usePushNotifications } from "./push/hook";
export type {
  UsePushNotificationsOpts,
  UsePushNotificationsResult,
  PushState,
} from "./push/hook";
export type {
  CommunityNotification,
  CommunityNotificationType,
  UseCommunityNotificationsOpts,
  UseCommunityNotificationsResult,
} from "./types";
export { communityContract } from "./community/contract";
export { communityKeys } from "./community/hooks";
export type {
  AssetRef,
  ContactData,
  ContentFormat,
  EmbedData,
  LocationData,
  QuotePreview,
  SystemEventData,
  VoiceMetadata,
  ContainerResponse,
  CreateContainerBody,
  UpdateContainerBody,
  ThreadResponse,
  CreateThreadBody,
  CreateThreadBodyExtended,
  UpdateThreadBody,
  ReplyResponse,
  CreateReplyBody,
  CreateReplyBodyExtended,
  UpdateReplyBody,
  ReactionBody,
  ReactionResponse,
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
