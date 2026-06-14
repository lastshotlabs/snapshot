---
title: Installation
description: Install Snapshot and create your first runtime instance.
draft: false
---

## Install

```sh
bun add @lastshotlabs/snapshot @tanstack/react-query @tanstack/react-router jotai react react-dom
```

Optional peers:

```sh
bun add -d vite
bun add react-server-dom-webpack
```

## Create A Runtime

```tsx
// src/snapshot.ts
import { createSnapshot } from "@lastshotlabs/snapshot";

export const snap = createSnapshot({
  apiUrl: "/api",
  auth: {
    session: { mode: "cookie" },
  },
  loginPath: "/login",
  homePath: "/",
});
```

## Wrap Your App

```tsx
import { snap } from "./snapshot";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <snap.QueryProvider>{children}</snap.QueryProvider>;
}
```

## Import UI

```tsx
import { ButtonBase, CardBase, RichInputBase } from "@lastshotlabs/snapshot/ui";
```

Focused subpaths:

```ts
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui/emoji-picker";
import { GifPickerBase } from "@lastshotlabs/snapshot/ui/gif-picker";
```

## Sync Backend Types

```sh
snapshot sync --api http://localhost:3000
snapshot sync --file ./schema.json --zod
```

## Next Step

Continue with the [Quick Start](/start-here/).
