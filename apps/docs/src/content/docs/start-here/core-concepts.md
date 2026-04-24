---
title: Core Concepts
description: The mental model behind Snapshot — how hooks, components, and the SDK fit together.
draft: false
---

Before diving into domain guides, this page explains how Snapshot is structured so you can navigate the rest of the docs confidently.

## One factory, everything attached

Every Snapshot app starts with `createSnapshot()`. This single call creates the API client, token storage, query cache, and returns all hooks:

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {},
});

// Every hook lives on the snap object
const { user } = snap.useUser();
const { mutate: login } = snap.useLogin();
const { theme, toggle } = snap.useTheme();
```

You'll see `snap.useX()` throughout the docs. That's always the same object returned by `createSnapshot()`.

## Two import paths

Snapshot has two entry points:

| Import | What you get |
|--------|-------------|
| `@lastshotlabs/snapshot` | `createSnapshot`, `definePlugin`, `usePushNotifications`, types |
| `@lastshotlabs/snapshot/ui` | All 113 standalone components (`ButtonBase`, `InputField`, etc.) |

```tsx
// SDK hooks come from your snap instance
import { createSnapshot } from "@lastshotlabs/snapshot";
const snap = createSnapshot({ apiUrl: "/api", manifest: {} });
snap.useUser();     // hook on the instance
snap.useLogin();    // hook on the instance

// Components come from the /ui path
import { ButtonBase, InputField, DataTableBase } from "@lastshotlabs/snapshot/ui";
```

## Query hooks vs mutation hooks

Snapshot hooks follow TanStack Query conventions:

**Query hooks** fetch data and cache it. They return `{ data, isLoading, error }`:

```tsx
const { user, isLoading } = snap.useUser();
const { sessions } = snap.useSessions();
const { data: threads } = snap.useThreads(containerId);
```

**Mutation hooks** perform actions. They return `{ mutate, isPending }`:

```tsx
const { mutate: login, isPending } = snap.useLogin();
const { mutate: register } = snap.useRegister();
const { mutate: deleteAccount } = snap.useDeleteAccount();

// Call mutate with the payload
login({ email, password });
```

## Component naming

All 113 components follow two naming patterns:

- **`*Field`** — Form inputs: `InputField`, `SelectField`, `TextareaField`, `SwitchField`, `DatePickerField`, etc.
- **`*Base`** — Everything else: `ButtonBase`, `CardBase`, `DataTableBase`, `ModalBase`, `NavBase`, etc.

Every component works as a plain React component with typed props. No provider, no context, no config object required:

```tsx
<InputField label="Email" type="email" value={email} onChange={setEmail} />
<ButtonBase label="Submit" onClick={handleSubmit} />
<CardBase title="Settings">Card content here</CardBase>
```

## Styling with slots

Components expose named sub-elements called **slots** for targeted styling:

```tsx
<CardBase
  title="User Profile"
  slots={{
    root: { style: { border: "1px solid #e5e7eb" } },
    header: { style: { backgroundColor: "#f9fafb" } },
    title: { style: { fontSize: "1.25rem" } },
  }}
/>
```

Slots accept `style`, `className`, and state-based overrides. See [Theming and Styling](/guides/theming-and-styling/) for the full system.

## QueryProvider

Every Snapshot hook must render inside the `QueryProvider` component. It wraps TanStack Query and Jotai state:

```tsx
export default function App() {
  return (
    <snap.QueryProvider>
      {/* All Snapshot hooks work here */}
    </snap.QueryProvider>
  );
}
```

This is typically the outermost wrapper in your app — set it once and forget it.

## Code-first vs manifest

Snapshot supports two authoring modes that use the same components under the hood:

**Code-first** (default) — Write React with hooks and standalone components:

```tsx
<NavBase items={[...]} logo={{...}} />
<DataTableBase columns={[...]} rows={data} />
```

**Manifest mode** — Compose apps from JSON config:

```json
{
  "navigation": { "items": [...] },
  "routes": [{ "path": "/", "content": [{ "type": "data-table", "columns": [...] }] }]
}
```

Both modes are first-class. Start code-first unless you specifically want config-driven assembly. See [Manifest Quick Start](/manifest/quick-start/) to explore that path.

## What's next

Now that you understand the model, pick the guide that matches what you're building:

1. **[Authentication](/guides/authentication/)** — Login, MFA, OAuth, passkeys, sessions
2. **[Forms](/guides/forms/)** — 18 field components, validation, wizards
3. **[Data Tables](/guides/data-tables/)** — Tables, lists, charts, stat cards
4. **[Layout](/guides/layout-and-navigation/)** — App shells, nav bars, grids
5. **[Overlays](/guides/overlays/)** — Modals, drawers, command palettes

Or jump to a complete example: [Recipes](/recipes/login-page/)
