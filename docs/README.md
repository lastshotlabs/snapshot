# Snapshot Docs

Snapshot is a code-first frontend SDK for Bunshot-powered React apps. The
runtime starts with `createSnapshot({ apiUrl })`; apps then compose Snapshot
hooks, generated API hooks, and standalone UI components in normal React code.

## Start Here

| Doc | Purpose |
| --- | --- |
| [README](../README.md) | Install, runtime setup, auth, routing, sync, UI, SSR, and package entry points |
| [api-cheatsheet.md](./api-cheatsheet.md) | Current public API quick reference |
| [actions.md](./actions.md) | Code-first interaction patterns with toasts, confirmations, mutations, and navigation |
| [customization.md](./customization.md) | Styling, tokens, slots, and component composition |
| [tokens.md](./tokens.md) | Token system details |
| [ssr.md](./ssr.md) | Server rendering architecture |
| [rsc-ppr.md](./rsc-ppr.md) | RSC and partial prerendering notes |

## Current Model

1. Create a runtime once with `createSnapshot`.
2. Wrap the app in the runtime's `QueryProvider`.
3. Build screens with React components and Snapshot hooks.
4. Import UI from `@lastshotlabs/snapshot/ui` when useful.
5. Run `snapshot sync` when you want typed API clients and React Query hooks
   from your backend schema.
6. Add `snapshotSync()` or `snapshotSsr()` to Vite only when the project needs
   those build-time helpers.

## Primary Imports

```ts
import { createSnapshot } from "@lastshotlabs/snapshot";
import { ButtonBase, ToastContainer } from "@lastshotlabs/snapshot/ui";
import { snapshotSync, snapshotSsr } from "@lastshotlabs/snapshot/vite";
import { createReactRenderer } from "@lastshotlabs/snapshot/ssr";
```

## Commands

```sh
snapshot init
snapshot sync --api http://localhost:3000
snapshot sync --file ./schema.json --zod
snapshot sync --api http://localhost:3000 --watch
```

## What Should Be Documented

New docs should lead with code. Prefer showing:

- The `createSnapshot` runtime setup.
- The hook or component import.
- A minimal React usage example.
- The relevant type or option names.

Avoid documenting generated output as the primary API. Generated hooks are
useful project code, but the stable package surface is the runtime, UI, Vite,
SSR, and CLI entry points listed above.
