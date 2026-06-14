# Data Binding

Snapshot's UI context helpers let components publish values and subscribe to
them without prop drilling. This is optional; use it when sibling components
need to coordinate across a page.

## Providers

Use `AppContextProvider` for app-wide values and `PageContextProvider` for
values that should reset when a route unmounts.

```tsx
import { AppContextProvider, PageContextProvider } from "@lastshotlabs/snapshot/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppContextProvider>
      <PageContextProvider>{children}</PageContextProvider>
    </AppContextProvider>
  );
}
```

## Publishing

```tsx
import { usePublish } from "@lastshotlabs/snapshot/ui";

function UsersTable({ rows }: { rows: User[] }) {
  const publish = usePublish("users-table");

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            onClick={() => publish({ selected: row })}
          >
            <td>{row.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Subscribing

```tsx
import { useSubscribe } from "@lastshotlabs/snapshot/ui";

function UserDetail() {
  const selectedUser = useSubscribe({ from: "users-table.selected" }) as
    | User
    | undefined;

  if (!selectedUser) return null;
  return <aside>{selectedUser.email}</aside>;
}
```

Dot paths are supported:

```tsx
const email = useSubscribe({ from: "users-table.selected.email" });
```

## Resolving Objects

Use `useResolveFrom` when a component accepts an object with a mix of static
values and refs.

```tsx
import { useResolveFrom } from "@lastshotlabs/snapshot/ui";

function RevenueCard() {
  const params = useResolveFrom({
    userId: { from: "users-table.selected.id" },
    period: { from: "date-range.value" },
    currency: "USD",
  });

  const revenue = useRevenue(params);
  return <strong>{revenue.total}</strong>;
}
```

## Multiple Values

```tsx
import { useResolveFromMany } from "@lastshotlabs/snapshot/ui";

const values = useResolveFromMany([
  { from: "filters.status" },
  { from: "filters.owner" },
]);
```

## Type Guard

```ts
import { isFromRef } from "@lastshotlabs/snapshot/ui";

isFromRef({ from: "users-table.selected" }); // true
isFromRef("plain value"); // false
```

## When To Use It

Use context refs for page-level coordination such as:

- A table driving a detail drawer.
- A filter bar driving cards and charts.
- A selected item driving a toolbar.
- A global notification or layout state read by multiple components.

Use normal props for local parent-child composition. The context helpers are an
escape hatch for cross-component coordination, not a replacement for React data
flow.
