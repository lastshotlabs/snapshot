# Actions

Snapshot actions are code now: React event handlers, mutation callbacks,
router navigation, and small UI managers for common feedback patterns. Keep the
business logic in TypeScript and call Snapshot hooks directly.

## Core Pattern

```tsx
import { useToastManager } from "@lastshotlabs/snapshot/ui";
import { snapshot } from "./snapshot";

export function SaveProfileButton({ name }: { name: string }) {
  const toast = useToastManager();

  async function save() {
    await snapshot.api.patch("/account/profile", { name });
    toast.show({ message: "Profile saved", variant: "success" });
    await snapshot.queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  return <button onClick={() => void save()}>Save</button>;
}
```

The important parts are ordinary React:

- Use `onClick`, `onSubmit`, `onChange`, and mutation callbacks.
- Call `snapshot.api` for direct requests.
- Call generated hooks from `snapshot sync` for typed endpoint flows.
- Use `snapshot.queryClient` to invalidate or seed cache data.
- Use router APIs for navigation, or register `snapshot.setNavigator(...)` once
  and let Snapshot auth hooks navigate through your router.

## Toasts

`useToastManager()` enqueues transient feedback. Render one `ToastContainer`
near the root of your app.

```tsx
import { ToastContainer, useToastManager } from "@lastshotlabs/snapshot/ui";

function InviteButton() {
  const toast = useToastManager();

  async function invite() {
    await snapshot.api.post("/team/invites", {
      email: "ada@example.com",
    });

    toast.show({
      message: "Invite sent",
      variant: "success",
      action: {
        label: "View",
        onClick: () => window.location.assign("/team/invites"),
      },
    });
  }

  return <button onClick={() => void invite()}>Invite</button>;
}

export function AppChrome() {
  return (
    <>
      <InviteButton />
      <ToastContainer />
    </>
  );
}
```

Toast options:

| Option | Purpose |
| --- | --- |
| `message` | Required message text |
| `variant` | `success`, `error`, `warning`, or `info` |
| `duration` | Auto-dismiss timeout in milliseconds. Use `0` to keep it open |
| `icon` | Snapshot icon name |
| `color` | Custom background color |
| `action` | Inline button with `{ label, onClick }` |

## Confirmations

`useConfirmManager()` returns a promise-based confirmation API. Render one
`ConfirmDialog` near the root.

```tsx
import { ConfirmDialog, useConfirmManager } from "@lastshotlabs/snapshot/ui";

function DeleteAccountButton() {
  const confirm = useConfirmManager();
  const toast = useToastManager();
  const deleteAccount = snapshot.useDeleteAccount();

  async function onDelete() {
    const ok = await confirm.show({
      title: "Delete account",
      message: "This permanently removes your account.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive",
      requireInput: "DELETE",
    });

    if (!ok) return;

    await deleteAccount.mutateAsync();
    toast.show({ message: "Account deleted", variant: "success" });
  }

  return <button onClick={() => void onDelete()}>Delete account</button>;
}

export function AppChrome() {
  return (
    <>
      <DeleteAccountButton />
      <ConfirmDialog />
    </>
  );
}
```

Confirmation options:

| Option | Purpose |
| --- | --- |
| `title` | Dialog title |
| `message` / `description` | Dialog body |
| `confirmLabel` | Confirm button label |
| `cancelLabel` | Cancel button label |
| `variant` | `default` or `destructive` |
| `requireInput` | Requires the user to type an exact value before confirming |

## Mutation Flows

Prefer mutation hooks when the runtime already exposes a first-class flow.

```tsx
function LogoutButton() {
  const logout = snapshot.useLogout();

  return (
    <button
      disabled={logout.isPending}
      onClick={() => logout.mutate({ redirectTo: "/login" })}
    >
      Sign out
    </button>
  );
}
```

For generated endpoint hooks, keep UI side effects in the callback:

```tsx
function PublishThreadButton({ threadId }: { threadId: string }) {
  const toast = useToastManager();
  const publish = snapshot.usePublishThread();

  return (
    <button
      disabled={publish.isPending}
      onClick={() =>
        publish.mutate(threadId, {
          onSuccess: () => {
            toast.show({ message: "Thread published", variant: "success" });
          },
        })
      }
    >
      Publish
    </button>
  );
}
```

## Navigation

For auth flows, register a router bridge once:

```tsx
import { useEffect } from "react";
import { router } from "./router";
import { snapshot } from "./snapshot";

export function SnapshotNavigationBridge() {
  useEffect(() => {
    snapshot.setNavigator((to, opts) => {
      void router.navigate({ to: to as never, replace: opts.replace });
    });

    return () => snapshot.setNavigator(null);
  }, []);

  return null;
}
```

For app-specific interactions, call your router directly:

```tsx
function EditButton({ id }: { id: string }) {
  return (
    <button
      onClick={() => {
        void router.navigate({ to: "/threads/$id/edit", params: { id } });
      }}
    >
      Edit
    </button>
  );
}
```

## Debounce And Throttle

Snapshot still exports small helpers for rate-limiting callbacks.

```tsx
import { debounceAction, throttleAction } from "@lastshotlabs/snapshot/ui";

function scheduleSearch(query: string) {
  void debounceAction(
    "search",
    () =>
      snapshot.queryClient.invalidateQueries({
        queryKey: ["search", query],
      }),
    300,
  );
}

function scheduleAutosave() {
  void throttleAction(
    "draft-autosave",
    () => snapshot.api.post("/drafts/autosave", collectDraft()),
    1_000,
  );
}
```

Use these helpers at module scope or memoize them so a render does not recreate
the timer state.

## Error Handling

`ApiError` exposes the HTTP status and response body. Use the auth formatter
for auth screens and plain branching elsewhere.

```tsx
import { ApiError } from "@lastshotlabs/snapshot";

async function saveSettings() {
  try {
    await snapshot.api.patch("/settings", collectSettings());
    toast.show({ message: "Settings saved", variant: "success" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      toast.show({ message: "You do not have access", variant: "error" });
      return;
    }

    toast.show({ message: "Could not save settings", variant: "error" });
  }
}
```

Auth UI:

```tsx
const login = snapshot.useLogin();

if (login.error) {
  const message = snapshot.formatAuthError(login.error, "login");
  return <p>{message}</p>;
}
```

## Root UI Managers

Place shared managers once, near your router outlet:

```tsx
import { ConfirmDialog, ToastContainer } from "@lastshotlabs/snapshot/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
```
