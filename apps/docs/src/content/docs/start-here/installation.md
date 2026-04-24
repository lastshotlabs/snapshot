---
title: Installation
description: Install Snapshot and create your first snapshot instance.
draft: false
---

## Install

```bash
npm install @lastshotlabs/snapshot
```

Snapshot has peer dependencies on React 18+ and TanStack Query:

```bash
npm install react react-dom @tanstack/react-query
```

## Create a snapshot instance

Every Snapshot app starts with a single `createSnapshot()` call. This creates the API client, token storage, query cache, and returns all hooks.

```tsx
// src/snapshot.ts
import { createSnapshot } from "@lastshotlabs/snapshot";

export const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {},
});
```

### Config options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiUrl` | `string` | Yes | Base URL for the Bunshot API |
| `manifest` | `object` | Yes | Manifest config (can be `{}` for code-first apps) |
| `env` | `Record<string, string>` | No | Environment variables for manifest `{ env: "..." }` refs |
| `bearerToken` | `string` | No | Static API credential (server-side only, not for browsers) |
| `plugins` | `SnapshotPlugin[]` | No | Plugins that register custom components |

For code-first apps, pass `manifest: {}` -- you get all SDK hooks without any manifest-driven UI.

For manifest-driven apps, pass your full manifest object. See [Manifest Quick Start](/manifest/quick-start/).

## Import components

Standalone components are exported from `@lastshotlabs/snapshot/ui`:

```tsx
import {
  ButtonBase,
  InputField,
  CardBase,
  DataTableBase,
  NavBase,
  ModalBase,
} from "@lastshotlabs/snapshot/ui";
```

All 113 components work as plain React components with typed props. No manifest context required.

## Wrap your app

The `QueryProvider` component wraps TanStack Query and Jotai state providers. Every Snapshot hook must render inside it.

```tsx
// src/App.tsx
import { snap } from "./snapshot";

export default function App() {
  return (
    <snap.QueryProvider>
      {/* your app */}
    </snap.QueryProvider>
  );
}
```

## What's included

After `createSnapshot()`, you have access to:

**Auth hooks** -- `useUser`, `useLogin`, `useLogout`, `useRegister`, `useForgotPassword`

**MFA hooks** -- `useMfaVerify`, `useMfaSetup`, `useMfaVerifySetup`, `useMfaDisable`, `useMfaRecoveryCodes`, `useMfaEmailOtpEnable`, `useMfaEmailOtpVerifySetup`, `useMfaEmailOtpDisable`, `useMfaResend`, `useMfaMethods`, `usePendingMfaChallenge`, `isMfaChallenge`

**Account hooks** -- `useResetPassword`, `useVerifyEmail`, `useResendVerification`, `useSetPassword`, `useDeleteAccount`, `useCancelDeletion`, `useRefreshToken`, `useSessions`, `useRevokeSession`

**OAuth hooks** -- `useOAuthExchange`, `getOAuthUrl`, `useOAuthProviders`, `getOAuthProviders`

**WebAuthn hooks** -- `useWebAuthnRegisterOptions`, `useWebAuthnRegister`, `useWebAuthnCredentials`, `useWebAuthnRemoveCredential`, `usePasskeyLoginOptions`, `usePasskeyLogin`, `useWebAuthnCheck`

**WebSocket hooks** -- `useSocket`, `useRoom`, `useRoomEvent`

**SSE hooks** -- `useSSE`, `useSseEvent`, `onSseEvent`

**Community hooks** -- 49 hooks for containers, threads, replies, reactions, moderation, search, and notifications

**Webhook hooks** -- 8 hooks for endpoint CRUD, deliveries, and testing

**Primitives** -- `api` (HTTP client), `tokenStorage`, `queryClient`, `useTheme`, `formatAuthError`

**Routing** -- `protectedBeforeLoad`, `guestBeforeLoad` (TanStack Router guards)

**Components** -- `QueryProvider`, `ManifestApp`

## Next step

Head to the [Quick Start](/start-here/) to build a working app.
