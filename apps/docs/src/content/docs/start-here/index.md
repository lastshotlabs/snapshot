---
title: Quick Start
description: Build a working code-first Snapshot app with auth and UI components.
draft: false
---

## 1. Create Your Runtime

```tsx
// src/snapshot.ts
import { createSnapshot } from "@lastshotlabs/snapshot";

export const snap = createSnapshot({
  apiUrl: "/api",
  loginPath: "/login",
  homePath: "/",
});
```

## 2. Wrap The App

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return <snap.QueryProvider>{children}</snap.QueryProvider>;
}
```

## 3. Build A Login Page

```tsx
import { ButtonBase, CardBase, InputControl } from "@lastshotlabs/snapshot/ui";
import { useState } from "react";
import { snap } from "../snapshot";

export function LoginPage() {
  const login = snap.useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <CardBase title="Sign in">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          login.mutate({ email, password });
        }}
      >
        <InputControl value={email} onChangeText={setEmail} type="email" />
        <InputControl value={password} onChangeText={setPassword} type="password" />
        <ButtonBase label="Sign in" type="submit" disabled={login.isPending} />
      </form>
    </CardBase>
  );
}
```

## 4. Build A Protected Route

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { snap } from "../snapshot";

export const Route = createFileRoute("/settings")({
  ...snap.protect(),
  component: SettingsPage,
});
```

## Next Steps

- [Core Concepts](/start-here/core-concepts/)
- [Authentication](/guides/authentication/)
- [Forms and Validation](/guides/forms/)
- [Data Tables and Lists](/guides/data-tables/)
- [Theming and Styling](/guides/theming-and-styling/)
