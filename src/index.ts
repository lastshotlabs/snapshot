export { createSnapshot } from "./create-snapshot";
export { ApiError } from "./api/error";
export { registerClient, getRegisteredClient } from "./api/client";
export { isMfaChallenge } from "./types";
export { formatAuthError, createAuthErrorFormatter } from "./auth/error-format";
export { definePlugin } from "./plugin";
export type {
  SnapshotPlugin,
  PluginSetupContext,
  PluginComponentEntry,
  PluginComponentGroupDefinition,
} from "./plugin";
export { generateManifestSchema } from "./schema-generator";

export type {
  SnapshotConfig,
  SnapshotInstance,
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
