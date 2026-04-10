# React Server Components (RSC)

React Server Components let you split your component tree into two worlds:

- **Server components** — run on the server, output HTML + an RSC payload. Zero JavaScript sent to the browser for these components.
- **Client components** — ship to the browser and hydrate. Marked with a `'use client'` directive.
- **Shared components** — no directive. Can run on either side. Must not use browser-only APIs or server-only APIs.

RSC in Snapshot is opt-in. Enable it by setting `rsc: true` in `snapshotSsr()`.

---

## Enabling RSC

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { snapshotSsr } from '@lastshotlabs/snapshot/vite';

export default defineConfig({
  plugins: [
    react(),
    snapshotSsr({ rsc: true }),
  ],
});
```

This does three things automatically:

1. Adds the `rscTransform()` Vite plugin to the build pipeline.
2. Adds the `react-server` export condition to the server build so RSC-aware packages resolve their server entry points.
3. Generates `rsc-manifest.json` in the server output directory after the server bundle is assembled.

### Peer dependency

RSC requires `react-server-dom-webpack` (the most stable RSC runtime available with Vite):

```sh
bun add -D react-server-dom-webpack
```

It is declared as an optional peer dependency. You do not need it if you are not using RSC.

## Enabling RSC from the manifest

If you are using the manifest renderer (`createManifestRenderer()`), you can
enable RSC directly from `snapshot.manifest.json` without changing any
TypeScript:

```json
{
  "ssr": {
    "rsc": true,
    "rscManifestPath": "./dist/server/rsc-manifest.json"
  }
}
```

The manifest renderer automatically loads the RSC manifest from
`rscManifestPath` at server startup and passes it to `renderPage()`.

You still need `snapshotSsr({ rsc: true })` in your `vite.config.ts` so the
build generates `rsc-manifest.json` and applies the RSC transform.

---

## The `'use client'` directive

Add `'use client'` as the first line of any component that:

- Uses React hooks (`useState`, `useEffect`, etc.)
- Handles browser events (`onClick`, `onChange`, etc.)
- Uses browser-only APIs (`window`, `document`, `localStorage`, etc.)

```tsx
// src/components/LikeButton.tsx
'use client';

import { useState } from 'react';

export function LikeButton({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      ♥ {count}
    </button>
  );
}
```

In the **server build**, this file is replaced with a stub:

```ts
// Auto-generated RSC server stub — do not edit.
import { createClientReference } from 'react-server-dom-webpack/server';
export const LikeButton = createClientReference('src/components/LikeButton.tsx#LikeButton');
```

In the **client build**, the file ships unchanged. The browser receives the real component code and hydrates it.

---

## The RSC manifest

After `vite build --ssr`, Snapshot writes `rsc-manifest.json` to your server output directory (default: `dist/server/rsc-manifest.json`).

```json
{
  "components": {
    "src/components/LikeButton.tsx#LikeButton": "assets/LikeButton-Bx2kLm9a.js",
    "src/components/PostCard.tsx#default": "assets/PostCard-Lm9aBx2k.js"
  }
}
```

**Key format:** `"{relativePath}#{exportName}"` — where `relativePath` is the file path relative to the Vite project root and `exportName` is the export name (`"default"` for default exports).

**Value format:** The hashed chunk URL from the Vite client manifest. The RSC runtime embeds this URL in the flight payload so the browser knows which JS file to load for each client component.

### Loading the manifest at runtime

```ts
// server/middleware/ssr.ts
import { readFileSync } from 'node:fs';
import type { RscManifest } from '@lastshotlabs/snapshot/ssr';

const rscManifest: RscManifest = JSON.parse(
  readFileSync('./dist/server/rsc-manifest.json', 'utf-8'),
);
```

---

## RSC rendering with `renderPage()`

Pass the loaded manifest to `renderPage()` via the `rscOptions` parameter:

```ts
import { renderPage } from '@lastshotlabs/snapshot/ssr';
import type { RscOptions } from '@lastshotlabs/snapshot/ssr';

const rscOptions: RscOptions = { manifest: rscManifest };

const response = await renderPage(element, context, shell, 5000, rscOptions);
```

When `rscOptions` is provided, `renderPage()` performs a **two-pass RSC render**:

1. **Pass 1:** The React tree is rendered to the RSC flight format using `react-server-dom-webpack/server`. Client components (`'use client'`) become serialized references with their chunk URLs.
2. **Pass 2:** The RSC flight stream is piped through `react-dom/server` to produce the HTML response.

When `rscOptions` is omitted, `renderPage()` falls back to the standard single-pass `react-dom/server` render. Existing SSR setups are unaffected.

---

## Zero-JS server components

Server components never appear in the browser JS bundle. A component like this:

```tsx
// src/components/PostBody.tsx
// No 'use client' directive — this is a server component.

import { db } from '../db';

export async function PostBody({ slug }: { slug: string }) {
  const post = await db.posts.findBySlug(slug);
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

...contributes zero bytes to the client bundle. Its HTML output is streamed from the server and embedded in the RSC payload.

---

## Migration from regular SSR

If you are currently using Snapshot SSR without RSC:

1. Add `rsc: true` to `snapshotSsr()` in your Vite config.
2. Add `react-server-dom-webpack` as a dev dependency.
3. Run both build commands: `vite build` (client) then `vite build --ssr` (server).
4. Load `rsc-manifest.json` in your server middleware and pass it to `renderPage()`.
5. Mark any component that uses hooks or browser APIs with `'use client'`.

All components that lack a directive are treated as server components by default. Start by auditing components that use `useState`, `useEffect`, or browser-specific APIs — those need `'use client'`.

---

## Limitations

- **No `AsyncLocalStorage` in server components on edge runtimes.** Cloudflare Workers and Deno Deploy do not support `AsyncLocalStorage`. The Snapshot cache primitive (`cache()`) uses `AsyncLocalStorage` under the hood. Avoid using `cache()` inside server components when targeting edge runtimes.
- **Props must be serializable.** Data passed from a server component to a client component (`'use client'`) must be JSON-serializable. Functions, class instances, and `undefined` values cannot cross the server/client boundary.
- **No direct DOM access in server components.** Server components run on the server only. `window`, `document`, and other browser globals are unavailable.
- **`react-server-dom-webpack` version pinning.** The RSC protocol is not yet stable. Pin your `react-server-dom-webpack` version to match your installed `react` and `react-dom` versions. Mismatches cause runtime errors.

---

## API reference

### `RscManifest`

```ts
interface RscManifest {
  readonly components: Readonly<Record<string, string>>;
}
```

Maps client component IDs to their output chunk URLs. Generated at build time by `snapshotSsr({ rsc: true })`.

### `RscOptions`

```ts
interface RscOptions {
  readonly manifest: RscManifest;
}
```

Passed to `renderPage()` to enable RSC two-pass rendering.

### `hasUseClientDirective(code: string): boolean`

Returns `true` if the source file begins with a `'use client'` directive.

### `hasUseServerDirective(code: string): boolean`

Returns `true` if the source file begins with a `'use server'` directive.

### `buildComponentId(relativePath: string, exportName: string): string`

Builds a component ID string in the format `"{relativePath}#{exportName}"`.
