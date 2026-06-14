---
title: Core Concepts
description: How Snapshot's runtime, hooks, components, and providers fit together.
draft: false
---

## One Runtime

Every app starts with `createSnapshot()`. The returned object owns the API
client, token storage, query cache, hooks, route guards, and provider.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";

const snap = createSnapshot({ apiUrl: "/api" });

const { user } = snap.useUser();
const login = snap.useLogin();
```

## Two Main Imports

| Import | What you get |
| --- | --- |
| `@lastshotlabs/snapshot` | `createSnapshot`, runtime types, auth helpers |
| `@lastshotlabs/snapshot/ui` | Standalone components, tokens, actions, icons, UI hooks |

## Query And Mutation Hooks

Query hooks read data and cache it:

```tsx
const { user, isLoading } = snap.useUser();
const { sessions } = snap.useSessions();
```

Mutation hooks perform writes:

```tsx
const login = snap.useLogin();
login.mutate({ email, password });
```

## Provider

Every Snapshot hook should render inside the runtime's provider.

```tsx
<snap.QueryProvider>
  <App />
</snap.QueryProvider>
```

## Components

Snapshot UI components are regular React components.

```tsx
import { ButtonBase, CardBase, DataTableBase } from "@lastshotlabs/snapshot/ui";

<CardBase title="Settings">
  <ButtonBase label="Save" onClick={save} />
</CardBase>
```

## Styling

Components accept `className`, `style`, and component-specific `slots`. For
shared theming, generate Snapshot CSS variables with `resolveTokens()`.

```tsx
import { resolveTokens } from "@lastshotlabs/snapshot/ui";

const css = resolveTokens({ flavor: "neutral" });
```

## Backend Sync

Run `snapshot sync` when you want typed API helpers and React Query hooks from
your Bunshot OpenAPI schema.

```sh
snapshot sync --api http://localhost:3000
```
