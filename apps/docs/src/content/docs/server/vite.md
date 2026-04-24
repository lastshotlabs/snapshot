---
title: Vite Plugin
description: Snapshot Vite plugins for app bootstrapping, sync, and SSR build integration.
draft: false
---

Snapshot ships three Vite plugins for different integration needs.

## snapshotApp

Boot a Snapshot app directly from a manifest file:

```tsx
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { snapshotApp } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotApp({
      manifest: "./snapshot.manifest.json",
      apiUrl: "/api",
    }),
  ],
});
```

This plugin:
- Loads and validates the manifest at build time
- Generates the app entry point
- Sets up hot-reload for manifest changes in development

## snapshotSync

Keep generated client output aligned with Bunshot API contracts:

```tsx
// vite.config.ts
import { snapshotSync } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotSync({
      contractUrl: "http://localhost:3000/api/contract",
      outputDir: "./src/generated",
    }),
  ],
});
```

This plugin:
- Fetches the OpenAPI contract from the Bunshot server
- Generates TypeScript types, API client, TanStack Query hooks, and Zod schemas
- Watches for contract changes in development

Equivalent to running `bunx snapshot sync` manually.

## snapshotSsr

Build integration for SSR, RSC, prefetch, PPR, and SSG:

```tsx
// vite.config.ts
import { snapshotSsr } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotSsr({
      ssr: true,
      rsc: true,
      prefetch: true,
    }),
  ],
});
```

This plugin:
- Configures Vite for server-side rendering
- Sets up RSC transform when enabled
- Generates prefetch manifests at build time
- Handles PPR shell extraction and caching

## Combined setup

A typical production setup uses all three:

```tsx
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { snapshotApp, snapshotSync, snapshotSsr } from "@lastshotlabs/snapshot/vite";

export default defineConfig({
  plugins: [
    react(),
    snapshotApp({ manifest: "./snapshot.manifest.json", apiUrl: "/api" }),
    snapshotSync({ contractUrl: "http://localhost:3000/api/contract", outputDir: "./src/generated" }),
    snapshotSsr({ ssr: true, prefetch: true }),
  ],
});
```

## Next steps

- [SSR and RSC](/server/ssr-rsc/) -- server rendering guide
- [Vite Reference](/reference/vite/) -- complete plugin API reference
- [Quick Start](/start-here/) -- getting started with Snapshot
