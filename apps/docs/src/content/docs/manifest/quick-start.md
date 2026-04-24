---
title: Manifest Quick Start
description: Build apps from JSON manifests with routes, navigation, resources, and theming.
draft: false
---

Manifest mode lets you assemble entire apps from JSON configuration instead of writing React by hand. The same 113 components and all SDK hooks are available -- you just compose them declaratively.

## Minimal manifest app

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    routes: [
      {
        id: "home",
        path: "/",
        title: "Home",
        content: [
          { type: "heading", text: "Welcome", level: 1 },
          { type: "text", text: "Your first manifest app." },
        ],
      },
    ],
  },
});

// Render the entire app from manifest
function App() {
  return <snap.ManifestApp />;
}
```

`ManifestApp` renders the entire application -- routing, navigation, auth screens, overlays, and all page content -- from the manifest config.

## Adding navigation

```tsx
manifest: {
  app: { name: "My App" },
  navigation: {
    position: "sidebar",
    logo: { text: "My App" },
    items: [
      { label: "Dashboard", path: "/", icon: "home" },
      { label: "Users", path: "/users", icon: "users" },
      { label: "Settings", path: "/settings", icon: "settings" },
    ],
  },
  routes: [
    { id: "dashboard", path: "/", title: "Dashboard", content: [...] },
    { id: "users", path: "/users", title: "Users", content: [...] },
    { id: "settings", path: "/settings", title: "Settings", content: [...] },
  ],
}
```

## Adding auth

```tsx
manifest: {
  app: {
    name: "My App",
    auth: {
      loginPath: "/login",
      homePath: "/",
      mfaPath: "/mfa",
    },
  },
  auth: {
    login: { title: "Sign in" },
    register: { title: "Create account" },
    forgotPassword: { title: "Reset password" },
  },
  // ... navigation and routes
}
```

Auth screens are generated automatically from the `auth` config.

## Data tables with resources

```tsx
manifest: {
  resources: {
    users: {
      endpoint: "/api/users",
      fields: ["id", "name", "email", "role", "createdAt"],
    },
  },
  routes: [
    {
      id: "users",
      path: "/users",
      title: "Users",
      content: [
        {
          type: "data-table",
          resource: "users",
          columns: [
            { field: "name", label: "Name", sortable: true },
            { field: "email", label: "Email" },
            { field: "role", label: "Role", format: "badge" },
            { field: "createdAt", label: "Joined", format: "date" },
          ],
        },
      ],
    },
  ],
}
```

Resources bind to the API automatically -- data fetching, pagination, and mutations are handled by the runtime.

## Theming

```tsx
manifest: {
  theme: {
    colors: {
      primary: "#3b82f6",
      accent: "#8b5cf6",
    },
    radius: { default: "0.5rem" },
    fonts: { sans: "Inter" },
  },
}
```

See [Theming and Styling](/guides/theming-and-styling/) for the full token system.

## Overlays and workflows

```tsx
manifest: {
  overlays: {
    createUser: {
      type: "modal",
      title: "Create User",
      content: [
        { type: "auto-form", resource: "users", action: "create" },
      ],
    },
  },
  workflows: {
    openCreateUser: [
      { type: "open-overlay", overlay: "createUser" },
    ],
  },
}
```

## When to use manifest vs code-first

| Use manifest when... | Use code-first when... |
|----------------------|----------------------|
| Standard CRUD screens | Custom UI logic |
| Config-driven theming | Complex form validation |
| Rapid prototyping | Third-party integrations |
| Non-developer editing | Fine-grained state management |

Most real apps combine both -- manifest for standard screens, code-first for custom interactions.

## Next steps

- [Manifest Examples](/manifest/examples/) -- five complete manifest app examples
- [Presets](/manifest/presets/) -- factory functions for common page patterns
- [Manifest Reference](/reference/manifest/) -- full manifest schema
- [Theming and Styling](/guides/theming-and-styling/) -- token and slot system
