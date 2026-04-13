---
title: SDK Apps
description: Build custom React applications on top of Snapshot's SDK and generated outputs.
draft: false
---

Use the SDK path when you want custom React and want Snapshot to provide the platform primitives around it.

This path is best when you want:

- a typed runtime created by `createSnapshot`
- auth, MFA, passkey, OAuth, account, and session primitives
- generated API client output and sync workflows
- community, webhook, websocket, SSE, and push integrations
- the option to embed Snapshot UI surfaces without giving up custom React

## Read In This Order

Start with these source-backed references:

- [SDK Reference](/reference/sdk/)
- [CLI Reference](/reference/cli/)
- [Vite Reference](/reference/vite/)
- [Community and Realtime](/integrate/community-and-realtime/)
- [Content and Media](/integrate/content-and-media/)
- [Examples and Showcase](/examples/)

Canonical source for this surface lives in:

- `src/index.ts`
- `src/create-snapshot.tsx`
- `src/api/client.ts`
- `src/auth/**`
- `src/community/**`
- `src/webhooks/**`
- `src/ws/**`
- `src/sse/**`
- `src/push/**`
- `src/cli/commands/**`
- `src/vite/index.ts`
- `src/plugin.ts`

## Typical SDK Flow

The normal SDK path is:

1. run sync against Bunshot so client types and generated hooks are current
2. create a Snapshot instance with `createSnapshot`
3. wire auth, session, account, and realtime primitives into your app shell
4. use community, webhook, websocket, SSE, and push surfaces where the product needs them
5. embed Snapshot UI surfaces only where they help, rather than rewriting solved components
6. add Vite or SSR helpers only if the application runtime needs them

## What To Reach For Next

- Use [Manifest Apps](/build/manifest-apps/) if the app starts shifting from bespoke React toward config-driven app assembly.
- Use [SSR and RSC](/integrate/ssr-rsc/) if the app needs server rendering, prefetch, PPR, or SSG integration.
- Use the generated reference when exact export shapes matter more than workflow guidance.

## Where SDK Builders Usually Need Concrete Examples

Use these showcase sections for source-backed examples:

- `communication` for chat, comments, reactions, emoji, GIF, presence, and typing
- `content` for markdown, editors, uploads, embeds, and comparison views
- `workflow` for richer operational surfaces that often get embedded into custom React
- `feed-chart-wizard` for charts, feed streams, and multistep flows

The canonical example source is still the playground:

- `playground/src/showcase.tsx`
- `playground/src/app.tsx`
- `playground/src/token-editor.tsx`
