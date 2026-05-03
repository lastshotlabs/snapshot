# @lastshotlabs/snapshot

[![npm version](https://img.shields.io/npm/v/@lastshotlabs/snapshot.svg)](https://www.npmjs.com/package/@lastshotlabs/snapshot)

Snapshot is the React SDK and config-driven UI runtime for
[Bunshot](https://github.com/lastshotlabs/bunshot)-powered apps.

It gives a frontend app one `createSnapshot()` factory for auth, account
management, realtime, generated API hooks, manifest rendering, theming, and UI
components. Use it code-first with normal React components, manifest-first with
`snapshot.manifest.json`, or mix both in the same app.

## What You Get

- 100+ hooks across auth, MFA, OAuth, passkeys, account management, WebSocket,
  SSE, community, webhooks, and notifications.
- 100+ standalone UI components imported from `@lastshotlabs/snapshot/ui`.
- Manifest-driven app rendering for routes, navigation, auth screens, overlays,
  actions, workflows, resources, and themed page composition.
- Vite plugins for manifest apps, OpenAPI sync, SSR, RSC, prefetch manifests,
  SSG, and PPR build metadata.
- Server rendering helpers exported from `@lastshotlabs/snapshot/ssr`.
- A CLI for scaffolding apps, syncing API types and hooks, validating manifests,
  and running manifest apps locally.

## Install

```bash
npm install @lastshotlabs/snapshot react react-dom @tanstack/react-query @tanstack/react-router @unhead/react jotai recharts
```

Optional peers depend on the features you use:

```bash
npm install -D vite
npm install zod react-server-dom-webpack
```

Bun users can install the same packages with `bun add`.

## Public Imports

| Import                        | Use it for                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@lastshotlabs/snapshot`      | `createSnapshot`, plugins, push notifications, contracts, shared types                                |
| `@lastshotlabs/snapshot/ui`   | Standalone UI components such as `ButtonBase`, `InputField`, `CardBase`, `DataTableBase`, `ModalBase` |
| `@lastshotlabs/snapshot/vite` | `snapshotApp`, `snapshotSync`, `snapshotSsr`                                                          |
| `@lastshotlabs/snapshot/ssr`  | React, manifest, RSC, PPR, and prefetch rendering utilities                                           |

## Quick Start

Create one Snapshot instance and put the app under `QueryProvider`.

```tsx
import type { ReactNode } from "react";
import { createSnapshot } from "@lastshotlabs/snapshot";
import { ButtonBase, CardBase } from "@lastshotlabs/snapshot/ui";

export const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    app: {
      name: "My App",
      auth: {
        loginPath: "/login",
        homePath: "/",
      },
    },
  },
});

function Providers({ children }: { children: ReactNode }) {
  return <snap.QueryProvider>{children}</snap.QueryProvider>;
}

function Dashboard() {
  const { user, isLoading } = snap.useUser();

  if (isLoading) return null;
  if (!user) return <LoginPage />;

  return (
    <CardBase>
      <h1>Welcome back, {user.email}</h1>
      <ButtonBase>Open dashboard</ButtonBase>
    </CardBase>
  );
}

export function App() {
  return (
    <Providers>
      <Dashboard />
    </Providers>
  );
}
```

Mutation hooks follow TanStack Query conventions.

```tsx
function LoginPage() {
  const login = snap.useLogin();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        login.mutate({
          email: String(form.get("email")),
          password: String(form.get("password")),
        });
      }}
    >
      <input name="email" type="email" />
      <input name="password" type="password" />
      <ButtonBase type="submit" disabled={login.isPending}>
        Sign in
      </ButtonBase>
    </form>
  );
}
```

## Code-First Apps

Code-first apps use Snapshot hooks and standalone components inside your own
React routes, layouts, and state model.

Use this mode when you need custom UI behavior, complex validation, bespoke
state, or third-party integrations.

Core patterns:

- Call `createSnapshot({ apiUrl, manifest })` once.
- Wrap hook usage in `snap.QueryProvider`.
- Read data with query hooks such as `snap.useUser()`.
- Write data with mutation hooks such as `snap.useLogin()` and
  `snap.useLogout()`.
- Import standalone UI from `@lastshotlabs/snapshot/ui`.

Standalone components are plain React components. They do not require the
manifest runtime.

```tsx
import {
  CardBase,
  DataTableBase,
  InputField,
  ModalBase,
} from "@lastshotlabs/snapshot/ui";

function UsersPanel() {
  return (
    <CardBase>
      <InputField label="Search" placeholder="Search users" />
      <DataTableBase
        columns={[
          { field: "email", label: "Email" },
          { field: "role", label: "Role" },
        ]}
        rows={[{ id: "1", email: "admin@example.com", role: "Admin" }]}
      />
      <ModalBase open={false} title="Invite user" onClose={() => undefined} />
    </CardBase>
  );
}
```

Component naming is consistent:

- `*Field` components are form inputs.
- `*Base` components are everything else.

## Manifest Apps

Manifest apps render routes, navigation, auth, overlays, resources, workflows,
and page content from configuration.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    routes: [
      {
        id: "home",
        path: "/",
        title: "Home",
        content: [
          { type: "heading", level: 1, text: "Welcome" },
          { type: "text", text: "Your first manifest app." },
        ],
      },
    ],
  },
});

export function App() {
  return <snap.ManifestApp />;
}
```

Use manifest mode when you want standard CRUD pages, configurable navigation,
themeable app shells, auth screens, non-developer editing, or fast internal-tool
prototypes. You can still drop into custom React components and Snapshot hooks
where the app needs more control.

## Styling

Snapshot components support normal React styling plus a slot model for precise
surface-level overrides.

```tsx
<ButtonBase
  slots={{
    root: {
      className: "bg-black text-white",
      states: {
        hover: { className: "bg-neutral-800" },
        disabled: { className: "opacity-50" },
      },
    },
  }}
>
  Save
</ButtonBase>
```

Slots compose with theme tokens and stateful styling. Common states include
`hover`, `focus`, `open`, `selected`, `current`, `active`, `completed`,
`invalid`, and `disabled`.

## CLI

Use the package directly with npm or Bun:

```bash
npx @lastshotlabs/snapshot init my-app
bunx @lastshotlabs/snapshot init my-app
```

Common commands:

| Command                      | Description                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `snapshot init`              | Scaffold a new Snapshot app                                                     |
| `snapshot sync`              | Generate TypeScript types, API functions, and TanStack Query hooks from OpenAPI |
| `snapshot dev`               | Run a manifest app with Snapshot's built-in Vite dev server                     |
| `snapshot build`             | Build a manifest app                                                            |
| `snapshot preview`           | Preview the local build output                                                  |
| `snapshot add-page`          | Add a page to `snapshot.manifest.json`                                          |
| `snapshot add-resource`      | Add a manifest resource                                                         |
| `snapshot manifest/init`     | Create `snapshot.manifest.json`                                                 |
| `snapshot manifest/schema`   | Generate the manifest JSON Schema                                               |
| `snapshot manifest/validate` | Validate a manifest file                                                        |
| `snapshot validate`          | Alias for manifest validation                                                   |

Examples:

```bash
snapshot init my-app --template admin
snapshot sync --api http://localhost:3000 --zod
snapshot sync --file ./openapi.json --watch
snapshot manifest/validate
```

## Vite

Snapshot exports Vite plugins for three integration points.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {
  snapshotApp,
  snapshotSsr,
  snapshotSync,
} from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotApp({
      manifestFile: "snapshot.manifest.json",
      apiUrl: "/api",
    }),
    snapshotSync({
      file: "./openapi.json",
      zod: true,
    }),
    snapshotSsr({
      rsc: true,
      prefetchManifest: true,
    }),
  ],
});
```

- `snapshotApp()` boots a manifest-driven app from `snapshot.manifest.json`.
- `snapshotSync()` runs OpenAPI sync during the Vite lifecycle.
- `snapshotSsr()` configures client and server builds, RSC transforms, prefetch
  manifests, optional SSG, and optional PPR metadata.

## SSR And RSC

Server rendering utilities are exported from `@lastshotlabs/snapshot/ssr`.

```ts
import {
  createManifestRenderer,
  createReactRenderer,
  renderPage,
  usePrefetchRoute,
} from "@lastshotlabs/snapshot/ssr";

export const reactRenderer = createReactRenderer({
  routes: import.meta.glob("./pages/**/*.tsx"),
});

export const manifestRenderer = createManifestRenderer({
  manifest,
  apiUrl: "/api",
});
```

The SSR package also includes RSC helpers, server action plumbing, PPR shell
cache utilities, safe state serialization, and prefetch support.

## Realtime And Community

Snapshot includes hooks for WebSocket rooms, SSE streams, push notifications,
community containers, threads, replies, reactions, reports, bans, notifications,
and webhooks.

```tsx
function Room({ roomId }: { roomId: string }) {
  const { isSubscribed } = snap.useRoom(roomId);

  snap.useRoomEvent(roomId, "message", (message) => {
    console.log(message);
  });

  return <div>{isSubscribed ? "Subscribed" : "Subscribing"}</div>;
}
```

Manifest apps can declare realtime endpoints in config, while code-first apps
can use the hooks directly.

## Documentation

The docs app is the source of truth for product guides and generated API
references:

| Topic                 | Docs                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Start here            | [apps/docs/src/content/docs/start-here/index.md](apps/docs/src/content/docs/start-here/index.md)                         |
| Installation          | [apps/docs/src/content/docs/start-here/installation.md](apps/docs/src/content/docs/start-here/installation.md)           |
| Core concepts         | [apps/docs/src/content/docs/start-here/core-concepts.md](apps/docs/src/content/docs/start-here/core-concepts.md)         |
| Capabilities          | [apps/docs/src/content/docs/start-here/capabilities.md](apps/docs/src/content/docs/start-here/capabilities.md)           |
| Component library     | [apps/docs/src/content/docs/build/component-library.md](apps/docs/src/content/docs/build/component-library.md)           |
| Manifest apps         | [apps/docs/src/content/docs/build/manifest-apps.md](apps/docs/src/content/docs/build/manifest-apps.md)                   |
| Manifest quick start  | [apps/docs/src/content/docs/manifest/quick-start.md](apps/docs/src/content/docs/manifest/quick-start.md)                 |
| Auth                  | [apps/docs/src/content/docs/guides/authentication.md](apps/docs/src/content/docs/guides/authentication.md)               |
| Forms                 | [apps/docs/src/content/docs/guides/forms.md](apps/docs/src/content/docs/guides/forms.md)                                 |
| Data tables           | [apps/docs/src/content/docs/guides/data-tables.md](apps/docs/src/content/docs/guides/data-tables.md)                     |
| Layout and navigation | [apps/docs/src/content/docs/guides/layout-and-navigation.md](apps/docs/src/content/docs/guides/layout-and-navigation.md) |
| Realtime              | [apps/docs/src/content/docs/guides/realtime.md](apps/docs/src/content/docs/guides/realtime.md)                           |
| Theming and slots     | [apps/docs/src/content/docs/build/styling-and-slots.md](apps/docs/src/content/docs/build/styling-and-slots.md)           |
| CLI reference         | [apps/docs/src/content/docs/reference/cli.md](apps/docs/src/content/docs/reference/cli.md)                               |
| SDK reference         | [apps/docs/src/content/docs/reference/sdk.md](apps/docs/src/content/docs/reference/sdk.md)                               |
| UI reference          | [apps/docs/src/content/docs/reference/ui/index.md](apps/docs/src/content/docs/reference/ui/index.md)                     |
| Component reference   | [apps/docs/src/content/docs/reference/components.md](apps/docs/src/content/docs/reference/components.md)                 |
| Vite reference        | [apps/docs/src/content/docs/reference/vite.md](apps/docs/src/content/docs/reference/vite.md)                             |
| SSR reference         | [apps/docs/src/content/docs/reference/ssr.md](apps/docs/src/content/docs/reference/ssr.md)                               |

## Development

```bash
npm install
npm run typecheck
npm test
npm run docs:ci
npm run release:check
```

`docs:ci` regenerates docs, typechecks docs examples, checks docs impact and
coverage, verifies component coverage, smoke-tests examples, and builds the docs
site.

Releases are published to npm from GitHub Actions.
