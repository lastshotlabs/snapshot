# CLI Reference

The Snapshot CLI scaffolds new applications and keeps your TypeScript API types in sync
with your bunshot backend's OpenAPI schema.

```sh
# Install globally
npm install -g @lastshotlabs/snapshot
# or use via bunx without installing
bunx @lastshotlabs/snapshot <command>
```

---

## `snapshot init`

Scaffolds a complete React application wired to a bunshot backend.

```sh
snapshot init [name] [dir] [flags]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Project name (becomes the page `<title>` and `package.json` name). Prompted if omitted. |
| `dir` | Output directory. Defaults to `./<package-name>`. |

### Flags

| Flag | Description |
|------|-------------|
| `-y, --yes` | Skip all prompts. Uses the defaults listed below. |
| `--template admin` | Scaffold the admin template instead of the standard app. |
| `--no-git` | Skip `git init` at the end of scaffolding. |

### Interactive prompts

When run without `--yes`, the scaffold walks you through:

| Prompt | Options | Default |
|--------|---------|---------|
| **Security profile** | `hardened` (recommended), `prototype` (local dev only) | `hardened` |
| **Layout** | `minimal` (bare shell), `top-nav` (header + links), `sidebar` (collapsible sidebar) | `top-nav` |
| **Theme** | `default` (neutral), `dark`, `minimal` (slate, small radius), `vibrant` (violet, saturated) | `default` |
| **Auth pages?** | yes / no | yes |
| **MFA pages?** | yes / no (only asked if auth pages = yes) | no |
| **Passkey pages?** | yes / no (only asked if auth pages = yes) | no |
| **shadcn components** | multiselect from the full list | recommended set |
| **WebSocket support?** | yes / no | yes |
| **Community pages?** | yes / no | no |
| **SSE onramp?** | yes / no | no |
| **bunshot-mail plugin?** | yes / no | no |
| **Git init?** | yes / no | yes |

**`--yes` defaults:**
Security = `hardened`, layout = `top-nav`, theme = `default`, auth pages = yes, MFA = yes,
passkeys = yes, components = recommended set, WebSocket = yes, community = no, SSE = no,
mail = no, git = yes.

### Security profiles

**`hardened`** — Production-ready. Uses httpOnly cookies for token storage, CSRF headers,
strict auth guards on all routes. Suitable for production deployment.

**`prototype`** — Stores the bearer token in `VITE_BEARER_TOKEN`. A runtime guard prevents
deployment to non-localhost origins (override with `VITE_ALLOW_PROTOTYPE_DEPLOYMENT=true`).
Use this for local development against a bunshot backend before auth is configured.

### What gets generated

```
my-app/
├── package.json                    # Bun workspace, deps: React, TanStack Router, TanStack Query, Jotai, etc.
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts                  # Vite + TanStack Router + snapshotSync() plugin
├── components.json                 # shadcn config
├── snapshot.config.json            # sync output paths
├── .env                            # VITE_API_URL placeholder (+ VITE_WS_URL if WebSocket)
├── index.html
│
├── src/
│   ├── main.tsx                    # App entry (Prototype mode adds a deployment guard here)
│   ├── lib/
│   │   ├── snapshot.ts             # createSnapshot() factory + all exports
│   │   ├── router.ts               # TanStack Router instance
│   │   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│   ├── styles/
│   │   └── globals.css             # Tailwind v4 @import + @theme block + CSS variables
│   ├── types/
│   │   └── api.ts                  # Shared API types (extended by sync)
│   ├── store/
│   │   └── ui.ts                   # UI state atoms (sidebar open, etc.)
│   │
│   ├── routes/                     # TanStack Router file-based routes
│   │   ├── __root.tsx              # Root route (providers, QueryClient, ToastContainer, ConfirmDialog)
│   │   ├── _authenticated.tsx      # Auth guard layout route
│   │   ├── _authenticated/
│   │   │   ├── index.tsx           # Home route (/)
│   │   │   └── settings/           # Settings routes (if auth pages)
│   │   ├── _guest.tsx              # Guest-only guard layout route
│   │   └── _guest/auth/            # Auth routes (if auth pages)
│   │       ├── login.tsx
│   │       ├── register.tsx
│   │       ├── forgot-password.tsx
│   │       ├── reset-password.tsx
│   │       ├── verify-email.tsx
│   │       └── oauth/callback.tsx
│   │
│   ├── pages/                      # Page components (imported by routes)
│   │   ├── HomePage.tsx
│   │   ├── auth/                   # Auth page components (if auth pages)
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ...
│   │   └── settings/               # Settings page components
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── RootLayout.tsx      # Top-level layout (sidebar, top-nav, or minimal)
│   │   │   ├── AuthLayout.tsx      # Centered card layout for auth pages
│   │   │   ├── PendingComponent.tsx
│   │   │   ├── ErrorComponent.tsx
│   │   │   ├── NotFoundComponent.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── ...                 # Layout-specific nav components
│   │   ├── ui/                     # Generated by shadcn (button, input, card, etc.)
│   │   └── shared/                 # Your shared custom components (empty, .gitkeep)
│   │
│   ├── hooks/
│   │   ├── api/                    # Generated by `snapshot sync` (empty until synced)
│   │   └── ...                     # Your custom hooks
│   │
│   └── api/                        # Generated by `snapshot sync` (empty until synced)
│
├── server-plugins/
│   └── mail.ts                     # bunshot-mail config (only if mail plugin selected)
│
└── .gitignore
```

**Not generated — auto-created when running the app:**

- `routeTree.gen.ts` — TanStack Router generates this on first `bun dev`. TypeScript will
  show an error for it until you run the dev server once.

### After scaffolding

```sh
cd my-app

# 1. Fill in .env
#    VITE_API_URL=http://localhost:3001   ← your bunshot backend
#    VITE_WS_URL=ws://localhost:3001/chat ← if WebSocket was selected

# 2. Start dev server (also auto-syncs if schema.json exists)
bun dev

# 3. Generate typed API hooks from your backend
bun run sync
```

### Admin template

```sh
snapshot init my-admin --template admin
```

The admin template is a thinner scaffold tuned for internal tools — no auth pages or
feature selection prompts. Generates the same core structure with an admin-focused layout.

---

## `snapshot sync`

Reads your bunshot backend's OpenAPI schema and generates typed TypeScript types and
React Query hooks.

```sh
snapshot sync [flags]
```

### Flags

| Flag | Description |
|------|-------------|
| `--api <url>` | Fetch OpenAPI schema from a running API (e.g. `http://localhost:3000`) |
| `--file <path>` | Read OpenAPI schema from a local JSON file (e.g. `./schema.json`) |
| `-w, --watch` | Re-run sync whenever the schema file changes (only works with `--file`) |
| `--zod` | Generate Zod validators alongside mutation hooks |
| `--api-dir <path>` | Override the API implementation output directory |
| `--hooks-dir <path>` | Override the React Query hooks output directory |
| `--types-path <path>` | Override the TypeScript types output path |
| `--snapshot-import <name>` | Override the import alias for `@lib/snapshot` |

Either `--api` or `--file` is required. `--api` fetches `/openapi.json` from the URL.

### What gets generated

Given an OpenAPI schema, sync writes to the paths configured in `snapshot.config.json`:

```json
{
  "apiDir": "src/api",
  "hooksDir": "src/hooks/api",
  "typesPath": "src/types/api.ts",
  "snapshotImport": "@lib/snapshot"
}
```

**`src/types/api.ts`** — TypeScript interfaces for every schema object:

```ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserBody {
  name: string;
  email: string;
}
```

**`src/api/`** — Typed API functions (one file per tag group):

```ts
// src/api/users.ts
export const getUsers = (api: ApiClient) => () =>
  api.get<User[]>("/users");

export const createUser = (api: ApiClient) => (body: CreateUserBody) =>
  api.post<User>("/users", body);
```

**`src/hooks/api/`** — React Query hooks (one file per tag group):

```ts
// src/hooks/api/users.ts
export function useUsers() {
  const { api, queryClient } = useSnapshot();
  return useQuery({ queryKey: ["users"], queryFn: getUsers(api) });
}

export function useCreateUser() {
  const { api, queryClient } = useSnapshot();
  return useMutation({
    mutationFn: createUser(api),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
```

If `--zod` is passed, a Zod schema is also generated for each response type:

```ts
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
});
```

### Watch mode

```sh
snapshot sync --file ./schema.json --watch
```

Polls the file for changes and re-runs sync on every update. Good for a workflow where
your bunshot backend writes `schema.json` on restart.

For live schema updates from a running API, use the Vite plugin instead — it integrates
with the dev server's file watcher.

### Running manually vs. automatically

Scaffolded apps include a `sync` script in `package.json`:

```sh
bun run sync   # runs snapshot sync --file ./schema.json
```

The Vite plugin runs sync automatically on `bun dev` when `schema.json` exists. See
the [Vite plugin section](#snapshot-vite-plugin) below.

---

## snapshot.config.json

Controls where `snapshot sync` writes its output. Generated by `snapshot init` and
placed at the project root.

```json
{
  "apiDir": "src/api",
  "hooksDir": "src/hooks/api",
  "typesPath": "src/types/api.ts",
  "snapshotImport": "@lib/snapshot"
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `apiDir` | `src/api` | Where to write the typed API functions |
| `hooksDir` | `src/hooks/api` | Where to write the React Query hooks |
| `typesPath` | `src/types/api.ts` | Where to write the TypeScript interfaces |
| `snapshotImport` | `@lib/snapshot` | Import alias for the snapshot instance in generated hooks |

All paths are relative to the project root (where `snapshot.config.json` lives).

---

## Snapshot Vite Plugin

The `snapshotSync` Vite plugin runs `snapshot sync` automatically as part of the dev
server. Scaffolded apps include it in `vite.config.ts`:

```ts
import { snapshotSync } from "@lastshotlabs/snapshot/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    TanStackRouterVite({ routesDirectory: "src/routes" }),
    snapshotSync({ file: "schema.json" }),
  ],
});
```

### Options

```ts
snapshotSync({
  file?: string,    // Local schema file path. When set, watches for changes.
  apiUrl?: string,  // Fetch schema from a running API. Falls back to VITE_API_URL.
  zod?: boolean,    // Generate Zod validators. Default: false.
})
```

### Behavior

- **On `bun dev` start**: runs sync once if the schema file exists. If the file doesn't
  exist yet, logs a warning and skips — no error.
- **On schema file change**: re-runs sync automatically (file watcher integration).
- **On `bun build`**: runs sync once at build start.

For live polling against a running API (not a local file), use `snapshot sync --watch`
from the CLI instead — the Vite plugin's file watcher can't poll remote URLs.

---

## Environment variables

Scaffolded apps read these from `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Base URL of your bunshot backend (e.g. `http://localhost:3001`) |
| `VITE_WS_URL` | If WebSocket selected | Full WebSocket endpoint URL (e.g. `ws://localhost:3001/chat`) |
| `VITE_BEARER_TOKEN` | Prototype mode only | API bearer token for prototype security profile |
| `VITE_ALLOW_PROTOTYPE_DEPLOYMENT` | Optional | Set to `true` to allow prototype-mode app on non-localhost origin |

Copy `.env` to `.env.local` for local overrides — `.env.local` is gitignored.

---

## Generated `src/lib/snapshot.ts`

The snapshot library file wires `createSnapshot()` and re-exports everything your app
needs. You import from `@lib/snapshot` throughout your app (aliased via `vite.config.ts`).

```ts
import {
  // Auth
  useUser,
  useLogin,
  useLogout,
  useRegister,
  usePasswordReset,
  // Data hooks (added by snapshot sync)
  // e.g. useUsers, useCreateUser, useProducts, ...
  // Theme
  useTheme,
  // Real-time
  useSocket,
  // Config-driven UI
  QueryProvider,
  // Low-level escape hatches
  api,
  queryClient,
  tokenStorage,
} from "@lib/snapshot";
```

`createSnapshot()` is called once in this file — all hooks are closures over the single
instance. You never call `createSnapshot()` yourself.

---

## Troubleshooting

**TypeScript error on `routeTree.gen.ts`**

This file is auto-generated by TanStack Router on the first `bun dev`. Run `bun dev`
once and the error disappears. Add `routeTree.gen.ts` to `.gitignore` (already done by
the scaffold).

**`bun run sync` fails with "schema not found"**

Drop `schema.json` into your project root first, or point sync at your running API:
`snapshot sync --api http://localhost:3001`.

**Types are stale after backend changes**

Run `bun run sync` (or let the Vite plugin do it automatically when `schema.json`
changes). If using `--watch`, the file must change on disk — bunshot writes
`schema.json` on backend restart by default.

**`VITE_API_URL` is undefined at runtime**

Vite only exposes `import.meta.env.VITE_*` variables. If your variable name doesn't
start with `VITE_`, it's stripped from the bundle. Rename it.

**Auth redirects loop**

The `_authenticated.tsx` route checks for a valid session and redirects to `/auth/login`
if missing. The `_guest.tsx` route redirects to `/` if a session exists. If you're
looping, check that your bunshot backend's session endpoint (`/auth/me` or equivalent)
returns the expected shape — `useUser()` returning `null` or an error triggers the
redirect.
