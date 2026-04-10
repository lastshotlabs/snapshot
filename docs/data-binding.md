# Data Binding: `id` / `from` Pattern

The context system lets config-driven components communicate without direct imports.
Components publish values by `id`; other components subscribe via `{ "from": "id" }` refs.

## Two Contexts

| Context         | Scope     | Lifetime                | Prefix    |
| --------------- | --------- | ----------------------- | --------- |
| **PageContext** | Per-route | Destroyed on navigation | none      |
| **AppContext**  | Global    | Persists across routes  | `global.` |

## How It Works

### Publishing (Page Context)

A component with an `id` registers a Jotai atom in the page context and publishes its
current value (selected row, form data, active tab, etc.):

```tsx
import { usePublish } from "@lastshotlabs/snapshot/ui";

function UsersTable() {
  const publish = usePublish("users-table");

  const handleRowSelect = (row) => {
    publish({ selected: row });
  };

  return <table onClick={handleRowSelect}>...</table>;
}
```

When the component unmounts, the atom is cleaned up automatically.

### Subscribing

Other components subscribe to published values using `{ from: "id" }`:

```tsx
import { useSubscribe } from "@lastshotlabs/snapshot/ui";

function UserDetail() {
  // Full value
  const data = useSubscribe({ from: "users-table.selected" });

  // Nested field via dot-path
  const name = useSubscribe({ from: "users-table.selected.name" });

  // Static values pass through unchanged
  const label = useSubscribe("Hello"); // -> 'Hello'
  const count = useSubscribe(42); // -> 42

  return <div>{name}</div>;
}
```

If the source component hasn't mounted yet, `useSubscribe` returns `undefined`.

### Resolving Multiple Refs

Use `useResolveFrom` to resolve all `FromRef` values in a config object at once:

```tsx
import { useResolveFrom } from "@lastshotlabs/snapshot/ui";

function StatsCard() {
  const resolved = useResolveFrom({
    userId: { from: "users-table.selected.id" },
    period: { from: "date-range" },
    label: "Revenue",
  });
  // -> { userId: 5, period: '30d', label: 'Revenue' }
}
```

## Global State

Global state persists across route changes. Define globals in the manifest and access
them with the `global.` prefix:

```json
{
  "globals": {
    "user": {},
    "cart": { "data": "GET /api/cart", "default": { "items": [] } }
  }
}
```

```tsx
// In any component, on any page
const cart = useSubscribe({ from: "global.cart" });
const itemCount = useSubscribe({ from: "global.cart.items.length" });
```

- `default` values are available immediately on mount.
- `data` endpoints are fetched asynchronously; the default is used until the response arrives.

## Wiring Examples

### Table drives detail drawer

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
        { "type": "detail-card", "data": { "from": "users-table.selected" } }
      ]
    }
  ]
}
```

### Filter chain

```json
{
  "content": [
    { "type": "select", "id": "date-range", "options": ["7d", "30d", "90d"] },
    {
      "type": "stat-card",
      "data": "GET /api/stats/revenue",
      "params": { "period": { "from": "date-range" } }
    },
    {
      "type": "table",
      "data": "GET /api/orders",
      "filters": { "period": { "from": "date-range" } }
    }
  ]
}
```

Changing the dropdown refetches all bound components automatically.

### Global cart badge

```json
{
  "globals": {
    "cart": { "data": "GET /api/cart" }
  },
  "nav": [
    {
      "label": "Cart",
      "path": "/cart",
      "badge": { "from": "global.cart.items.length" }
    }
  ]
}
```

## Type Guard

Use `isFromRef` to check whether a value is a `FromRef`:

```ts
import { isFromRef } from "@lastshotlabs/snapshot/ui";

isFromRef({ from: "users-table.selected" }); // true
isFromRef("static-string"); // false
isFromRef(42); // false
```

## Realtime Event Binding

Manifest realtime events can dispatch workflows without custom wiring code.

```json
{
  "realtime": {
    "ws": {
      "events": {
        "chat.message.created": "append-to-feed"
      }
    },
    "sse": {
      "endpoints": {
        "/__sse/feed": {
          "events": {
            "feed.updated": "refresh-feed"
          }
        }
      }
    }
  }
}
```

- `realtime.ws.events` maps WebSocket event name to workflow name.
- `realtime.sse.endpoints[path].events` maps SSE event name to workflow name.
- Each event dispatches the mapped workflow through the same manifest workflow runtime used by actions and route lifecycle hooks.

## Providers

Wrap your app with `AppContextProvider` (once, at the root) and each page with
`PageContextProvider`:

```tsx
import {
  AppContextProvider,
  PageContextProvider,
} from "@lastshotlabs/snapshot/ui";

function App() {
  return (
    <AppContextProvider globals={manifest.globals} api={apiClient}>
      <Router>
        <Route
          path="/users"
          element={
            <PageContextProvider>
              <UsersPage />
            </PageContextProvider>
          }
        />
      </Router>
    </AppContextProvider>
  );
}
```
