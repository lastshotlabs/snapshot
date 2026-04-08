# Getting Started

This guide covers the config-driven UI system in `@lastshotlabs/snapshot/ui`. You describe
your application as a JSON manifest; Snapshot renders it as a fully interactive React app
with routing, data fetching, theming, and inter-component communication.

## Installation

```bash
npm install @lastshotlabs/snapshot
# peer deps
npm install react react-dom @tanstack/react-query jotai zod
```

## Manifest Structure

A snapshot manifest is a JSON file (`snapshot.manifest.json`) with four top-level sections:

```json
{
  "$schema": "https://lastshotlabs.dev/schemas/manifest.json",
  "theme": { ... },
  "globals": { ... },
  "nav": [ ... ],
  "pages": { ... }
}
```

| Section   | Purpose                                                                 |
| --------- | ----------------------------------------------------------------------- |
| `theme`   | Design tokens: flavor, colors, radius, spacing, fonts, component tokens |
| `globals` | App-wide reactive state (persists across routes)                        |
| `nav`     | Sidebar / top-nav items with icons, badges, and role-based visibility   |
| `pages`   | Route-keyed page definitions containing component trees                 |

## Create a Manifest

Use the CLI or write one by hand:

```bash
npx snapshot manifest init
```

### Complete Example

```json
{
  "theme": {
    "flavor": "midnight",
    "overrides": {
      "radius": "lg",
      "spacing": "comfortable",
      "font": { "sans": "Inter" }
    }
  },
  "globals": {
    "cart": { "data": "GET /api/cart", "default": { "items": [] } }
  },
  "nav": [
    { "label": "Dashboard", "path": "/", "icon": "LayoutDashboard" },
    { "label": "Users", "path": "/users", "icon": "Users" },
    {
      "label": "Settings",
      "path": "/settings",
      "icon": "Settings",
      "roles": ["admin"]
    },
    {
      "label": "Cart",
      "path": "/cart",
      "icon": "ShoppingCart",
      "badge": { "from": "global.cart.items.length" }
    }
  ],
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
              "field": "total",
              "label": "Revenue",
              "format": "currency",
              "icon": "DollarSign",
              "trend": { "field": "previousTotal", "sentiment": "up-is-good" },
              "span": 4
            },
            {
              "type": "stat-card",
              "data": "GET /api/stats/users",
              "field": "count",
              "label": "Active Users",
              "format": "number",
              "icon": "Users",
              "span": 4
            },
            {
              "type": "stat-card",
              "data": "GET /api/stats/orders",
              "field": "count",
              "label": "Orders",
              "format": "number",
              "icon": "Package",
              "span": 4
            }
          ]
        },
        {
          "type": "data-table",
          "id": "recent-orders",
          "data": "GET /api/orders",
          "columns": [
            { "field": "id", "label": "#", "width": "80px" },
            { "field": "customer", "sortable": true },
            { "field": "total", "format": "currency", "sortable": true },
            {
              "field": "status",
              "format": "badge",
              "badgeColors": {
                "completed": "success",
                "pending": "warning",
                "cancelled": "destructive"
              }
            }
          ],
          "pagination": { "type": "offset", "pageSize": 10 },
          "searchable": true,
          "actions": [
            {
              "label": "View",
              "icon": "Eye",
              "action": { "type": "navigate", "to": "/orders/{id}" }
            }
          ]
        }
      ]
    },
    "/users": {
      "layout": "sidebar",
      "title": "Users",
      "content": [
        {
          "type": "row",
          "justify": "end",
          "children": [
            {
              "type": "button",
              "label": "Add User",
              "icon": "Plus",
              "action": { "type": "open-modal", "modal": "create-user" }
            }
          ]
        },
        {
          "type": "data-table",
          "id": "users-table",
          "data": "GET /api/users",
          "columns": [
            { "field": "name", "sortable": true },
            { "field": "email" },
            {
              "field": "role",
              "format": "badge",
              "filter": { "type": "select", "options": "auto" }
            },
            { "field": "createdAt", "format": "date", "sortable": true }
          ],
          "selectable": true,
          "searchable": { "placeholder": "Search users..." },
          "actions": [
            {
              "label": "Edit",
              "icon": "Pencil",
              "action": { "type": "open-modal", "modal": "edit-user" }
            },
            {
              "label": "Delete",
              "icon": "Trash2",
              "action": [
                {
                  "type": "confirm",
                  "message": "Delete {name}?",
                  "variant": "destructive"
                },
                {
                  "type": "api",
                  "method": "DELETE",
                  "endpoint": "/api/users/{id}"
                },
                { "type": "refresh", "target": "users-table" },
                {
                  "type": "toast",
                  "message": "User deleted",
                  "variant": "success"
                }
              ]
            }
          ],
          "bulkActions": [
            {
              "label": "Delete {count} users",
              "action": [
                { "type": "confirm", "message": "Delete {count} users?" },
                {
                  "type": "api",
                  "method": "POST",
                  "endpoint": "/api/users/bulk-delete"
                },
                { "type": "refresh", "target": "users-table" }
              ]
            }
          ]
        },
        {
          "type": "drawer",
          "id": "user-detail",
          "trigger": { "from": "users-table.selected" },
          "title": { "from": "users-table.selected.name" },
          "size": "md",
          "side": "right",
          "content": [
            {
              "type": "detail-card",
              "data": { "from": "users-table.selected" },
              "fields": [
                { "field": "name", "label": "Full Name" },
                { "field": "email", "format": "email", "copyable": true },
                { "field": "role", "format": "badge" },
                { "field": "createdAt", "format": "date" }
              ]
            }
          ]
        },
        {
          "type": "modal",
          "id": "create-user",
          "title": "Create User",
          "size": "md",
          "content": [
            {
              "type": "form",
              "submit": "/api/users",
              "method": "POST",
              "fields": [
                {
                  "name": "name",
                  "type": "text",
                  "label": "Full Name",
                  "required": true
                },
                { "name": "email", "type": "email", "required": true },
                {
                  "name": "role",
                  "type": "select",
                  "options": [
                    { "label": "User", "value": "user" },
                    { "label": "Admin", "value": "admin" }
                  ]
                }
              ],
              "submitLabel": "Create",
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
    }
  }
}
```

## Running the App

### Option A: ManifestApp (zero custom code)

```tsx
import { ManifestApp } from "@lastshotlabs/snapshot/ui";
import manifest from "./snapshot.manifest.json";

function App() {
  return <ManifestApp manifest={manifest} apiUrl="https://api.example.com" />;
}
```

`ManifestApp` handles everything: creates the SDK instance, generates theme CSS, sets up
providers, renders nav and pages, registers all built-in components.

### Option B: Compose from parts

```tsx
import {
  resolveTokens,
  injectStyleSheet,
  PageRenderer,
  AppContextProvider,
  PageContextProvider,
  ToastContainer,
  ConfirmDialog,
} from "@lastshotlabs/snapshot/ui";
import { createSnapshot } from "@lastshotlabs/snapshot";

const snapshot = createSnapshot({ baseUrl: "https://api.example.com" });
const css = resolveTokens(manifest.theme);
injectStyleSheet(css);

function UsersPage() {
  return (
    <PageContextProvider>
      <PageRenderer config={manifest.pages["/users"]} />
    </PageContextProvider>
  );
}
```

### Option C: CLI sync (generates routes and theme)

```bash
npx snapshot sync --server https://api.example.com
```

This reads the backend OpenAPI spec and generates:

- Typed API client + hooks
- Theme CSS from `snapshot.manifest.json`
- Route definitions from manifest pages

## Consumption Levels

The config-driven UI supports three levels of usage, from pure config to full custom code.

### Level 1: Pure Config

Everything lives in the manifest JSON. No React code needed. Use `ManifestApp` to render.

```json
{
  "type": "data-table",
  "data": "GET /api/users",
  "columns": "auto",
  "searchable": true
}
```

### Level 2: Mix Config + Custom React

Use config-driven components alongside your own React code. Import `useActionExecutor`,
`useSubscribe`, and other hooks to interact with the config system from custom components.

```tsx
import { useActionExecutor, useSubscribe } from "@lastshotlabs/snapshot/ui";

function CustomHeader() {
  const userName = useSubscribe({ from: "global.user.name" });
  const execute = useActionExecutor();

  return (
    <header>
      <h1>Welcome, {userName}</h1>
      <button onClick={() => execute({ type: "navigate", to: "/settings" })}>
        Settings
      </button>
    </header>
  );
}
```

Register custom components so they can be referenced in manifests:

```tsx
import { registerComponent } from "@lastshotlabs/snapshot/ui";

registerComponent("custom-header", CustomHeader);
```

Then in the manifest:

```json
{ "type": "custom", "component": "custom-header" }
```

### Level 3: Headless Hooks

Use the component logic without the framework's rendering. Headless hooks return data,
state, and handlers with no JSX.

```tsx
import { useDataTable, useAutoForm } from "@lastshotlabs/snapshot/ui";

function MyTable() {
  const { rows, sort, setSort, page, setPage, isLoading } = useDataTable({
    type: "data-table",
    data: "GET /api/users",
    columns: "auto",
    pagination: { type: "offset", pageSize: 20 },
  });

  // Render with your own UI library
  return <MyCustomTable data={rows} loading={isLoading} />;
}
```

### Level 3b: Component Overrides

Override the rendering of any built-in component type while keeping its config contract:

```tsx
import { registerComponent } from "@lastshotlabs/snapshot/ui";

// Replace the built-in stat-card with your own implementation
registerComponent("stat-card", function MyStatCard({ config }) {
  // `config` has the same shape as the built-in stat-card schema
  return (
    <div className="my-stat">
      {config.label}: {config.field}
    </div>
  );
});
```

The manifest stays the same. Only the rendering changes.

## Key Concepts

### Data Binding

Components communicate through the `id` / `from` ref system. A component with an `id`
publishes its state; other components subscribe with `{ "from": "that-id" }`. See
[data-binding.md](./data-binding.md).

### Actions

User interactions are expressed as a fixed action vocabulary: `navigate`, `api`,
`open-modal`, `close-modal`, `refresh`, `set-value`, `download`, `confirm`, `toast`.
Actions compose into sequential chains. See [actions.md](./actions.md).

### Tokens and Flavors

The theme system uses named flavors (presets) with per-token overrides. Eight built-in
flavors; define your own with `defineFlavor()`. See [tokens.md](./tokens.md) and
[customization.md](./customization.md).

### Responsive Values

Many config fields accept responsive breakpoint maps:

```json
{ "default": 4, "md": 6, "lg": 12 }
```

Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`. Flat values apply at all sizes.
