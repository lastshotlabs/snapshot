---
title: Vite Plugin
description: Snapshot Vite plugins for OpenAPI sync and SSR build integration.
draft: false
---

Snapshot exposes Vite helpers from `@lastshotlabs/snapshot/vite`.

## snapshotSync

Run OpenAPI sync during Vite startup/build:

```tsx
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { snapshotSync } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotSync({ file: "./schema.json", zod: true }),
  ],
});
```

Use the CLI for live API polling:

```sh
snapshot sync --api http://localhost:3000 --watch
```

## snapshotSsr

Add Snapshot SSR build helpers:

```tsx
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { snapshotSsr } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    ...snapshotSsr({
      rsc: true,
      ppr: true,
    }),
  ],
});
```

`snapshotSsr()` configures client/server build output and can generate route
prefetch metadata, static route metadata, RSC metadata, and PPR route metadata.

## Combined Setup

```tsx
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { snapshotSync, snapshotSsr } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotSync({ file: "./schema.json" }),
    ...snapshotSsr({ rsc: true }),
  ],
});
```

## Next Steps

- [SSR and RSC](/server/ssr-rsc/)
- [Vite Reference](/reference/vite/)
- [Quick Start](/start-here/)
