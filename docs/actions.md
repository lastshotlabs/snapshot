# Action Executor

The action executor is the runtime that dispatches the fixed action vocabulary.
Components dispatch actions declaratively; the executor handles routing, API calls,
modals, toasts, confirmations, and data flow. Actions compose into chains.

## Action Types

| Type          | Purpose                               |
| ------------- | ------------------------------------- |
| `navigate`    | Navigate to a route                   |
| `api`         | Call an API endpoint                  |
| `open-modal`  | Open a modal/drawer by id            |
| `close-modal` | Close a modal (by id or topmost)      |
| `refresh`     | Re-fetch a component's data           |
| `set-value`   | Set another component's published value |
| `download`    | Download a file from an endpoint      |
| `confirm`     | Show a confirmation dialog            |
| `toast`       | Show a toast notification             |

## Usage

### In manifest config (Level 1)

```json
{
  "actions": [
    { "type": "confirm", "message": "Delete this user?" },
    { "type": "api", "method": "DELETE", "endpoint": "/api/users/{id}" },
    { "type": "refresh", "target": "users-table" },
    { "type": "toast", "message": "User deleted", "variant": "success" }
  ]
}
```

### In custom React code (Level 2)

```tsx
import { useActionExecutor } from "@lastshotlabs/snapshot/ui";

function DeleteButton({ userId }: { userId: number }) {
  const execute = useActionExecutor();

  return (
    <button
      onClick={() =>
        execute(
          [
            { type: "confirm", message: "Delete this user?" },
            { type: "api", method: "DELETE", endpoint: `/api/users/${userId}` },
            { type: "refresh", target: "users-table" },
            { type: "toast", message: "User deleted", variant: "success" },
          ],
          { userId },
        )
      }
    >
      Delete
    </button>
  );
}
```

## Action Chain Behavior

Actions in an array execute **sequentially**. Key behaviors:

- **`confirm` stops the chain** if the user cancels.
- **`api` populates `{result}`** in the context for downstream actions.
- **`api` with `onError`** catches errors and executes error actions instead of throwing.
- All string fields support **`{param}` interpolation** from context.

## String Interpolation

Any string field (endpoints, messages, values) supports `{key}` placeholders
resolved from the execution context:

```ts
// Simple key
interpolate("/users/{id}", { id: 42 }); // "/users/42"

// Nested path
interpolate("{user.name}", { user: { name: "Alice" } }); // "Alice"

// Missing keys are preserved
interpolate("{missing}", {}); // "{missing}"
```

## API Action

The `api` action calls an endpoint and supports recursive `onSuccess`/`onError` chains:

```ts
{
  type: "api",
  method: "DELETE",
  endpoint: "/api/users/{id}",
  onSuccess: [
    { type: "refresh", target: "users-table" },
    { type: "toast", message: "Deleted", variant: "success" }
  ],
  onError: {
    type: "toast",
    message: "Failed to delete",
    variant: "error"
  }
}
```

The API response is available as `{result}` in `onSuccess` actions. The error is
available as `{error}` in `onError` actions.

## Modal Manager

The modal manager maintains a stack of open modal ids:

```tsx
import { useModalManager } from "@lastshotlabs/snapshot/ui";

function MyComponent() {
  const { open, close, isOpen, stack } = useModalManager();

  open("edit-user"); // opens modal
  close("edit-user"); // closes specific modal
  close(); // closes topmost modal
  isOpen("edit-user"); // check if open
}
```

Actions: `{ type: "open-modal", modal: "edit-user" }` and `{ type: "close-modal" }`.

## Toast Notifications

```tsx
import { useToastManager, ToastContainer } from "@lastshotlabs/snapshot/ui";

// Place once at app root
function App() {
  return (
    <>
      <Routes />
      <ToastContainer />
    </>
  );
}

// Show toasts programmatically
function MyComponent() {
  const { show, dismiss } = useToastManager();
  show({ message: "Saved!", variant: "success", duration: 3000 });
}
```

Variants: `success`, `error`, `warning`, `info`. Default duration: 5000ms. Set to 0
for no auto-dismiss.

## Confirmation Dialog

```tsx
import { useConfirmManager, ConfirmDialog } from "@lastshotlabs/snapshot/ui";

// Place once at app root
function App() {
  return (
    <>
      <Routes />
      <ConfirmDialog />
    </>
  );
}

// Show confirmation programmatically
function MyComponent() {
  const { show } = useConfirmManager();

  async function handleDelete() {
    const confirmed = await show({
      message: "Delete this item?",
      confirmLabel: "Yes, delete",
      cancelLabel: "No, keep",
      variant: "destructive",
    });
    if (confirmed) {
      // proceed
    }
  }
}
```

## Refresh Pattern

The `refresh` action increments a counter atom (`__refresh_{componentId}`) in the
registry. Components watch this atom to know when to re-fetch their data:

```ts
{ type: "refresh", target: "users-table" }
// Supports comma-separated targets:
{ type: "refresh", target: "users-table, stats-card" }
```

## Setup

The action executor requires `SnapshotApiContext` for `api` and `download` actions:

```tsx
import { SnapshotApiContext } from "@lastshotlabs/snapshot/ui";

function App({ apiClient }) {
  return (
    <SnapshotApiContext.Provider value={apiClient}>
      <Routes />
      <ToastContainer />
      <ConfirmDialog />
    </SnapshotApiContext.Provider>
  );
}
```

## Zod Validation

All action configs have Zod schemas for manifest validation:

```ts
import { actionSchema } from "@lastshotlabs/snapshot/ui";

const result = actionSchema.safeParse({
  type: "toast",
  message: "Hello",
  variant: "success",
});
```

Individual schemas are also exported: `navigateActionSchema`, `apiActionSchema`,
`toastActionSchema`, etc.
