---
title: SDK Reference
description: Generated from src/index.ts and the declarations it re-exports.
draft: false
---

Generated from `src/index.ts`.

## Contents

- [Factory](#factory) (1)
- [API Client](#api-client) (3)
- [Auth](#auth) (52)
- [Community](#community) (29)
- [Webhooks](#webhooks) (9)
- [Plugins](#plugins) (5)
- [Push Notifications](#push-notifications) (4)
- [Realtime](#realtime) (7)
- [Schema Generation](#schema-generation) (1)
- [Core Types](#core-types) (4)

<details>
<summary><strong>All exports (alphabetical)</strong></summary>

| Export | Kind | Source | Description |
|---|---|---|---|
| `ApiError` | class | `src/api/error.ts` | HTTP error thrown by Snapshot API clients for non-success responses. |
| `AuthContract` | interface | `src/auth/contract.ts` | Full auth contract used by `createSnapshot()` to build auth URLs and requests. |
| `AuthContractConfig` | interface | `src/auth/contract.ts` | Partial auth contract overrides. |
| `AuthEndpoints` | interface | `src/auth/contract.ts` | Relative auth endpoint paths used by Snapshot's built-in auth hooks. |
| `AuthErrorConfig` | interface | `src/types.ts` | Optional configuration for auth error formatting. |
| `AuthErrorContext` | typealias | `src/types.ts` | Auth UI contexts that can provide custom error messaging. |
| `AuthHeaders` | interface | `src/auth/contract.ts` | Header names Snapshot sends for session and CSRF-aware auth requests. |
| `AuthUser` | interface | `src/types.ts` | Minimal authenticated user shape returned by Snapshot auth hooks. |
| `BanBody` | interface | `src/community/types.ts` | Request body for creating a user ban. |
| `BanCheckResponse` | interface | `src/community/types.ts` | Result returned when checking whether a user is banned. |
| `BanResponse` | interface | `src/community/types.ts` | Ban record returned by moderation endpoints. |
| `communityContract` | variable | `src/community/contract.ts` | Built-in route contract for Snapshot community APIs. |
| `CommunityHooks` | typealias | `src/community/hooks.ts` | Hook surface returned by `createCommunityHooks()`. |
| `CommunityNotification` | interface | `src/types.ts` | Normalized notification shape used by `useCommunityNotifications()`. |
| `CommunityNotificationType` | typealias | `src/types.ts` | Community notification types surfaced by Snapshot's notification helpers. |
| `CommunitySearchParams` | interface | `src/community/types.ts` | Search parameters accepted by the community search hooks. |
| `ContainerResponse` | interface | `src/community/types.ts` | Community container returned by the community API. |
| `createAuthErrorFormatter` | function | `src/auth/error-format.ts` | Create a reusable auth error formatter with shared formatting rules. |
| `CreateContainerBody` | interface | `src/community/types.ts` | Request body for creating a community container. |
| `CreateReplyBody` | interface | `src/community/types.ts` | Request body for creating a reply. |
| `createSnapshot` | function | `src/create-snapshot.tsx` | Create a per-instance snapshot runtime from bootstrap config and a manifest.  Resolves manifest env refs, builds per-instance runtime managers, and wires manifest-driven auth/realtime workflow dispatch events. |
| `CreateThreadBody` | interface | `src/community/types.ts` | Request body for creating a thread in a container. |
| `CreateWebhookEndpointBody` | interface | `src/webhooks/types.ts` | Request body for creating a webhook endpoint. |
| `defaultContract` | function | `src/auth/contract.ts` | Create the built-in auth contract for a given API base URL. |
| `definePlugin` | function | `src/plugin.ts` | Identity function for defining plugins with full type inference. No runtime logic. Exists solely so `const p = definePlugin({...})` gives full autocomplete on the plugin shape. |
| `DeleteAccountBody` | interface | `src/types.ts` | Request body for deleting the current account. |
| `ForgotPasswordBody` | interface | `src/types.ts` | Request body for the forgot-password endpoint. |
| `formatAuthError` | function | `src/auth/error-format.ts` | Format a raw auth `ApiError` into the message shown to application code. |
| `generateManifestSchema` | function | `src/schema-generator.ts` | Generate a JSON Schema for the snapshot manifest and write it to disk.  When called without plugins, produces the built-in schema. Consumer apps call this with their plugins to get a schema that includes custom types. |
| `getRegisteredClient` | function | `src/api/client.ts` | Look up a previously registered custom client factory. |
| `isMfaChallenge` | function | `src/types.ts` | Narrow a login result to the MFA challenge branch. |
| `ListParams` | interface | `src/community/types.ts` | Shared page-based pagination parameters. |
| `ListWebhookDeliveriesParams` | interface | `src/webhooks/types.ts` | Parameters for listing deliveries for a single webhook endpoint. |
| `ListWebhookEndpointsParams` | interface | `src/webhooks/types.ts` | Page-based pagination parameters for listing webhook endpoints. |
| `LoginBody` | interface | `src/types.ts` | Credentials posted to the login endpoint. |
| `LoginResponse` | interface | `src/types.ts` | Raw login response shape from bunshot (includes MFA fields) |
| `LoginResult` | typealias | `src/types.ts` | useLogin resolves to either a user or an MFA challenge |
| `LoginVars` | typealias | `src/types.ts` | Login variables accepted by `useLogin()`. |
| `LogoutVars` | interface | `src/types.ts` | Logout options accepted by `useLogout()`. |
| `mergeContract` | function | `src/auth/contract.ts` | Merge a partial auth contract override with the built-in defaults. |
| `MfaChallenge` | interface | `src/types.ts` | Returned by useLogin when mfaRequired is true |
| `MfaDisableBody` | interface | `src/types.ts` | Request body for disabling MFA. |
| `MfaEmailOtpDisableBody` | interface | `src/types.ts` | Request body for disabling email OTP MFA. |
| `MfaEmailOtpEnableResponse` | interface | `src/types.ts` | Response returned when email OTP MFA setup begins. |
| `MfaEmailOtpVerifySetupBody` | interface | `src/types.ts` | Request body for confirming email OTP MFA setup. |
| `MfaMethod` | typealias | `src/types.ts` | MFA method identifiers supported by Snapshot's auth contract. |
| `MfaMethodsResponse` | interface | `src/types.ts` | Response listing the enabled MFA methods for the current user. |
| `MfaRecoveryCodesBody` | interface | `src/types.ts` | Request body for regenerating recovery codes. |
| `MfaRecoveryCodesResponse` | interface | `src/types.ts` | Recovery codes returned by the auth API. |
| `MfaResendBody` | interface | `src/types.ts` | Request body for resending an MFA challenge. |
| `MfaSetupResponse` | interface | `src/types.ts` | Setup payload returned when provisioning TOTP MFA. |
| `MfaVerifyBody` | interface | `src/types.ts` | Request body for verifying an MFA challenge. |
| `MfaVerifySetupBody` | interface | `src/types.ts` | Verification body for confirming an MFA setup flow. |
| `MfaVerifySetupResponse` | interface | `src/types.ts` | Response returned after successful MFA setup verification. |
| `NotificationResponse` | interface | `src/community/types.ts` | Notification record returned by community notification endpoints. |
| `OAuthExchangeBody` | interface | `src/types.ts` | Request body for exchanging an OAuth callback code. |
| `OAuthExchangeResponse` | interface | `src/types.ts` | Tokens returned after a successful OAuth exchange. |
| `OAuthProvider` | typealias | `src/types.ts` | OAuth provider identifier used by auth URL helpers and OAuth hooks. |
| `PaginatedResponse` | interface | `src/community/types.ts` | Generic paginated list response used by community and webhook list endpoints. |
| `PasskeyLoginBody` | interface | `src/types.ts` | Request body for completing a passkey login. |
| `PasskeyLoginOptionsBody` | interface | `src/types.ts` | Request body for retrieving passkey login options. |
| `PasskeyLoginOptionsResponse` | interface | `src/types.ts` | Response returned when beginning a passkey login flow. |
| `PasskeyLoginVars` | typealias | `src/types.ts` | Passkey login variables accepted by `usePasskeyLogin()`. |
| `PluginComponentEntry` | interface | `src/plugin.ts` | A component entry in a plugin: the React component + its Zod schema. |
| `PluginComponentGroupDefinition` | interface | `src/plugin.ts` | A component group definition in a plugin. |
| `PluginSetupContext` | interface | `src/plugin.ts` | Context passed to plugin setup() hooks. |
| `PushState` | typealias | `src/push/hook.ts` | High-level browser push subscription state reported by `usePushNotifications()`. |
| `ReactionBody` | interface | `src/community/types.ts` | Emoji reaction payload for thread and reply reaction endpoints. |
| `RefreshTokenBody` | interface | `src/types.ts` | Request body for refreshing auth tokens. |
| `RefreshTokenResponse` | interface | `src/types.ts` | Token refresh response returned by the auth API. |
| `RegisterBody` | interface | `src/types.ts` | Registration payload posted to the register endpoint. |
| `registerClient` | function | `src/api/client.ts` | Register a named custom client factory. |
| `RegisterVars` | typealias | `src/types.ts` | Registration variables accepted by `useRegister()`. |
| `ReplyListParams` | interface | `src/community/types.ts` | List parameters for fetching replies in a specific thread. |
| `ReplyResponse` | interface | `src/community/types.ts` | Reply record returned by the community API. |
| `ReportBody` | interface | `src/community/types.ts` | Request body for filing a community moderation report. |
| `ReportResponse` | interface | `src/community/types.ts` | Report record returned by moderation endpoints. |
| `RequestOptions` | interface | `src/types.ts` | Optional overrides for individual API client requests. |
| `ResendVerificationBody` | interface | `src/types.ts` | Request body for sending a new verification email. |
| `ResetPasswordBody` | interface | `src/types.ts` | Request body for completing a password reset flow. |
| `ResolveReportBody` | interface | `src/community/types.ts` | Request body for resolving a moderation report. |
| `SearchResponse` | interface | `src/community/types.ts` | Search results returned by the thread and reply search endpoints. |
| `Session` | interface | `src/types.ts` | Active session metadata returned by session-management hooks. |
| `SetPasswordBody` | interface | `src/types.ts` | Request body for setting or rotating an account password. |
| `SnapshotConfig` | interface | `src/types.ts` | Bootstrap configuration for `createSnapshot()`. |
| `SnapshotInstance` | interface | `src/types.ts` | Runtime surface returned by `createSnapshot()`. |
| `SnapshotPlugin` | interface | `src/plugin.ts` | Snapshot plugin interface. |
| `SocketHook` | interface | `src/types.ts` | Realtime websocket control surface returned by `useSocket()`. |
| `SseConfig` | interface | `src/types.ts` | SSE configuration. Each key is an endpoint path that must start with `/__sse/`. The value is per-endpoint options. One EventSource is created per endpoint. reconnectOnLogin: whether to reconnect all endpoints on login success (default true). |
| `SseConnectionStatus` | typealias | `src/sse/manager.ts` | Lifecycle state of a managed SSE connection. |
| `SseEndpointConfig` | interface | `src/types.ts` | Per-endpoint SSE behavior configuration. |
| `SseEventHookResult` | interface | `src/types.ts` | Return type of useSseEvent<T>(endpoint, event) |
| `SseHookResult` | interface | `src/types.ts` | Return type of useSSE(endpoint) |
| `TestWebhookBody` | interface | `src/webhooks/types.ts` | Request body for sending a test delivery through a webhook endpoint. |
| `ThreadListParams` | interface | `src/community/types.ts` | List parameters for fetching threads in a specific container. |
| `ThreadResponse` | interface | `src/community/types.ts` | Thread record returned by the community API. |
| `TokenStorage` | interface | `src/auth/storage.ts` | Per-instance token storage used by Snapshot auth flows. |
| `UpdateContainerBody` | interface | `src/community/types.ts` | Request body for updating a community container. |
| `UpdateReplyBody` | interface | `src/community/types.ts` | Request body for updating an existing reply. |
| `UpdateThreadBody` | interface | `src/community/types.ts` | Request body for updating or moderating a thread. |
| `UpdateWebhookEndpointBody` | interface | `src/webhooks/types.ts` | Request body for updating a webhook endpoint. |
| `UseCommunityNotificationsOpts` | interface | `src/types.ts` | Options for the community notifications hook. |
| `UseCommunityNotificationsResult` | interface | `src/types.ts` | Return shape of `useCommunityNotifications()`. |
| `usePushNotifications` | function | `src/push/hook.ts` | Standalone hook for Web Push subscription management. No dependency on Snapshot's SSE or auth infrastructure. CSRF: /__push/* routes are CSRF-exempt by design. No CSRF header is sent. Auth: requests use credentials: 'include' (cookie auth). Service worker setup: copy sw.js from node_modules/@lastshotlabs/snapshot/dist/sw.js to your project's public/sw.js, OR use `snapshot init` which scaffolds it automatically. |
| `UsePushNotificationsOpts` | interface | `src/push/hook.ts` | Optional overrides for the manifest-backed push configuration. |
| `UsePushNotificationsResult` | interface | `src/push/hook.ts` | Return shape of `usePushNotifications()`. |
| `VerifyEmailBody` | interface | `src/types.ts` | Request body for confirming email verification. |
| `WebAuthnCredential` | interface | `src/types.ts` | Registered WebAuthn credential metadata. |
| `WebAuthnRegisterBody` | interface | `src/types.ts` | Request body for registering a WebAuthn credential. |
| `WebAuthnRegisterOptionsResponse` | interface | `src/types.ts` | Response returned when requesting WebAuthn registration options. |
| `WebhookDeliveryResponse` | interface | `src/webhooks/types.ts` | Delivery record returned for a webhook endpoint event attempt. |
| `WebhookEndpointResponse` | interface | `src/webhooks/types.ts` | Webhook endpoint record returned by the webhook API. |
| `WebhookHooks` | typealias | `src/webhooks/hooks.ts` | Hook surface returned by `createWebhookHooks()`. |
| `webhooksContract` | variable | `src/webhooks/contract.ts` | Built-in route contract for Snapshot webhook APIs. |
| `WebSocketManager` | class | `src/ws/manager.ts` | Per-instance WebSocket connection manager. |

</details>

## Factory

| Export | Kind | Description |
|---|---|---|
| `createSnapshot` | function | Create a per-instance snapshot runtime from bootstrap config and a manifest.  Resolves manifest env refs, builds per-instance runtime managers, and wires manifest-driven auth/realtime workflow dispatch events. |

### Details

#### `createSnapshot<TWSEvents extends Record<string, unknown> = Record<string, unknown>>(config: SnapshotConfig) => SnapshotInstance<TWSEvents>`

Create a per-instance snapshot runtime from bootstrap config and a manifest.

Resolves manifest env refs, builds per-instance runtime managers, and wires
manifest-driven auth/realtime workflow dispatch events.

**Parameters:**

| Name | Description |
|------|-------------|
| `config` | Four-field bootstrap config |

**Returns:** A fully initialized snapshot instance

**Example:**

```ts
import { createSnapshot } from '@lastshotlabs/snapshot';
import manifest from './manifest.json';

const snap = createSnapshot({
  apiUrl: 'https://api.example.com',
  manifest,
});

// Use hooks in your React components
function App() {
  const { user } = snap.useUser();
  return user ? <div>Hello {user.email}</div> : <LoginForm />;
}
```

---

## API Client

| Export | Kind | Description |
|---|---|---|
| `ApiError` | class | HTTP error thrown by Snapshot API clients for non-success responses. |
| `getRegisteredClient` | function | Look up a previously registered custom client factory. |
| `registerClient` | function | Register a named custom client factory. |

### Details

#### `getRegisteredClient(name: string) => ClientFactory | undefined`

Look up a previously registered custom client factory.

**Parameters:**

| Name | Description |
|------|-------------|
| `name` | Registered client factory name |

**Returns:** The registered factory when found

---

#### `registerClient(name: string, factory: ClientFactory) => void`

Register a named custom client factory.

**Parameters:**

| Name | Description |
|------|-------------|
| `name` | Manifest-facing client factory name |
| `factory` | Factory that creates an ApiClient-like instance |

---

## Auth

| Export | Kind | Description |
|---|---|---|
| `AuthContract` | interface | Full auth contract used by `createSnapshot()` to build auth URLs and requests. |
| `AuthContractConfig` | interface | Partial auth contract overrides. |
| `AuthEndpoints` | interface | Relative auth endpoint paths used by Snapshot's built-in auth hooks. |
| `AuthErrorConfig` | interface | Optional configuration for auth error formatting. |
| `AuthErrorContext` | typealias | Auth UI contexts that can provide custom error messaging. |
| `AuthHeaders` | interface | Header names Snapshot sends for session and CSRF-aware auth requests. |
| `AuthUser` | interface | Minimal authenticated user shape returned by Snapshot auth hooks. |
| `createAuthErrorFormatter` | function | Create a reusable auth error formatter with shared formatting rules. |
| `defaultContract` | function | Create the built-in auth contract for a given API base URL. |
| `DeleteAccountBody` | interface | Request body for deleting the current account. |
| `ForgotPasswordBody` | interface | Request body for the forgot-password endpoint. |
| `formatAuthError` | function | Format a raw auth `ApiError` into the message shown to application code. |
| `LoginBody` | interface | Credentials posted to the login endpoint. |
| `LoginResponse` | interface | Raw login response shape from bunshot (includes MFA fields) |
| `LoginResult` | typealias | useLogin resolves to either a user or an MFA challenge |
| `LoginVars` | typealias | Login variables accepted by `useLogin()`. |
| `LogoutVars` | interface | Logout options accepted by `useLogout()`. |
| `mergeContract` | function | Merge a partial auth contract override with the built-in defaults. |
| `MfaChallenge` | interface | Returned by useLogin when mfaRequired is true |
| `MfaDisableBody` | interface | Request body for disabling MFA. |
| `MfaEmailOtpDisableBody` | interface | Request body for disabling email OTP MFA. |
| `MfaEmailOtpEnableResponse` | interface | Response returned when email OTP MFA setup begins. |
| `MfaEmailOtpVerifySetupBody` | interface | Request body for confirming email OTP MFA setup. |
| `MfaMethod` | typealias | MFA method identifiers supported by Snapshot's auth contract. |
| `MfaMethodsResponse` | interface | Response listing the enabled MFA methods for the current user. |
| `MfaRecoveryCodesBody` | interface | Request body for regenerating recovery codes. |
| `MfaRecoveryCodesResponse` | interface | Recovery codes returned by the auth API. |
| `MfaResendBody` | interface | Request body for resending an MFA challenge. |
| `MfaSetupResponse` | interface | Setup payload returned when provisioning TOTP MFA. |
| `MfaVerifyBody` | interface | Request body for verifying an MFA challenge. |
| `MfaVerifySetupBody` | interface | Verification body for confirming an MFA setup flow. |
| `MfaVerifySetupResponse` | interface | Response returned after successful MFA setup verification. |
| `OAuthExchangeBody` | interface | Request body for exchanging an OAuth callback code. |
| `OAuthExchangeResponse` | interface | Tokens returned after a successful OAuth exchange. |
| `OAuthProvider` | typealias | OAuth provider identifier used by auth URL helpers and OAuth hooks. |
| `PasskeyLoginBody` | interface | Request body for completing a passkey login. |
| `PasskeyLoginOptionsBody` | interface | Request body for retrieving passkey login options. |
| `PasskeyLoginOptionsResponse` | interface | Response returned when beginning a passkey login flow. |
| `PasskeyLoginVars` | typealias | Passkey login variables accepted by `usePasskeyLogin()`. |
| `RefreshTokenBody` | interface | Request body for refreshing auth tokens. |
| `RefreshTokenResponse` | interface | Token refresh response returned by the auth API. |
| `RegisterBody` | interface | Registration payload posted to the register endpoint. |
| `RegisterVars` | typealias | Registration variables accepted by `useRegister()`. |
| `ResendVerificationBody` | interface | Request body for sending a new verification email. |
| `ResetPasswordBody` | interface | Request body for completing a password reset flow. |
| `Session` | interface | Active session metadata returned by session-management hooks. |
| `SetPasswordBody` | interface | Request body for setting or rotating an account password. |
| `TokenStorage` | interface | Per-instance token storage used by Snapshot auth flows. |
| `VerifyEmailBody` | interface | Request body for confirming email verification. |
| `WebAuthnCredential` | interface | Registered WebAuthn credential metadata. |
| `WebAuthnRegisterBody` | interface | Request body for registering a WebAuthn credential. |
| `WebAuthnRegisterOptionsResponse` | interface | Response returned when requesting WebAuthn registration options. |

### Details

#### `createAuthErrorFormatter(config?: AuthErrorConfig | undefined) => (error: ApiError, context: AuthErrorContext) => string`

Create a reusable auth error formatter with shared formatting rules.

**Example:**

```ts
const format = createAuthErrorFormatter({ verbose: false });
const message = format(apiError, 'login');
```

---

#### `defaultContract(apiUrl: string) => AuthContract`

Create the built-in auth contract for a given API base URL.

---

#### `formatAuthError(error: ApiError, context: AuthErrorContext, config?: AuthErrorConfig | undefined) => string`

Format a raw auth `ApiError` into the message shown to application code.

**Example:**

```ts
const message = formatAuthError(apiError, 'login');

// With custom config
const message = formatAuthError(apiError, 'register', {
  verbose: true,
  messages: { register: 'Registration failed.' },
});
```

---

#### `mergeContract(apiUrl: string, partial?: AuthContractConfig | undefined) => AuthContract`

Merge a partial auth contract override with the built-in defaults.

**Parameters:**

| Name | Description |
|------|-------------|
| `apiUrl` | Base API URL used to derive absolute auth URLs |
| `partial` | Partial contract override from bootstrap or manifest config |

**Returns:** The merged auth contract

---

## Community

| Export | Kind | Description |
|---|---|---|
| `BanBody` | interface | Request body for creating a user ban. |
| `BanCheckResponse` | interface | Result returned when checking whether a user is banned. |
| `BanResponse` | interface | Ban record returned by moderation endpoints. |
| `communityContract` | variable | Built-in route contract for Snapshot community APIs. |
| `CommunityHooks` | typealias | Hook surface returned by `createCommunityHooks()`. |
| `CommunityNotification` | interface | Normalized notification shape used by `useCommunityNotifications()`. |
| `CommunityNotificationType` | typealias | Community notification types surfaced by Snapshot's notification helpers. |
| `CommunitySearchParams` | interface | Search parameters accepted by the community search hooks. |
| `ContainerResponse` | interface | Community container returned by the community API. |
| `CreateContainerBody` | interface | Request body for creating a community container. |
| `CreateReplyBody` | interface | Request body for creating a reply. |
| `CreateThreadBody` | interface | Request body for creating a thread in a container. |
| `ListParams` | interface | Shared page-based pagination parameters. |
| `NotificationResponse` | interface | Notification record returned by community notification endpoints. |
| `PaginatedResponse` | interface | Generic paginated list response used by community and webhook list endpoints. |
| `ReactionBody` | interface | Emoji reaction payload for thread and reply reaction endpoints. |
| `ReplyListParams` | interface | List parameters for fetching replies in a specific thread. |
| `ReplyResponse` | interface | Reply record returned by the community API. |
| `ReportBody` | interface | Request body for filing a community moderation report. |
| `ReportResponse` | interface | Report record returned by moderation endpoints. |
| `ResolveReportBody` | interface | Request body for resolving a moderation report. |
| `SearchResponse` | interface | Search results returned by the thread and reply search endpoints. |
| `ThreadListParams` | interface | List parameters for fetching threads in a specific container. |
| `ThreadResponse` | interface | Thread record returned by the community API. |
| `UpdateContainerBody` | interface | Request body for updating a community container. |
| `UpdateReplyBody` | interface | Request body for updating an existing reply. |
| `UpdateThreadBody` | interface | Request body for updating or moderating a thread. |
| `UseCommunityNotificationsOpts` | interface | Options for the community notifications hook. |
| `UseCommunityNotificationsResult` | interface | Return shape of `useCommunityNotifications()`. |

## Webhooks

| Export | Kind | Description |
|---|---|---|
| `CreateWebhookEndpointBody` | interface | Request body for creating a webhook endpoint. |
| `ListWebhookDeliveriesParams` | interface | Parameters for listing deliveries for a single webhook endpoint. |
| `ListWebhookEndpointsParams` | interface | Page-based pagination parameters for listing webhook endpoints. |
| `TestWebhookBody` | interface | Request body for sending a test delivery through a webhook endpoint. |
| `UpdateWebhookEndpointBody` | interface | Request body for updating a webhook endpoint. |
| `WebhookDeliveryResponse` | interface | Delivery record returned for a webhook endpoint event attempt. |
| `WebhookEndpointResponse` | interface | Webhook endpoint record returned by the webhook API. |
| `WebhookHooks` | typealias | Hook surface returned by `createWebhookHooks()`. |
| `webhooksContract` | variable | Built-in route contract for Snapshot webhook APIs. |

## Plugins

| Export | Kind | Description |
|---|---|---|
| `definePlugin` | function | Identity function for defining plugins with full type inference. No runtime logic. Exists solely so `const p = definePlugin({...})` gives full autocomplete on the plugin shape. |
| `PluginComponentEntry` | interface | A component entry in a plugin: the React component + its Zod schema. |
| `PluginComponentGroupDefinition` | interface | A component group definition in a plugin. |
| `PluginSetupContext` | interface | Context passed to plugin setup() hooks. |
| `SnapshotPlugin` | interface | Snapshot plugin interface. |

### Details

#### `definePlugin(plugin: SnapshotPlugin) => SnapshotPlugin`

Identity function for defining plugins with full type inference.

No runtime logic. Exists solely so `const p = definePlugin({...})` gives
full autocomplete on the plugin shape.

**Parameters:**

| Name | Description |
|------|-------------|
| `plugin` | The plugin definition |

**Returns:** The same plugin definition, typed

**Example:**

```ts
const myPlugin = definePlugin({
  name: 'my-plugin',
  components: [{ type: 'my-widget', component: MyWidget, schema: myWidgetSchema }],
});
```

---

## Push Notifications

| Export | Kind | Description |
|---|---|---|
| `PushState` | typealias | High-level browser push subscription state reported by `usePushNotifications()`. |
| `usePushNotifications` | function | Standalone hook for Web Push subscription management. No dependency on Snapshot's SSE or auth infrastructure. CSRF: /__push/* routes are CSRF-exempt by design. No CSRF header is sent. Auth: requests use credentials: 'include' (cookie auth). Service worker setup: copy sw.js from node_modules/@lastshotlabs/snapshot/dist/sw.js to your project's public/sw.js, OR use `snapshot init` which scaffolds it automatically. |
| `UsePushNotificationsOpts` | interface | Optional overrides for the manifest-backed push configuration. |
| `UsePushNotificationsResult` | interface | Return shape of `usePushNotifications()`. |

### Details

#### `usePushNotifications(opts?: UsePushNotificationsOpts | undefined) => UsePushNotificationsResult`

Standalone hook for Web Push subscription management.
No dependency on Snapshot's SSE or auth infrastructure.

CSRF: /__push/* routes are CSRF-exempt by design. No CSRF header is sent.
Auth: requests use credentials: 'include' (cookie auth).

Service worker setup: copy sw.js from node_modules/@lastshotlabs/snapshot/dist/sw.js
to your project's public/sw.js, OR use `snapshot init` which scaffolds it automatically.

**Example:**

```ts
const { state, subscribe, unsubscribe } = usePushNotifications();

// With custom options
const { state, subscribe, unsubscribe } = usePushNotifications({
  vapidPublicKey: 'BEl62i...',
  subscribeUrl: '/api/push/subscribe',
});
```

---

## Realtime

| Export | Kind | Description |
|---|---|---|
| `SocketHook` | interface | Realtime websocket control surface returned by `useSocket()`. |
| `SseConfig` | interface | SSE configuration. Each key is an endpoint path that must start with `/__sse/`. The value is per-endpoint options. One EventSource is created per endpoint. reconnectOnLogin: whether to reconnect all endpoints on login success (default true). |
| `SseConnectionStatus` | typealias | Lifecycle state of a managed SSE connection. |
| `SseEndpointConfig` | interface | Per-endpoint SSE behavior configuration. |
| `SseEventHookResult` | interface | Return type of useSseEvent<T>(endpoint, event) |
| `SseHookResult` | interface | Return type of useSSE(endpoint) |
| `WebSocketManager` | class | Per-instance WebSocket connection manager. |

## Schema Generation

| Export | Kind | Description |
|---|---|---|
| `generateManifestSchema` | function | Generate a JSON Schema for the snapshot manifest and write it to disk.  When called without plugins, produces the built-in schema. Consumer apps call this with their plugins to get a schema that includes custom types. |

### Details

#### `generateManifestSchema(options: GenerateOptions) => void`

Generate a JSON Schema for the snapshot manifest and write it to disk.

When called without plugins, produces the built-in schema. Consumer apps
call this with their plugins to get a schema that includes custom types.

**Parameters:**

| Name | Description |
|------|-------------|
| `options` | Generation options |

**Example:**

```ts
// Generate the built-in schema only
generateManifestSchema({ outPath: './manifest.schema.json' });

// Include custom plugin types in the schema
generateManifestSchema({
  plugins: [myPlugin],
  outPath: './manifest.schema.json',
  iconNames: ['home', 'settings', 'user'],
});
```

---

## Core Types

| Export | Kind | Description |
|---|---|---|
| `isMfaChallenge` | function | Narrow a login result to the MFA challenge branch. |
| `RequestOptions` | interface | Optional overrides for individual API client requests. |
| `SnapshotConfig` | interface | Bootstrap configuration for `createSnapshot()`. |
| `SnapshotInstance` | interface | Runtime surface returned by `createSnapshot()`. |

### Details

#### `isMfaChallenge(result: LoginResult) => result is MfaChallenge`

Narrow a login result to the MFA challenge branch.

---

#### `SnapshotConfig` *(interface)*

Bootstrap configuration for `createSnapshot()`.

**Members:**

| Name | Type | Description |
|------|------|-------------|
| `apiUrl` | `string` | API base URL for this snapshot instance. |
| `env` | `Record<string, string \| undefined> \| undefined` | Optional environment source used to resolve `{ env: "..." }` manifest refs. |
| `bearerToken` | `string \| undefined` | Static API credential. Not a user session token. Do not use in browser deployments - emits a runtime warning in browser contexts. |
| `manifest` | `ManifestConfig` | The frontend manifest for the running app. |
| `plugins` | `SnapshotPlugin[] \| undefined` | Optional plugins to register custom components, groups, and setup hooks. |

**Example:**

```ts
const snap = createSnapshot({
  apiUrl: 'https://api.example.com',
  manifest: myManifest,
});
```

---

#### `SnapshotInstance` *(interface)*

Runtime surface returned by `createSnapshot()`.

**Members:**

| Name | Type | Description |
|------|------|-------------|
| `bootstrap` | `{ env?: Record<string, string \| undefined> \| undefined; bearerToken?: string ...` | Bootstrap values used to create this snapshot instance. |
| `useUser` | `() => { user: AuthUser \| null; isLoading: boolean; isError: boolean; }` | Fetch the current authenticated user. Returns null when logged out. |
| `useLogin` | `() => UseMutationResult<LoginResult, ApiError, LoginVars>` | Post credentials and log in. Returns an MFA challenge instead of a user when MFA is required. |
| `useLogout` | `() => UseMutationResult<void, ApiError, void \| LogoutVars>` | Clear the session, tokens, and query cache. Navigates to the login route on success. |
| `useRegister` | `() => UseMutationResult<AuthUser, ApiError, RegisterVars>` | Create a new account. Auto-logs in on success when the backend allows it. |
| `useForgotPassword` | `() => UseMutationResult<void, ApiError, ForgotPasswordBody>` | Send a password-reset email to the given address. |
| `useSocket` | `() => SocketHook<TWSEvents>` | Open and manage a WebSocket connection. Returns connection state and send/close helpers. |
| `useRoom` | `(room: string) => { isSubscribed: boolean; }` | Subscribe to a WebSocket room. Returns whether the subscription is active. |
| `useRoomEvent` | `<T>(room: string, event: string, handler: (data: T) => void) => void` | Listen for a specific event on a WebSocket room. The handler fires on each matching message. |
| `useTheme` | `() => { theme: "light" \| "dark"; toggle: () => void; set: (t: "light" \| "dark...` | Read and toggle the current color theme (light/dark). |
| `usePendingMfaChallenge` | `() => MfaChallenge \| null` | Read the pending MFA challenge set by a login that returned `mfaRequired: true`. |
| `useMfaVerify` | `() => UseMutationResult<AuthUser, ApiError, Omit<MfaVerifyBody, "mfaToken">>` | Verify an MFA code against the pending challenge. Resolves to the authenticated user on success. |
| `useMfaSetup` | `() => UseMutationResult<MfaSetupResponse, ApiError, void>` | Begin TOTP MFA provisioning. Returns a secret and QR URI for authenticator apps. |
| `useMfaVerifySetup` | `() => UseMutationResult<MfaVerifySetupResponse, ApiError, MfaVerifySetupBody>` | Confirm TOTP MFA setup by verifying a code from the authenticator app. |
| `useMfaDisable` | `() => UseMutationResult<{ message: string; }, ApiError, MfaDisableBody>` | Disable MFA for the current user. Requires a valid code or recovery code. |
| `useMfaRecoveryCodes` | `() => UseMutationResult<MfaRecoveryCodesResponse, ApiError, MfaRecoveryCodesB...` | Regenerate MFA recovery codes. Returns the new codes. |
| `useMfaEmailOtpEnable` | `() => UseMutationResult<MfaEmailOtpEnableResponse, ApiError, void>` | Begin email OTP MFA enrollment. Sends a verification code to the user's email. |
| `useMfaEmailOtpVerifySetup` | `() => UseMutationResult<MfaVerifySetupResponse, ApiError, MfaEmailOtpVerifySe...` | Confirm email OTP MFA setup by verifying the emailed code. |
| `useMfaEmailOtpDisable` | `() => UseMutationResult<{ message: string; }, ApiError, MfaEmailOtpDisableBody>` | Disable email OTP MFA for the current user. |
| `useMfaResend` | `() => UseMutationResult<{ message: string; }, ApiError, MfaResendBody>` | Resend the MFA challenge code (email OTP or SMS). |
| `useMfaMethods` | `() => { methods: MfaMethod[] \| null; isLoading: boolean; isError: boolean; }` | List MFA methods currently enabled for the authenticated user. |
| `isMfaChallenge` | `(result: LoginResult) => result is MfaChallenge` | Type-narrowing guard: returns true when a login result is an MFA challenge. |
| `useResetPassword` | `() => UseMutationResult<{ message: string; }, ApiError, ResetPasswordBody>` | Complete a password reset using the token from the reset email. |
| `useVerifyEmail` | `() => UseMutationResult<{ message: string; }, ApiError, VerifyEmailBody>` | Confirm the user's email address using a verification token. |
| `useResendVerification` | `() => UseMutationResult<{ message: string; }, ApiError, ResendVerificationBody>` | Request a new verification email for the current user. |
| `useSetPassword` | `() => UseMutationResult<{ message: string; }, ApiError, SetPasswordBody>` | Set or rotate the account password. Requires the current password or a reset token. |
| `useDeleteAccount` | `() => UseMutationResult<void, ApiError, void \| DeleteAccountBody>` | Schedule the current account for deletion. |
| `useCancelDeletion` | `() => UseMutationResult<{ message: string; }, ApiError, void>` | Cancel a pending account deletion before the grace period expires. |
| `useRefreshToken` | `() => UseMutationResult<RefreshTokenResponse, ApiError, void \| RefreshTokenBody>` | Refresh the current access and refresh tokens. |
| `useSessions` | `() => { sessions: Session[]; isLoading: boolean; isError: boolean; }` | List all active sessions for the authenticated user. |
| `useRevokeSession` | `() => UseMutationResult<void, ApiError, string>` | Revoke a session by its ID. Logs out that device. |
| `useOAuthExchange` | `() => UseMutationResult<OAuthExchangeResponse, ApiError, OAuthExchangeBody>` | Exchange an OAuth callback code for session tokens. Called after the provider redirects back. |
| `useOAuthUnlink` | `() => UseMutationResult<void, ApiError, OAuthProvider>` | Remove an OAuth provider link from the current account. |
| `getOAuthUrl` | `(provider: OAuthProvider) => string` | Build the redirect URL for starting an OAuth login flow with the given provider. |
| `getLinkUrl` | `(provider: OAuthProvider) => string` | Build the redirect URL for linking an OAuth provider to the current account. |
| `useWebAuthnRegisterOptions` | `() => UseMutationResult<WebAuthnRegisterOptionsResponse, ApiError, void>` | Request WebAuthn registration options (challenge, relying party info) from the server. |
| `useWebAuthnRegister` | `() => UseMutationResult<{ message: string; }, ApiError, WebAuthnRegisterBody>` | Complete WebAuthn credential registration with the attestation response from the authenticator. |
| `useWebAuthnCredentials` | `() => { credentials: WebAuthnCredential[]; isLoading: boolean; isError: boole...` | List all registered WebAuthn credentials for the current user. |
| `useWebAuthnRemoveCredential` | `() => UseMutationResult<{ message: string; }, ApiError, string>` | Remove a registered WebAuthn credential by its ID. |
| `useWebAuthnDisable` | `() => UseMutationResult<{ message: string; }, ApiError, void>` | Disable WebAuthn for the current user and remove all registered credentials. |
| `usePasskeyLoginOptions` | `() => UseMutationResult<PasskeyLoginOptionsResponse, ApiError, PasskeyLoginOp...` | Request passkey login options (challenge) from the server to start a passwordless login. |
| `usePasskeyLogin` | `() => UseMutationResult<LoginResult, ApiError, PasskeyLoginVars>` | Complete a passkey login with the assertion response from the authenticator. |
| `formatAuthError` | `(error: ApiError, context: AuthErrorContext) => string` | Format an API error into a user-facing auth error message using optional per-context overrides. |
| `useSSE` | `(endpoint: string) => SseHookResult` | Connect to a server-sent events endpoint. Returns connection status and a close function. |
| `useSseEvent` | `<T = unknown>(endpoint: string, event: string) => SseEventHookResult<T>` | Subscribe to a named event on an SSE endpoint. Returns the latest payload and connection status. |
| `onSseEvent` | `(endpoint: string, event: string, handler: (payload: unknown) => void) => () ...` | Register a callback for a named SSE event. Returns an unsubscribe function. |
| `useCommunityNotifications` | `(opts?: UseCommunityNotificationsOpts \| undefined) => UseCommunityNotificatio...` | Subscribe to real-time community notifications via SSE. Requires an `/__sse/notifications` endpoint. |
| `useContainers` | `(params?: ListParams \| undefined) => UseQueryResult<PaginatedResponse<Contain...` | List community containers with optional pagination. |
| `useContainer` | `(containerId: string) => UseQueryResult<ContainerResponse, ApiError>` | Fetch a single container by ID. |
| `useCreateContainer` | `() => UseMutationResult<ContainerResponse, ApiError, CreateContainerBody, unk...` | Create a new community container. |
| `useUpdateContainer` | `() => UseMutationResult<ContainerResponse, ApiError, { containerId: string; }...` | Update a container's metadata. |
| `useDeleteContainer` | `() => UseMutationResult<void, ApiError, { containerId: string; }, unknown>` | Delete a container and its contents. |
| `useContainerThreads` | `({ containerId, ...params }: ThreadListParams) => UseQueryResult<PaginatedRes...` | List threads in a container with pagination and optional filters. |
| `useContainerThread` | `(threadId: string) => UseQueryResult<ThreadResponse, ApiError>` | Fetch a single thread by ID. |
| `useCreateThread` | `() => UseMutationResult<ThreadResponse, ApiError, { containerId: string; } & ...` | Create a new thread in a container. |
| `useUpdateThread` | `() => UseMutationResult<ThreadResponse, ApiError, { threadId: string; contain...` | Update a thread's content or metadata. |
| `useDeleteThread` | `() => UseMutationResult<void, ApiError, { threadId: string; containerId: stri...` | Delete a thread. |
| `usePublishThread` | `() => UseMutationResult<ThreadResponse, ApiError, { threadId: string; contain...` | Publish a draft thread, making it visible to other users. |
| `useLockThread` | `() => UseMutationResult<ThreadResponse, ApiError, { threadId: string; contain...` | Lock a thread to prevent new replies. |
| `usePinThread` | `() => UseMutationResult<ThreadResponse, ApiError, { threadId: string; contain...` | Pin a thread to the top of its container. |
| `useUnpinThread` | `() => UseMutationResult<ThreadResponse, ApiError, { threadId: string; contain...` | Unpin a previously pinned thread. |
| `useThreadReplies` | `({ threadId, ...params }: ReplyListParams) => UseQueryResult<PaginatedRespons...` | List replies in a thread with pagination. |
| `useReply` | `(replyId: string) => UseQueryResult<ReplyResponse, ApiError>` | Fetch a single reply by ID. |
| `useCreateReply` | `() => UseMutationResult<ReplyResponse, ApiError, { threadId: string; } & Crea...` | Post a new reply to a thread. |
| `useUpdateReply` | `() => UseMutationResult<ReplyResponse, ApiError, { replyId: string; threadId:...` | Update a reply's content. |
| `useDeleteReply` | `() => UseMutationResult<void, ApiError, { replyId: string; threadId: string; ...` | Delete a reply. |
| `useThreadReactions` | `(threadId: string) => UseQueryResult<ReactionBody[], ApiError>` | List reactions on a thread. |
| `useReplyReactions` | `(replyId: string) => UseQueryResult<ReactionBody[], ApiError>` | List reactions on a reply. |
| `useAddThreadReaction` | `() => UseMutationResult<void, ApiError, { threadId: string; containerId: stri...` | Add an emoji reaction to a thread. |
| `useRemoveThreadReaction` | `() => UseMutationResult<void, ApiError, { threadId: string; containerId: stri...` | Remove an emoji reaction from a thread. |
| `useAddReplyReaction` | `() => UseMutationResult<void, ApiError, { replyId: string; threadId: string; ...` | Add an emoji reaction to a reply. |
| `useRemoveReplyReaction` | `() => UseMutationResult<void, ApiError, { replyId: string; threadId: string; ...` | Remove an emoji reaction from a reply. |
| `useContainerMembers` | `(containerId: string, params?: ListParams \| undefined) => UseQueryResult<Pagi...` | List members of a container with pagination. |
| `useContainerModerators` | `(containerId: string, params?: ListParams \| undefined) => UseQueryResult<Pagi...` | List moderators of a container. |
| `useContainerOwners` | `(containerId: string, params?: ListParams \| undefined) => UseQueryResult<Pagi...` | List owners of a container. |
| `useAddMember` | `() => UseMutationResult<void, ApiError, { containerId: string; userId: string...` | Add a user as a member of a container. |
| `useRemoveMember` | `() => UseMutationResult<void, ApiError, { containerId: string; userId: string...` | Remove a member from a container. |
| `useAssignModerator` | `() => UseMutationResult<void, ApiError, { containerId: string; userId: string...` | Promote a member to moderator. |
| `useRemoveModerator` | `() => UseMutationResult<void, ApiError, { containerId: string; userId: string...` | Remove moderator role from a user. |
| `useAssignOwner` | `() => UseMutationResult<void, ApiError, { containerId: string; userId: string...` | Promote a member to owner. |
| `useRemoveOwner` | `() => UseMutationResult<void, ApiError, { containerId: string; userId: string...` | Remove owner role from a user. |
| `useNotifications` | `(params?: ListParams \| undefined) => UseQueryResult<PaginatedResponse<Notific...` | List notifications for the current user with pagination. |
| `useNotificationsUnreadCount` | `() => UseQueryResult<{ count: number; }, ApiError>` | Get the count of unread notifications. |
| `useMarkNotificationRead` | `() => UseMutationResult<void, ApiError, { notificationId: string; }, unknown>` | Mark a single notification as read. |
| `useMarkAllNotificationsRead` | `() => UseMutationResult<void, ApiError, void, unknown>` | Mark all notifications as read. |
| `useReports` | `(params?: ListParams \| undefined) => UseQueryResult<PaginatedResponse<ReportR...` | List moderation reports with pagination. |
| `useReport` | `(reportId: string) => UseQueryResult<ReportResponse, ApiError>` | Fetch a single report by ID. |
| `useCreateReport` | `() => UseMutationResult<ReportResponse, ApiError, ReportBody, unknown>` | File a moderation report against a thread or reply. |
| `useResolveReport` | `() => UseMutationResult<ReportResponse, ApiError, { reportId: string; } & Res...` | Resolve a moderation report with an action (e.g., warn, delete). |
| `useDismissReport` | `() => UseMutationResult<ReportResponse, ApiError, { reportId: string; }, unkn...` | Dismiss a moderation report without taking action. |
| `useBans` | `(params?: ListParams \| undefined) => UseQueryResult<PaginatedResponse<BanResp...` | List banned users with pagination. |
| `useCheckBan` | `(userId: string, containerId?: string \| undefined) => UseQueryResult<BanCheck...` | Check whether a specific user is banned. |
| `useCreateBan` | `() => UseMutationResult<BanResponse, ApiError, BanBody, unknown>` | Ban a user from a container or globally. |
| `useRemoveBan` | `() => UseMutationResult<void, ApiError, { banId: string; userId: string; }, u...` | Remove a ban, restoring the user's access. |
| `useSearchThreads` | `(params: CommunitySearchParams & { q: string; }) => UseQueryResult<SearchResp...` | Full-text search across threads. |
| `useSearchReplies` | `(params: CommunitySearchParams & { q: string; }) => UseQueryResult<SearchResp...` | Full-text search across replies. |
| `useWebhookEndpoints` | `() => UseQueryResult<WebhookEndpointResponse[], ApiError>` | List webhook endpoints with pagination. |
| `useWebhookEndpoint` | `(endpointId: string) => UseQueryResult<WebhookEndpointResponse, ApiError>` | Fetch a single webhook endpoint by ID. |
| `useCreateWebhookEndpoint` | `() => UseMutationResult<WebhookEndpointResponse, ApiError, CreateWebhookEndpo...` | Create a new webhook endpoint. |
| `useUpdateWebhookEndpoint` | `() => UseMutationResult<WebhookEndpointResponse, ApiError, { endpointId: stri...` | Update an existing webhook endpoint's URL, events, or status. |
| `useDeleteWebhookEndpoint` | `() => UseMutationResult<void, ApiError, { endpointId: string; }, unknown>` | Delete a webhook endpoint. |
| `useWebhookDeliveries` | `({ endpointId, page, pageSize, }: ListWebhookDeliveriesParams) => UseQueryRes...` | List delivery attempts for a webhook endpoint. |
| `useWebhookDelivery` | `(deliveryId: string) => UseQueryResult<WebhookDeliveryResponse, ApiError>` | Fetch a single delivery record by ID. |
| `useTestWebhookEndpoint` | `() => UseMutationResult<void, ApiError, { endpointId: string; } & TestWebhook...` | Send a test delivery through a webhook endpoint. |
| `api` | `ApiClient` | Low-level API client bound to this snapshot instance. |
| `tokenStorage` | `TokenStorage` | Token storage used for session persistence (access + refresh tokens). |
| `queryClient` | `QueryClient` | TanStack Query client shared across all hooks in this snapshot instance. |
| `useWebSocketManager` | `() => WebSocketManager<TWSEvents> \| null` | Access the WebSocket connection manager. Returns null when WebSocket is not configured. |
| `protectedBeforeLoad` | `(ctx: { context: { queryClient: QueryClient; }; }) => Promise<void>` | Route guard that redirects unauthenticated users to the login page. Use as a `beforeLoad` handler. |
| `guestBeforeLoad` | `(ctx: { context: { queryClient: QueryClient; }; }) => Promise<void>` | Route guard that redirects authenticated users away from guest-only pages. Use as a `beforeLoad` handler. |
| `QueryProvider` | `FC<{ children: ReactNode; }>` | React provider that wraps children with the TanStack QueryClientProvider for this instance. |
| `ManifestApp` | `ComponentType<{}> \| undefined` | Config-driven ManifestApp component, available when `manifest` is provided in config. |

---
