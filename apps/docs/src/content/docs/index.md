---
title: Snapshot Docs
description: Source-backed docs for building apps with Snapshot and contributing to the framework itself.
draft: false
---

Snapshot is the frontend counterpart to Bunshot. It gives you several ways to build on top of the same platform surface without having to rediscover the repo.

Snapshot currently supports:

- manifest-driven apps assembled from `snapshot.manifest.json`, built-in schemas, presets, resources, workflows, overlays, navigation, and tokenized theming
- SDK-driven apps built with `createSnapshot`, generated API client output, auth, community, webhook, websocket, SSE, and push primitives
- SSR and Vite integration for file-based React SSR, manifest rendering, RSC, prefetch, PPR, and SSG-oriented build flows
- plugin-driven extension through custom components, component groups, and schema generation
- a broad config-driven component catalog across data, forms, layout, navigation, overlays, content, media, communication, workflow, and commerce

## Start Here

- [Choose Your Path](/start-here/) routes each persona to the right entrypoint.
- [Capabilities](/start-here/capabilities/) is the generated high-level inventory of what exists on `main`.
- [Examples and Showcase](/examples/) maps current playground sections to real framework features.

The fastest routes are:

- manifest builders: [Manifest Apps](/build/manifest-apps/) then [Styling and Slots](/build/styling-and-slots/)
- SDK builders: [SDK Apps](/build/sdk-apps/) then the generated reference pages for SDK, CLI, and Vite
- SSR and platform integrators: [SSR and RSC](/integrate/ssr-rsc/) then the SSR and Vite reference pages
- contributors: [Contributor Flow](/contribute/overview/), [Contributor Testing](/contribute/testing/), and [Agent Flow](/contribute/agent-flow/)

## Canonical Source

The public docs are grounded in these source surfaces:

- `src/index.ts`
- `src/ui.ts`
- `src/ssr/index.ts`
- `src/vite/index.ts`
- `src/ui/manifest/schema.ts`
- `src/plugin.ts`
- `playground/src/showcase.tsx`

Use the persona guides for workflow and orientation. Use generated reference for exact exported shapes.
