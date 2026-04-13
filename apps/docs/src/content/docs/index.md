---
title: Snapshot Docs
description: Source-backed docs for building with Snapshot and contributing to the framework itself.
draft: false
---

Snapshot is the frontend counterpart to Bunshot. It gives you two main ways to build on top of the same platform surface:

- **Manifest-driven apps** built from `snapshot.manifest.json`, component schemas, presets, workflows, and tokenized theming
- **SDK-driven apps** built with `createSnapshot`, generated API clients and hooks, auth/community/webhook primitives, and custom React

Those two paths sit on top of the same underlying capabilities now shipping on `main`:

- manifest UI composition with routes, overlays, resources, workflows, shortcuts, sub-apps, and slot-based styling
- SDK bootstrap with auth, MFA, passkeys, OAuth, SSE, websocket, push, community, and webhook hooks
- SSR, manifest rendering, React Server Components support, and Vite plugins for app bootstrapping and sync
- a broad config-driven UI catalog covering data, forms, navigation, overlays, content, media, communication, workflow, and presets
- a playground showcase that exercises the current component surface in realistic compositions

## Start Here

- [Choose Your Path](/start-here/) routes each persona to the right docs entrypoint.
- [Capabilities](/start-here/capabilities/) is the generated high-level inventory of what exists on `main`.
- [Examples and Showcase](/examples/) maps the current playground sections to real framework features.

The fastest top-level jumps for most readers are:

- manifest builders: [Manifest Apps](/build/manifest-apps/) then `dashboard`, `data`, `forms`, `navigation`, `overlay`, and `presets` in the showcase
- SDK builders: [SDK Apps](/build/sdk-apps/) then `communication`, `content`, and `feed-chart-wizard` in the showcase
- platform integrators: [SSR and RSC](/integrate/ssr-rsc/) then [Capabilities](/start-here/capabilities/)
- contributors: [Contributor Flow](/contribute/overview/), [Contributor Testing](/contribute/testing/), then [Agent Flow](/contribute/agent-flow/)

## Canonical Source

The public docs are grounded in these source surfaces:

- `src/index.ts`
- `src/ui.ts`
- `src/ssr/index.ts`
- `src/vite/index.ts`
- `src/ui/manifest/schema.ts`
- `playground/src/showcase.tsx`

Use the persona guides for workflow and orientation. Use generated reference for exact exported shapes.
