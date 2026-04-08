# Snapshot Vision & Architecture

> This document captures the full vision for Snapshot's evolution from a React SDK + CLI into
> a config-driven full-stack frontend platform. It is the canonical reference for architectural
> decisions made during the generation chat and spec discussions.

## What Snapshot Is Today

Snapshot is a React frontend SDK + CLI for bunshot-powered backends.

### SDK (`@lastshotlabs/snapshot`)

- `createSnapshot(config)` factory returns all hooks as closures — no singletons
- Auth hooks: login, logout, register, MFA (TOTP, email OTP, WebAuthn), OAuth, account management
- Community hooks: containers, threads, replies, reactions, reports, bans, search, notifications
- Webhook hooks: endpoint CRUD, deliveries, test
- WebSocket: `useSocket`, `useRoom`, `useRoomEvent` — Jotai atom for manager, lazy init
- SSE: `useSSE`, `useSseEvent`, `onSseEvent` — per-endpoint registry (one EventSource per endpoint, multiple subscribers)
- Push: `usePushNotifications`
- Routing: `protectedBeforeLoad`, `guestBeforeLoad` (TanStack Router)
- Theme: `useTheme` — light/dark toggle via Jotai atom + `document.documentElement.classList`
- Auth contract pattern: `AuthContract` / `communityContract` — configurable endpoint/header maps

### CLI (`snapshot`)

- `snapshot init` — scaffolds a new app: layout (minimal/top-nav/sidebar), theme (default/dark/minimal/vibrant), optional MFA/passkey/WS/community/SSE/mail pages. Generates shadcn `components.json`, `globals.css` with oklch CSS variable palettes, route files, page components.
- `snapshot sync` — reads OpenAPI spec from bunshot backend (or local JSON file), generates typed TanStack Query hooks + TypeScript types + optional Zod validators. Vite plugin (`snapshotSync()`) auto-runs sync on schema file changes.

### Current Stack

- React 19, TanStack Router, TanStack Query, Jotai, Vite
- shadcn/ui for UI primitives (Button, Input, Card, Table, etc.)
- Tailwind v4 with oklch CSS variables
- tsup for build, vitest for tests, oclif for CLI

---

## The Full Vision

Snapshot becomes the frontend half of a config-driven full-stack platform. A backend manifest
(bunshot) and a frontend manifest (snapshot) together describe a complete application. The user
describes what they want; the platform generates a running full-stack app.

### The Full-Stack Manifest

```
App Manifest (full stack)
├── backend: { ... }          ← bunshot manifest (exists today)
└── frontend: { ... }         ← snapshot manifest (the new layer)
    ├── theme                  design tokens
    ├── globals                app-level state definitions
    ├── pages                  page definitions with component trees
    ├── nav                    navigation structure
    └── auth                   which auth screens/providers to include
```

The backend and frontend manifests connect through the OpenAPI spec: the backend manifest
defines entities and routes → bunshot generates the API with OpenAPI docs → `snapshot sync`
reads the OpenAPI spec and the frontend manifest → generates pages, hooks, data bindings.

---

## Three Levels of Usage

The framework does everything by default from config alone. But consumers can reach in at any
level they want.

### Level 1: Pure Config — zero React code

The default path. A consumer builds their entire app with a manifest file:

```json
{
  "theme": {
    "colors": { "primary": "#2563eb", "danger": "#dc2626" },
    "radius": "md",
    "font": { "sans": "Inter" },
    "mode": "system"
  },
  "globals": {
    "cart": { "data": "GET /api/cart" }
  },
  "nav": [
    { "label": "Products", "path": "/", "icon": "store" },
    { "label": "Orders", "path": "/orders", "icon": "package" },
    { "label": "Settings", "path": "/settings", "icon": "gear" }
  ],
  "auth": {
    "screens": ["login", "register", "forgot-password"],
    "providers": ["google", "github"]
  },
  "pages": {
    "/": {
      "layout": "sidebar",
      "content": [
        {
          "type": "row",
          "gap": "md",
          "children": [
            {
              "type": "stat-card",
              "data": "GET /api/stats/revenue",
              "span": 4
            },
            { "type": "stat-card", "data": "GET /api/stats/orders", "span": 4 },
            {
              "type": "stat-card",
              "data": "GET /api/stats/customers",
              "span": 4
            }
          ]
        },
        {
          "type": "table",
          "id": "orders-table",
          "data": "GET /api/orders",
          "columns": "auto",
          "actions": [
            {
              "label": "View",
              "action": { "type": "open-modal", "modal": "order-detail" }
            }
          ]
        },
        {
          "type": "modal",
          "id": "order-detail",
          "content": [
            {
              "type": "detail-card",
              "data": { "from": "orders-table.selected" }
            },
            {
              "type": "feed",
              "data": "GET /api/orders/:id/activity",
              "params": { "id": { "from": "orders-table.selected.id" } }
            }
          ]
        }
      ]
    }
  }
}
```

### Level 2: Mix config + own React code

Use framework components directly in custom pages:

```tsx
import { DataTable, StatCard, useDataTable } from "@lastshotlabs/snapshot";

export function MyCustomDashboard() {
  const table = useDataTable({ data: "GET /api/users", columns: "auto" });

  return (
    <div>
      <h1>My custom header with custom logic</h1>
      <StatCard data="GET /api/stats/users" />
      <DataTable {...table} />
      <MyCustomWidget />
    </div>
  );
}
```

### Level 3: Override a component's rendering

Keep the behavior, replace the look:

```tsx
import { useDataTable, DataTableProps } from "@lastshotlabs/snapshot";

export function MyDataTable(props: DataTableProps) {
  const table = useDataTable(props);

  // Same data fetching, pagination, sorting, filtering — custom rendering
  return (
    <div className="my-custom-table">
      {table.rows.map((row) => (
        <MyCustomRow key={row.id} {...row} />
      ))}
    </div>
  );
}

// Register it so manifest config can reference it
registerComponent("table", MyDataTable);
```

The consumer chooses how much control they want, per-component. One page can be pure config,
another can be fully custom React using framework hooks.

---

## Design Token System

### Architecture Decision: Build-time + Runtime (A+B)

**Build-time (A):** `snapshot sync` reads the manifest theme config, runs `resolveTokens()`,
generates `snapshot-tokens.css` with all CSS custom properties. This is the baseline — what
ships to production, zero runtime cost.

**Runtime (B):** The package exports `useTokenEditor()` that can override any CSS custom
property on the fly via `document.documentElement.style.setProperty()`. No re-render, no
CSS-in-JS. Inline styles on `:root` beat CSS file declarations in specificity, so runtime
overrides layer on top of the generated CSS with no conflict.

```ts
const { setToken, resetTokens, getTokens } = useTokenEditor();

setToken("colors.primary", "#e11d48"); // instantly updates everything using --color-primary
setToken("radius", "lg"); // instantly updates --radius
resetTokens(); // reverts to the CSS file defaults
getTokens(); // returns current overrides as a manifest-shaped object
```

This enables a **theme editor UI**: user tweaks tokens → sees live changes → `getTokens()`
returns the delta as a manifest-compatible object → persist to backend/localStorage → next
`snapshot sync` makes the overrides the new baseline.

No runtime cost in production — if nobody calls `setToken()`, the CSS file does all the work.

### What lives in the package vs CLI

| Layer                 | Where      | What                                         |
| --------------------- | ---------- | -------------------------------------------- |
| Token Zod schema      | Package    | Validates configs, defines what tokens exist |
| `resolveTokens()`     | Package    | Config → CSS custom properties string        |
| `useTokenEditor()`    | Package    | Runtime overrides, opt-in                    |
| `snapshot-tokens.css` | CLI output | Generated baseline CSS                       |

### Token Categories

- **Color** — semantic names (primary, secondary, muted, destructive, accent). Each generates
  foreground variant automatically. Maps to oklch CSS variables extending shadcn's system.
- **Spacing scale** — consistent spacing tokens (xs, sm, md, lg, xl) used by layout components.
- **Radius scale** — none, sm, md, lg, full. Applied globally via `--radius` variable.
- **Font scale** — font family + size scale. Named font stacks (inter, system, mono).
- **Component-level tokens** — card padding, table row height, input height, etc.
- **Dark/light mode** — a token switch, not a separate theme. Single token config,
  two generated CSS blocks (`.light` and `.dark` classes on root element).
- **Breakpoint-aware values** — any layout/spacing/sizing token accepts either a flat value
  or a breakpoint map: `{ "default": 1, "md": 2, "lg": 3 }`.

The token system **extends** shadcn's existing CSS variable system rather than replacing it.
shadcn already uses `--primary`, `--background`, `--radius`, etc. The token system generates
values for these variables from the manifest config. shadcn primitives (Button, Input, Card)
automatically pick up the manifest theme with zero changes.

---

## Config-Driven Component Library

### Architecture Decision: Framework ships complete components

The `@lastshotlabs/snapshot` package ships all components — behavior AND rendering. The
consumer doesn't get generated component files to edit by default. They configure components
through the manifest.

Components are higher-level abstractions built on top of shadcn primitives. Not replacing
shadcn. Not hiding shadcn. `DataTable` internally composes shadcn `Table`, `TableHeader`,
`TableRow`, `TableCell`. Token system extends shadcn's CSS variable system. Consumer can drop
down to shadcn when config can't express what they need.

### Headless hooks for flexibility

Each component's logic is also exported as a standalone headless hook for Level 2/3 usage:

- `useDataTable(config)` — data fetching, pagination, sort, filter, column inference
- `useAutoForm(config)` — field inference, validation, submit, error state
- `useStatCard(config)` — data fetching, formatting
- `useDetailView(config)` — data fetching, field display
- etc. for every component

These hooks are what consumers use when they want to write their own rendering (Level 3) or
mix framework components with custom React (Level 2). The framework's own built-in components
use these same hooks internally.

### Component Model

Each config-driven component:

1. Has a Zod config schema describing what the manifest can set
2. Fetches its own data from its bound API endpoint using the generated API client
3. Manages its own loading, error, and empty states internally
4. Publishes its current value by `id` to a page-level context
5. Subscribes to values from other components via `{ "from": "component-id" }`
6. Executes actions from the fixed action vocabulary

### Config-Driven Pages: Both Generated + Runtime

**Dev-time:** `snapshot sync` generates actual TanStack Router route files from the manifest.
Each page becomes a real `.tsx` file. Full type-checking at build time. Consumer can modify
generated pages.

**Runtime:** The package also exports `<PageRenderer>` that interprets manifest config at
runtime. This enables:

- A live page builder / visual editor in dev mode
- Pages that can change without a rebuild
- Preview of manifest changes before syncing

Both paths render the same components from the same config schemas. Generated files are a
static snapshot of what `PageRenderer` would produce.

---

## Component Catalog (55 components)

### Foundation (build first — everything else depends on these)

| #   | Component        | Description                                                                                                                                                                                                                                |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Layout + Nav** | Page shells (sidebar, top-nav, minimal) + navigation from manifest                                                                                                                                                                         |
| 2   | **StatCard**     | Single metric display bound to an endpoint                                                                                                                                                                                                 |
| 3   | **DataTable**    | Auto-columns from OpenAPI, sort, filter, pagination, row actions, bulk actions, inline edit                                                                                                                                                |
| 4   | **AutoForm**     | Auto-fields from OpenAPI request body schema, validation, submit. Field types: text, number, password, email, select, multi-select, toggle, checkbox, radio, date, daterange, rating, color, location, tag, variant, file, audio-recording |
| 5   | **DetailCard**   | Key-value display of a single record                                                                                                                                                                                                       |
| 6   | **Modal**        | Config-driven overlay, triggered by action vocabulary                                                                                                                                                                                      |
| 7   | **Drawer/Sheet** | Slide-out panel, anchored to edge                                                                                                                                                                                                          |
| 8   | **Tabs**         | Tabbed content areas, each tab contains other components                                                                                                                                                                                   |

### Core (covers most app patterns)

| #   | Component              | Description                                                          |
| --- | ---------------------- | -------------------------------------------------------------------- |
| 9   | **List**               | Card-based list with configurable card templates                     |
| 10  | **Feed**               | Chronological activity/notification stream                           |
| 11  | **Chart**              | Line/bar/pie/area chart bound to an endpoint                         |
| 12  | **Wizard**             | Multi-step form with sequencing                                      |
| 13  | **FileUpload**         | Drag-and-drop upload with progress and preview                       |
| 14  | **RichTextEditor**     | Block-based content editor (form field level)                        |
| 15  | **NotificationCenter** | In-app notification list, mark-read, real-time                       |
| 16  | **CommandPalette**     | Cmd+K search, actions from action vocabulary                         |
| 17  | **FacetedFilter**      | Filter panel (checkboxes, ranges, toggles) bound to other components |
| 18  | **DateRangeFilter**    | Global date range picker, drives charts/tables via `from` refs       |

### Domain — Communication

| #   | Component         | Description                                                            |
| --- | ----------------- | ---------------------------------------------------------------------- |
| 19  | **ChatView**      | Message list + input + WebSocket binding + typing indicators + threads |
| 20  | **CommentThread** | Inline comments anchored to content (supports deep nesting)            |
| 21  | **ProfileCard**   | User avatar, name, status, actions                                     |
| 22  | **EmojiPicker**   | Emoji selection, wraps `emoji-mart` or similar                         |
| 23  | **VideoCall**     | Voice/video calls, wraps LiveKit/Daily.co (peer dep)                   |

### Domain — Content

| #   | Component          | Description                                               |
| --- | ------------------ | --------------------------------------------------------- |
| 24  | **MediaGallery**   | Grid/carousel of images/video, lightbox                   |
| 25  | **DocumentViewer** | Inline preview of PDF/image/office docs                   |
| 26  | **DocumentEditor** | Full-page block editor, wraps Tiptap/BlockNote (peer dep) |
| 27  | **VersionHistory** | Timeline of versions, diff view, restore                  |
| 28  | **Stories**        | Full-screen auto-advance carousel with progress bars      |
| 29  | **AudioRecorder**  | Record + waveform display + send action                   |

### Domain — Organization

| #   | Component       | Description                                          |
| --- | --------------- | ---------------------------------------------------- |
| 30  | **Calendar**    | Month/week/day views bound to an endpoint            |
| 31  | **KanbanBoard** | Draggable columns bound to a status field            |
| 32  | **TreeView**    | Hierarchical data with expand/collapse, drag reorder |
| 33  | **Map**         | Markers from endpoint, location picker mode          |
| 34  | **GanttChart**  | Timeline chart with task bars and dependencies       |

### Domain — Workflow

| #   | Component           | Description                                             |
| --- | ------------------- | ------------------------------------------------------- |
| 35  | **WorkflowBuilder** | Visual DAG editor, wraps ReactFlow (peer dep)           |
| 36  | **ApprovalFlow**    | Linear approval chain with approve/reject actions       |
| 37  | **StatusPipeline**  | Horizontal stages showing where an item is in a process |

### Domain — Commerce

| #   | Component           | Description                                    |
| --- | ------------------- | ---------------------------------------------- |
| 38  | **Cart**            | Line items, quantities, subtotals, promo codes |
| 39  | **ComparisonTable** | Side-by-side feature/spec comparison           |

### Domain — Admin

| #   | Component           | Description                                                   |
| --- | ------------------- | ------------------------------------------------------------- |
| 40  | **ActivityMonitor** | Real-time event stream via SSE/WebSocket with rate indicators |
| 41  | **HealthStatus**    | System component status grid with uptime sparklines           |

### Domain — Account

| #   | Component             | Description                                    |
| --- | --------------------- | ---------------------------------------------- |
| 42  | **AvatarUpload**      | Circular image crop + upload                   |
| 43  | **SessionManager**    | Active sessions with device info, revoke       |
| 44  | **ConnectedAccounts** | OAuth provider list with connect/disconnect    |
| 45  | **DangerZone**        | Destructive actions with confirmation barriers |

### Domain — Documentation

| #   | Component           | Description                                                    |
| --- | ------------------- | -------------------------------------------------------------- |
| 46  | **DocRenderer**     | Renders markdown/MDX with syntax highlighting and callouts     |
| 47  | **TableOfContents** | Auto-generated from headings, scroll-spy                       |
| 48  | **CodeBlock**       | Syntax highlighting, copy, language tabs                       |
| 49  | **ApiReference**    | Auto-generated from OpenAPI — endpoint docs, try-it playground |
| 50  | **VersionSwitcher** | Global doc version selector                                    |
| 51  | **Changelog**       | Chronological release entries with version filtering           |

### Domain — Education

| #   | Component            | Description                                        |
| --- | -------------------- | -------------------------------------------------- |
| 52  | **Leaderboard**      | Ranked list with score, avatar, change indicators  |
| 53  | **FlashCard**        | Interactive card with flip/reveal, deck navigation |
| 54  | **QuizFlow**         | Multi-question assessment with scoring and results |
| 55  | **AudioVideoPlayer** | Media playback with playlist mode                  |

### Composability

The 55 components are the vocabulary. New "components" are compositions — a config that wires
existing ones together with `from` refs and actions. No new code needed. For example, a CRM
pipeline view is just KanbanBoard + Drawer + DetailCard + CommentThread + Feed wired together
in manifest config. New components only get added when there's a genuinely new interaction
pattern that can't be expressed as a composition.

---

## Page Presets

Page presets are manifest shorthands that expand to common component compositions:

| Preset                  | Expands to                                                           |
| ----------------------- | -------------------------------------------------------------------- |
| **CrudPage**            | DataTable + Modal(AutoForm) + DetailCard                             |
| **DashboardPage**       | DateRangeFilter + StatCards + Charts + DataTable                     |
| **SettingsPage**        | Tabs + AutoForms                                                     |
| **DocumentPage**        | DocumentEditor + CommentThread + VersionHistory                      |
| **InboxPage**           | List + DetailCard/Drawer                                             |
| **ProductPage**         | MediaGallery + DetailCard + Feed(reviews) + Cart action              |
| **AdminPage**           | ActivityMonitor + HealthStatus + DataTable(audit) + List(moderation) |
| **StorefrontPage**      | FacetedFilter + List + Cart                                          |
| **DocsPage**            | TreeView(sidebar) + DocRenderer + TableOfContents                    |
| **AccountSettingsPage** | Tabs(AutoForms + SessionManager + ConnectedAccounts + DangerZone)    |
| **UserProfilePage**     | ProfileCard + StatCards + Tabs(Feed + List)                          |

---

## Inter-Component Data Binding

### The `id` / `from` Pattern

A component that drives others declares an `id`. Components that consume its value use
`{ "from": "id" }` in their config:

```json
{
  "content": [
    {
      "type": "select",
      "id": "status-filter",
      "options": ["all", "active", "inactive"],
      "default": "all"
    },
    {
      "type": "table",
      "data": "GET /api/users",
      "filters": {
        "status": { "from": "status-filter" }
      }
    },
    {
      "type": "stat-card",
      "data": "GET /api/users/count",
      "params": {
        "status": { "from": "status-filter" }
      }
    }
  ]
}
```

### Architecture Decision: Jotai atom map with two-layer context

**Page-level `<PageContext>`** — component-to-component refs within a page. Created/destroyed
with the route. Each component with an `id` gets a Jotai atom registered in a `Map<string, atom>`.
Components subscribing via `{ "from": "id" }` look up and subscribe to that atom.

**App-level `<AppContext>`** — global state that persists across route changes. Same Jotai atom
map pattern, mounted at the root layout.

**Convention:** `from` refs starting with `global.` resolve from `AppContext`. Everything else
resolves from the current `PageContext`.

```ts
function resolveFrom(ref: string, pageCtx: AtomRegistry, appCtx: AtomRegistry) {
  if (ref.startsWith("global.")) {
    return appCtx.get(ref.slice(7));
  }
  return pageCtx.get(ref);
}
```

**Default globals:**

- `global.user` — current authenticated user
- `global.cart` — cart state (e-commerce apps)
- `global.theme` — current theme tokens
- `global.notifications` — unread count, latest items
- `global.permissions` — current user's roles/permissions

**Custom globals from manifest:**

```json
{
  "globals": {
    "activeProject": { "data": "GET /api/projects/current" },
    "orgSettings": { "data": "GET /api/org/settings" }
  }
}
```

**Why Jotai:**

- Already a peer dep (WebSocket manager atom, theme atom)
- Proven reactivity — no re-render storms, selective subscriptions
- Named atoms in a registry = debuggable (inspect all component state by id)
- Automatic cleanup on unmount
- Page scoping prevents cross-page state leaks

---

## Action Vocabulary

User interactions are expressed as named actions with defined config schemas, not arbitrary
JavaScript.

| Action        | Description                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `navigate`    | Go to a page. `{ "action": "navigate", "to": "/users/{id}" }`                                         |
| `api`         | Call an API endpoint. `{ "action": "api", "method": "DELETE", "endpoint": "/api/users/{id}" }`        |
| `open-modal`  | Open a modal by id. `{ "action": "open-modal", "modal": "order-detail" }`                             |
| `close-modal` | Close the current modal.                                                                              |
| `refresh`     | Re-fetch a component's data by target id. `{ "action": "refresh", "target": "users-table" }`          |
| `set-value`   | Set another component's value. `{ "action": "set-value", "target": "status-filter", "value": "all" }` |
| `download`    | Trigger file download from endpoint.                                                                  |
| `confirm`     | Show confirmation dialog before proceeding.                                                           |
| `toast`       | Show a notification. `{ "action": "toast", "message": "User deleted", "variant": "success" }`         |

Actions compose: a delete button can `confirm` → `api` (DELETE) → `refresh` (table) → `toast`
(success message). Each step is declarative.

---

## Interaction Presets

Hover, press, focus, and enter states are named tokens, not raw CSS:

```json
{
  "interactions": {
    "hover": "lift",
    "focus": "ring",
    "press": "scale-down",
    "enter": "fade-in"
  }
}
```

### Preset Catalog

| Category     | Presets                                                    |
| ------------ | ---------------------------------------------------------- |
| Hover        | `lift`, `glow`, `darken`, `lighten`, `outline`, `scale-up` |
| Press/Active | `scale-down`, `darken`                                     |
| Focus        | `ring`, `outline`, `glow`                                  |
| Enter/Exit   | `fade-in`, `slide-up`, `slide-in`, `scale-in`, `none`      |
| Loading      | `skeleton`, `pulse`, `spinner`                             |

### Duration Tokens

`instant` (0ms), `fast` (150ms), `normal` (250ms), `slow` (400ms).

---

## Responsiveness

Layout adaptation is config-driven via breakpoint-aware tokens:

```json
{
  "columns": { "default": 1, "md": 2, "lg": 3 },
  "gap": { "default": "sm", "md": "md" },
  "display": { "default": "hidden", "md": "visible" }
}
```

Every layout/spacing/sizing property accepts a flat value or a breakpoint map. Under the hood,
generates Tailwind responsive classes or CSS media queries.

---

## Code Escape Hatch

For UI that config can't express (custom visualizations, third-party SDKs, complex interactions).

### How It Works

Custom components are registered by name and referenced from the manifest:

```json
{ "type": "custom", "component": "OrderTimeline" }
```

The `OrderTimeline` component is a React component the consumer wrote. It receives the same
typed API hooks and can participate in the `from` ref system. It lives alongside generated code.

### Rules

- Custom components are registered by name in a registry file
- Custom code is never overwritten by sync
- The escape hatch exists; it should not be the default path
- Level 3 (override a component's rendering) is also an escape hatch

### Future: Monaco Editor in Platform

For the hosted Bunshot Cloud platform, users can write custom components in a Monaco Editor
embedded in the browser dashboard with full IntelliSense from generated type definitions.

---

## What Ships Where

### In `@lastshotlabs/snapshot` package (npm):

| What                                     | Why                                                 |
| ---------------------------------------- | --------------------------------------------------- |
| All 55 components (behavior + rendering) | Framework ships complete — consumer just configures |
| Headless hooks for every component       | Level 2/3 flexibility — consumers who want control  |
| Token Zod schemas + `resolveTokens()`    | Validation + CSS generation logic                   |
| `useTokenEditor()`                       | Runtime token overrides                             |
| `PageContext` + `AppContext` providers   | Atom registry + `from` ref resolution               |
| `<PageRenderer>`                         | Runtime page rendering from config                  |
| Action executor                          | Fixed vocabulary runtime                            |
| Config Zod schemas for all components    | Validation at sync time + runtime                   |
| `from` ref resolution system             | Core wiring logic                                   |
| Component registration API               | For escape hatch / Level 3 overrides                |

### Generated into consumer project by `snapshot sync`:

| What                              | Overwrite behavior                               |
| --------------------------------- | ------------------------------------------------ |
| Typed API client + hooks          | Always — must match current OpenAPI spec         |
| Type definitions                  | Always — must match current OpenAPI spec         |
| Theme CSS (`snapshot-tokens.css`) | Always — must match current manifest tokens      |
| Page route files                  | Only on first run or with `--refresh-pages` flag |
| Auth flow screens                 | Only on first run or with `--refresh-auth` flag  |

### In the consumer's project (consumer-owned):

| What                                | Notes                                           |
| ----------------------------------- | ----------------------------------------------- |
| `snapshot.manifest.json` (or `.ts`) | The app config — theme, pages, nav, globals     |
| Custom escape hatch components      | Registered by name, never overwritten           |
| Level 2/3 custom pages/components   | Consumer's own React code using framework hooks |

---

## Manifest Ownership: Split (Option C)

**Bunshot owns data** — which endpoints exist and their shapes (OpenAPI spec). Bunshot should
not care about UI layout.

**Snapshot owns presentation** — how to display data (pages, layout, theme, components). The
manifest file (`snapshot.manifest.json`) lives in the consumer's project. They own it, edit it,
commit it.

**`snapshot sync` merges both** — reads OpenAPI from backend + manifest from consumer project →
generates typed client + page components + theme CSS.

Bunshot Cloud could provide a visual editor that writes to this manifest file (future), but the
file is always the source of truth.

---

## bunshot sync Evolution

### Current Behavior

1. Reads OpenAPI spec from bunshot backend (URL or local file)
2. Generates `src/api/generated/types.ts` — TypeScript types from schemas
3. Generates `src/api/generated/hooks.ts` — TanStack Query hooks per endpoint
4. Optionally generates Zod validators for mutation request bodies

### Target Behavior

All current behavior, plus: 5. Reads frontend manifest (`snapshot.manifest.json`) 6. Generates page route files from manifest + OpenAPI response shapes 7. Auto-derives form fields from POST/PUT request body schemas 8. Auto-derives table columns from GET response schemas 9. Auto-derives detail view fields from GET-by-id response schemas 10. Generates nav component from manifest nav config 11. Generates auth flow screens from manifest auth config 12. Generates theme CSS from manifest token config

---

## Build Priority

### Phase 1: Foundation (the first 8 components + infrastructure)

1. Token system — manifest theme config → CSS variables extending shadcn
2. `from` ref system — `PageContext` + `AppContext` + Jotai atom registry
3. Action executor — the action vocabulary runtime
4. `PageRenderer` — runtime page rendering from config
5. Layout + Nav
6. StatCard — simplest data-bound component, proves the pattern
7. DataTable — workhorse, validates auto-columns + `from` refs
8. AutoForm — validates auto-fields + action vocabulary (submit = `api`)
9. DetailCard — validates cross-component wiring via `from`
10. Modal + Drawer/Sheet
11. Tabs

### Phase 2: Core (components 9-18)

List, Feed, Chart, Wizard, FileUpload, RichTextEditor, NotificationCenter, CommandPalette,
FacetedFilter, DateRangeFilter

### Phase 3: Domain components (19-55)

Communication, Content, Organization, Workflow, Commerce, Admin, Account, Documentation,
Education — each domain ships independently.

### Phase 4: Page presets

CrudPage, DashboardPage, SettingsPage, etc. — manifest shorthands built from existing
components.

---

## Planned Feature Areas (from Generation Chat)

### Selective Hook Syncing

Manifest of available hooks. Consumer picks which to sync. Tree-shaking for API clients —
don't generate hooks for endpoints you don't use.

### Multiple Hook/Client Sets

Generate multiple API clients for multi-app or multi-tenant setups. Each "app" in Snapshot
gets its own generated client pointing at a specific bunshot instance or tenant.

### Offline Docs

Bundle the OpenAPI spec + any custom docs as a static asset. Snapshot can read from
`/openapi.json` or a local file (already partially supported via Vite plugin's `file` option).

### Apps Within Apps

If bunshot supports multi-tenancy with nested routing, Snapshot mirrors that. A Snapshot
"workspace" maps to a bunshot tenant. Nested app structure supported.

### SSR Framework

Full server-side rendering story for Snapshot. TBD on approach (TanStack Start, custom, etc.).

---

## Relationship to Bunshot Platform Vision

Snapshot is the frontend layer of the Bunshot Cloud platform:

```
User describes app (chat UI / form / MCP)
        ↓
Backend manifest generated + audited → bunshot deploys API
Frontend manifest generated          → snapshot generates UI
        ↓
Both deployed behind same domain
  api.myapp.com  → bunshot backend
  myapp.com      → snapshot frontend
```

The backend generation layer (config gen, audit suite, MCP server) is built and working in
bunshot. The frontend generation layer (this document) is the other half. When both connect
through the manifest + OpenAPI spec, the full-stack config-driven platform is complete.

Framework (MIT open source) generates the code. Platform (proprietary) deploys and manages it.
The user owns their code. The platform provides operational leverage.

---

## App Coverage Validation

This component set has been validated against real-world apps:

| App                     | Coverage | Notes                                                                              |
| ----------------------- | -------- | ---------------------------------------------------------------------------------- |
| **Slack/Discord/Teams** | ✅       | ChatView + TreeView(channels) + VideoCall + EmojiPicker + NotificationCenter       |
| **Gmail**               | ✅       | List + Drawer + RichTextEditor + TreeView(labels) + FacetedFilter + Calendar       |
| **Reddit**              | ✅       | Feed + CommentThread(deep nesting) + FacetedFilter + ProfileCard                   |
| **WhatsApp**            | ✅       | ChatView + AudioRecorder + VideoCall + Stories + Map                               |
| **Nike.com**            | ✅       | FacetedFilter + List + MediaGallery + Cart + DetailCard                            |
| **Jira**                | ✅       | KanbanBoard + DataTable + TreeView + GanttChart + WorkflowBuilder + StatusPipeline |
| **Notion/Google Docs**  | ✅       | DocumentEditor + CommentThread + VersionHistory + TreeView                         |
| **Shopify admin**       | ✅       | DashboardPage + CrudPage + Chart + ActivityMonitor                                 |
| **Duolingo**            | ✅       | FlashCard + QuizFlow + Leaderboard + AudioVideoPlayer                              |
| **Gitbook/Docusaurus**  | ✅       | DocRenderer + TableOfContents + CodeBlock + ApiReference + VersionSwitcher         |
