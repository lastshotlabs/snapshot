---
title: Snapshot
description: Build React apps with 113 components, 108 hooks, and full-stack auth — backed by Bunshot.
draft: false
---

Snapshot gives you everything you need to build React apps on a Bunshot backend: authentication, forms, data tables, real-time chat, file uploads, and 113 standalone components that work with plain props.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import { ButtonBase, InputField, CardBase } from "@lastshotlabs/snapshot/ui";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {},
});

function App() {
  const { user, isLoading } = snap.useUser();
  if (isLoading) return null;
  if (!user) return <LoginPage />;
  return <Dashboard user={user} />;
}
```

## What you get

### 108 hooks across 8 domains

| Domain | Hooks | What they do |
|--------|-------|-------------|
| **Auth** | `useUser`, `useLogin`, `useLogout`, `useRegister`, `useForgotPassword` | Core authentication flow |
| **MFA** | `useMfaVerify`, `useMfaSetup`, `useMfaDisable`, + 7 more | Multi-factor auth with TOTP, email OTP, recovery codes |
| **OAuth** | `getOAuthUrl`, `useOAuthExchange`, `useOAuthProviders`, `useOAuthUnlink` | Social login providers |
| **Passkeys** | `useWebAuthnRegister`, `usePasskeyLogin`, `useWebAuthnCredentials`, + 4 more | WebAuthn/passkey authentication |
| **Account** | `useSetPassword`, `useSessions`, `useRevokeSession`, `useDeleteAccount`, + 5 more | Account management and sessions |
| **WebSocket** | `useSocket`, `useRoom`, `useRoomEvent` | Real-time rooms and events |
| **SSE** | `useSSE`, `useSseEvent`, `onSseEvent` | Server-sent events |
| **Community** | 49 hooks | Threads, replies, reactions, moderation, notifications, search |

### 113 standalone components

Every component works as a plain React component with typed props. No context, no config object.

| Category | Components | Examples |
|----------|-----------|----------|
| **Forms** | 18 | `InputField`, `SelectField`, `AutoFormBase`, `WizardBase` |
| **Data** | 7 | `DataTableBase`, `ListBase`, `ChartBase`, `StatCardBase` |
| **Layout** | 15 | `NavBase`, `CardBase`, `GridBase`, `LayoutBase`, `SplitPaneBase` |
| **Navigation** | 5 | `TabsBase`, `BreadcrumbBase`, `AccordionBase`, `TreeViewBase` |
| **Overlay** | 8 | `ModalBase`, `DrawerBase`, `CommandPaletteBase`, `DropdownMenuBase` |
| **Content** | 6 | `MarkdownBase`, `RichTextEditorBase`, `CodeBlockBase` |
| **Media** | 5 | `FileUploaderBase`, `CarouselBase`, `VideoBase`, `EmbedBase` |
| **Communication** | 7 | `ChatWindowBase`, `PresenceIndicatorBase`, `TypingIndicatorBase` |
| **Feedback** | 4 | Error, loading, not-found, offline states |
| **Workflow** | 4 | `StepperBase`, `KanbanBase`, `ApprovalBase` |

### Full-stack features

- **Auth** -- Login, register, MFA, OAuth, passkeys, session management, and route guards
- **Real-time** -- WebSocket rooms, SSE streams, push notifications, typing indicators, presence
- **Community** -- Threads, replies, reactions, moderation, notifications, chat windows
- **Theming** -- Design tokens, named slots, dark mode, responsive patterns
- **SSR** -- React SSR, manifest rendering, RSC, PPR, Vite integration
- **Manifest mode** -- Config-driven assembly from JSON with routes, resources, workflows

## Learning path

### 1. Get running

- [Installation](/start-here/installation/) -- install, create your snapshot instance
- [Quick Start](/start-here/) -- build a working app with auth and a data table in 30 lines
- [Core Concepts](/start-here/core-concepts/) -- the mental model: hooks, components, naming, slots

### 2. Build common features

Pick the guides for what you're building. Start with auth and forms — most apps need both.

| Building... | Guide | You'll learn |
|-------------|-------|-------------|
| Login, registration, MFA | [Authentication](/guides/authentication/) | Auth hooks, MFA flows, OAuth, passkeys |
| Input fields, selects, wizards | [Forms and Validation](/guides/forms/) | 18 field components, controlled forms, wizards |
| Tables, lists, charts | [Data Tables and Lists](/guides/data-tables/) | Sorting, pagination, row actions, charts |
| Nav bars, sidebars, layouts | [Layout and Navigation](/guides/layout-and-navigation/) | App shells, grids, nav patterns |
| Modals, drawers, dialogs | [Overlays and Modals](/guides/overlays/) | Modal forms, confirm dialogs, command palettes |

### 3. Add specialized features

| Building... | Guide |
|-------------|-------|
| Chat, threads, reactions | [Community and Chat](/guides/community-and-chat/) |
| WebSocket, SSE, push | [Realtime](/guides/realtime/) |
| Uploads, images, video | [File Uploads and Media](/guides/file-uploads-and-media/) |
| Tokens, slots, dark mode | [Theming and Styling](/guides/theming-and-styling/) |

### 4. See complete apps

Copy-paste-ready applications that combine multiple features:

- [Login Page](/recipes/login-page/) -- email/password + OAuth + MFA + passkeys
- [Admin Dashboard](/recipes/admin-dashboard/) -- nav, stats, CRUD table, modals
- [Chat Application](/recipes/chat-app/) -- rooms, messages, presence, typing
- [Settings Page](/recipes/settings-page/) -- tabs, profile, password, sessions

### 5. Go deeper

| Need | Where to go |
|------|------------|
| Config-driven assembly | [Manifest Quick Start](/manifest/quick-start/), [Examples](/manifest/examples/), [Presets](/manifest/presets/) |
| Server-side rendering | [SSR and RSC](/server/ssr-rsc/), [Vite Plugin](/server/vite/) |
| All 113 components at a glance | [Component Overview](/build/component-library/) |
| Full API surface | [SDK Reference](/reference/sdk/), [Component Reference](/reference/components/) |
| Custom plugins | [Manifest Reference](/reference/manifest/) |
