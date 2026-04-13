---
title: SSR and RSC
description: Integrate Snapshot with Bunshot SSR, manifest rendering, prefetch, PPR, SSG, and React Server Components.
draft: false
---

Snapshot has dedicated SSR and Vite surfaces for server rendering and build integration.

Use this path when you need:

- file-based React SSR
- manifest-driven SSR
- React Server Components
- prefetch manifest generation
- static params support
- PPR and SSG-oriented build flows

## Read In This Order

Start with these references:

- [SSR Reference](/reference/ssr/)
- [Vite Reference](/reference/vite/)
- [SDK Apps](/build/sdk-apps/) if the app runtime is still being assembled
- [Capabilities](/start-here/capabilities/) if you need the current platform inventory first

Canonical source for this surface lives in:

- `src/ssr/index.ts`
- `src/ssr/render.ts`
- `src/ssr/renderer.ts`
- `src/ssr/manifest-renderer.ts`
- `src/ssr/rsc.ts`
- `src/ssr/ppr.ts`
- `src/ssr/ppr-cache.ts`
- `src/ssr/prefetch.ts`
- `src/vite/index.ts`

## Choosing The Right Integration Path

- Use `createReactRenderer` when the server should render file-based React routes.
- Use `createManifestRenderer` when the server should render routes from the Snapshot manifest.
- Use `snapshotApp` when a Vite app should boot directly from `snapshot.manifest.json`.
- Use `snapshotSync` when generated client output should stay aligned with Bunshot contracts.
- Use `snapshotSsr` when the build needs SSR, RSC, prefetch, PPR, or SSG-oriented integration.

## Practical Flow

Most SSR integrations follow this order:

1. choose whether the app is file-based React, manifest-driven, or hybrid
2. wire the client bootstrap with the relevant Vite plugin surface
3. wire the server renderer with the matching Snapshot SSR surface
4. add RSC, prefetch, PPR, or SSG only if the runtime actually needs them
5. validate the resulting contract against the generated SSR and Vite reference

If you only need a client app with manifest-driven rendering, do not start here. Start in [Manifest Apps](/build/manifest-apps/).
