---
title: Quick Start
description: Build a working app with auth and a data table in under 30 lines.
draft: false
---

This guide builds a working app with login, a user greeting, and a data table. You'll have something running in five minutes.

**Prerequisites:** A Bunshot backend running at `/api` with auth enabled. See [Installation](/start-here/installation/) if you haven't set up your project yet.

## 1. Create your snapshot instance

```tsx
// src/snapshot.ts
import { createSnapshot } from "@lastshotlabs/snapshot";

export const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    app: {
      name: "My App",
      auth: { loginPath: "/login", homePath: "/" },
    },
  },
});
```

This is the single entry point for the entire Snapshot runtime. Every hook and primitive comes from this object.

## 2. Build a login page

```tsx
// src/pages/Login.tsx
import { snap } from "../snapshot";
import { InputField, ButtonBase, CardBase } from "@lastshotlabs/snapshot/ui";
import { useState } from "react";

export function LoginPage() {
  const { mutate: login, isPending } = snap.useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <CardBase title="Sign in">
      <form onSubmit={(e) => { e.preventDefault(); login({ email, password }); }}>
        <InputField label="Email" type="email" value={email} onChange={setEmail} />
        <InputField label="Password" type="password" value={password} onChange={setPassword} />
        <ButtonBase label="Sign in" type="submit" disabled={isPending} />
      </form>
    </CardBase>
  );
}
```

`useLogin()` returns a TanStack Query mutation. On success, it stores tokens, fetches the user, and navigates to `homePath`.

## 3. Build a dashboard

```tsx
// src/pages/Dashboard.tsx
import { snap } from "../snapshot";
import { NavBase, DataTableBase, ButtonBase } from "@lastshotlabs/snapshot/ui";

export function Dashboard() {
  const { user } = snap.useUser();
  const { mutate: logout } = snap.useLogout();

  return (
    <>
      <NavBase
        logo={{ text: "My App", path: "/" }}
        items={[
          { label: "Dashboard", path: "/", active: true },
          { label: "Settings", path: "/settings" },
        ]}
      >
        <ButtonBase label="Sign out" variant="ghost" onClick={() => logout()} />
      </NavBase>
      <main style={{ padding: "2rem" }}>
        <h1>Welcome, {user?.name}</h1>
        <DataTableBase
          columns={[
            { field: "name", label: "Name", sortable: true },
            { field: "email", label: "Email" },
            { field: "role", label: "Role" },
          ]}
          rows={[
            { name: "Alice", email: "alice@example.com", role: "Admin" },
            { name: "Bob", email: "bob@example.com", role: "Member" },
          ]}
        />
      </main>
    </>
  );
}
```

## 4. Wire it together

```tsx
// src/App.tsx
import { snap } from "./snapshot";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
  const { user, isLoading } = snap.useUser();

  return (
    <snap.QueryProvider>
      {isLoading ? null : user ? <Dashboard /> : <LoginPage />}
    </snap.QueryProvider>
  );
}
```

`QueryProvider` wraps TanStack Query and Jotai providers. Every Snapshot hook must be rendered inside it.

## What just happened

- `createSnapshot()` created an API client, token storage, query client, and all hooks
- `useUser()` fetches `/api/auth/me` and caches the result
- `useLogin()` posts to `/api/auth/login`, stores the JWT, and refetches the user
- `useLogout()` clears tokens and cache, then navigates to `loginPath`
- Every `*Base` component is a standalone React component with typed props

## Next steps

- [Authentication](/guides/authentication/) -- MFA, OAuth, passkeys, registration, password reset
- [Forms and Validation](/guides/forms/) -- all 18 form components and validation patterns
- [Data Tables and Lists](/guides/data-tables/) -- sorting, filtering, pagination, row actions
- [Layout and Navigation](/guides/layout-and-navigation/) -- sidebars, top-nav, grids, cards
- [Theming and Styling](/guides/theming-and-styling/) -- tokens, slots, dark mode

## Same app in manifest mode

The same app can be expressed as a JSON manifest instead of React code. If you prefer config-driven assembly, see [Manifest Quick Start](/manifest/quick-start/).

```json
{
  "app": {
    "name": "My App",
    "auth": { "loginPath": "/login", "homePath": "/" }
  },
  "navigation": {
    "position": "top",
    "logo": { "text": "My App" },
    "items": [
      { "label": "Dashboard", "path": "/" },
      { "label": "Settings", "path": "/settings" }
    ]
  },
  "routes": [
    {
      "path": "/",
      "content": [
        {
          "type": "data-table",
          "resource": "users",
          "columns": [
            { "field": "name", "header": "Name", "sortable": true },
            { "field": "email", "header": "Email" },
            { "field": "role", "header": "Role" }
          ]
        }
      ]
    }
  ]
}
```
