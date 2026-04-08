# Config-Driven UI Foundation — Canonical Spec

> **Status**
>
> | Phase | Title                            | Status      | Track              |
> | ----- | -------------------------------- | ----------- | ------------------ |
> | 1     | Token System                     | Not started | A — Infrastructure |
> | 2     | Page Context & `from` Ref System | Not started | A — Infrastructure |
> | 3     | Action Executor                  | Not started | A — Infrastructure |
> | 4     | Manifest Schema & PageRenderer   | Not started | A — Infrastructure |
> | 5     | Layout + Nav                     | Not started | B — Components     |
> | 6     | StatCard                         | Not started | B — Components     |
> | 7     | DataTable                        | Not started | B — Components     |
> | 8     | AutoForm                         | Not started | B — Components     |
> | 9     | DetailCard                       | Not started | B — Components     |
> | 10    | Modal + Drawer/Sheet             | Not started | B — Components     |
> | 11    | Tabs                             | Not started | B — Components     |
> | 12    | Integration & Sync               | Not started | C — CLI            |

---

## Vision

### The Problem

Today, building a frontend for a bunshot backend means writing hundreds of lines of React by
hand. Every page requires wiring: TanStack Query hooks for data fetching, Jotai atoms for
state, TanStack Router for navigation, shadcn components for UI, and custom glue code to
connect them all. A simple CRUD page — table with filters, create modal, edit form — is 300+
lines of boilerplate that looks nearly identical across every app.

The SDK gives you hooks (`useLogin`, `useUser`, `useSocket`) but you still build every screen
manually. The CLI scaffolds starter pages, but they're static templates with hardcoded layouts
— no data binding, no composition, no way to describe what you want and get a running app.

### The After

A consumer writes a single JSON file — `snapshot.manifest.json` — and gets a complete,
production-quality application:

```json
{
  "theme": {
    "flavor": "midnight",
    "overrides": { "colors": { "primary": "#8b5cf6" }, "radius": "lg" }
  },
  "globals": {
    "user": {},
    "cart": { "data": "GET /api/cart" }
  },
  "nav": [
    { "label": "Dashboard", "path": "/", "icon": "home" },
    { "label": "Users", "path": "/users", "icon": "users", "roles": ["admin"] },
    { "label": "Products", "path": "/products", "icon": "package" },
    { "label": "Settings", "path": "/settings", "icon": "gear" }
  ],
  "auth": {
    "screens": ["login", "register", "forgot-password", "mfa"],
    "providers": ["google", "github"],
    "passkey": true
  },
  "pages": {
    "/": {
      "layout": "sidebar",
      "title": "Dashboard",
      "content": [
        {
          "type": "row",
          "gap": "md",
          "children": [
            {
              "type": "stat-card",
              "data": "GET /api/stats/revenue",
              "format": "currency",
              "icon": "dollar-sign",
              "trend": { "field": "change", "sentiment": "up-is-good" },
              "span": 4
            },
            {
              "type": "stat-card",
              "data": "GET /api/stats/orders",
              "format": "number",
              "icon": "shopping-cart",
              "span": 4
            },
            {
              "type": "stat-card",
              "data": "GET /api/stats/customers",
              "format": "compact",
              "icon": "users",
              "span": 4
            }
          ]
        },
        {
          "type": "table",
          "id": "recent-orders",
          "data": "GET /api/orders",
          "columns": "auto",
          "searchable": true,
          "pagination": { "type": "cursor", "pageSize": 10 },
          "actions": [
            {
              "label": "View",
              "icon": "eye",
              "action": { "type": "open-modal", "modal": "order-detail" }
            },
            {
              "label": "Delete",
              "icon": "trash",
              "action": [
                { "type": "confirm", "message": "Delete this order?" },
                {
                  "type": "api",
                  "method": "DELETE",
                  "endpoint": "/api/orders/{id}"
                },
                { "type": "refresh", "target": "recent-orders" },
                {
                  "type": "toast",
                  "message": "Order deleted",
                  "variant": "success"
                }
              ]
            }
          ]
        },
        {
          "type": "modal",
          "id": "order-detail",
          "title": "Order Details",
          "size": "lg",
          "content": [
            {
              "type": "detail-card",
              "data": { "from": "recent-orders.selected" },
              "actions": [
                {
                  "label": "Edit",
                  "icon": "pencil",
                  "action": { "type": "open-modal", "modal": "order-edit" }
                }
              ]
            },
            {
              "type": "tabs",
              "children": [
                {
                  "label": "Activity",
                  "content": [
                    {
                      "type": "feed",
                      "data": "GET /api/orders/{id}/activity",
                      "params": {
                        "id": { "from": "recent-orders.selected.id" }
                      }
                    }
                  ]
                },
                {
                  "label": "Notes",
                  "content": [
                    {
                      "type": "comment-thread",
                      "data": "GET /api/orders/{id}/notes",
                      "params": {
                        "id": { "from": "recent-orders.selected.id" }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "modal",
          "id": "order-edit",
          "title": "Edit Order",
          "content": [
            {
              "type": "form",
              "data": { "from": "recent-orders.selected" },
              "submit": "/api/orders/{id}",
              "method": "PATCH",
              "fields": "auto",
              "onSuccess": [
                { "type": "close-modal" },
                { "type": "refresh", "target": "recent-orders" },
                {
                  "type": "toast",
                  "message": "Order updated",
                  "variant": "success"
                }
              ]
            }
          ]
        }
      ]
    },
    "/users": {
      "layout": "sidebar",
      "title": "Users",
      "roles": ["admin"],
      "content": [
        {
          "type": "row",
          "gap": "md",
          "justify": "between",
          "align": "center",
          "children": [
            { "type": "heading", "text": "Users", "level": 2 },
            {
              "type": "button",
              "label": "Add User",
              "icon": "plus",
              "action": { "type": "open-modal", "modal": "create-user" }
            }
          ]
        },
        {
          "type": "table",
          "id": "users-table",
          "data": "GET /api/users",
          "columns": [
            { "field": "name", "sortable": true },
            { "field": "email", "sortable": true },
            {
              "field": "role",
              "format": "badge",
              "badgeColors": { "admin": "destructive", "user": "secondary" },
              "filter": { "type": "select", "options": "auto" }
            },
            {
              "field": "createdAt",
              "format": "date",
              "label": "Joined",
              "sortable": true
            }
          ],
          "selectable": true,
          "searchable": {
            "placeholder": "Search by name or email...",
            "fields": ["name", "email"]
          },
          "bulkActions": [
            {
              "label": "Delete Selected",
              "icon": "trash",
              "action": [
                { "type": "confirm", "message": "Delete {count} users?" },
                {
                  "type": "api",
                  "method": "DELETE",
                  "endpoint": "/api/users/bulk",
                  "body": { "ids": { "from": "users-table.selectedIds" } }
                },
                { "type": "refresh", "target": "users-table" },
                {
                  "type": "toast",
                  "message": "{count} users deleted",
                  "variant": "success"
                }
              ]
            }
          ]
        },
        {
          "type": "drawer",
          "id": "user-detail",
          "side": "right",
          "size": "lg",
          "trigger": { "from": "users-table.selected" },
          "content": [
            {
              "type": "detail-card",
              "data": { "from": "users-table.selected" },
              "title": { "from": "users-table.selected.name" }
            },
            {
              "type": "session-manager",
              "data": "GET /api/users/{id}/sessions",
              "params": { "id": { "from": "users-table.selected.id" } }
            }
          ]
        },
        {
          "type": "modal",
          "id": "create-user",
          "title": "Create User",
          "content": [
            {
              "type": "form",
              "submit": "/api/users",
              "fields": "auto",
              "onSuccess": [
                { "type": "close-modal" },
                { "type": "refresh", "target": "users-table" },
                {
                  "type": "toast",
                  "message": "User created",
                  "variant": "success"
                }
              ]
            }
          ]
        }
      ]
    },
    "/settings": {
      "layout": "sidebar",
      "title": "Settings",
      "content": [
        {
          "type": "tabs",
          "children": [
            {
              "label": "Profile",
              "icon": "user",
              "content": [
                {
                  "type": "avatar-upload",
                  "data": "GET /api/me",
                  "field": "avatar",
                  "submit": "PATCH /api/me/avatar"
                },
                {
                  "type": "form",
                  "data": "GET /api/me",
                  "submit": "/api/me",
                  "method": "PATCH",
                  "fields": [
                    { "name": "name", "type": "text", "required": true },
                    { "name": "email", "type": "email", "required": true },
                    { "name": "bio", "type": "textarea" }
                  ]
                }
              ]
            },
            {
              "label": "Security",
              "icon": "shield",
              "content": [
                {
                  "type": "form",
                  "submit": "/api/me/password",
                  "submitLabel": "Change Password",
                  "fields": [
                    {
                      "name": "currentPassword",
                      "type": "password",
                      "required": true
                    },
                    {
                      "name": "newPassword",
                      "type": "password",
                      "required": true,
                      "validation": {
                        "minLength": 8,
                        "message": "Password must be at least 8 characters"
                      }
                    },
                    {
                      "name": "confirmPassword",
                      "type": "password",
                      "required": true
                    }
                  ]
                },
                { "type": "connected-accounts", "data": "GET /api/me/oauth" },
                { "type": "session-manager", "data": "GET /api/me/sessions" }
              ]
            },
            {
              "label": "Danger",
              "icon": "alert-triangle",
              "content": [
                {
                  "type": "danger-zone",
                  "actions": [
                    {
                      "label": "Export Data",
                      "description": "Download all your data as JSON",
                      "action": {
                        "type": "download",
                        "endpoint": "/api/me/export"
                      }
                    },
                    {
                      "label": "Delete Account",
                      "description": "Permanently delete your account and all data",
                      "action": [
                        {
                          "type": "confirm",
                          "message": "This action cannot be undone. Type DELETE to confirm.",
                          "confirmLabel": "Delete Forever"
                        },
                        {
                          "type": "api",
                          "method": "DELETE",
                          "endpoint": "/api/me"
                        },
                        { "type": "navigate", "to": "/goodbye" }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

That's a full application — dashboard with real-time stats, user management with admin roles,
CRUD with modals, settings with profile/security/danger zones, auth with OAuth and passkeys —
all from config. No React. No TypeScript. No boilerplate.

### Three Levels of Control

The framework does everything by default. But the consumer can reach in at any level:

**Level 1: Pure config** — the manifest drives the entire app. Zero code.

**Level 2: Config + custom React** — use framework components directly in custom pages:

```tsx
import { DataTable, StatCard, AutoForm } from "@lastshotlabs/snapshot";

export function MyCustomDashboard() {
  return (
    <div>
      <h1>Custom header with my own logic</h1>
      <StatCard config={{ data: "GET /api/stats/users", format: "number" }} />
      <DataTable config={{ data: "GET /api/users", columns: "auto" }} />
      <MyCustomChart />
    </div>
  );
}
```

**Level 3: Headless hooks + custom rendering** — keep the data/state logic, replace the UI:

```tsx
import { useDataTable } from "@lastshotlabs/snapshot";

export function MyCustomTable() {
  const { rows, columns, sort, pagination, filters, selection } = useDataTable({
    data: "GET /api/users",
    columns: "auto",
    selectable: true,
  });

  // Complete control over rendering — the hook handles data fetching,
  // sort state, filter state, pagination, selection tracking, cache invalidation
  return (
    <div className="my-custom-grid">
      {rows.map((row) => (
        <MyCustomCard key={row.id} data={row} />
      ))}
    </div>
  );
}

// Register to make it available from manifest config
registerComponent("table", MyCustomTable);
```

**Level 3b: Override a single component globally** — swap the framework's rendering for one
component type across the entire app:

```tsx
import { useStatCard } from "@lastshotlabs/snapshot";

// My app wants stat cards to look completely different
function MyStatCard({ config }: { config: StatCardConfig }) {
  const { value, label, trend, isLoading } = useStatCard(config);

  return (
    <div className="my-custom-stat">
      <span className="big-number">{value}</span>
      <span className="label">{label}</span>
    </div>
  );
}

// Now every { "type": "stat-card" } in the manifest uses this component
registerComponent("stat-card", MyStatCard);
```

The consumer chooses their level of control **per-component, per-page**. One page can be pure
config. Another can mix config components with custom React. A third can be entirely custom
code using headless hooks. All in the same app.

### What This Spec Covers

This spec covers the **foundation layer**: the infrastructure (token system, page context,
action executor, manifest renderer) and the first 8 config-driven components (Layout, Nav,
StatCard, DataTable, AutoForm, DetailCard, Modal/Drawer, Tabs).

Everything else in the 55-component catalog builds on this foundation using the exact same
patterns. Once the foundation is solid, adding a new component is: define its Zod config
schema, write its headless hook, write its rendering component, register it.

---

## What Already Exists on Main

Audited 2026-04-06 against commit `0581a83`.

| File                                   | What                                                                                                       | Lines |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----- |
| `src/create-snapshot.tsx`              | Factory function — all hooks closed over config                                                            | 462   |
| `src/types.ts`                         | All SDK type definitions (SnapshotConfig, SnapshotInstance, auth, MFA, SSE, WS, community)                 | 429   |
| `src/index.ts`                         | Package exports (~80 types, 4 functions)                                                                   | 103   |
| `src/theme/hook.ts`                    | `useTheme` — light/dark toggle via Jotai `atomWithStorage`, applies `.dark` class to `<html>`              | 56    |
| `src/api/client.ts`                    | `ApiClient` — dual auth (cookie/token), CSRF, 401 token refresh, bearer support                            | ~200  |
| `src/api/error.ts`                     | `ApiError` class with status, message, response body                                                       | ~30   |
| `src/auth/contract.ts`                 | `AuthContract` factory — `defaultContract(apiUrl)`, `mergeContract(apiUrl, overrides)`                     | ~80   |
| `src/auth/hooks.ts`                    | `createAuthHooks()` → `useUser`, `useLogin`, `useLogout`, `useRegister`, `useForgotPassword`               | ~200  |
| `src/auth/mfa-hooks.ts`                | `createMfaHooks()` → 12 MFA hooks (TOTP, email OTP, WebAuthn)                                              | ~200  |
| `src/auth/oauth-hooks.ts`              | `createOAuthHooks()` → `getOAuthUrl`, `useOAuthExchange`, `useOAuthUnlink`                                 | ~80   |
| `src/auth/webauthn-hooks.ts`           | `createWebAuthnHooks()` → passkey login, credential management                                             | ~120  |
| `src/auth/account-hooks.ts`            | `createAccountHooks()` → sessions, password reset, email verification, account deletion                    | ~150  |
| `src/auth/storage.ts`                  | `createTokenStorage()` — localStorage/sessionStorage/memory/noop strategies                                | ~80   |
| `src/community/hooks.ts`               | `createCommunityHooks()` → 50+ hooks (containers, threads, replies, reactions, moderation)                 | ~800  |
| `src/community/contract.ts`            | `communityContract` — endpoint paths for community API                                                     | ~60   |
| `src/webhooks/hooks.ts`                | `createWebhookHooks()` → 8 hooks for webhook CRUD and deliveries                                           | ~120  |
| `src/ws/manager.ts`                    | `WebSocketManager` — auto-reconnect, room subscriptions, exponential backoff                               | ~200  |
| `src/ws/atom.ts`                       | `wsManagerAtom` — Jotai atom for WS manager singleton                                                      | ~10   |
| `src/ws/hook.ts`                       | `createWsHooks()` → `useSocket`, `useRoom`, `useRoomEvent`                                                 | ~120  |
| `src/sse/manager.ts`                   | `SseManager` — per-endpoint EventSource, subscriber `on/off`, auto-reconnect                               | ~150  |
| `src/cli/sync.ts`                      | OpenAPI → typed hooks + types generation (supports multi-backend, Zod validators)                          | 1071  |
| `src/cli/templates/globals-css.ts`     | Hardcoded oklch palettes: neutral, dark, minimal (slate), vibrant (violet) — 22 CSS vars each × light/dark | 217   |
| `src/cli/templates/components-json.ts` | Generates shadcn `components.json` with theme → baseColor mapping                                          | 34    |
| `src/cli/templates/snapshot-lib.ts`    | Generates consumer's `@lib/snapshot` file with `createSnapshot(config)` and hook destructuring             | ~60   |
| `src/vite/index.ts`                    | Vite plugin — auto-sync on schema file changes                                                             | 68    |
| `tsup.config.ts`                       | 4 build entries: library (ESM+CJS), CLI index, CLI commands, Vite plugin                                   | ~40   |

**What doesn't exist:** No component system. No token schema. No page context. No `from` refs.
No action executor. No `PageRenderer`. No manifest schema. No component registration API.
No flavors system. No component-level tokens.

**Current theme system:** 4 hardcoded oklch palettes selected by name string (`default`,
`dark`, `minimal`, `vibrant`) in `globals-css.ts`. Each palette defines 22 CSS variables in
light + dark variants. shadcn components consume these via Tailwind v4's `@theme` directive.
`useTheme()` toggles a `dark` class on `<html>`. No runtime customization. No partial
overrides. No extension mechanism.

---

## Developer Context

### Build & Test Commands

```sh
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier check
bun run build            # tsup + oclif manifest
bun test                 # vitest run
```

### Key Patterns

**Factory closure pattern (every SDK module follows this):**

```ts
function createFooHooks(deps: { api: ApiClient; queryClient: QueryClient }) {
  function useFoo() {
    // Captures deps from closure. No globals. No React context for deps.
  }
  return { useFoo };
}

// In createSnapshot:
const fooHooks = createFooHooks({ api, queryClient });
return { ...fooHooks /* ...other hook factories */ };
```

**Contract pattern (endpoint paths are configurable):**

```ts
const contract = mergeContract(apiUrl, config.contract);
// contract.endpoints.login → "/auth/login"
// Hooks use contract paths, not hardcoded strings
```

**Jotai atom pattern (existing):**

```ts
// ws/atom.ts — singleton within createSnapshot scope
const wsManagerAtom = atom<WebSocketManager | null>(null);
// theme/hook.ts — persisted across sessions
const themeAtom = atomWithStorage<Theme>("snapshot-theme", defaultTheme);
```

### Package Entry Points

Currently two: `"."` (main SDK) and `"./vite"` (Vite plugin). This spec does not add new
entry points — all new exports go through `"."`.

### Peer Dependencies

React ≥19, TanStack Query ≥5, TanStack Router ≥1, Jotai ≥2, Vite ≥5 (optional), Zod ^3
(optional). This spec makes Zod a **required** peer dependency (it's used for all config
schema validation).

### shadcn as a Bundled Dependency

Config-driven components render using shadcn primitives (Button, Input, Card, Table, Dialog,
Sheet, Tabs, etc.). These are **bundled into the package**, not imported from the consumer's
project. The consumer still has their own shadcn installation for custom components, but the
framework's components are self-contained.

This means: `@radix-ui/*` packages become dependencies (not peer deps) of the snapshot
package. Tailwind CSS classes used by bundled components must work in the consumer's Tailwind
setup — this is guaranteed because both use the same CSS variable names.

---

## Non-Negotiable Engineering Constraints

From `docs/engineering-rules.md`:

| #   | Rule                                                                 | Impact on this spec                                             |
| --- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | Factory pattern — `createSnapshot(config)` is the single entry point | New component hooks integrate into the factory                  |
| 3   | Hooks are closures, not globals                                      | Component hooks capture `api`, `queryClient` from factory scope |
| 5   | No `any`. No unnecessary casts                                       | All component configs are fully typed via Zod inference         |
| 8   | Separation of concerns — SDK modules by domain                       | Each component is its own module under `src/components/`        |
| 9   | Shared types in `types.ts`. Never redefine a shape                   | Token types, action types, component base types in `types.ts`   |
| 10  | Peer deps are boundaries                                             | Zod becomes required peer dep. Radix becomes bundled dep.       |
| 15  | Test what you ship                                                   | Every component, hook, schema, and utility has tests            |
| 21  | Design tokens are the styling boundary                               | Components consume tokens only — no raw CSS values              |
| 22  | Components are higher-level abstractions                             | Zod config schema, self-manage data + state                     |
| 23  | Inter-component data binding via `from` refs                         | PageContext + AppContext atom registries                        |
| 24  | Fixed action vocabulary                                              | 9 action types, Zod-validated configs                           |
| 28  | JSDoc on every exported function, hook, type, class                  | All new public API surface                                      |
| 29  | Documentation parity — `docs/` updated in same commit                | Per-phase doc requirements specified                            |

---

## Phase 1: Token System

### Goal

Replace the 4 hardcoded oklch palettes with a full design token system. The consumer declares
theme intent through **flavors** (named presets), **overrides** (per-token customization),
and **component-level tokens** (per-component styling). `resolveTokens()` generates CSS custom
properties that extend shadcn's variable system. `useTokenEditor()` enables runtime
customization for theme editors and per-user theming.

### The Vision

A consumer should be able to:

1. Pick a flavor: `"flavor": "midnight"` — done, beautiful app
2. Override specific tokens: `"overrides": { "colors": { "primary": "#8b5cf6" } }` — keeps the
   flavor's other colors, just swaps primary
3. Define component-level tokens: `"components": { "card": { "padding": "relaxed" } }` — cards
   get more padding without affecting the rest of the app
4. Create their own flavor: export a `ThemeConfig` and name it
5. Let end users customize at runtime: `useTokenEditor().setToken('colors.primary', '#e11d48')`
   — instant live preview in a theme editor UI
6. Persist runtime overrides: `getTokens()` returns a manifest-compatible object that can be
   saved and restored

### The API

```ts
import {
  themeSchema,
  resolveTokens,
  useTokenEditor,
  flavors,
  defineFlavor,
} from "@lastshotlabs/snapshot";

// --- Flavor system ---

// List built-in flavors
console.log(Object.keys(flavors));
// ['neutral', 'slate', 'midnight', 'violet', 'rose', 'emerald', 'ocean', 'sunset']

// Use a built-in flavor with overrides
const css = resolveTokens({
  flavor: "midnight",
  overrides: {
    colors: { primary: "#8b5cf6" },
    radius: "lg",
  },
});

// Define a custom flavor
const myBrandFlavor = defineFlavor("my-brand", {
  colors: {
    primary: "#1d4ed8",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#fafaf9",
    destructive: "#dc2626",
  },
  darkColors: {
    primary: "#3b82f6",
    secondary: "#94a3b8",
    accent: "#fbbf24",
    background: "#0c0a09",
    destructive: "#ef4444",
  },
  radius: "md",
  spacing: "default",
  font: { sans: "DM Sans", mono: "JetBrains Mono" },
  components: {
    card: { shadow: "md", padding: "relaxed" },
    table: { striped: true, density: "comfortable" },
    button: { weight: "medium" },
  },
});

// Use custom flavor in manifest
// { "theme": { "flavor": "my-brand" } }

// --- Runtime editing ---

const { setToken, resetTokens, getTokens, setFlavor, subscribe } =
  useTokenEditor();

// Change individual tokens at runtime — instant visual update
setToken("colors.primary", "#e11d48");
setToken("radius", "full");
setToken("components.card.shadow", "lg");

// Switch entire flavor at runtime
setFlavor("midnight");

// Get current state as manifest-compatible config (for persistence)
const overrides = getTokens();
// → { colors: { primary: '#e11d48' }, radius: 'full', components: { card: { shadow: 'lg' } } }

// Persist to backend, restore on next load
await api.patch("/api/me/preferences", { theme: overrides });

// Subscribe to changes (for syncing theme editor UI)
const unsub = subscribe((overrides) => {
  console.log("Theme changed:", overrides);
});
```

### Types

```ts
/** Named theme preset. Provides a complete set of design tokens. */
interface Flavor {
  /** Flavor identifier. */
  name: string;
  /** Human-readable display name. */
  displayName: string;
  /** Light mode colors. */
  colors: ThemeColors;
  /** Dark mode colors. If omitted, auto-derived from light colors. */
  darkColors?: ThemeColors;
  /** Border radius preset. */
  radius: RadiusScale;
  /** Spacing density. */
  spacing: SpacingScale;
  /** Font families. */
  font: FontConfig;
  /** Component-level token overrides. */
  components?: ComponentTokens;
}

/** Semantic color tokens. Each generates a CSS custom property. */
interface ThemeColors {
  /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
  primary?: string;
  /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
  secondary?: string;
  /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
  muted?: string;
  /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
  accent?: string;
  /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
  destructive?: string;
  /** Success color. Generates `--success` and `--success-foreground`. */
  success?: string;
  /** Warning color. Generates `--warning` and `--warning-foreground`. */
  warning?: string;
  /** Info color. Generates `--info` and `--info-foreground`. */
  info?: string;
  /** Page background. Generates `--background` and `--foreground`. */
  background?: string;
  /** Card background. Generates `--card` and `--card-foreground`. */
  card?: string;
  /** Popover background. Generates `--popover` and `--popover-foreground`. */
  popover?: string;
  /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
  sidebar?: string;
  /** Border color. Generates `--border`. */
  border?: string;
  /** Input border color. Generates `--input`. */
  input?: string;
  /** Focus ring color. Generates `--ring`. */
  ring?: string;
  /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
  chart?: [string, string, string, string, string];
}

/** Border radius scale. */
type RadiusScale = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

/** Spacing density. Affects padding, gaps, and margins globally. */
type SpacingScale = "compact" | "default" | "comfortable" | "spacious";

/** Font configuration. */
interface FontConfig {
  /** Primary font family (body text, headings). */
  sans?: string;
  /** Monospace font family (code, pre). */
  mono?: string;
  /** Display font (large headings, hero text). */
  display?: string;
  /** Base font size in px. Default: 16. */
  baseSize?: number;
  /** Type scale ratio. Default: 1.25 (major third). */
  scale?: number;
}

/** A breakpoint-aware value. Flat value or responsive map. */
type Responsive<T> =
  | T
  | { default: T; sm?: T; md?: T; lg?: T; xl?: T; "2xl"?: T };

/** Component-level token overrides. Per-component styling knobs. */
interface ComponentTokens {
  card?: {
    shadow?: "none" | "sm" | "md" | "lg" | "xl";
    padding?: SpacingScale;
    border?: boolean;
  };
  table?: {
    striped?: boolean;
    density?: "compact" | "default" | "comfortable";
    headerBackground?: boolean;
    hoverRow?: boolean;
    borderStyle?: "none" | "horizontal" | "grid";
  };
  button?: {
    weight?: "light" | "medium" | "bold";
    uppercase?: boolean;
    iconSize?: "sm" | "md" | "lg";
  };
  input?: {
    size?: "sm" | "md" | "lg";
    variant?: "outline" | "filled" | "underline";
  };
  modal?: {
    overlay?: "light" | "dark" | "blur";
    animation?: "fade" | "scale" | "slide-up" | "none";
  };
  nav?: {
    variant?: "minimal" | "bordered" | "filled";
    activeIndicator?: "background" | "border-left" | "border-bottom" | "dot";
  };
  badge?: {
    variant?: "solid" | "outline" | "soft";
    rounded?: boolean;
  };
  toast?: {
    position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
    animation?: "slide" | "fade" | "pop";
  };
}

/** Theme configuration in the manifest. */
interface ThemeConfig {
  /** Named flavor preset. Provides all base tokens. */
  flavor?: string;
  /** Token overrides applied on top of the flavor. */
  overrides?: {
    colors?: ThemeColors;
    darkColors?: ThemeColors;
    radius?: RadiusScale;
    spacing?: SpacingScale;
    font?: FontConfig;
    components?: ComponentTokens;
  };
  /** Initial color mode. 'system' follows prefers-color-scheme. */
  mode?: "light" | "dark" | "system";
}

/** Return type of useTokenEditor(). */
interface TokenEditor {
  /** Override a single token at runtime. Instant visual update via CSS custom property. */
  setToken: (path: string, value: string) => void;
  /** Switch to a different flavor at runtime. Resets all overrides. */
  setFlavor: (flavorName: string) => void;
  /** Reset all runtime overrides. Reverts to the CSS file baseline. */
  resetTokens: () => void;
  /** Get current runtime overrides as a manifest-compatible config object. */
  getTokens: () => Partial<ThemeConfig["overrides"]>;
  /** Get the name of the currently active flavor. */
  currentFlavor: () => string;
  /** Subscribe to token changes. Returns unsubscribe function. */
  subscribe: (
    listener: (overrides: Partial<ThemeConfig["overrides"]>) => void,
  ) => () => void;
}
```

### Built-in Flavors

The 4 current hardcoded palettes become the first built-in flavors. Additional flavors are
added to cover common app aesthetics:

| Flavor     | Description                                           | Primary     | Vibe                                |
| ---------- | ----------------------------------------------------- | ----------- | ----------------------------------- |
| `neutral`  | Clean, professional. Current default palette.         | Gray scale  | Corporate SaaS, admin dashboards    |
| `slate`    | Softer neutral. Current "minimal" palette.            | Slate tones | Documentation, content apps         |
| `midnight` | Dark-first. Deep backgrounds with high-contrast text. | Blue-violet | Dev tools, media apps, chat         |
| `violet`   | Vibrant purple. Current "vibrant" palette.            | Violet      | Creative apps, social platforms     |
| `rose`     | Warm pink-red tones.                                  | Rose        | E-commerce, lifestyle, beauty       |
| `emerald`  | Nature-inspired greens.                               | Emerald     | Finance, health, sustainability     |
| `ocean`    | Deep blues with teal accents.                         | Cyan-blue   | Travel, communication, productivity |
| `sunset`   | Warm orange-amber tones.                              | Orange      | Food, entertainment, energy         |

Each flavor provides a full `ThemeColors` (light + dark), a default radius, spacing, and font.
Flavors are extensible — `defineFlavor()` creates new ones.

**Flavor resolution order:** `flavor defaults` → `overrides` → `runtime setToken()`.
Each layer only overrides what it specifies. Omitted tokens cascade from the previous layer.

### Component-Level Tokens

Component-level tokens are CSS custom properties scoped to component selectors:

```css
/* Generated by resolveTokens() when components.card is configured */
[data-snapshot-component="card"] {
  --card-shadow: var(--shadow-md);
  --card-padding: var(--spacing-relaxed);
  --card-border: 1px solid var(--border);
}

[data-snapshot-component="table"] {
  --table-stripe-bg: var(--muted);
  --table-density: 1; /* multiplier for row height */
  --table-hover-bg: var(--accent);
}

[data-snapshot-component="input"] {
  --input-height: 2.5rem;
  --input-variant: outline; /* used by component logic, not CSS */
}
```

Components read their own tokens via CSS variables. This means:

- A consumer can override `[data-snapshot-component="card"] { --card-shadow: none }` in their
  own CSS to kill card shadows globally
- Component tokens cascade — setting `spacing: 'compact'` globally affects card padding,
  table row height, input height, etc.
- Component-level overrides in the manifest take precedence over global tokens

### Zod Schema

```ts
const themeColorsSchema = z
  .object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    muted: z.string().optional(),
    accent: z.string().optional(),
    destructive: z.string().optional(),
    success: z.string().optional(),
    warning: z.string().optional(),
    info: z.string().optional(),
    background: z.string().optional(),
    card: z.string().optional(),
    popover: z.string().optional(),
    sidebar: z.string().optional(),
    border: z.string().optional(),
    input: z.string().optional(),
    ring: z.string().optional(),
    chart: z
      .tuple([z.string(), z.string(), z.string(), z.string(), z.string()])
      .optional(),
  })
  .strict();

const radiusSchema = z.enum(["none", "xs", "sm", "md", "lg", "xl", "full"]);
const spacingSchema = z.enum(["compact", "default", "comfortable", "spacious"]);

const fontSchema = z
  .object({
    sans: z.string().optional(),
    mono: z.string().optional(),
    display: z.string().optional(),
    baseSize: z.number().min(10).max(24).optional(),
    scale: z.number().min(1.1).max(1.5).optional(),
  })
  .strict();

const componentTokensSchema = z
  .object({
    card: z
      .object({
        shadow: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
        padding: spacingSchema.optional(),
        border: z.boolean().optional(),
      })
      .strict()
      .optional(),
    table: z
      .object({
        striped: z.boolean().optional(),
        density: z.enum(["compact", "default", "comfortable"]).optional(),
        headerBackground: z.boolean().optional(),
        hoverRow: z.boolean().optional(),
        borderStyle: z.enum(["none", "horizontal", "grid"]).optional(),
      })
      .strict()
      .optional(),
    button: z
      .object({
        weight: z.enum(["light", "medium", "bold"]).optional(),
        uppercase: z.boolean().optional(),
        iconSize: z.enum(["sm", "md", "lg"]).optional(),
      })
      .strict()
      .optional(),
    input: z
      .object({
        size: z.enum(["sm", "md", "lg"]).optional(),
        variant: z.enum(["outline", "filled", "underline"]).optional(),
      })
      .strict()
      .optional(),
    modal: z
      .object({
        overlay: z.enum(["light", "dark", "blur"]).optional(),
        animation: z.enum(["fade", "scale", "slide-up", "none"]).optional(),
      })
      .strict()
      .optional(),
    nav: z
      .object({
        variant: z.enum(["minimal", "bordered", "filled"]).optional(),
        activeIndicator: z
          .enum(["background", "border-left", "border-bottom", "dot"])
          .optional(),
      })
      .strict()
      .optional(),
    badge: z
      .object({
        variant: z.enum(["solid", "outline", "soft"]).optional(),
        rounded: z.boolean().optional(),
      })
      .strict()
      .optional(),
    toast: z
      .object({
        position: z
          .enum(["top-right", "top-center", "bottom-right", "bottom-center"])
          .optional(),
        animation: z.enum(["slide", "fade", "pop"]).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

const themeConfigSchema = z
  .object({
    flavor: z.string().optional(),
    overrides: z
      .object({
        colors: themeColorsSchema.optional(),
        darkColors: themeColorsSchema.optional(),
        radius: radiusSchema.optional(),
        spacing: spacingSchema.optional(),
        font: fontSchema.optional(),
        components: componentTokensSchema.optional(),
      })
      .strict()
      .optional(),
    mode: z.enum(["light", "dark", "system"]).optional(),
  })
  .strict();
```

### Implementation

**`src/tokens/schema.ts`** — Zod schemas + TypeScript types (inferred from schemas).

**`src/tokens/flavors.ts`** — Built-in flavor definitions + `defineFlavor()` + flavor registry.

```ts
const flavorRegistry = new Map<string, Flavor>();

function defineFlavor(name: string, config: Omit<Flavor, "name">): Flavor {
  const flavor: Flavor = { name, displayName: name, ...config };
  flavorRegistry.set(name, flavor);
  return flavor;
}

function getFlavor(name: string): Flavor | undefined {
  return flavorRegistry.get(name);
}

// Register built-in flavors
defineFlavor("neutral", {
  /* ... extracted from current globals-css.ts neutral palette */
});
defineFlavor("slate", {
  /* ... extracted from current globals-css.ts minimal palette */
});
defineFlavor("midnight", {
  /* ... new dark-first palette */
});
defineFlavor("violet", {
  /* ... extracted from current globals-css.ts vibrant palette */
});
defineFlavor("rose", {
  /* ... new warm palette */
});
defineFlavor("emerald", {
  /* ... new green palette */
});
defineFlavor("ocean", {
  /* ... new blue palette */
});
defineFlavor("sunset", {
  /* ... new orange palette */
});
```

**`src/tokens/resolve.ts`** — `resolveTokens(config: ThemeConfig): string`

Resolution pipeline:

1. Load base flavor (default: `neutral`)
2. Deep merge overrides onto flavor defaults
3. Convert all colors to oklch (hex, hsl, rgb, oklch all accepted)
4. Auto-derive foreground colors (contrast-aware luminance check)
5. Auto-derive dark mode colors if `darkColors` not provided (reduce lightness, boost chroma)
6. Map radius enum to CSS value: `none`=0, `xs`=0.125rem, `sm`=0.25rem, `md`=0.5rem,
   `lg`=0.75rem, `xl`=1rem, `full`=9999px
7. Map spacing enum to scale: `compact`=0.75, `default`=1, `comfortable`=1.25, `spacious`=1.5
8. Map font config to CSS: `--font-sans`, `--font-mono`, `--font-display`, `--font-size-base`,
   `--font-scale`
9. Generate component-level CSS custom properties
10. Output CSS string with `@import`, `@theme`, `:root`, `.dark`, component selectors

**`src/tokens/color.ts`** — Color conversion utilities.

No external dependencies. Inline implementations of:

- `hexToOklch(hex: string): [number, number, number]`
- `hslToOklch(h: number, s: number, l: number): [number, number, number]`
- `oklchToString(l: number, c: number, h: number): string`
- `deriveForeground(backgroundColor: string): string` — returns light or dark foreground
  based on background luminance
- `deriveDarkVariant(lightColor: string): string` — reduces lightness, adjusts chroma for
  dark mode

Test against known color conversion tables to validate accuracy.

**`src/tokens/editor.ts`** — `useTokenEditor(): TokenEditor`

Runtime overrides via `document.documentElement.style.setProperty()`:

```ts
function useTokenEditor(): TokenEditor {
  const overridesRef = useRef<Map<string, string>>(new Map());
  const currentFlavorRef = useRef<string>("neutral");
  const listenersRef = useRef<
    Set<(o: Partial<ThemeConfig["overrides"]>) => void>
  >(new Set());

  const setToken = useCallback((path: string, value: string) => {
    const cssVar = tokenPathToCssVar(path);
    const cssValue = convertToCssValue(path, value);
    document.documentElement.style.setProperty(cssVar, cssValue);
    overridesRef.current.set(path, value);
    notifyListeners();
  }, []);

  const setFlavor = useCallback((flavorName: string) => {
    const flavor = getFlavor(flavorName);
    if (!flavor) throw new Error(`Unknown flavor: ${flavorName}`);

    // Remove all current overrides
    resetTokens();

    // Apply flavor's tokens as inline styles
    const tokens = flavorToTokenMap(flavor);
    for (const [cssVar, value] of tokens) {
      document.documentElement.style.setProperty(cssVar, value);
    }
    currentFlavorRef.current = flavorName;
    notifyListeners();
  }, []);

  const resetTokens = useCallback(() => {
    for (const [path] of overridesRef.current) {
      document.documentElement.style.removeProperty(tokenPathToCssVar(path));
    }
    overridesRef.current.clear();
    notifyListeners();
  }, []);

  const getTokens = useCallback((): Partial<ThemeConfig["overrides"]> => {
    return mapToThemeConfig(overridesRef.current);
  }, []);

  const currentFlavor = useCallback(() => currentFlavorRef.current, []);

  const subscribe = useCallback(
    (listener: (o: Partial<ThemeConfig["overrides"]>) => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [],
  );

  return {
    setToken,
    setFlavor,
    resetTokens,
    getTokens,
    currentFlavor,
    subscribe,
  };
}
```

**Token path to CSS variable mapping:**

```ts
const TOKEN_MAP: Record<string, string> = {
  "colors.primary": "--primary",
  "colors.secondary": "--secondary",
  "colors.background": "--background",
  "colors.card": "--card",
  // ... all semantic colors
  radius: "--radius",
  spacing: "--spacing-unit",
  "font.sans": "--font-sans",
  "font.mono": "--font-mono",
  "components.card.shadow": "--card-shadow",
  "components.card.padding": "--card-padding",
  "components.table.density": "--table-density",
  // ... all component tokens
};
```

**`src/tokens/defaults.ts`** — Default token values and palette extraction.

Extract the 4 existing palettes from `globals-css.ts` into structured `Flavor` objects. Add 4
new palettes (rose, emerald, ocean, sunset). Each flavor specifies all 30+ CSS variables in
light and dark modes.

### Integration with Existing Theme

`useTheme()` (existing) handles the light/dark class toggle on `<html>`. No changes needed.
`resolveTokens()` generates `:root { ... }` and `.dark { ... }` blocks — the class toggle
picks which variables are active.

`useTokenEditor()` sets inline styles on `:root` which override CSS file declarations
(inline > class specificity). Mode-specific runtime overrides work by setting properties on
the `.dark` selector element when in dark mode:

```ts
// In setToken, when the path starts with 'darkColors.'
if (isDarkColorPath(path)) {
  // Set on a scoped style element for .dark selector
  darkStyleSheet.setProperty(cssVar, cssValue);
} else {
  document.documentElement.style.setProperty(cssVar, cssValue);
}
```

### Files to Create

| File                     | What                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `src/tokens/schema.ts`   | Zod schemas + TS types (ThemeConfig, ThemeColors, Flavor, ComponentTokens, etc.)       |
| `src/tokens/flavors.ts`  | Built-in flavor definitions, `defineFlavor()`, `getFlavor()`, flavor registry          |
| `src/tokens/resolve.ts`  | `resolveTokens()` — config → CSS string with all token layers                          |
| `src/tokens/color.ts`    | Color conversion: hex→oklch, hsl→oklch, foreground derivation, dark variant derivation |
| `src/tokens/editor.ts`   | `useTokenEditor()` hook with setToken, setFlavor, resetTokens, getTokens, subscribe    |
| `src/tokens/defaults.ts` | Default token values, palette extraction from existing globals-css                     |
| `src/tokens/index.ts`    | Module exports                                                                         |

### Files to Modify

| File           | Change                                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts` | Export: `themeConfigSchema`, `resolveTokens`, `useTokenEditor`, `defineFlavor`, `flavors`, all token types                               |
| `src/types.ts` | Add: `ThemeConfig`, `ThemeColors`, `Flavor`, `ComponentTokens`, `TokenEditor`, `Responsive`, `RadiusScale`, `SpacingScale`, `FontConfig` |

### Documentation Impact

| Target           | Change                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/tokens.md` | **Create** — design token system guide: flavors, overrides, component tokens, runtime editing, custom flavors, CSS variable reference |
| `docs/vision.md` | Verify token system section matches implementation                                                                                    |

### Exit Criteria

- [ ] `resolveTokens({ flavor: 'neutral' })` returns valid CSS with all 30+ variables in light and dark
- [ ] `resolveTokens({ flavor: 'midnight', overrides: { colors: { primary: '#8b5cf6' } } })` merges correctly
- [ ] `resolveTokens({})` (no config) returns neutral flavor CSS — always a valid baseline
- [ ] All 8 built-in flavors produce visually distinct, aesthetically coherent palettes
- [ ] `defineFlavor('custom', { ... })` registers and `resolveTokens({ flavor: 'custom' })` uses it
- [ ] Color conversion: hex→oklch verified against known conversion table for 20+ colors
- [ ] Auto-derived foreground passes WCAG AA contrast ratio (4.5:1) for all built-in flavors
- [ ] Auto-derived dark mode colors are visually coherent (not just inverted)
- [ ] Component-level tokens generate correct scoped CSS
- [ ] `useTokenEditor().setToken('colors.primary', '#e11d48')` updates CSS variable instantly
- [ ] `useTokenEditor().setFlavor('midnight')` switches entire palette at runtime
- [ ] `useTokenEditor().resetTokens()` reverts to CSS file baseline
- [ ] `useTokenEditor().getTokens()` returns manifest-compatible object
- [ ] `useTokenEditor().subscribe()` fires on every setToken/setFlavor/resetTokens call
- [ ] `themeConfigSchema.safeParse()` validates all valid configs, rejects invalid
- [ ] All exports have JSDoc
- [ ] `bun run typecheck && bun run build && bun test` pass

### Tests

| File                                   | What                                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tokens/__tests__/schema.test.ts`  | Zod validation: all valid config shapes, invalid configs with descriptive errors, edge cases (empty, partial, unknown keys)                 |
| `src/tokens/__tests__/resolve.test.ts` | CSS generation: each flavor, override merging, dark mode derivation, component tokens, radius/spacing/font mapping, missing-config defaults |
| `src/tokens/__tests__/color.test.ts`   | Color conversion: hex→oklch (20+ known values), hsl→oklch, oklch passthrough, foreground contrast, dark variant derivation                  |
| `src/tokens/__tests__/editor.test.ts`  | Token editor: setToken, setFlavor, resetTokens, getTokens, subscribe/unsubscribe, mode-specific overrides, unknown flavor error             |
| `src/tokens/__tests__/flavors.test.ts` | Flavor registry: built-in flavors exist, defineFlavor creates new, getFlavor retrieves, override doesn't mutate original                    |

---

## Phase 2: Page Context & `from` Ref System

### Goal

Build the reactive wiring layer that lets components communicate via `{ "from": "id" }` refs.
Two-layer context: `PageContext` (per-route, destroyed on navigation) and `AppContext` (global,
persists across routes). Jotai atoms underneath. This is the nervous system of the config-driven
UI — without it, components are isolated islands.

### Real-World Wiring Examples

**Example 1: Table drives detail drawer**

```json
{
  "content": [
    {
      "type": "table",
      "id": "users-table",
      "data": "GET /api/users",
      "selectable": true
    },
    {
      "type": "drawer",
      "id": "user-detail",
      "trigger": { "from": "users-table.selected" },
      "title": { "from": "users-table.selected.name" },
      "content": [
        { "type": "detail-card", "data": { "from": "users-table.selected" } },
        {
          "type": "feed",
          "data": "GET /api/users/{id}/activity",
          "params": { "id": { "from": "users-table.selected.id" } }
        }
      ]
    }
  ]
}
```

When a user clicks a table row:

1. `users-table` publishes `{ selected: { id: 5, name: "Alice", ... }, selectedRows: [...] }`
2. `user-detail` drawer opens (trigger resolves to truthy)
3. Drawer title resolves to `"Alice"`
4. Detail card receives the full user object
5. Feed fetches `GET /api/users/5/activity`

**Example 2: Filter chain across components**

```json
{
  "content": [
    {
      "type": "select",
      "id": "date-range",
      "options": ["7d", "30d", "90d", "1y"],
      "default": "30d"
    },
    {
      "type": "select",
      "id": "region-filter",
      "data": "GET /api/regions",
      "valueField": "code",
      "labelField": "name"
    },
    {
      "type": "row",
      "children": [
        {
          "type": "stat-card",
          "data": "GET /api/stats/revenue",
          "params": {
            "period": { "from": "date-range" },
            "region": { "from": "region-filter" }
          }
        },
        {
          "type": "stat-card",
          "data": "GET /api/stats/orders",
          "params": {
            "period": { "from": "date-range" },
            "region": { "from": "region-filter" }
          }
        }
      ]
    },
    {
      "type": "chart",
      "data": "GET /api/stats/revenue/timeseries",
      "params": {
        "period": { "from": "date-range" },
        "region": { "from": "region-filter" }
      }
    },
    {
      "type": "table",
      "data": "GET /api/orders",
      "filters": {
        "period": { "from": "date-range" },
        "region": { "from": "region-filter" }
      }
    }
  ]
}
```

Changing either dropdown refetches all 4 components. One source, four subscribers. No wiring
code.

**Example 3: Global state (cart, auth)**

```json
{
  "globals": {
    "user": {},
    "cart": { "data": "GET /api/cart" }
  },
  "nav": [
    {
      "label": "Cart",
      "path": "/cart",
      "icon": "shopping-cart",
      "badge": { "from": "global.cart.items.length" }
    }
  ],
  "pages": {
    "/checkout": {
      "content": [
        {
          "type": "detail-card",
          "data": { "from": "global.cart" },
          "title": "Order Summary"
        }
      ]
    }
  }
}
```

`global.cart` persists across all pages. The nav badge updates in real-time as items are
added. The checkout page reads cart contents without refetching.

### The API

```tsx
import {
  PageContextProvider,
  AppContextProvider,
  usePublish,
  useSubscribe,
  useResolveFrom,
  isFromRef,
} from "@lastshotlabs/snapshot";

// Level 2: Using in custom React code
function MyCustomComponent() {
  // Publish a value that other components can subscribe to
  const publish = usePublish("my-component");

  // Subscribe to another component's published value
  const selectedUser = useSubscribe({ from: "users-table.selected" });
  const userName = useSubscribe({ from: "users-table.selected.name" });

  // Subscribe to global state
  const currentUser = useSubscribe({ from: "global.user" });

  // Static values pass through unchanged
  const staticValue = useSubscribe("just-a-string"); // → 'just-a-string'

  // Resolve all FromRefs in a config object at once
  const resolvedConfig = useResolveFrom({
    userId: { from: "users-table.selected.id" },
    period: { from: "date-range" },
    label: "static label",
  });
  // → { userId: 5, period: '30d', label: 'static label' }

  useEffect(() => {
    publish({ myValue: 42 });
  }, []);

  return <div>User: {userName}</div>;
}
```

### Types

```ts
/** A reference to another component's published value. */
interface FromRef {
  /** Dot-path reference. Examples: "component-id", "component-id.field", "global.user.name" */
  from: string;
}

/** Type guard for FromRef values. */
function isFromRef(value: unknown): value is FromRef;

/**
 * Resolves a type where FromRef values are replaced with their resolved types.
 * Used internally — consumers don't need to use this directly.
 */
type ResolvedConfig<T> = {
  [K in keyof T]: T[K] extends FromRef ? unknown : T[K];
};

/** The atom registry interface — maps component ids to their published Jotai atoms. */
interface AtomRegistry {
  /** Register an atom for a component id. Idempotent — returns existing atom if already registered. */
  register(id: string): PrimitiveAtom<unknown>;
  /** Get the atom for a component id. Returns undefined if not registered. */
  get(id: string): PrimitiveAtom<unknown> | undefined;
  /** Remove a component's atom. Called on unmount. */
  unregister(id: string): void;
  /** Get all registered component ids. For debugging/dev tools. */
  keys(): string[];
  /** Get the Jotai store backing this registry. */
  store: Store;
}

/** Global state definition from the manifest. */
interface GlobalConfig {
  /** Endpoint to fetch initial value from. Fetched on app mount. */
  data?: string;
  /** Static default value (used until endpoint responds, or if no endpoint). */
  default?: unknown;
}

/** Props for AppContextProvider. */
interface AppContextProviderProps {
  /** Global state definitions from manifest. Keyed by id. */
  globals?: Record<string, GlobalConfig>;
  /** The API client instance (from createSnapshot) for fetching global data. */
  api?: ApiClient;
  children: React.ReactNode;
}

/** Props for PageContextProvider. */
interface PageContextProviderProps {
  children: React.ReactNode;
}
```

### Implementation

**`src/context/registry.ts`** — `AtomRegistryImpl` class

```ts
import { atom, createStore, type PrimitiveAtom } from "jotai";
import type { Store } from "jotai/vanilla";

class AtomRegistryImpl implements AtomRegistry {
  private atoms = new Map<string, PrimitiveAtom<unknown>>();
  readonly store: Store;

  constructor(store?: Store) {
    this.store = store ?? createStore();
  }

  register(id: string): PrimitiveAtom<unknown> {
    const existing = this.atoms.get(id);
    if (existing) return existing;

    const a = atom<unknown>(undefined);
    // Debug label for Jotai devtools
    a.debugLabel = `snapshot:${id}`;
    this.atoms.set(id, a);
    return a;
  }

  get(id: string): PrimitiveAtom<unknown> | undefined {
    return this.atoms.get(id);
  }

  unregister(id: string): void {
    this.atoms.delete(id);
  }

  keys(): string[] {
    return [...this.atoms.keys()];
  }
}
```

**`src/context/providers.tsx`** — Context providers

```tsx
import { Provider as JotaiProvider } from "jotai";

const PageRegistryContext = createContext<AtomRegistry | null>(null);
const AppRegistryContext = createContext<AtomRegistry | null>(null);

function AppContextProvider({
  globals,
  api,
  children,
}: AppContextProviderProps) {
  const registryRef = useRef<AtomRegistry>(null);
  if (!registryRef.current) {
    registryRef.current = new AtomRegistryImpl();
  }
  const registry = registryRef.current;

  // Initialize globals on mount
  useEffect(() => {
    if (!globals) return;
    for (const [id, config] of Object.entries(globals)) {
      const a = registry.register(id);

      // Set default value immediately
      if (config.default !== undefined) {
        registry.store.set(a, config.default);
      }

      // Fetch from endpoint if specified
      if (config.data && api) {
        const [method, endpoint] = parseDataString(config.data);
        api.get(endpoint).then((data) => {
          registry.store.set(a, data);
        });
      }
    }
  }, []);

  return (
    <AppRegistryContext.Provider value={registry}>
      <JotaiProvider store={registry.store}>{children}</JotaiProvider>
    </AppRegistryContext.Provider>
  );
}

function PageContextProvider({ children }: PageContextProviderProps) {
  const registryRef = useRef<AtomRegistry>(null);
  if (!registryRef.current) {
    registryRef.current = new AtomRegistryImpl();
  }

  return (
    <PageRegistryContext.Provider value={registryRef.current}>
      {children}
    </PageRegistryContext.Provider>
  );
}
```

**`src/context/hooks.ts`** — Core hooks

```ts
function usePublish(id: string): (value: unknown) => void {
  const pageRegistry = useContext(PageRegistryContext);

  // Register atom on mount, unregister on unmount
  const atomRef = useRef<PrimitiveAtom<unknown>>();
  if (!atomRef.current && pageRegistry) {
    atomRef.current = pageRegistry.register(id);
  }

  useEffect(() => {
    return () => {
      if (pageRegistry) pageRegistry.unregister(id);
      atomRef.current = undefined;
    };
  }, [id, pageRegistry]);

  return useCallback(
    (value: unknown) => {
      if (atomRef.current && pageRegistry) {
        pageRegistry.store.set(atomRef.current, value);
      }
    },
    [pageRegistry],
  );
}

function useSubscribe(ref: FromRef | unknown): unknown {
  // Static values pass through
  if (!isFromRef(ref)) return ref;

  const refPath = ref.from;
  const isGlobal = refPath.startsWith("global.");
  const cleanPath = isGlobal ? refPath.slice(7) : refPath;

  // Split component id from sub-path: "users-table.selected.id" → ["users-table", "selected.id"]
  const dotIndex = cleanPath.indexOf(".");
  const componentId =
    dotIndex === -1 ? cleanPath : cleanPath.slice(0, dotIndex);
  const subPath = dotIndex === -1 ? "" : cleanPath.slice(dotIndex + 1);

  const registry = useContext(
    isGlobal ? AppRegistryContext : PageRegistryContext,
  );
  const sourceAtom = registry?.get(componentId);

  // If atom doesn't exist yet, return undefined (component may not have mounted yet)
  const value = useAtomValue(sourceAtom ?? atom(undefined), {
    store: registry?.store,
  });

  return subPath ? getNestedValue(value, subPath) : value;
}

function useResolveFrom<T extends Record<string, unknown>>(
  config: T,
): ResolvedConfig<T> {
  // Collect all FromRef paths from the config
  const refs = extractFromRefs(config);
  // Subscribe to each one
  const resolved = new Map<string, unknown>();
  for (const [path, ref] of refs) {
    resolved.set(path, useSubscribe(ref));
  }
  // Return config with FromRefs replaced by resolved values
  return applyResolved(config, resolved) as ResolvedConfig<T>;
}
```

**`src/context/utils.ts`** — Utility functions

```ts
/** Safely access nested values via dot-path. */
function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Check if a value is a FromRef. */
function isFromRef(value: unknown): value is FromRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "from" in value &&
    typeof (value as FromRef).from === "string"
  );
}

/** Parse a data string like "GET /api/users" into [method, endpoint]. */
function parseDataString(data: string): [string, string] {
  const spaceIndex = data.indexOf(" ");
  if (spaceIndex === -1) return ["GET", data];
  return [data.slice(0, spaceIndex), data.slice(spaceIndex + 1)];
}

/** Extract all FromRef values from a nested config object with their dot-paths. */
function extractFromRefs(obj: unknown, prefix = ""): Map<string, FromRef> {
  /* ... */
}

/** Apply resolved values back into a config object, replacing FromRefs. */
function applyResolved<T>(config: T, resolved: Map<string, unknown>): T {
  /* ... */
}
```

### Files to Create

| File                        | What                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `src/context/registry.ts`   | `AtomRegistryImpl` class with Jotai store                                            |
| `src/context/providers.tsx` | `PageContextProvider`, `AppContextProvider`                                          |
| `src/context/hooks.ts`      | `usePublish`, `useSubscribe`, `useResolveFrom`                                       |
| `src/context/utils.ts`      | `getNestedValue`, `isFromRef`, `parseDataString`, `extractFromRefs`, `applyResolved` |
| `src/context/types.ts`      | `FromRef`, `AtomRegistry`, `GlobalConfig`, provider prop types                       |
| `src/context/index.ts`      | Module exports                                                                       |

### Files to Modify

| File           | Change                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/index.ts` | Export: `PageContextProvider`, `AppContextProvider`, `usePublish`, `useSubscribe`, `useResolveFrom`, `isFromRef`, all context types |
| `src/types.ts` | Add: `FromRef`, `GlobalConfig`, `AtomRegistry` interface                                                                            |

### Documentation Impact

| Target                 | Change                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/data-binding.md` | **Create** — `id`/`from` pattern guide, page vs global context, wiring examples (table→drawer, filter chain, global cart), Level 2 usage with usePublish/useSubscribe |

### Exit Criteria

- [ ] `usePublish('foo')` registers atom in PageContext, returns stable setter function
- [ ] `useSubscribe({ from: 'foo' })` returns current value, re-renders on change
- [ ] `useSubscribe({ from: 'foo.bar.baz' })` resolves nested dot-path
- [ ] `useSubscribe({ from: 'global.user' })` reads from AppContext
- [ ] `useSubscribe({ from: 'global.user.name' })` reads nested from AppContext
- [ ] `useSubscribe('static-string')` returns `'static-string'` (passthrough)
- [ ] `useSubscribe(42)` returns `42` (passthrough)
- [ ] `useResolveFrom({ a: { from: 'x' }, b: 'static' })` → `{ a: <resolved>, b: 'static' }`
- [ ] Atoms cleaned up on component unmount
- [ ] Page context destroyed on route change (all page atoms gone)
- [ ] App context survives route changes
- [ ] Globals with `data` string fetch from endpoint on mount
- [ ] Globals with `default` value are immediately available
- [ ] `isFromRef({ from: 'x' })` → true; `isFromRef('x')` → false
- [ ] Jotai devtools show atom labels (`snapshot:component-id`)
- [ ] No re-render storms — only subscribers of changed atoms re-render
- [ ] All exports have JSDoc
- [ ] `bun run typecheck && bun run build && bun test` pass

### Tests

| File                                      | What                                                                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/context/__tests__/registry.test.ts`  | AtomRegistry: register, get, unregister, keys, idempotent register, store access                                                                                         |
| `src/context/__tests__/hooks.test.ts`     | usePublish/useSubscribe: publish→subscribe flow, nested paths, global prefix, static passthrough, unmount cleanup, multiple subscribers                                  |
| `src/context/__tests__/providers.test.ts` | Provider isolation: page context scoped to route, app context persists, globals init from config (default + data), nested providers                                      |
| `src/context/__tests__/utils.test.ts`     | getNestedValue: simple, deep, missing, null safety. isFromRef: valid, invalid, edge cases. parseDataString: with/without method. extractFromRefs: nested objects, arrays |

---

## Phase 3: Action Executor

### Goal

Build the runtime that executes the fixed action vocabulary. Components dispatch actions
declaratively; the executor handles routing, API calls, modals, toasts, confirmations,
and data flow. Actions compose into chains — a delete button becomes
`confirm → api(DELETE) → refresh(table) → toast(success)`.

### The API

```ts
import { useActionExecutor } from '@lastshotlabs/snapshot'

// Level 1: Actions defined in manifest config
{
  "actions": [
    { "label": "Delete", "action": [
      { "type": "confirm", "message": "Delete this user?" },
      { "type": "api", "method": "DELETE", "endpoint": "/api/users/{id}" },
      { "type": "refresh", "target": "users-table" },
      { "type": "toast", "message": "User deleted", "variant": "success" }
    ]}
  ]
}

// Level 2: Using action executor in custom React code
function MyComponent() {
  const execute = useActionExecutor()

  async function handleDelete(userId: number) {
    await execute([
      { type: 'confirm', message: 'Delete this user?' },
      { type: 'api', method: 'DELETE', endpoint: `/api/users/${userId}` },
      { type: 'refresh', target: 'users-table' },
      { type: 'toast', message: 'User deleted', variant: 'success' },
    ])
  }

  return <button onClick={() => handleDelete(5)}>Delete</button>
}
```

### Types

```ts
/** All possible action configs. Discriminated union on `type`. */
type ActionConfig =
  | NavigateAction
  | ApiAction
  | OpenModalAction
  | CloseModalAction
  | RefreshAction
  | SetValueAction
  | DownloadAction
  | ConfirmAction
  | ToastAction;

/** Navigate to a route. */
interface NavigateAction {
  type: "navigate";
  /** Route path. Supports `{param}` interpolation from context. */
  to: string;
  /** Replace history entry instead of pushing. */
  replace?: boolean;
}

/** Call an API endpoint. */
interface ApiAction {
  type: "api";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Endpoint path. Supports `{param}` interpolation. */
  endpoint: string;
  /** Request body. Can include `{ from: 'id' }` refs. */
  body?: Record<string, unknown> | FromRef;
  /** Query parameters. */
  params?: Record<string, unknown>;
  /** Actions to execute on success. Response data available as `{result}` in subsequent interpolation. */
  onSuccess?: ActionConfig | ActionConfig[];
  /** Actions to execute on error. Error available as `{error}` in subsequent interpolation. */
  onError?: ActionConfig | ActionConfig[];
}

/** Open a modal or drawer by id. */
interface OpenModalAction {
  type: "open-modal";
  /** The id of the modal/drawer component to open. */
  modal: string;
}

/** Close a modal or drawer. */
interface CloseModalAction {
  type: "close-modal";
  /** Specific modal id. Omit to close the topmost. */
  modal?: string;
}

/** Re-fetch a component's data. */
interface RefreshAction {
  type: "refresh";
  /** Component id to refresh. Can be a comma-separated list for multiple. */
  target: string;
}

/** Set another component's published value. */
interface SetValueAction {
  type: "set-value";
  /** Component id. */
  target: string;
  /** Value to set. Supports `{param}` interpolation. */
  value: unknown;
}

/** Download a file from an endpoint. */
interface DownloadAction {
  type: "download";
  /** Endpoint path. Supports `{param}` interpolation. */
  endpoint: string;
  /** Suggested filename. */
  filename?: string;
}

/** Show a confirmation dialog. Stops the chain if cancelled. */
interface ConfirmAction {
  type: "confirm";
  /** Message to display. Supports `{param}` interpolation. */
  message: string;
  /** Confirm button text. Default: "Confirm". */
  confirmLabel?: string;
  /** Cancel button text. Default: "Cancel". */
  cancelLabel?: string;
  /** Visual variant. */
  variant?: "default" | "destructive";
}

/** Show a toast notification. */
interface ToastAction {
  type: "toast";
  /** Message. Supports `{param}` interpolation (e.g., `"{count} users deleted"`). */
  message: string;
  /** Visual variant. */
  variant?: "success" | "error" | "warning" | "info";
  /** Auto-dismiss duration in ms. Default: 5000. 0 = no auto-dismiss. */
  duration?: number;
  /** Optional action button in the toast. */
  action?: { label: string; action: ActionConfig };
}

/** The execute function returned by useActionExecutor. */
type ActionExecuteFn = (
  action: ActionConfig | ActionConfig[],
  context?: Record<string, unknown>,
) => Promise<void>;
```

### Implementation

**`src/actions/executor.ts`** — `useActionExecutor()` hook

The executor captures dependencies from context and returns an `execute` function:

```ts
function useActionExecutor(): ActionExecuteFn {
  const api = useSnapshotApi();
  const router = useRouter();
  const pageRegistry = useContext(PageRegistryContext);
  const appRegistry = useContext(AppRegistryContext);
  const modalManager = useModalManager();
  const toastManager = useToastManager();
  const confirmManager = useConfirmManager();

  const execute = useCallback(
    async (
      action: ActionConfig | ActionConfig[],
      context: Record<string, unknown> = {},
    ): Promise<void> => {
      const actions = Array.isArray(action) ? action : [action];

      for (const a of actions) {
        switch (a.type) {
          case "navigate": {
            const to = interpolate(a.to, context);
            router.navigate({ to, replace: a.replace });
            break;
          }

          case "api": {
            const endpoint = interpolate(a.endpoint, context);
            const body = a.body ? resolveBody(a.body, context) : undefined;
            const method = a.method.toLowerCase() as keyof ApiClient;
            try {
              const result = await api[method](endpoint, body);
              if (a.onSuccess) {
                await execute(a.onSuccess, { ...context, result });
              }
            } catch (error) {
              if (a.onError) {
                await execute(a.onError, { ...context, error });
              } else {
                throw error;
              }
            }
            break;
          }

          case "open-modal":
            modalManager.open(a.modal);
            break;

          case "close-modal":
            modalManager.close(a.modal);
            break;

          case "refresh": {
            // Support comma-separated targets: "table1,table2"
            const targets = a.target.split(",").map((t) => t.trim());
            for (const target of targets) {
              const registry = resolveRegistry(
                target,
                pageRegistry,
                appRegistry,
              );
              if (registry) {
                const refreshAtom = registry.get(`__refresh_${target}`);
                if (refreshAtom) {
                  registry.store.set(refreshAtom, Date.now());
                }
              }
            }
            break;
          }

          case "set-value": {
            const value =
              typeof a.value === "string"
                ? interpolate(a.value, context)
                : a.value;
            const registry = resolveRegistry(
              a.target,
              pageRegistry,
              appRegistry,
            );
            if (registry) {
              const atom = registry.get(a.target);
              if (atom) registry.store.set(atom, value);
            }
            break;
          }

          case "download": {
            const endpoint = interpolate(a.endpoint, context);
            const blob = await api.get(endpoint, { responseType: "blob" });
            triggerBrowserDownload(blob as Blob, a.filename ?? "download");
            break;
          }

          case "confirm": {
            const message = interpolate(a.message, context);
            const confirmed = await confirmManager.show({
              message,
              confirmLabel: a.confirmLabel,
              cancelLabel: a.cancelLabel,
              variant: a.variant,
            });
            if (!confirmed) return; // Stop the chain
            break;
          }

          case "toast": {
            const message = interpolate(a.message, context);
            toastManager.show({
              message,
              variant: a.variant,
              duration: a.duration,
              action: a.action
                ? {
                    label: a.action.label,
                    onClick: () => execute(a.action!.action, context),
                  }
                : undefined,
            });
            break;
          }
        }
      }
    },
    [
      api,
      router,
      pageRegistry,
      appRegistry,
      modalManager,
      toastManager,
      confirmManager,
    ],
  );

  return execute;
}
```

**`src/actions/interpolate.ts`** — Template string interpolation

```ts
/**
 * Replace {key} placeholders with values from context.
 * Supports nested paths: {user.name}, {result.id}
 * Supports special tokens: {count} (length of selectedRows), {id} (current row id)
 */
function interpolate(
  template: string,
  context: Record<string, unknown>,
): string {
  return template.replace(/\{([^}]+)\}/g, (_, path) => {
    const value = getNestedValue(context, path);
    return value != null ? String(value) : `{${path}}`;
  });
}
```

**`src/actions/modal-manager.ts`** — Modal state management

```ts
const modalStackAtom = atom<string[]>([]);

function useModalManager() {
  const [stack, setStack] = useAtom(modalStackAtom);
  return {
    open: (id: string) =>
      setStack((prev) => [...prev.filter((m) => m !== id), id]),
    close: (id?: string) =>
      setStack((prev) =>
        id ? prev.filter((m) => m !== id) : prev.slice(0, -1),
      ),
    isOpen: (id: string) => stack.includes(id),
    stack,
  };
}
```

**`src/actions/toast.ts`** — Toast notification system

Jotai atom holds toast queue. `<ToastContainer>` component reads the queue and renders toasts
using shadcn `Toast` / `Sonner`. Position and animation controlled by component-level tokens
from the theme config.

```ts
interface ToastItem {
  id: string;
  message: string;
  variant: "success" | "error" | "warning" | "info";
  duration: number;
  action?: { label: string; onClick: () => void };
}

const toastQueueAtom = atom<ToastItem[]>([]);

function useToastManager() {
  const [, setQueue] = useAtom(toastQueueAtom);
  return {
    show: (toast: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setQueue((prev) => [...prev, { ...toast, id }]);

      if (toast.duration !== 0) {
        setTimeout(() => {
          setQueue((prev) => prev.filter((t) => t.id !== id));
        }, toast.duration ?? 5000);
      }
    },
    dismiss: (id: string) =>
      setQueue((prev) => prev.filter((t) => t.id !== id)),
  };
}
```

**`src/actions/confirm.ts`** — Promise-based confirmation dialog

```ts
interface ConfirmRequest {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  resolve: (confirmed: boolean) => void;
}

const confirmAtom = atom<ConfirmRequest | null>(null);

function useConfirmManager() {
  const [, setConfirm] = useAtom(confirmAtom);
  return {
    show: (options: Omit<ConfirmRequest, "resolve">): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirm({ ...options, resolve });
      });
    },
  };
}

// <ConfirmDialog> component reads confirmAtom and renders shadcn AlertDialog
```

### Zod Schemas

```ts
const navigateActionSchema = z
  .object({
    type: z.literal("navigate"),
    to: z.string(),
    replace: z.boolean().optional(),
  })
  .strict();

const apiActionSchema: z.ZodType<ApiAction> = z
  .object({
    type: z.literal("api"),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    endpoint: z.string(),
    body: z.union([z.record(z.unknown()), fromRefSchema]).optional(),
    params: z.record(z.unknown()).optional(),
    onSuccess: z
      .lazy(() => z.union([actionSchema, z.array(actionSchema)]))
      .optional(),
    onError: z
      .lazy(() => z.union([actionSchema, z.array(actionSchema)]))
      .optional(),
  })
  .strict();

const openModalActionSchema = z
  .object({
    type: z.literal("open-modal"),
    modal: z.string(),
  })
  .strict();

const closeModalActionSchema = z
  .object({
    type: z.literal("close-modal"),
    modal: z.string().optional(),
  })
  .strict();

const refreshActionSchema = z
  .object({
    type: z.literal("refresh"),
    target: z.string(),
  })
  .strict();

const setValueActionSchema = z
  .object({
    type: z.literal("set-value"),
    target: z.string(),
    value: z.unknown(),
  })
  .strict();

const downloadActionSchema = z
  .object({
    type: z.literal("download"),
    endpoint: z.string(),
    filename: z.string().optional(),
  })
  .strict();

const confirmActionSchema = z
  .object({
    type: z.literal("confirm"),
    message: z.string(),
    confirmLabel: z.string().optional(),
    cancelLabel: z.string().optional(),
    variant: z.enum(["default", "destructive"]).optional(),
  })
  .strict();

const toastActionSchema = z
  .object({
    type: z.literal("toast"),
    message: z.string(),
    variant: z.enum(["success", "error", "warning", "info"]).optional(),
    duration: z.number().optional(),
    action: z
      .object({
        label: z.string(),
        action: z.lazy(() => actionSchema),
      })
      .optional(),
  })
  .strict();

const actionSchema = z.discriminatedUnion("type", [
  navigateActionSchema,
  apiActionSchema,
  openModalActionSchema,
  closeModalActionSchema,
  refreshActionSchema,
  setValueActionSchema,
  downloadActionSchema,
  confirmActionSchema,
  toastActionSchema,
]);
```

### Files to Create

| File                           | What                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `src/actions/types.ts`         | Action type definitions + Zod schemas                                                |
| `src/actions/executor.ts`      | `useActionExecutor()` hook                                                           |
| `src/actions/modal-manager.ts` | Modal stack state (Jotai atom) + `useModalManager()`                                 |
| `src/actions/toast.ts`         | Toast queue (Jotai atom) + `useToastManager()` + `<ToastContainer>` component        |
| `src/actions/confirm.ts`       | Confirm dialog (Promise-based) + `useConfirmManager()` + `<ConfirmDialog>` component |
| `src/actions/interpolate.ts`   | `interpolate()` template string replacement                                          |
| `src/actions/index.ts`         | Module exports                                                                       |

### Files to Modify

| File           | Change                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `src/index.ts` | Export: `useActionExecutor`, `actionSchema`, all action types, `ToastContainer`, `ConfirmDialog` |
| `src/types.ts` | Add: all action type definitions                                                                 |

### Documentation Impact

| Target            | Change                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/actions.md` | **Create** — action vocabulary reference (all 9 types with examples), chaining, interpolation syntax, `{result}` and `{error}` in onSuccess/onError, Level 2 usage |

### Exit Criteria

- [ ] `execute({ type: 'navigate', to: '/foo/{id}' }, { id: 5 })` navigates to `/foo/5`
- [ ] `execute({ type: 'navigate', to: '/foo', replace: true })` replaces history
- [ ] `execute({ type: 'api', method: 'DELETE', endpoint: '/api/foo/{id}' })` calls API
- [ ] `execute({ type: 'api', ..., onSuccess: [toast, refresh] })` chains on success
- [ ] `execute({ type: 'api', ..., onError: [toast] })` chains on error
- [ ] API action `onSuccess` context includes `{result}` from response
- [ ] `execute([confirm, api, refresh, toast])` runs sequentially, stops chain on cancel
- [ ] `execute({ type: 'open-modal', modal: 'foo' })` opens modal, isOpen('foo') → true
- [ ] `execute({ type: 'close-modal' })` closes topmost modal
- [ ] `execute({ type: 'close-modal', modal: 'foo' })` closes specific modal
- [ ] `execute({ type: 'refresh', target: 'table1,table2' })` refreshes multiple components
- [ ] `execute({ type: 'set-value', target: 'x', value: 5 })` publishes to registry
- [ ] `execute({ type: 'download', endpoint: '/api/export' })` triggers browser download
- [ ] `execute({ type: 'toast', message: 'hi', variant: 'success' })` shows toast
- [ ] Toast auto-dismisses after `duration` ms
- [ ] Toast with `action` shows clickable button
- [ ] `execute({ type: 'confirm', message: 'Sure?', variant: 'destructive' })` shows dialog
- [ ] `interpolate('/api/{resource}/{id}', { resource: 'users', id: 5 })` → `'/api/users/5'`
- [ ] `interpolate('{count} deleted', { count: 3 })` → `'3 deleted'`
- [ ] `actionSchema.safeParse(validAction)` succeeds for all 9 types
- [ ] `actionSchema.safeParse({ type: 'invalid' })` fails with descriptive error
- [ ] All exports have JSDoc
- [ ] `bun run typecheck && bun run build && bun test` pass

### Tests

| File                                          | What                                                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/actions/__tests__/executor.test.ts`      | Each action type, chaining, confirm cancellation, error handling, context propagation through chains |
| `src/actions/__tests__/interpolate.test.ts`   | Simple, nested, missing keys (preserved), multiple in one string, non-string context values          |
| `src/actions/__tests__/modal-manager.test.ts` | Open, close by id, close topmost, duplicate open, isOpen, stack ordering                             |
| `src/actions/__tests__/toast.test.ts`         | Show, auto-dismiss, dismiss manually, action button, queue ordering                                  |
| `src/actions/__tests__/confirm.test.ts`       | Show, confirm resolves true, cancel resolves false, variant styling                                  |
| `src/actions/__tests__/types.test.ts`         | Zod validation: valid configs for all 9 types, invalid configs, recursive onSuccess/onError          |

---

## Phase 4: Manifest Schema & PageRenderer

### Goal

Define the manifest format (`snapshot.manifest.json`) with comprehensive Zod validation and
build the `<PageRenderer>` that renders pages from config at runtime, plus `<ManifestApp>`
that renders an entire application from a single manifest.

### The API

**Level 1: Full app from manifest**

```tsx
import { ManifestApp } from "@lastshotlabs/snapshot";
import manifest from "./snapshot.manifest.json";

// Entire app from config — zero custom React
function App() {
  return <ManifestApp manifest={manifest} apiUrl="https://api.myapp.com" />;
}
```

**Level 2: PageRenderer in custom routing**

```tsx
import { PageRenderer, useManifest } from "@lastshotlabs/snapshot";

function MyRoute() {
  const manifest = useManifest();
  return <PageRenderer page={manifest.pages["/dashboard"]} />;
}
```

**Level 2: Register custom components for manifest use**

```tsx
import { registerComponent } from "@lastshotlabs/snapshot";

// Register a custom component the manifest can reference
registerComponent("revenue-chart", MyCustomRevenueChart);

// Now this works in manifest config:
// { "type": "custom", "component": "revenue-chart", "props": { "currency": "EUR" } }
```

### Types

```ts
/** The complete manifest schema. */
interface ManifestConfig {
  /** JSON schema reference for IDE autocomplete. */
  $schema?: string;
  /** Design tokens. Flavor + overrides. */
  theme?: ThemeConfig;
  /** Global state definitions. Persist across routes. */
  globals?: Record<string, GlobalConfig>;
  /** Navigation structure. */
  nav?: NavItem[];
  /** Auth screen configuration. */
  auth?: AuthScreenConfig;
  /** Page definitions keyed by route path. */
  pages: Record<string, PageConfig>;
}

/** Navigation item. */
interface NavItem {
  /** Display label. */
  label: string;
  /** Route path. */
  path: string;
  /** Lucide icon name. */
  icon?: string;
  /** Required roles (checked against global.user.roles). */
  roles?: string[];
  /** Badge — static count or from ref (e.g., notification count). */
  badge?: number | FromRef;
  /** Nested children (renders as expandable group). */
  children?: NavItem[];
}

/** Auth screen config. */
interface AuthScreenConfig {
  /** Which screens to generate. */
  screens: (
    | "login"
    | "register"
    | "forgot-password"
    | "reset-password"
    | "verify-email"
    | "mfa"
  )[];
  /** OAuth providers to show. */
  providers?: ("google" | "github" | "apple" | "microsoft")[];
  /** Enable passkey/WebAuthn login. */
  passkey?: boolean;
  /** Custom branding for auth pages. */
  branding?: {
    logo?: string;
    title?: string;
    description?: string;
  };
}

/** A page definition. */
interface PageConfig {
  /** Layout shell. Default: inherits from parent or 'sidebar'. */
  layout?: "sidebar" | "top-nav" | "minimal" | "full-width";
  /** Document title (for browser tab). */
  title?: string;
  /** Component tree. */
  content: ComponentConfig[];
  /** Required roles. Redirects to forbidden page if not met. */
  roles?: string[];
  /** Breadcrumb label. */
  breadcrumb?: string;
}

/** Base config shared by all components. */
interface BaseComponentConfig {
  /** Component type discriminator. */
  type: string;
  /** Unique id for `from` ref system. Optional — only needed if other components reference this one. */
  id?: string;
  /** Responsive visibility. Can be static, responsive, or from-ref. */
  visible?: boolean | Responsive<boolean> | FromRef;
  /** Additional CSS class. */
  className?: string;
  /** Grid span when inside a row. */
  span?: Responsive<number>;
}

/** Union of all component configs. Extended by each component phase. */
type ComponentConfig =
  | RowConfig
  | HeadingConfig
  | ButtonConfig
  | CustomComponentConfig;
// ... each phase adds its component config to this union

/** Row — horizontal layout container. */
interface RowConfig extends BaseComponentConfig {
  type: "row";
  gap?: Responsive<"xs" | "sm" | "md" | "lg" | "xl">;
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
  children: ComponentConfig[];
}

/** Heading — simple text heading. */
interface HeadingConfig extends BaseComponentConfig {
  type: "heading";
  text: string | FromRef;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Button — action trigger. */
interface ButtonConfig extends BaseComponentConfig {
  type: "button";
  label: string;
  icon?: string;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "sm" | "md" | "lg" | "icon";
  action: ActionConfig | ActionConfig[];
  /** Disable condition. */
  disabled?: boolean | FromRef;
}

/** Select — dropdown that publishes its value. */
interface SelectConfig extends BaseComponentConfig {
  type: "select";
  /** Static options or endpoint to fetch options from. */
  options: { label: string; value: string }[] | string;
  /** For endpoint options: which field is the value. */
  valueField?: string;
  /** For endpoint options: which field is the label. */
  labelField?: string;
  /** Default selected value. */
  default?: string;
  /** Placeholder text. */
  placeholder?: string;
}

/** Custom component escape hatch. */
interface CustomComponentConfig extends BaseComponentConfig {
  type: "custom";
  /** Registered component name. */
  component: string;
  /** Props to pass to the custom component. */
  props?: Record<string, unknown>;
}
```

### Implementation

**`src/manifest/schema.ts`** — Manifest Zod schema

Uses a dynamic component registry pattern — each component phase registers its schema:

```ts
// Extensible component type validation
const componentSchemaRegistry = new Map<string, z.ZodType>();

function registerComponentSchema(type: string, schema: z.ZodType): void {
  componentSchemaRegistry.set(type, schema);
}

// Component config validation — delegates to registered schemas
const componentConfigSchema = z
  .object({ type: z.string() })
  .passthrough()
  .superRefine((data, ctx) => {
    const schema = componentSchemaRegistry.get(data.type);
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        for (const issue of result.error.issues) ctx.addIssue(issue);
      }
    } else if (data.type !== "custom") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown component type "${data.type}". Available types: ${[...componentSchemaRegistry.keys()].join(", ")}`,
      });
    }
  });

// Register built-in structural components
registerComponentSchema("row", rowConfigSchema);
registerComponentSchema("heading", headingConfigSchema);
registerComponentSchema("button", buttonConfigSchema);
registerComponentSchema("select", selectConfigSchema);
```

**`src/manifest/renderer.tsx`** — `<PageRenderer>` and `<ComponentRenderer>`

```tsx
function PageRenderer({ page }: { page: PageConfig }) {
  const Layout = getLayout(page.layout ?? "sidebar");

  return (
    <PageContextProvider>
      <Layout>
        {page.content.map((config, i) => (
          <ComponentRenderer
            key={config.id ?? `component-${i}`}
            config={config}
          />
        ))}
      </Layout>
    </PageContextProvider>
  );
}

function ComponentRenderer({ config }: { config: ComponentConfig }) {
  // Check visibility
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  // Resolve component from registry
  const Component = getRegisteredComponent(config.type);
  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[snapshot] Unknown component type: "${config.type}"`);
    }
    return null;
  }

  // Wrap with span for responsive grid
  const span = config.span;
  const style = span
    ? { gridColumn: `span ${typeof span === "number" ? span : "auto"}` }
    : undefined;

  return (
    <div data-snapshot-component={config.type} style={style}>
      <Component config={config} />
    </div>
  );
}
```

The `data-snapshot-component` attribute serves two purposes:

1. Component-level token CSS selectors target it
2. Dev tools / debugging can identify component boundaries

**`src/manifest/component-registry.ts`** — Runtime component registration

```ts
type ConfigDrivenComponent = React.ComponentType<{ config: any }>

const runtimeComponentRegistry = new Map<string, ConfigDrivenComponent>()

/** Register a component for manifest rendering. Used by the framework for built-in components and by consumers for custom components. */
function registerComponent(type: string, component: ConfigDrivenComponent): void {
  if (runtimeComponentRegistry.has(type) && process.env.NODE_ENV === 'development') {
    console.warn(`[snapshot] Overriding component "${type}"`)
  }
  runtimeComponentRegistry.set(type, component)
}

function getRegisteredComponent(type: string): ConfigDrivenComponent | undefined {
  if (type === 'custom') return CustomComponentWrapper
  return runtimeComponentRegistry.get(type)
}

// The custom component wrapper resolves the named component from the consumer's registrations
function CustomComponentWrapper({ config }: { config: CustomComponentConfig }) {
  const Component = runtimeComponentRegistry.get(config.component)
  if (!Component) {
    console.warn(`[snapshot] Custom component "${config.component}" not registered`)
    return null
  }
  return <Component config={config} {...config.props} />
}
```

**`src/manifest/app.tsx`** — `<ManifestApp>` — full application from manifest

```tsx
interface ManifestAppProps {
  manifest: ManifestConfig;
  apiUrl: string;
  /** Additional createSnapshot config. */
  snapshotConfig?: Partial<SnapshotConfig>;
}

function ManifestApp({ manifest, apiUrl, snapshotConfig }: ManifestAppProps) {
  // Create snapshot instance
  const snapshot = useMemo(
    () =>
      createSnapshot({
        apiUrl,
        ...snapshotConfig,
      }),
    [apiUrl],
  );

  // Apply theme tokens (inject CSS)
  useEffect(() => {
    if (manifest.theme) {
      const css = resolveTokens(manifest.theme);
      injectStyleSheet("snapshot-tokens", css);
    }
  }, [manifest.theme]);

  return (
    <snapshot.QueryProvider>
      <AppContextProvider globals={manifest.globals} api={snapshot.api}>
        <SnapshotApiContext.Provider value={snapshot.api}>
          <ToastContainer />
          <ConfirmDialog />
          <ManifestRouter manifest={manifest} />
        </SnapshotApiContext.Provider>
      </AppContextProvider>
    </snapshot.QueryProvider>
  );
}

// ManifestRouter creates TanStack Router routes from manifest.pages
function ManifestRouter({ manifest }: { manifest: ManifestConfig }) {
  // Creates route tree from manifest.pages
  // Each route wraps its page in <PageRenderer>
  // Auth-guarded routes use protectedBeforeLoad
  // Includes nav from manifest.nav
  // Includes auth screens from manifest.auth
}
```

### Files to Create

| File                                 | What                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `src/manifest/schema.ts`             | Manifest Zod schema + component schema registry + TypeScript types          |
| `src/manifest/renderer.tsx`          | `<PageRenderer>`, `<ComponentRenderer>`                                     |
| `src/manifest/component-registry.ts` | `registerComponent()`, `getRegisteredComponent()`, custom component wrapper |
| `src/manifest/app.tsx`               | `<ManifestApp>`, `<ManifestRouter>`                                         |
| `src/manifest/structural.tsx`        | Built-in structural components: Row, Heading, Button, Select                |
| `src/manifest/types.ts`              | Manifest config types, component base types                                 |
| `src/manifest/index.ts`              | Module exports                                                              |

### Files to Modify

| File           | Change                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/index.ts` | Export: `ManifestApp`, `PageRenderer`, `ComponentRenderer`, `registerComponent`, `registerComponentSchema`, `manifestSchema`, all manifest types |

### Documentation Impact

| Target                  | Change                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `docs/manifest.md`      | **Create** — manifest format reference with full examples, field descriptions, component type registry                 |
| `docs/page-renderer.md` | **Create** — PageRenderer usage, ManifestApp usage, component registration (framework and custom), Level 2 integration |

### Exit Criteria

- [ ] `manifestSchema.safeParse(fullManifest)` validates the complete example from the Vision section
- [ ] `manifestSchema.safeParse(invalidManifest)` produces descriptive errors naming the invalid field
- [ ] `<ManifestApp manifest={manifest} apiUrl="..." />` renders a full working application
- [ ] `<PageRenderer page={pageConfig} />` renders a component tree with PageContext
- [ ] `<ComponentRenderer config={rowConfig} />` renders row with children
- [ ] `<ComponentRenderer config={unknownConfig} />` warns in dev, returns null
- [ ] `registerComponent('my-widget', MyWidget)` makes it renderable via `{ "type": "custom", "component": "my-widget" }`
- [ ] `registerComponent('stat-card', MyStatCard)` overrides the built-in (with dev warning)
- [ ] `data-snapshot-component` attribute present on all rendered components
- [ ] Visibility via `visible: false`, `visible: { from: 'toggle' }`, responsive `visible` all work
- [ ] `span` grid column spanning works in row layout
- [ ] Structural components work: Row (with gap/justify/align/wrap), Heading, Button, Select
- [ ] Select publishes its value via `usePublish(id)` when `id` is set
- [ ] Button executes its action config on click
- [ ] All exports have JSDoc
- [ ] `bun run typecheck && bun run build && bun test` pass

### Tests

| File                                        | What                                                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/manifest/__tests__/schema.test.ts`     | Manifest validation: full valid manifest, missing pages (required), invalid theme, unknown component types (descriptive error), structural component schemas |
| `src/manifest/__tests__/renderer.test.ts`   | PageRenderer: wraps in PageContext, renders component tree, handles unknown types, visibility control, span layout                                           |
| `src/manifest/__tests__/registry.test.ts`   | Component registration: register/get, custom wrapper, override with warning, unknown custom component                                                        |
| `src/manifest/__tests__/app.test.ts`        | ManifestApp: creates snapshot, applies theme, creates routes, renders nav, global context                                                                    |
| `src/manifest/__tests__/structural.test.ts` | Row (gap/justify/align/wrap/children), Heading (text/level/fromRef), Button (label/icon/variant/action), Select (options/default/publish)                    |

---

## Phases 5-11: Components

Each component follows the identical pattern established in Phases 1-4:

1. **Config type + Zod schema** — defines what the manifest can set
2. **Headless hook** — data fetching, state management, action dispatch (Level 3 API)
3. **Rendering component** — composes shadcn primitives, consumes design tokens (Level 1 default)
4. **Registration** — `registerComponent()` + `registerComponentSchema()` on module load
5. **Tests** — schema validation, hook logic, rendering

The following sections specify each component's **config schema, headless hook API, and key
implementation details**. For files-to-create, documentation, and exit criteria, follow the
same pattern as Phase 6 (StatCard) — each component gets its own directory under
`src/components/{name}/` with `types.ts`, `hook.ts`, `{name}.tsx`, and `index.ts`.

### Phase 5: Layout + Nav

**Layout shells:** Four layout components that wrap page content.

```ts
// Sidebar layout: fixed sidebar (collapsible on mobile via shadcn Sheet) + main content
// Top-nav layout: horizontal nav bar + content below
// Minimal layout: centered content, no persistent nav (for auth pages, onboarding)
// Full-width layout: edge-to-edge, no padding, no nav (for landing pages, custom layouts)
```

All layouts consume these design tokens:

- `--sidebar` / `--sidebar-foreground` (sidebar background)
- `nav.variant` component token (minimal/bordered/filled)
- `nav.activeIndicator` component token (background/border-left/border-bottom/dot)
- Spacing tokens for padding/gaps

**Nav component config:**

```ts
interface NavConfig extends BaseComponentConfig {
  type: "nav";
  items: NavItem[];
  /** Collapse sidebar on mobile. Default: true. */
  collapsible?: boolean;
  /** Show user menu (avatar, name, logout). */
  userMenu?:
    | boolean
    | {
        showAvatar?: boolean;
        showEmail?: boolean;
        /** Additional menu items. */
        items?: { label: string; icon?: string; action: ActionConfig }[];
      };
  /** Logo / brand element. */
  logo?: { src?: string; text?: string; path?: string };
}
```

**Headless hook:**

```ts
interface UseNavResult {
  /** Resolved nav items with active/visible state. */
  items: ResolvedNavItem[];
  /** Currently active item (matching current route). */
  activeItem: ResolvedNavItem | null;
  /** Whether sidebar is collapsed (mobile). */
  isCollapsed: boolean;
  /** Toggle sidebar collapse. */
  toggle: () => void;
  /** Current user info (from global.user). */
  user: AuthUser | null;
}

interface ResolvedNavItem extends NavItem {
  isActive: boolean;
  isVisible: boolean;
  resolvedBadge: number | null;
}
```

**Key details:**

- Nav reads `global.user` from AppContext for role-based visibility and user menu
- Active route detection uses TanStack Router's `useMatch` / `useLocation`
- Badge values can be `FromRef` (e.g., `{ "from": "global.notifications.unread" }`)
- Icons rendered via `lucide-react` dynamic import by name
- Mobile breakpoint: sidebar collapses at `md` breakpoint, opens via hamburger → Sheet

**Files to create:** `src/components/layout/sidebar.tsx`, `top-nav.tsx`, `minimal.tsx`,
`full-width.tsx`, `index.ts`. `src/components/nav/nav.tsx`, `hook.ts`, `types.ts`, `index.ts`.

---

### Phase 6: StatCard

**Config:**

```ts
interface StatCardConfig extends BaseComponentConfig {
  type: "stat-card";
  /** API endpoint to fetch data. Supports FromRef for dependent data. */
  data: string | FromRef;
  /** Query parameters. Support FromRef for filtered stats. */
  params?: Record<string, unknown | FromRef>;
  /** Response field to display. Default: auto-detect first numeric field. */
  field?: string;
  /** Display label. Default: humanized field name. */
  label?: string | FromRef;
  /** Number format. */
  format?: "number" | "currency" | "percent" | "compact" | "decimal";
  /** Currency code (for format: 'currency'). Default: 'USD'. */
  currency?: string;
  /** Decimal places. Default: auto. */
  decimals?: number;
  /** Prefix text (e.g., "$"). */
  prefix?: string;
  /** Suffix text (e.g., "%"). */
  suffix?: string;
  /** Lucide icon name. */
  icon?: string;
  /** Icon color (semantic token name). */
  iconColor?: string;
  /** Trend indicator — shows change vs. comparison period. */
  trend?: {
    /** Response field containing comparison value. */
    field: string;
    /** 'up-is-good': green for increase. 'up-is-bad': red for increase. */
    sentiment?: "up-is-good" | "up-is-bad";
    /** Format for the trend value. */
    format?: "percent" | "absolute";
  };
  /** Click action. */
  action?: ActionConfig;
  /** Grid span inside a row. */
  span?: Responsive<number>;
  /** Loading skeleton variant. */
  loading?: "skeleton" | "pulse" | "spinner";
}
```

**Headless hook:**

```ts
interface UseStatCardResult {
  /** Formatted display value (e.g., "$12,345", "89%"). */
  value: string | null;
  /** Raw numeric value. */
  rawValue: number | null;
  /** Display label. */
  label: string;
  /** Loading state. */
  isLoading: boolean;
  /** Error state. */
  error: Error | null;
  /** Trend info. */
  trend: {
    direction: "up" | "down" | "flat";
    value: string;
    percentage: number;
    sentiment: "positive" | "negative" | "neutral";
  } | null;
  /** Refetch data. */
  refetch: () => void;
  /** The full response data (for custom rendering). */
  data: Record<string, unknown> | null;
}
```

**Implementation:**

- Uses `useSubscribe` to resolve `data` and `params` FromRefs before fetching
- Uses TanStack Query (`useQuery`) with the API client for data fetching
- Auto-detects first numeric field if `field` not specified (inspect response keys)
- Number formatting via `Intl.NumberFormat` (handles locale, currency, compact notation)
- Publishes `{ value: rawValue, label, trend }` via `usePublish(id)` when `id` is set
- Responds to `refresh` action by watching a refresh counter atom
- Renders with shadcn `Card` + design tokens for card shadow, padding, border

**Files:** `src/components/stat-card/{stat-card.tsx, hook.ts, types.ts, format.ts, index.ts}`

---

### Phase 7: DataTable

**Config:** (as specified in first draft — DataTableConfig with columns, pagination, filters,
actions, selectable, bulkActions, searchable)

**Additional details for this pass:**

- **Auto-columns at runtime:** When `columns: 'auto'` and running via PageRenderer (no OpenAPI
  metadata available), inspect the first response object's keys to derive columns. Type
  inference: `typeof value === 'number'` → number format, ISO date string pattern → date format,
  boolean → boolean format, etc.
- **Published state shape:**
  ```ts
  {
    selected: T | null,                    // last clicked row
    selectedRows: T[],                     // all selected rows
    selectedIds: (string | number)[],      // ids of selected rows
    filters: Record<string, unknown>,      // current filter values
    sort: { field: string; direction: 'asc' | 'desc' } | null,
    page: number,
    search: string,
  }
  ```
- **Responsive:** On mobile (`sm` breakpoint), table switches to card-based layout. Each row
  becomes a card with field labels. This is automatic — no config needed.
- **Component tokens consumed:** `table.striped`, `table.density`, `table.headerBackground`,
  `table.hoverRow`, `table.borderStyle`
- **Refresh:** Listens for `refresh` action by watching `__refresh_{id}` atom

**Headless hook:** (as specified in first draft — UseDataTableResult with columns, rows,
totalRows, sort, pagination, filters, search, selection)

**Files:** `src/components/data-table/{data-table.tsx, hook.ts, types.ts, columns.ts, filters.tsx, pagination.tsx, index.ts}`

---

### Phase 8: AutoForm

**Config:** (as specified in first draft — AutoFormConfig with data, submit, method, fields,
onSuccess, onError, submitLabel, layout, gridColumns)

**Additional details for this pass:**

- **Auto-field derivation at runtime:** When `fields: 'auto'` and running via PageRenderer,
  the hook needs the OpenAPI request body schema. The sync-generated types include schema
  metadata as a static export. If not available, the form renders text inputs for all fields
  and the consumer must specify field types manually.
- **Cross-field validation:** Support `validation.custom` as a field-level Zod schema string
  that gets parsed at runtime. Example: `"validation": { "custom": "z.string().email()" }`
- **Conditional fields:** `visible: { field: 'role', equals: 'admin' }` shows a field only
  when another field has a specific value. Real-time reactivity within the form.
- **Component tokens consumed:** `input.size`, `input.variant`, `button.weight`
- **Published state:** When `id` is set, publishes `{ values, isDirty, isValid, errors }`
- **Integration with action executor:** Submit button executes:
  `api(method, endpoint, values) → onSuccess actions`. The `{result}` from the API response
  is available in onSuccess interpolation.

**Headless hook:** (as specified in first draft — UseAutoFormResult with fields, values,
setValue, errors, isDirty, isValid, isSubmitting, submit, reset)

**Files:** `src/components/auto-form/{auto-form.tsx, hook.ts, types.ts, fields.ts, field-renderers.tsx, validation.ts, index.ts}`

---

### Phase 9: DetailCard

**Config:** (as specified in first draft — DetailCardConfig with data, fields, title, actions)

**Additional details for this pass:**

- **FromRef data:** The most common usage is `{ "data": { "from": "users-table.selected" } }`.
  When the source is a FromRef, the hook uses `useSubscribe` instead of fetching. When it's
  an endpoint string, it fetches via TanStack Query.
- **Mixed sources:** Support `{ "data": "GET /api/users/{id}", "params": { "id": { "from": "users-table.selected.id" } } }` — endpoint with dynamic params from another component.
- **Field formatting:** Same format types as DataTable columns (text, number, date, datetime,
  currency, boolean, badge, link, email). Plus `image` (renders as avatar/thumbnail) and
  `list` (renders as comma-separated or bulleted).
- **Component tokens consumed:** `card.shadow`, `card.padding`, `card.border`
- **Empty state:** When data is null/undefined (e.g., no row selected), renders "Select an
  item to view details" or custom `emptyState` message.

**Files:** `src/components/detail-card/{detail-card.tsx, hook.ts, types.ts, index.ts}`

---

### Phase 10: Modal + Drawer/Sheet

**Config:** (as specified in first draft — ModalConfig and DrawerConfig with title, content,
size/side)

**Additional details for this pass:**

- **Trigger from ref:** Drawer supports `trigger: FromRef` — auto-opens when the ref becomes
  truthy (e.g., `"trigger": { "from": "users-table.selected" }`). Auto-closes when null.
- **Modal/Drawer content is recursive:** Content array rendered via `<ComponentRenderer>`,
  meaning modals can contain tables, forms, tabs, even other modals.
- **Component tokens consumed:** `modal.overlay` (light/dark/blur), `modal.animation`
  (fade/scale/slide-up/none)
- **Accessibility:** Focus trap inside modal. Escape key closes. Scroll lock on body.
  All handled by shadcn Dialog/Sheet (Radix under the hood).
- **State integration:** Open/close controlled by the action executor's modal manager.
  `id` on the component matches the `modal` field in `open-modal`/`close-modal` actions.

**Files:** `src/components/modal/{modal.tsx, types.ts, index.ts}`,
`src/components/drawer/{drawer.tsx, types.ts, index.ts}`

---

### Phase 11: Tabs

**Config:** (as specified in first draft — TabsConfig with defaultTab, children, variant)

**Additional details for this pass:**

- **Tab content is recursive:** Each tab's `content` array rendered via `<ComponentRenderer>`.
- **Lazy rendering:** Tab content only mounts when the tab is first activated. Once mounted,
  stays mounted (preserves state when switching tabs).
- **Dynamic badges:** Tab badges can be FromRefs: `"badge": { "from": "global.notifications.unread" }`.
- **URL sync:** Optional `"urlSync": true` — active tab stored in URL query param, enabling
  direct links to specific tabs.
- **Published state:** When `id` is set, publishes `{ activeTab: number, activeLabel: string }`.
- **Component tokens:** Uses shadcn Tabs primitives. Variant styling (underline/pills/enclosed)
  via CSS class variants, not component tokens.

**Files:** `src/components/tabs/{tabs.tsx, hook.ts, types.ts, index.ts}`

---

## Phase 12: Integration & Sync

### Goal

Wire everything together: update `snapshot sync` to read the manifest and generate theme CSS

- page routes, update `createSnapshot` to support manifest-driven apps, add manifest
  validation CLI command, and verify the full end-to-end flow.

### Implementation

**Update `src/cli/sync.ts`:**

1. Look for `snapshot.manifest.json` (or `.ts` with default export) in the consumer's project root
2. If found, validate against `manifestSchema` — report errors clearly
3. If `manifest.theme` exists: call `resolveTokens(manifest.theme)`, write to
   `src/styles/snapshot-tokens.css` (always overwritten — theme CSS is generated, not consumer-edited)
4. If `manifest.pages` exists: generate TanStack Router route files for each page. Each route
   file imports `PageRenderer` and passes the page config. Generated route files are overwritten
   on every sync (they're thin wrappers, not consumer-edited).
5. If `manifest.auth` exists: generate auth screen route files from the auth screen config
6. If `manifest.nav` exists: generate nav component from nav config

**Update `src/create-snapshot.tsx`:**

1. Accept optional `manifest?: ManifestConfig` in `SnapshotConfig`
2. If manifest provided, export a pre-configured `ManifestApp` component
3. No breaking changes — existing hooks-only usage unaffected

**Update `src/cli/templates/globals-css.ts`:**

1. If manifest theme exists, use `resolveTokens()` instead of hardcoded palettes
2. Fall back to hardcoded palettes if no manifest (backward compat for `snapshot init`)

**New CLI command: `snapshot manifest validate`:**

```
$ snapshot manifest validate
✓ Manifest valid (4 pages, 6 nav items, midnight flavor)

$ snapshot manifest validate
✗ Manifest invalid:
  pages["/users"].content[2]: Unknown component type "datatable" — did you mean "table"?
  theme.overrides.radius: Expected 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full', received 'medium'
```

**New CLI command: `snapshot manifest init`:**
Generates a starter `snapshot.manifest.json` with theme, nav, a dashboard page, and a
settings page. Interactive prompts for flavor selection and feature toggles.

### Files to Create

| File                            | What                                                             |
| ------------------------------- | ---------------------------------------------------------------- |
| `src/cli/commands/manifest.ts`  | `snapshot manifest validate` + `snapshot manifest init` commands |
| `src/cli/templates/manifest.ts` | Manifest template generator (for `manifest init`)                |

### Files to Modify

| File                               | Change                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| `src/cli/sync.ts`                  | Read manifest, generate theme CSS + page routes + auth screens |
| `src/create-snapshot.tsx`          | Accept manifest in config, pre-configure ManifestApp           |
| `src/types.ts`                     | Add `manifest` to `SnapshotConfig`                             |
| `src/cli/templates/globals-css.ts` | Use `resolveTokens()` when manifest theme available            |
| `src/index.ts`                     | Verify all new exports are present                             |

### Documentation Impact

| Target                    | Change                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `docs/getting-started.md` | **Create** — quickstart: install → `manifest init` → edit manifest → `sync` → running app                               |
| `docs/components.md`      | **Create** — component reference: all 8 foundation components with config examples, headless hook APIs, Level 2/3 usage |
| `docs/tokens.md`          | Verify accuracy (created Phase 1)                                                                                       |
| `docs/manifest.md`        | Verify accuracy (created Phase 4)                                                                                       |
| `docs/data-binding.md`    | Verify accuracy (created Phase 2)                                                                                       |
| `docs/actions.md`         | Verify accuracy (created Phase 3)                                                                                       |
| `docs/customization.md`   | **Create** — guide to Level 1/2/3 usage, component overrides, custom components, when to use each level                 |

### Exit Criteria

- [ ] `snapshot sync` reads `snapshot.manifest.json` and validates it
- [ ] `snapshot sync` generates `src/styles/snapshot-tokens.css` from manifest theme
- [ ] `snapshot sync` generates route files from manifest pages
- [ ] `snapshot sync` generates auth screens from manifest auth config
- [ ] `snapshot manifest validate` reports validation errors with helpful suggestions
- [ ] `snapshot manifest init` generates a valid starter manifest with interactive prompts
- [ ] `createSnapshot({ ..., manifest })` works without breaking existing API
- [ ] Full flow: write manifest → sync → app renders with theme, nav, pages, data binding
- [ ] Backward compat: existing apps without manifest still work identically
- [ ] Level 1: Pure config app renders correctly
- [ ] Level 2: Framework components usable in custom React pages
- [ ] Level 3: Headless hooks usable with custom rendering
- [ ] Level 3b: `registerComponent` overrides built-in rendering
- [ ] All new exports have JSDoc
- [ ] All `docs/` pages created and accurate
- [ ] `bun run typecheck && bun run format:check && bun run build && bun test` pass

### Tests

| File                                          | What                                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/cli/__tests__/sync-manifest.test.ts`     | Sync reads manifest, generates CSS, generates routes, handles missing manifest gracefully                |
| `src/cli/__tests__/manifest-validate.test.ts` | Validate: valid manifest passes, invalid manifest reports errors with suggestions                        |
| `src/cli/__tests__/manifest-init.test.ts`     | Init: generates valid manifest for each flavor                                                           |
| `src/__tests__/integration.test.ts`           | Full flow: manifest → createSnapshot → ManifestApp renders pages with data binding, actions, theme       |
| `src/__tests__/levels.test.ts`                | Level 1 (pure config), Level 2 (mixed), Level 3 (headless hooks), Level 3b (component override) all work |

---

## Parallelization & Sequencing

### Track Overview

```
Track A: Infrastructure          Track B: Components             Track C: CLI
─────────────────────           ─────────────────────           ─────────────────
Phase 1: Token System           (waits for Phase 4)             (waits for all)
Phase 2: Page Context    ←parallel→                                    │
Phase 3: Action Executor                                               │
Phase 4: Manifest + Renderer                                           │
         │                      Phase 5: Layout + Nav                  │
         │                      Phase 6: StatCard                      │
         │                      Phase 7: DataTable                     │
         │                      Phase 8: AutoForm                      │
         │                      Phase 9: DetailCard                    │
         │                      Phase 10: Modal + Drawer               │
         │                      Phase 11: Tabs                         │
         │                               │                             │
         └───────────────────────────────┴──── Phase 12: Integration ──┘
```

### Why Tracks Are Independent

**Track A** owns: `src/tokens/`, `src/context/`, `src/actions/`, `src/manifest/`
**Track B** owns: `src/components/`
**Track C** modifies: `src/cli/sync.ts`, `src/create-snapshot.tsx`, `src/cli/commands/manifest.ts`

Shared files (`src/index.ts`, `src/types.ts`) are additive — each track adds exports, never
modifies existing ones.

### Phase Dependencies

| Phase                  | Hard Dependencies                                                                 | Can Parallel With             |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| 1. Token System        | None                                                                              | Phase 2                       |
| 2. Page Context        | None                                                                              | Phase 1                       |
| 3. Action Executor     | Phase 2 (uses registries for refresh/set-value)                                   | —                             |
| 4. Manifest + Renderer | Phase 1 (resolveTokens), Phase 2 (PageContextProvider), Phase 3 (action executor) | —                             |
| 5. Layout + Nav        | Phase 4 (component registry, layout resolver)                                     | Phases 6-11 (after 5 is done) |
| 6. StatCard            | Phase 4 (registry), Phase 2 (usePublish/useSubscribe)                             | Phases 7-11                   |
| 7. DataTable           | Phase 4, Phase 2, Phase 3 (row actions)                                           | Phases 8-11                   |
| 8. AutoForm            | Phase 4, Phase 2, Phase 3 (submit action)                                         | Phases 9-11                   |
| 9. DetailCard          | Phase 4, Phase 2 (from refs)                                                      | Phases 10-11                  |
| 10. Modal + Drawer     | Phase 3 (modal manager), Phase 4 (recursive renderer)                             | Phase 11                      |
| 11. Tabs               | Phase 4 (recursive renderer)                                                      | —                             |
| 12. Integration        | All of the above                                                                  | —                             |

**Phases 6-11 are mostly independent of each other** — they don't import each other's code.
However, building them sequentially allows each phase to validate the infrastructure
incrementally (StatCard proves data binding, DataTable proves from-refs, AutoForm proves
actions, etc.).

### Branch Strategy

- **Track A:** branch `feat/config-ui-infrastructure` — Phases 1-4 committed sequentially
- **Track B:** branch `feat/config-ui-components` — branched from Track A after Phase 4,
  Phases 5-11 committed sequentially
- **Track C:** branch `feat/config-ui-integration` — branched from Track B after Phase 11

Push branches, don't merge. Review before merge. Merge order: A → B → C into `main`.

### Agent Execution Checklist

1. Read `CLAUDE.md` — understand all engineering rules
2. Read `docs/vision.md` — understand the full vision, three levels, 55 components
3. Read this spec — understand what to build and why
4. Pick your track
5. For each phase:
   a. Read the phase section carefully
   b. Create the files listed (exact paths under `src/`)
   c. Modify the files listed (additive exports in `src/index.ts` and `src/types.ts`)
   d. Write tests (cover schema validation, hook logic, rendering, edge cases)
   e. Run `bun run typecheck && bun run format:check && bun run build && bun test`
   f. Verify JSDoc on every new export
   g. Create/update `docs/` pages as specified in Documentation Impact
   h. Commit with descriptive message: `feat(tokens): add flavor system and resolveTokens`
6. Push branch when all track phases pass
7. Do not merge — wait for review

### Risk Mitigation

| Risk                                                                    | Mitigation                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jotai store sharing between providers                                   | Each registry creates its own store via `createStore()`. App-level store wraps in `<JotaiProvider>`. Page-level registries use their own store scoped to the route.                                                              |
| Component registry conflicts                                            | Last registration wins. Dev-mode warning on override. This is intentional — Level 3b overrides should be explicit.                                                                                                               |
| Circular dependency: ComponentRenderer → components → ComponentRenderer | Components import ComponentRenderer for recursive content (modal, tabs, drawer). This is a runtime reference chain, not a compile-time circular dep. Break cycle via the component registry (lookup by name, not direct import). |
| shadcn/Radix bundled into package                                       | Mark `@radix-ui/*` as dependencies. Tailwind classes work because both package and consumer use the same CSS variable names. Test that bundled components render correctly in a consumer project.                                |
| Bundle size                                                             | Foundation is 8 components. Tree-shaking via tsup entry points. Unused components don't ship. Monitor bundle size per phase.                                                                                                     |
| Token editor SSR                                                        | Guard `document` access: `if (typeof document !== 'undefined')`. `useTokenEditor` returns no-op functions on server.                                                                                                             |
| Color conversion accuracy                                               | Test against known hex→oklch conversion table (20+ values). Use the CSS Color Level 4 algorithm, not approximations.                                                                                                             |
| Flavor aesthetic quality                                                | Each built-in flavor must be reviewed visually — automated tests verify structure, human review verifies beauty. Ship a Storybook or visual test page.                                                                           |

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # zero errors
bun run format:check     # zero issues (run `bun run format` to fix)
bun run build            # successful build
bun test                 # all tests pass
```

### Per-Track Checks

- [ ] No `any` types in new files
- [ ] No unnecessary `as` casts
- [ ] Every exported function/hook/type/class has JSDoc with `@param` and `@returns`
- [ ] Every `docs/` page referenced in Documentation Impact sections is created and accurate
- [ ] Component Zod schemas reject invalid configs with descriptive error messages
- [ ] All component tokens are documented in `docs/tokens.md`

### Full Completion Checks (after all tracks merged)

- [ ] **Level 1:** A consumer writes `snapshot.manifest.json` → runs `snapshot sync` → gets a
      running app with theme, nav, pages, data binding, actions — zero React code
- [ ] **Level 2:** A consumer imports `DataTable`, `StatCard`, etc. directly in their own
      React components
- [ ] **Level 3:** A consumer uses `useDataTable()`, `useAutoForm()` etc. headless hooks with
      fully custom rendering
- [ ] **Level 3b:** `registerComponent('table', MyTable)` overrides the built-in table globally
- [ ] **Flavors:** All 8 built-in flavors render distinct, visually coherent themes
- [ ] **Customization:** Flavor → overrides → component tokens → runtime `setToken()` all layer
      correctly
- [ ] **From refs:** Page-level and global refs resolve, nested paths work, cleanup on unmount
- [ ] **Actions:** All 9 action types execute correctly, chains work, confirm cancels chain
- [ ] **Backward compat:** Existing apps without manifest work identically to before
- [ ] `bun run typecheck && bun run format:check && bun run build && bun test` all pass
