---
title: Snapshot
description: Build code-first React apps on Bunshot with auth, realtime, generated hooks, and standalone UI.
draft: false
---

Snapshot is a code-first React SDK for Bunshot-powered apps. Create one runtime
with `createSnapshot({ apiUrl })`, compose hooks in React, and import UI from
`@lastshotlabs/snapshot/ui`.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import { ButtonBase, CardBase } from "@lastshotlabs/snapshot/ui";

const snap = createSnapshot({
  apiUrl: "/api",
});

function App() {
  const { user, isLoading } = snap.useUser();
  if (isLoading) return null;
  if (!user) return <LoginPage />;

  return (
    <CardBase>
      <h1>Welcome, {user.email}</h1>
      <ButtonBase label="Open dashboard" />
    </CardBase>
  );
}
```

## What You Get

- Auth, MFA, OAuth, passkey, account, community, webhook, WebSocket, SSE, and
  routing hooks from one runtime instance.
- A low-level API client plus TanStack Query cache access.
- OpenAPI sync for typed API helpers and React Query hooks.
- Standalone UI components with typed props, slots, and Snapshot design tokens.
- Vite helpers for sync, SSR, RSC, PPR, prefetch metadata, and static route
  metadata.
- CLI commands for scaffolding and sync.

## Learning Path

1. [Installation](/start-here/installation/)
2. [Quick Start](/start-here/)
3. [Core Concepts](/start-here/core-concepts/)
4. [Authentication](/guides/authentication/)
5. [Component Overview](/build/component-library/)
6. [SSR and RSC](/server/ssr-rsc/)

## Reference

| Need | Where to go |
| --- | --- |
| Runtime API | [SDK Reference](/reference/sdk/) |
| UI exports | [UI Reference](/reference/ui/) |
| Components | [Component Reference](/reference/components/) |
| Vite plugins | [Vite Reference](/reference/vite/) |
| SSR helpers | [SSR Reference](/reference/ssr/) |
| CLI | [CLI Reference](/reference/cli/) |
