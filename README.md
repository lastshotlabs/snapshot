# Snapshot

Snapshot is a code-first React SDK for Slingshot-powered apps. Create one
runtime in TypeScript, compose hooks and standalone UI components in React, and
sync backend schemas when you want generated client code.

## What You Get

- `createSnapshot({ apiUrl })` for auth, account, OAuth, MFA, WebAuthn,
  realtime, community, webhook, routing, and API primitives.
- TanStack Query integration through a pre-bound `QueryProvider`.
- Generated API types and React Query hooks from a Slingshot OpenAPI schema.
- Standalone UI components from `@lastshotlabs/snapshot/ui`.
- Vite helpers for OpenAPI sync, SSR, RSC, PPR, prefetch metadata, and static
  route metadata.
- CLI commands for scaffolding apps and syncing API contracts.

## Registry setup

Snapshot is published to the **public npm registry**. No token, no `.npmrc`, no
scope mapping — install it like any other package:

```sh
npm install @lastshotlabs/snapshot
```

Every release from `0.2.0` onward is published to both npmjs.org and GitHub
Packages. The two registries carry identical versions; npmjs.org is the
recommended channel because it needs no authentication.

<details>
<summary>Installing from GitHub Packages instead</summary>

GitHub Packages requires authentication even for public packages. Only use this
channel if your organization mandates it:

1. Create a GitHub [personal access token](https://github.com/settings/tokens/new)
   with the **`read:packages`** scope.
2. Add to your project's `.npmrc` (or `~/.npmrc`):

   ```ini
   @lastshotlabs:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```

3. Export the token where you install: `export GITHUB_TOKEN=ghp_…` (do the same in CI).

The default registry stays npmjs.org, so your other dependencies are unaffected.

</details>

> **Note:** versions `0.1.0` and `0.1.4` on npmjs.org are abandoned early
> artifacts and are **not installable** — they carry an unresolvable
> `file:vendor/…` dependency. Use `0.2.0` or later.

## Install

```sh
bun add @lastshotlabs/snapshot @tanstack/react-query @tanstack/react-router jotai react react-dom
```

Install optional peers only for the surfaces you use:

```sh
bun add -d vite
bun add react-server-dom-webpack
```

The 0.3 package boundary keeps editor, markdown, drag-and-drop, and CLI
libraries out of a basic install. Add the matching optional peers when you use
one of these UI surfaces:

| Surface                                 | Install                                                                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rich-input`                            | `bun add @tiptap/core @tiptap/extension-link @tiptap/extension-mention @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/pm @tiptap/react @tiptap/starter-kit tiptap-markdown` |
| `rich-text-editor`                      | `bun add @codemirror/commands @codemirror/lang-markdown @codemirror/language @codemirror/language-data @codemirror/state @codemirror/view`                                                     |
| Drag-and-drop surfaces such as `kanban` | `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`                                                                                                                                   |
| `markdown`                              | `bun add react-markdown rehype-highlight remark-gfm highlight.js`                                                                                                                              |
| `code-block`                            | `bun add highlight.js`                                                                                                                                                                         |
| `snapshot` CLI                          | `bun add @oclif/core @clack/prompts`                                                                                                                                                           |
| `snapshot/vite` sync plugin             | `bun add -d vite @clack/prompts`                                                                                                                                                               |

The CLI packages are optional too, so apps that only import Snapshot runtime or
UI code do not install them.

The CLI also includes `snapshot doctor` for registry/link/peer diagnostics and
`snapshot add <component>` for copying an application-owned component source
graph. Run `snapshot add --list` to inspect the generated catalog registry.

Use focused `@lastshotlabs/snapshot/ui/<name>` imports for the minimal
dependency path. The compatibility `@lastshotlabs/snapshot/ui` barrel
re-exports the whole catalog and therefore requires every optional UI peer.

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

| Area       | Hooks and helpers                                                                         |
| ---------- | ----------------------------------------------------------------------------------------- |
| Auth       | `useUser`, `useLogin`, `useLogout`, `useRegister`, `useForgotPassword`                    |
| Account    | `useResetPassword`, `useVerifyEmail`, `useSetPassword`, `useDeleteAccount`, `useSessions` |
| MFA        | `usePendingMfaChallenge`, `useMfaVerify`, `useMfaSetup`, `useMfaMethods`                  |
| OAuth      | `getOAuthUrl`, `getLinkUrl`, `useOAuthExchange`, `useOAuthUnlink`                         |
| WebAuthn   | `useWebAuthnRegisterOptions`, `useWebAuthnRegister`, `usePasskeyLogin`                    |
| Realtime   | `useSocket`, `useRoom`, `useRoomEvent`, `useSSE`, `useSseEvent`                           |
| Community  | container, thread, reply, reaction, moderation, notification, and search hooks            |
| Webhooks   | endpoint, delivery, and test-delivery hooks                                               |
| Routing    | `protect`, `guest`, `protectedBeforeLoad`, `guestBeforeLoad`, `setNavigator`              |
| Primitives | `api`, `queryClient`, `tokenStorage`, `useWebSocketManager`                               |

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

Generate typed request helpers and React Query hooks from a Slingshot OpenAPI
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
  plugins: [react(), snapshotSync({ file: "./schema.json", zod: true })],
});
```

## Standalone UI

UI components are plain React components. Import each component from its
focused subpath so unused component families and optional peers stay out of the
module graph.

```tsx
import { ButtonBase } from "@lastshotlabs/snapshot/ui/button";
import { CardBase } from "@lastshotlabs/snapshot/ui/card";
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";

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
    </CardBase>
  );
}
```

Every catalog component follows the same subpath convention:

```ts
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui/emoji-picker";
import { GifPickerBase } from "@lastshotlabs/snapshot/ui/gif-picker";
```

## Styling

Snapshot UI uses CSS custom properties with optional token helpers.

```tsx
import { resolveTokens } from "@lastshotlabs/snapshot/ui/tokens";

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

| Command         | Purpose                                             |
| --------------- | --------------------------------------------------- |
| `snapshot init` | Scaffold a new code-first Snapshot application      |
| `snapshot sync` | Generate API types and hooks from an OpenAPI schema |

## Package Entry Points

| Import                                   | Purpose                                                               |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `@lastshotlabs/snapshot`                 | `createSnapshot`, runtime hooks, auth/account/community/webhook types |
| `@lastshotlabs/snapshot/ui`              | Standalone UI components, tokens, actions, hooks, icons               |
| `@lastshotlabs/snapshot/ui/rich-input`   | Focused rich input component bundle                                   |
| `@lastshotlabs/snapshot/ui/emoji-picker` | Focused emoji picker component bundle                                 |
| `@lastshotlabs/snapshot/ui/gif-picker`   | Focused GIF picker component bundle                                   |
| `@lastshotlabs/snapshot/vite`            | `snapshotSync`, `snapshotSsr`                                         |
| `@lastshotlabs/snapshot/ssr`             | React SSR, RSC, PPR, cache, and prefetch helpers                      |
