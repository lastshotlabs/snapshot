# API Cheatsheet

This is the current public Snapshot surface after the code-first cleanup.

## Main Entry

```ts
import { createSnapshot } from "@lastshotlabs/snapshot";

const snapshot = createSnapshot({
  apiUrl: "https://api.example.com",
});
```

### `SnapshotConfig`

| Field | Purpose |
| --- | --- |
| `apiUrl` | Required backend base URL |
| `bearerToken` | Static API credential for trusted server contexts |
| `auth.session` | Cookie or token session mode, token storage, token key |
| `auth.contract` | Auth endpoint/header overrides |
| `auth.providers` | OAuth provider settings |
| `auth.mfa` | MFA setup defaults |
| `auth.webauthn` | WebAuthn relying-party settings |
| `auth.on` | `unauthenticated`, `forbidden`, and `logout` callbacks |
| `cache` | TanStack Query defaults: `staleTime`, `gcTime`, `retry` |
| `ws` | WebSocket URL, auth strategy, reconnect behavior, event handlers |
| `sse` | Server-sent event endpoints and handlers |
| `loginPath` | Redirect target for auth-required routes |
| `homePath` | Redirect target for guest-only routes |
| `mfaPath` | Redirect target when login requires MFA |

## Runtime Instance

`createSnapshot()` returns a per-app runtime object.

| Area | Surface |
| --- | --- |
| Provider | `QueryProvider` |
| Auth | `useUser`, `useLogin`, `useLogout`, `useRegister`, `useForgotPassword` |
| Account | `useResetPassword`, `useVerifyEmail`, `useResendVerification`, `useSetPassword`, `useDeleteAccount`, `useCancelDeletion`, `useRefreshToken`, `useSessions`, `useRevokeSession` |
| MFA | `usePendingMfaChallenge`, `useMfaVerify`, `useMfaSetup`, `useMfaVerifySetup`, `useMfaDisable`, `useMfaRecoveryCodes`, `useMfaEmailOtpEnable`, `useMfaEmailOtpVerifySetup`, `useMfaEmailOtpDisable`, `useMfaResend`, `useMfaMethods`, `isMfaChallenge` |
| OAuth | `useOAuthExchange`, `useOAuthUnlink`, `getOAuthUrl`, `getLinkUrl` |
| WebAuthn | `useWebAuthnRegisterOptions`, `useWebAuthnRegister`, `useWebAuthnCredentials`, `useWebAuthnRemoveCredential`, `useWebAuthnDisable`, `usePasskeyLoginOptions`, `usePasskeyLogin` |
| Realtime | `useSocket`, `useRoom`, `useRoomEvent`, `useSSE`, `useSseEvent`, `onSseEvent`, `useCommunityNotifications` |
| Community | container, thread, reply, reaction, member, notification, report, ban, and search hooks |
| Webhooks | endpoint, delivery, and test-delivery hooks |
| Routing | `protect`, `guest`, `protectedBeforeLoad`, `guestBeforeLoad`, `setNavigator` |
| Primitives | `api`, `tokenStorage`, `queryClient`, `useWebSocketManager`, `formatAuthError`, `useTheme` |

## Auth Example

```tsx
import { isMfaChallenge } from "@lastshotlabs/snapshot";
import { snapshot } from "./snapshot";

export function LoginButton() {
  const login = snapshot.useLogin();

  return (
    <button
      disabled={login.isPending}
      onClick={async () => {
        const result = await login.mutateAsync({
          email: "person@example.com",
          password: "secret",
        });

        if (isMfaChallenge(result)) {
          window.location.assign("/mfa");
        }
      }}
    >
      Sign in
    </button>
  );
}
```

## API Client

The runtime exposes a low-level client for direct calls:

```ts
const profile = await snapshot.api.get<{ name: string }>("/account/profile");

await snapshot.api.post("/account/profile", {
  name: "Ada",
});
```

Methods:

- `request<T>(method, path, body?, options?)`
- `get<T>(path, options?)`
- `post<T>(path, body, options?)`
- `put<T>(path, body, options?)`
- `patch<T>(path, body, options?)`
- `delete<T>(path, body?, options?)`

## Route Guards

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { snapshot } from "../snapshot";

export const Route = createFileRoute("/settings")({
  ...snapshot.protect(),
  component: SettingsPage,
});
```

Use `snapshot.guest()` for logged-out-only pages such as login or register.

## OpenAPI Sync

```sh
snapshot sync --api http://localhost:3000
snapshot sync --file ./schema.json --zod
snapshot sync --api http://localhost:3000 --watch
```

Vite:

```ts
import { snapshotSync } from "@lastshotlabs/snapshot/vite";

export default {
  plugins: [snapshotSync({ file: "./schema.json", zod: true })],
};
```

## UI Entry

```tsx
import {
  ButtonBase,
  CardBase,
  ConfirmDialog,
  RichInputBase,
  ToastContainer,
  useConfirmManager,
  useToastManager,
} from "@lastshotlabs/snapshot/ui";
```

Focused subpaths:

```ts
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui/emoji-picker";
import { GifPickerBase } from "@lastshotlabs/snapshot/ui/gif-picker";
```

Common UI helpers:

| Area | Surface |
| --- | --- |
| Actions | `useToastManager`, `ToastContainer`, `useConfirmManager`, `ConfirmDialog`, `useModalManager` |
| Tokens | `resolveTokens`, `resolveFrameworkStyles`, `useTokenEditor`, `defineFlavor`, `getFlavor`, `getAllFlavors` |
| Icons | `Icon`, `ICON_PATHS` |
| Responsive | `useBreakpoint`, `useResponsiveValue`, `resolveResponsiveValue` |
| Data/loading | `usePoll`, `useInfiniteScroll`, `useComponentData` |
| Drag and drop | `DndContext`, `SortableContext`, `DragOverlay`, `useSortable`, `arrayMove`, `useDndSensors` |
| State/context | `AppContextProvider`, `PageContextProvider`, `SnapshotApiProvider`, state persistence helpers |

## Toasts And Confirms

```tsx
import {
  ConfirmDialog,
  ToastContainer,
  useConfirmManager,
  useToastManager,
} from "@lastshotlabs/snapshot/ui";

function DeleteButton() {
  const confirm = useConfirmManager();
  const toast = useToastManager();
  const deleteAccount = snapshot.useDeleteAccount();

  async function onDelete() {
    const ok = await confirm.show({
      title: "Delete account",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    });

    if (!ok) return;
    await deleteAccount.mutateAsync();
    toast.show({ message: "Account deleted", variant: "success" });
  }

  return <button onClick={onDelete}>Delete</button>;
}

export function AppChrome() {
  return (
    <>
      <DeleteButton />
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
```

## Tokens

```tsx
import { resolveTokens } from "@lastshotlabs/snapshot/ui";

const css = resolveTokens({
  flavor: "neutral",
  overrides: {
    colors: {
      primary: "#2563eb",
      background: "#ffffff",
    },
    radius: "md",
    spacing: "default",
  },
});
```

## Vite Entry

```ts
import { snapshotSync, snapshotSsr } from "@lastshotlabs/snapshot/vite";
```

| Helper | Purpose |
| --- | --- |
| `snapshotSync(options)` | Runs OpenAPI sync during Vite startup/build |
| `snapshotSsr(options)` | Adds Snapshot SSR build helpers |

## SSR Entry

```ts
import {
  cache,
  createReactRenderer,
  createPprCache,
  extractPprShell,
  renderPage,
  renderPprPage,
  unstable_noStore,
  usePrefetchRoute,
} from "@lastshotlabs/snapshot/ssr";
```

Common exports:

- `createReactRenderer`
- `renderPage`
- `renderPprPage`
- `cache`
- `unstable_noStore`
- `extractPprShell`
- `StaticShellWrapper`
- `createPprCache`
- `usePrefetchRoute`
- `hasUseClientDirective`
- `hasUseServerDirective`
- `buildComponentId`

## Package Entry Points

| Import | Exposes |
| --- | --- |
| `@lastshotlabs/snapshot` | Runtime factory, hooks, API client types, auth/account/community/webhook types |
| `@lastshotlabs/snapshot/ui` | Standalone UI components, token helpers, actions, icons, hooks |
| `@lastshotlabs/snapshot/ui/rich-input` | Rich input bundle |
| `@lastshotlabs/snapshot/ui/emoji-picker` | Emoji picker bundle |
| `@lastshotlabs/snapshot/ui/gif-picker` | GIF picker bundle |
| `@lastshotlabs/snapshot/vite` | Vite plugins |
| `@lastshotlabs/snapshot/ssr` | Server rendering helpers |
