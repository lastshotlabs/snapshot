# Getting Started

Snapshot apps start in TypeScript. Create one runtime with `createSnapshot`,
wrap your React tree with its `QueryProvider`, then use the returned hooks and
helpers anywhere inside the app.

## Install

```sh
bun add @lastshotlabs/snapshot @tanstack/react-query @tanstack/react-router jotai react react-dom
```

Editor, markdown, and drag-and-drop libraries are optional peers. Install them
only for the matching component:

| Surface                                 | Install                                                                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rich-input`                            | `bun add @tiptap/core @tiptap/extension-link @tiptap/extension-mention @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/pm @tiptap/react @tiptap/starter-kit tiptap-markdown` |
| `rich-text-editor`                      | `bun add @codemirror/commands @codemirror/lang-markdown @codemirror/language @codemirror/language-data @codemirror/state @codemirror/view`                                                     |
| Drag-and-drop surfaces such as `kanban` | `bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`                                                                                                                                   |
| `markdown`                              | `bun add react-markdown rehype-highlight remark-gfm highlight.js`                                                                                                                              |
| `code-block`                            | `bun add highlight.js`                                                                                                                                                                         |
| `snapshot` CLI                          | `bun add @oclif/core @clack/prompts`                                                                                                                                                           |
| `snapshot/vite` sync plugin             | `bun add -d vite @clack/prompts`                                                                                                                                                               |

Apps that do not use the CLI do not install its oclif or prompt runtime.

Use focused `@lastshotlabs/snapshot/ui/<name>` imports for the minimal
dependency path. The compatibility `@lastshotlabs/snapshot/ui` barrel
re-exports the whole catalog and therefore requires every optional UI peer.

## Create A Runtime

```ts
// src/snapshot.ts
import { createSnapshot } from "@lastshotlabs/snapshot";

export const snapshot = createSnapshot({
  apiUrl: import.meta.env.VITE_API_URL,
  auth: {
    session: { mode: "cookie" },
  },
  loginPath: "/login",
  homePath: "/",
  mfaPath: "/mfa",
});
```

## Add The Provider

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";
import { snapshot } from "./snapshot";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <snapshot.QueryProvider>
    <App />
  </snapshot.QueryProvider>,
);
```

## Use Hooks

```tsx
import { isMfaChallenge } from "@lastshotlabs/snapshot";
import { snapshot } from "./snapshot";

export function LoginForm() {
  const login = snapshot.useLogin();

  async function submit(email: string, password: string) {
    const result = await login.mutateAsync({ email, password });

    if (isMfaChallenge(result)) {
      window.location.assign("/mfa");
      return;
    }

    window.location.assign("/");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        void submit(String(form.get("email")), String(form.get("password")));
      }}
    >
      <input name="email" type="email" autoComplete="email" />
      <input name="password" type="password" autoComplete="current-password" />
      <button type="submit" disabled={login.isPending}>
        Sign in
      </button>
    </form>
  );
}
```

## Protect Routes

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { snapshot } from "../snapshot";

export const Route = createFileRoute("/settings")({
  ...snapshot.protect(),
  component: SettingsPage,
});
```

Use `snapshot.guest()` for login and registration routes.

## Sync Your Backend Schema

```sh
snapshot sync --api http://localhost:3000
snapshot sync --file ./schema.json --zod
snapshot sync --api http://localhost:3000 --watch
```

Generated hooks and types are project code. Keep app behavior in React and call
those generated hooks from your components.

## Add UI Components

```tsx
import { ButtonBase } from "@lastshotlabs/snapshot/ui/button";
import { CardBase } from "@lastshotlabs/snapshot/ui/card";
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";

export function ReplyComposer() {
  return (
    <CardBase>
      <RichInputBase
        placeholder="Write a reply"
        emitMarkdown
        onSend={({ markdown, text }) => {
          console.log(markdown ?? text);
        }}
      />
      <ButtonBase label="Send" icon="send" />
    </CardBase>
  );
}
```

Every catalog component follows the same subpath convention:

```ts
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui/emoji-picker";
import { GifPickerBase } from "@lastshotlabs/snapshot/ui/gif-picker";
```

## Next Steps

- [API cheatsheet](./api-cheatsheet.md)
- [Actions](./actions.md)
- [Customization](./customization.md)
- [Tokens](./tokens.md)
- [CLI](./cli.md)
