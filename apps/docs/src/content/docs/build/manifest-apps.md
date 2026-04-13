---
title: Manifest Apps
description: Build apps from Snapshot's manifest runtime with minimal custom React.
draft: false
---

Use the manifest path when the application should be assembled primarily from `snapshot.manifest.json`.

This path is best when you want:

- routes, navigation, auth wiring, and runtime behavior declared in config
- built-in components, presets, actions, overlays, and workflows
- token-driven theming, slots, and stateful styling
- rich UI composition without writing bespoke React for every screen

## Read In This Order

Start with these source-backed references:

- [Manifest Reference](/reference/manifest/)
- [Styling and Slots](/build/styling-and-slots/)
- [UI Reference](/reference/ui/)
- [Component Catalog](/reference/components/)
- [Examples and Showcase](/examples/)
- [Capabilities](/start-here/capabilities/)

Canonical source for the manifest contract lives in:

- `src/ui/manifest/schema.ts`
- `src/ui/manifest/index.ts`
- `src/ui/manifest/types.ts`
- `src/ui/components/**/schema.ts`
- `src/ui/components/_base/schema.ts`
- `src/ui/components/_base/style-surfaces.ts`
- `src/ui/presets/**`

If prose and source disagree, trust those files.

## Typical Build Flow

Most manifest-first apps follow this order:

1. define `app`, `theme`, `resources`, `workflows`, `overlays`, and any plugin-provided component groups
2. define routes, navigation, route guards, and auth behavior
3. compose pages from built-in components, entity-page helpers, or presets
4. refine presentation through tokens, `slots`, and stateful styling
5. validate against the generated manifest and component reference
6. compare against the canonical showcase before assuming a pattern exists

## Where To Look For Real Coverage

Current high-signal manifest compositions live in:

- `playground/src/showcase.tsx`
- `src/ui/presets/**`
- `src/ui/entity-pages/**`
- `src/ui/components/**/schema.ts`

Use these showcase sections for the shortest path to real compositions:

- `dashboard` for KPI shells, stat cards, and summary layouts
- `data` for operational tables, filters, detail cards, and row actions
- `forms` for input contracts, quick-entry flows, and field state behavior
- `navigation` and `overlay` for app-shell interactions
- `presets` for larger composed screens

## When To Leave The Manifest Path

If you need custom React for a small part of the app, that does not invalidate the manifest-first approach. Many apps will combine:

- manifest-driven shell and page composition
- SDK hooks for domain logic
- SSR or Vite helpers for deployment needs

When that happens, keep the app-builder flow narrow:

- stay in this guide for manifest shape and UI composition
- move to [SDK Apps](/build/sdk-apps/) only for the custom React surface
- move to [SSR and RSC](/integrate/ssr-rsc/) only if the deployment/runtime integration actually needs it
