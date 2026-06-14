# Snapshot

Snapshot is a code-first React SDK for Bunshot-powered apps. Create one
runtime in TypeScript, compose hooks and standalone UI components in React, and
sync backend schemas when you want generated client code.

## What You Get

- `createSnapshot({ apiUrl })` for auth, account, OAuth, MFA, WebAuthn,
  realtime, community, webhook, routing, and API primitives.
- TanStack Query integration through a pre-bound `QueryProvider`.
- Generated API types and React Query hooks from a Bunshot OpenAPI schema.
- Standalone UI components from `@lastshotlabs/snapshot/ui`.
- Vite helpers for OpenAPI sync, SSR, RSC, PPR, prefetch metadata, and static
  route metadata.
- CLI commands for scaffolding apps and syncing API contracts.

## Install

```sh
bun add @lastshotlabs/snapshot @tanstack/react-query @tanstack/react-router jotai react react-dom
```

Install optional peers only for the surfaces you use:

```sh
bun add -d vite
bun add react-server-dom-webpack
```

## Runtime Setup

Create a single Snapshot runtime and import it anywhere your app needs hooks or
helpers.

```ts
// src/snapshot.ts
import { createSnapshot } from "@lastshotlabs/snapshot";

export const snapshot = createSnapshot({
  apiUrl: import.meta.env.VITE_API_URL,
  auth: {
    session: { mode: "cookie" },
    on: {
      unauthenticated: () => {
        void window.location.assign("/login");
      },
    },
  },
  cache: {
    staleTime: 60_000,
  },
  loginPath: "/login",
  homePath: "/",
  mfaPath: "/mfa",
});
```

Wrap your React tree with the instance-bound provider:

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import { snapshot } from "./snapshot";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <snapshot.QueryProvider>
    <App />
  </snapshot.QueryProvider>,
);
```

## Auth

Snapshot returns normal React hooks. Use them inside your own screens and
components.

```tsx
import { isMfaChallenge } from "@lastshotlabs/snapshot";
import { snapshot } from "./snapshot";

export function LoginForm() {
  const login = snapshot.useLogin();

  async function submit(email: string, password: string) {
    const result = await login.mutateAsync({ email, password });

    if (isMfaChallenge(result)) {
      window.location.assign("/mfa");
      return;
    }

    window.location.assign("/");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        void submit(String(form.get("email")), String(form.get("password")));
      }}
    >
      <input name="email" type="email" autoComplete="email" />
      <input name="password" type="password" autoComplete="current-password" />
      <button type="submit" disabled={login.isPending}>
        Sign in
      </button>
    </form>
  );
}
```

Common runtime hooks include:

| Area | Hooks and helpers |
| --- | --- |
| Auth | `useUser`, `useLogin`, `useLogout`, `useRegister`, `useForgotPassword` |
| Account | `useResetPassword`, `useVerifyEmail`, `useSetPassword`, `useDeleteAccount`, `useSessions` |
| MFA | `usePendingMfaChallenge`, `useMfaVerify`, `useMfaSetup`, `useMfaMethods` |
| OAuth | `getOAuthUrl`, `getLinkUrl`, `useOAuthExchange`, `useOAuthUnlink` |
| WebAuthn | `useWebAuthnRegisterOptions`, `useWebAuthnRegister`, `usePasskeyLogin` |
| Realtime | `useSocket`, `useRoom`, `useRoomEvent`, `useSSE`, `useSseEvent` |
| Community | container, thread, reply, reaction, moderation, notification, and search hooks |
| Webhooks | endpoint, delivery, and test-delivery hooks |
| Routing | `protect`, `guest`, `protectedBeforeLoad`, `guestBeforeLoad`, `setNavigator` |
| Primitives | `api`, `queryClient`, `tokenStorage`, `useWebSocketManager` |

## Route Guards

Use `protect()` and `guest()` with TanStack Router route definitions.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { snapshot } from "../snapshot";

export const Route = createFileRoute("/settings")({
  ...snapshot.protect(),
  component: SettingsPage,
});
```

Register a router-aware navigator once so Snapshot auth flows can navigate
through the router instead of falling back to browser history.

```tsx
import { useEffect } from "react";
import { router } from "./router";
import { snapshot } from "./snapshot";

export function SnapshotNavigationBridge() {
  useEffect(() => {
    snapshot.setNavigator((to, opts) => {
      void router.navigate({ to: to as never, replace: opts.replace });
    });

    return () => snapshot.setNavigator(null);
  }, []);

  return null;
}
```

## API Sync

Generate typed request helpers and React Query hooks from a Bunshot OpenAPI
schema.

```sh
snapshot sync --api http://localhost:3000
snapshot sync --file ./schema.json --zod
snapshot sync --api http://localhost:3000 --watch
```

You can also run sync from Vite:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { snapshotSync } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotSync({ file: "./schema.json", zod: true }),
  ],
});
```

## Standalone UI

UI components are plain React components. Import the full barrel or focused
subpaths for larger pieces.

```tsx
import {
  ButtonBase,
  CardBase,
  RichInputBase,
  ToastContainer,
} from "@lastshotlabs/snapshot/ui";

export function Composer() {
  return (
    <CardBase>
      <RichInputBase
        placeholder="Write a reply"
        emitMarkdown
        onSend={({ markdown, text }) => {
          console.log(markdown ?? text);
        }}
      />
      <ButtonBase label="Publish" icon="send" />
      <ToastContainer />
    </CardBase>
  );
}
```

Focused UI subpaths:

```ts
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui/emoji-picker";
import { GifPickerBase } from "@lastshotlabs/snapshot/ui/gif-picker";
```

## Styling

Snapshot UI uses CSS custom properties with optional token helpers.

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

export function SnapshotTheme() {
  return <style>{css}</style>;
}
```

Every standalone component accepts React props. Most components also expose
`className`, `style`, and `slots` for targeted styling.

## Realtime

Configure WebSocket and SSE endpoints in code:

```ts
export const snapshot = createSnapshot({
  apiUrl: import.meta.env.VITE_API_URL,
  ws: {
    auth: { strategy: "query-param", paramName: "token" },
    events: {
      "thread.updated": (payload) => {
        console.log(payload);
      },
    },
  },
  sse: {
    endpoints: {
      "/__sse/notifications": {
        events: {
          "community:notification.created": () => {
            console.log("new notification");
          },
        },
      },
    },
  },
});
```

## SSR

Server rendering utilities are exported from `@lastshotlabs/snapshot/ssr`.

```ts
import { createReactRenderer, renderPage } from "@lastshotlabs/snapshot/ssr";
```

Use `snapshotSsr()` in Vite when a project needs the Snapshot SSR build
helpers:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { snapshotSsr } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [react(), ...snapshotSsr()],
});
```

## CLI

| Command | Purpose |
| --- | --- |
| `snapshot init` | Scaffold a new code-first Snapshot application |
| `snapshot sync` | Generate API types and hooks from an OpenAPI schema |

## Package Entry Points

| Import | Purpose |
| --- | --- |
| `@lastshotlabs/snapshot` | `createSnapshot`, runtime hooks, auth/account/community/webhook types |
| `@lastshotlabs/snapshot/ui` | Standalone UI components, tokens, actions, hooks, icons |
| `@lastshotlabs/snapshot/ui/rich-input` | Focused rich input component bundle |
| `@lastshotlabs/snapshot/ui/emoji-picker` | Focused emoji picker component bundle |
| `@lastshotlabs/snapshot/ui/gif-picker` | Focused GIF picker component bundle |
| `@lastshotlabs/snapshot/vite` | `snapshotSync`, `snapshotSsr` |
| `@lastshotlabs/snapshot/ssr` | React SSR, RSC, PPR, cache, and prefetch helpers |
