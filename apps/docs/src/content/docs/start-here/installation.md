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

Snapshot keeps editor, markdown, drag-and-drop, and CLI libraries out of a
basic install. Add optional peers only for the UI surfaces you use:

| Surface                                 | Install                                                                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rich-input`                            | `bun add @tiptap/core @tiptap/extension-link @tiptap/extension-mention @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/pm @tiptap/react @tiptap/starter-kit tiptap-markdown` |
| `rich-text-editor`                      | `bun add @codemirror/commands @codemirror/lang-markdown @codemirror/language @codemirror/language-data @codemirror/state @codemirror/view`                                                     |
| Drag-and-drop surfaces such as `kanban` | `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`                                                                                                                                   |
| `markdown`                              | `bun add react-markdown rehype-highlight remark-gfm highlight.js`                                                                                                                              |
| `code-block`                            | `bun add highlight.js`                                                                                                                                                                         |
| `snapshot` CLI                          | `bun add @oclif/core @clack/prompts`                                                                                                                                                           |
| `snapshot/vite` sync plugin             | `bun add -d vite @clack/prompts`                                                                                                                                                               |

The CLI packages are optional too, so apps that only import Snapshot runtime or
UI code do not install either package.

Use focused `@lastshotlabs/snapshot/ui/<name>` imports for the minimal
dependency path. The compatibility `@lastshotlabs/snapshot/ui` barrel
re-exports the whole catalog and therefore requires every optional UI peer.

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
import { ButtonBase } from "@lastshotlabs/snapshot/ui/button";
import { CardBase } from "@lastshotlabs/snapshot/ui/card";
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
```

Other component subpaths:

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
