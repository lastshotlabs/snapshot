# Action Executor

The action executor is the runtime that dispatches the fixed action vocabulary.
Components dispatch actions declaratively; the executor handles routing, API calls,
modals, toasts, confirmations, and data flow. Actions compose into chains.

## Action Types

| Type          | Purpose                                 |
| ------------- | --------------------------------------- |
| `navigate`    | Navigate to a route                     |
| `api`         | Call an API endpoint                    |
| `open-modal`  | Open a modal/drawer by id               |
| `close-modal` | Close a modal (by id or topmost)        |
| `refresh`     | Re-fetch a component's data             |
| `set-value`   | Set another component's published value |
| `download`    | Download a file from an endpoint        |
| `confirm`     | Show a confirmation dialog              |
| `toast`       | Show a toast notification               |
| `track`       | Emit an analytics event                 |

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

### Track action

Use `track` to emit analytics events to every provider declared in
`manifest.analytics.providers`:

```json
{
  "actions": [
    {
      "type": "track",
      "event": "user.signup",
      "props": { "plan": "{plan}" }
    }
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

## Resource-Level Invalidation and Optimistic Rules

When an action or form submits through a manifest resource reference, cache behavior can
be declared directly on that resource:

```json
{
  "resources": {
    "create-comment": {
      "method": "POST",
      "endpoint": "/api/comments",
      "invalidates": [
        "comments-list",
        { "key": ["GET", "/api/stats/comments"] }
      ],
      "optimistic": {
        "target": "comments-list",
        "merge": "append"
      }
    }
  }
}
```

- `invalidates` accepts resource names and explicit query keys.
- `optimistic` applies an optimistic cache write before the request, then restores the
  snapshot on failure.

## Auto-Form Lifecycle Workflows

`form` components can run workflows around submit lifecycle moments:

```json
{
  "type": "form",
  "submit": { "resource": "create-comment" },
  "on": {
    "beforeSubmit": "validate-comment",
    "afterSubmit": "track-comment-created",
    "error": "report-submit-error"
  }
}
```

- `beforeSubmit` runs before the request.
- `afterSubmit` runs after a successful submit.
- `error` runs when submit fails.
- `beforeSubmit` can cancel submission by returning `{ "halt": true }`.

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

## All action schemas

Full reference for every action type:

### `navigate`

```ts
{ type: "navigate", to: string, replace?: boolean }
```

`to` supports interpolation: `{ "to": "/users/{id}" }`.
`replace` replaces the history entry instead of pushing.

### `api`

```ts
{
  type: "api",
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  body?: Record<string, unknown> | { from: string },
  params?: Record<string, unknown>,
  onSuccess?: ActionConfig | ActionConfig[],
  onError?: ActionConfig | ActionConfig[],
}
```

The response is available as `{result}` in `onSuccess`. The error message is available as
`{error}` in `onError`. Endpoint, body, and params values support interpolation.

`body` accepts a FromRef to submit an entire form's values — useful when a form isn't
using its own `submit` field but instead delegates submission to a button elsewhere:

```json
{
  "type": "api",
  "method": "POST",
  "endpoint": "/api/users",
  "body": { "from": "create-user-form" }
}
```

The form must have `"id": "create-user-form"` and publish `{ values }`. The `body`
receives the form's current `values` object.

`params` appends query parameters to the endpoint URL.

### `open-modal`

```ts
{ type: "open-modal", modal: string }
```

`modal` must match the `id` of a modal or drawer in the current page's `content`.

### `close-modal`

```ts
{ type: "close-modal", modal?: string }
```

Without `modal`, closes the topmost modal on the stack.

### `refresh`

```ts
{ type: "refresh", target: string }
```

`target` is a component `id` or a comma-separated list of ids:
`"target": "users-table, revenue-stat"`.

### `set-value`

```ts
{ type: "set-value", target: string, value: unknown }
```

Publishes a value to the page context atom keyed by `target`. Equivalent to calling
`usePublish(target)(value)` programmatically.

Use `set-value` when you need to push data into the context from an action chain rather
than from a component interaction. Common patterns:

**Pass row data to a custom context key before opening a modal:**

```json
[
  { "type": "set-value", "target": "editing-user", "value": "{row}" },
  { "type": "open-modal", "modal": "edit-user-modal" }
]
```

The modal's form can then read `{ "from": "editing-user" }` to pre-fill its fields.

**Clear a filter after an operation:**

```json
[
  { "type": "api", "method": "POST", "endpoint": "/api/search" },
  { "type": "set-value", "target": "search-query", "value": "" }
]
```

### `download`

```ts
{ type: "download", endpoint: string, filename?: string }
```

Calls the endpoint and triggers a file download. `filename` defaults to the
`Content-Disposition` header value.

```json
{
  "label": "Export CSV",
  "icon": "Download",
  "action": {
    "type": "download",
    "endpoint": "/api/users/export.csv",
    "filename": "users.csv"
  }
}
```

With the current row's ID (as a row action on a data-table):

```json
{
  "type": "download",
  "endpoint": "/api/invoices/{id}/pdf",
  "filename": "invoice-{id}.pdf"
}
```

### `confirm`

```ts
{
  type: "confirm",
  message: string,
  confirmLabel?: string,
  cancelLabel?: string,
  variant?: "default" | "destructive",
}
```

Pauses the chain. Resumes on confirm; cancels the entire chain on dismiss.

### `toast`

```ts
{
  type: "toast",
  message: string,
  variant?: "success" | "error" | "warning" | "info",
  duration?: number,
  action?: { label: string; action: ActionConfig },
}
```

`duration` is in milliseconds. Set to `0` to disable auto-dismiss.

`action` adds a button inside the toast — useful for "undo" patterns:

```json
{
  "type": "toast",
  "message": "User archived",
  "variant": "success",
  "action": {
    "label": "Undo",
    "action": { "type": "api", "method": "POST", "endpoint": "/api/users/{id}/unarchive" }
  }
}
```

---

## Error handling

By default, if an `api` action fails the chain stops silently. Add `onError` to handle it:

```json
{
  "type": "api",
  "method": "POST",
  "endpoint": "/api/users",
  "onSuccess": [
    { "type": "close-modal" },
    { "type": "refresh", "target": "users-table" },
    { "type": "toast", "message": "User created", "variant": "success" }
  ],
  "onError": {
    "type": "toast",
    "message": "Failed to create user: {error}",
    "variant": "error"
  }
}
```

For destructive operations, always include an error handler so users know what failed:

```json
{
  "type": "api",
  "method": "DELETE",
  "endpoint": "/api/users/{id}",
  "onSuccess": { "type": "refresh", "target": "users-table" },
  "onError": { "type": "toast", "message": "Delete failed: {error}", "variant": "error" }
}
```

### Error in a chain

When an action in a top-level chain (not inside `onSuccess`/`onError`) fails, the chain
stops. To handle errors in a top-level chain, use nested `onSuccess`/`onError` on the
`api` action:

```json
[
  { "type": "confirm", "message": "Archive this?" },
  {
    "type": "api",
    "method": "POST",
    "endpoint": "/api/projects/{id}/archive",
    "onSuccess": [
      { "type": "navigate", "to": "/projects" },
      { "type": "toast", "message": "Archived", "variant": "success" }
    ],
    "onError": { "type": "toast", "message": "Archive failed", "variant": "error" }
  }
]
```

---

## Debugging action chains

**Chain stops without any visible error**

The most common cause: a `confirm` was cancelled (expected) or an `api` action failed
without an `onError` handler. Add `onError` with a `toast` to make failures visible
during development.

**`{param}` interpolation not resolving**

Check: (1) the key exists in the row data / execution context, (2) the key is spelled
exactly correctly (case-sensitive), (3) nested paths use dot notation: `{user.name}`.
Missing keys are preserved as-is (`{missing}`) rather than clearing to empty string.

**`open-modal` does nothing**

The `modal` value must match the `id` of a modal or drawer component in the page's
`content` array. Check for typos and ensure the modal is in the same page, not a
different route.

**`refresh` doesn't re-fetch**

The `target` must match the `id` of the component that fetched the data. If the component
has no `id`, it can't be refreshed by target name.

---

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
`openModalActionSchema`, `closeModalActionSchema`, `refreshActionSchema`,
`setValueActionSchema`, `downloadActionSchema`, `confirmActionSchema`, `toastActionSchema`.
