---
title: Vite Reference
description: Generated from src/vite/index.ts and the declarations it re-exports.
draft: false
---

Generated from `src/vite/index.ts`.

| Export | Kind | Source | Description |
|---|---|---|---|
| `snapshotApp` | function | `src/vite/index.ts` | Vite plugin that boots a manifest-driven Snapshot app from `snapshot.manifest.json`.  The plugin injects a virtual app entry, wires `ManifestApp`, handles manifest hot reload during development, and emits a static `index.html` during build. |
| `SnapshotAppOptions` | interface | `src/vite/index.ts` | Options for `snapshotApp()`, the manifest-driven Snapshot app Vite plugin. |
| `snapshotSsr` | function | `src/vite/index.ts` | Vite plugin for SSR builds with Snapshot.  When added to the Vite config, it: 1. Enables Vite's manifest output (`build.manifest: true`) for client builds    so that bunshot-ssr can inject hashed asset URLs into the SSR HTML. 2. Configures the server bundle output directory when `vite build --ssr` is run. 3. Generates `dist/client/prefetch-manifest.json` after the client build, mapping    URL patterns to JS chunk and CSS file URLs for `<PrefetchLink>` prefetching.  **Two build commands are required:** - `vite build` → client bundle in `dist/client/` + `.vite/manifest.json` - `vite build --ssr` → server bundle in `dist/server/`  Add both to your `package.json`: ```json {   "scripts": {     "build:client": "vite build",     "build:server": "vite build --ssr src/ssr/entry-server.ts",     "build": "bun run build:client && bun run build:server"   } } ``` |
| `SnapshotSsrOptions` | interface | `src/vite/index.ts` | Options for the `snapshotSsr()` Vite plugin. |
| `snapshotSync` | function | `src/vite/index.ts` | Vite plugin that runs Snapshot's OpenAPI sync step during the Vite lifecycle.  Use this when a frontend project should regenerate API types and hooks from a Bunshot schema file or backend endpoint at startup. |
| `SnapshotSyncOptions` | interface | `src/vite/index.ts` | Options for `snapshotSync()`, Snapshot's Vite-driven Bunshot sync plugin. |
| `staticParamsPlugin` | function | `src/vite/index.ts` | Vite plugin that scans the server routes directory for `generateStaticParams` exports at build time and writes `static-params.json` to the client output directory.  `static-params.json` is a build-time artifact consumed by the ISR pre-renderer and by deployment tooling. It maps route patterns to their enumerated param sets.  This plugin runs during the `buildEnd` hook and only fires for client builds (not the SSR bundle build). It is automatically included in the plugin array returned by `snapshotSsr()` — you do not need to add it manually. |

## Details

#### `snapshotApp(opts?: SnapshotAppOptions) => Plugin<any>`

Vite plugin that boots a manifest-driven Snapshot app from
`snapshot.manifest.json`.

The plugin injects a virtual app entry, wires `ManifestApp`, handles
manifest hot reload during development, and emits a static `index.html`
during build.

**Parameters:**

| Name | Description |
|------|-------------|
| `opts` | Manifest app bootstrap options |

**Returns:** A Vite plugin for serving or building a Snapshot manifest app

---

#### `snapshotSsr(opts?: SnapshotSsrOptions) => Plugin<any>[]`

Vite plugin for SSR builds with Snapshot.

When added to the Vite config, it:
1. Enables Vite's manifest output (`build.manifest: true`) for client builds
   so that bunshot-ssr can inject hashed asset URLs into the SSR HTML.
2. Configures the server bundle output directory when `vite build --ssr` is run.
3. Generates `dist/client/prefetch-manifest.json` after the client build, mapping
   URL patterns to JS chunk and CSS file URLs for `<PrefetchLink>` prefetching.

**Two build commands are required:**
- `vite build` → client bundle in `dist/client/` + `.vite/manifest.json`
- `vite build --ssr` → server bundle in `dist/server/`

Add both to your `package.json`:
```json
{
  "scripts": {
    "build:client": "vite build",
    "build:server": "vite build --ssr src/ssr/entry-server.ts",
    "build": "bun run build:client && bun run build:server"
  }
}
```

**Parameters:**

| Name | Description |
|------|-------------|
| `opts` | Optional configuration. All fields have defaults. |

**Returns:** A Vite `Plugin` object.

**Example:**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { snapshotSync, snapshotSsr } from '@lastshotlabs/snapshot/vite'

export default defineConfig({
  plugins: [
    react(),
    snapshotSync({ file: './openapi.json' }),
    snapshotSsr(),
  ],
})
```

---

#### `snapshotSync(opts?: SnapshotSyncOptions) => Plugin<any>`

Vite plugin that runs Snapshot's OpenAPI sync step during the Vite
lifecycle.

Use this when a frontend project should regenerate API types and hooks
from a Bunshot schema file or backend endpoint at startup.

**Parameters:**

| Name | Description |
|------|-------------|
| `opts` | Sync source and generation options |

**Returns:** A Vite plugin that invokes Snapshot sync at build start

---

#### `staticParamsPlugin(opts: StaticParamsPluginOptions) => Plugin<any>`

Vite plugin that scans the server routes directory for `generateStaticParams`
exports at build time and writes `static-params.json` to the client output
directory.

`static-params.json` is a build-time artifact consumed by the ISR pre-renderer
and by deployment tooling. It maps route patterns to their enumerated param sets.

This plugin runs during the `buildEnd` hook and only fires for client builds
(not the SSR bundle build). It is automatically included in the plugin array
returned by `snapshotSsr()` — you do not need to add it manually.

**Parameters:**

| Name | Description |
|------|-------------|
| `opts` | Plugin configuration. |

**Returns:** A Vite `Plugin` object.

**Example:**

```ts
Standalone usage (if needed outside snapshotSsr)
```ts
import { staticParamsPlugin } from '@lastshotlabs/snapshot/vite'

// vite.config.ts
export default defineConfig({
plugins: [staticParamsPlugin({ clientOutDir: 'dist/client' })],
})
```
```

---
