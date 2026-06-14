---
title: Examples
description: Code-first Snapshot examples for auth, dashboards, chat, and settings.
draft: false
---

Snapshot examples are ordinary React apps built around one `createSnapshot`
runtime. Use the recipes when you want a complete page, or copy the smaller
patterns below into an existing app.

## Runtime

```ts
import { createSnapshot } from "@lastshotlabs/snapshot";

export const snapshot = createSnapshot({
  apiUrl: import.meta.env.VITE_API_URL,
  auth: {
    session: { mode: "cookie" },
  },
  loginPath: "/login",
  homePath: "/",
});
```

## Provider

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return <snapshot.QueryProvider>{children}</snapshot.QueryProvider>;
}
```

## Login

```tsx
import { isMfaChallenge } from "@lastshotlabs/snapshot";
import { ButtonBase, InputControl } from "@lastshotlabs/snapshot/ui";
import { snapshot } from "../snapshot";

export function LoginPage() {
  const login = snapshot.useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const result = await login.mutateAsync({ email, password });
    if (isMfaChallenge(result)) {
      window.location.assign("/mfa");
      return;
    }
    window.location.assign("/");
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <InputControl value={email} onChangeText={setEmail} type="email" />
      <InputControl value={password} onChangeText={setPassword} type="password" />
      <ButtonBase type="submit" label="Sign in" disabled={login.isPending} />
    </form>
  );
}
```

## Protected Route

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { snapshot } from "../snapshot";

export const Route = createFileRoute("/settings")({
  ...snapshot.protect(),
  component: SettingsPage,
});
```

## Feedback

```tsx
import {
  ConfirmDialog,
  ToastContainer,
  useConfirmManager,
  useToastManager,
} from "@lastshotlabs/snapshot/ui";

function DeleteAccountButton() {
  const confirm = useConfirmManager();
  const toast = useToastManager();
  const deleteAccount = snapshot.useDeleteAccount();

  async function remove() {
    const ok = await confirm.show({
      title: "Delete account",
      message: "This cannot be undone.",
      variant: "destructive",
      requireInput: "DELETE",
    });

    if (!ok) return;
    await deleteAccount.mutateAsync();
    toast.show({ message: "Account deleted", variant: "success" });
  }

  return <button onClick={() => void remove()}>Delete account</button>;
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
```

## Recipes

- [Login Page](/recipes/login-page/)
- [Admin Dashboard](/recipes/admin-dashboard/)
- [Chat Application](/recipes/chat-app/)
- [Settings Page](/recipes/settings-page/)
