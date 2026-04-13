---
title: Choose Your Path
description: Start from the right Snapshot workflow instead of scanning the repo.
draft: false
---

Snapshot has four primary personas. Many real apps will mix them, but you should still start from the persona that owns the core problem.

## Manifest App Builder

Use this path if the app shell, routes, navigation, resources, presets, workflows, and most screen composition should come from `snapshot.manifest.json`.

- Start with [Manifest Apps](/build/manifest-apps/)
- Then read [Styling and Slots](/build/styling-and-slots/)
- Then read [Manifest Reference](/reference/manifest/)
- Then use [UI Reference](/reference/ui/), [Components](/reference/components/), and [Examples and Showcase](/examples/)
- Then verify the broad capability inventory in [Capabilities](/start-here/capabilities/)

Most manifest builders will spend the most time in these showcase sections:

- `dashboard`
- `data`
- `forms`
- `navigation`
- `overlay`
- `presets`

## SDK App Builder

Use this path if you want custom React and want Snapshot to provide the platform runtime around it.

- Start with [SDK Apps](/build/sdk-apps/)
- Then read [SDK Reference](/reference/sdk/)
- Then read [CLI Reference](/reference/cli/) and [Vite Reference](/reference/vite/) if sync or bootstrapping is part of the app
- Then use [Community and Realtime](/integrate/community-and-realtime/) and [Content and Media](/integrate/content-and-media/)
- Then use [Examples and Showcase](/examples/)

Most SDK builders will care most about these showcase sections:

- `communication`
- `content`
- `workflow`
- `feed-chart-wizard`

## SSR / Platform Integrator

Use this path when Snapshot is being integrated with Bunshot SSR, manifest rendering, React Server Components, prefetch manifests, static params, PPR, or SSG.

- Start with [SSR and RSC](/integrate/ssr-rsc/)
- Then read [SSR Reference](/reference/ssr/) and [Vite Reference](/reference/vite/)
- Then confirm the currently documented platform inventory in [Capabilities](/start-here/capabilities/)

## Snapshot Contributor

Use this path if you are implementing Snapshot itself and need the repo-native discovery and docs-update workflow.

- Start with [Contributor Flow](/contribute/overview/)
- Then read [Contributor Testing](/contribute/testing/)
- Then read [Agent Flow](/contribute/agent-flow/)
- Then read the relevant surface `CLAUDE.md` plus generated reference for the area you are changing
- Then update the canonical showcase or top-level docs page that proves the visible behavior on `main`
