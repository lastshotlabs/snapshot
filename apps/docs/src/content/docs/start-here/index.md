---
title: Choose Your Path
description: The fastest route through Snapshot depends on what you are trying to build.
draft: false
---

Snapshot has four primary personas.

## Manifest App Builder

Use this path if you want the app to be driven mostly by `snapshot.manifest.json`, built-in component schemas, workflows, and tokenized theme configuration.

- Start with [Manifest Apps](/build/manifest-apps/)
- Then read [Styling and Slots](/build/styling-and-slots/)
- Then read [Manifest Reference](/reference/manifest/)
- Then use [UI Reference](/reference/ui/), [Components](/reference/components/), and [Content and Media](/integrate/content-and-media/)
- Then use [Examples and Showcase](/examples/)

Most manifest builders will end up using these canonical example sections:

- `dashboard`, `data`, `forms`, `navigation`, `overlay`, `workflow`, `presets`

## SDK App Builder

Use this path if you want custom React while Snapshot handles auth, generated API access, community/webhook integrations, realtime plumbing, and sync output.

- Start with [SDK Apps](/build/sdk-apps/)
- Then read [SDK Reference](/reference/sdk/)
- Then read [Vite Reference](/reference/vite/) if your app bootstraps or syncs through Vite
- Then look at [Community and Realtime](/integrate/community-and-realtime/) and [Content and Media](/integrate/content-and-media/)
- Then use [CLI Reference](/reference/cli/) and [Examples and Showcase](/examples/)

Most SDK builders will care most about these example sections:

- `communication`, `content`, `overlay`, `feed-chart-wizard`

## SSR / Platform Integrator

Use this path if Snapshot is being integrated with Bunshot SSR, manifest rendering, prefetch manifests, static params, or RSC.

- Start with [SSR and RSC](/integrate/ssr-rsc/)
- Then read [SSR Reference](/reference/ssr/) and [Vite Reference](/reference/vite/)
- Then verify capability coverage in [Capabilities](/start-here/capabilities/)

## Snapshot Contributor

Use this path if you are implementing Snapshot itself and need the repo-native discovery and docs-update workflow.

- Start with [Contributor Flow](/contribute/overview/)
- Then read [Contributor Testing](/contribute/testing/)
- Then read [Agent Flow](/contribute/agent-flow/)
- Then read the relevant surface `CLAUDE.md` plus generated reference for the area you are changing
- Then update the canonical showcase or docs example that proves the visible behavior on `main`
