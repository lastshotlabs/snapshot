---
title: SSR and RSC
description: Server-side rendering, React Server Components, prefetch, PPR, and SSG with Snapshot.
draft: false
---

Snapshot SSR helpers are exported from `@lastshotlabs/snapshot/ssr`.

## File-Based React SSR

```tsx
import { createReactRenderer } from "@lastshotlabs/snapshot/ssr";

const renderer = createReactRenderer({
  routesDir: "./server/routes",
});
```

## React Server Components

Enable the Vite transform with `snapshotSsr({ rsc: true })`, then pass RSC
options to `renderPage()` where your server renderer needs them.

```tsx
import {
  buildComponentId,
  hasUseClientDirective,
  hasUseServerDirective,
  renderPage,
} from "@lastshotlabs/snapshot/ssr";
```

## Route Prefetching

```tsx
import { usePrefetchRoute } from "@lastshotlabs/snapshot/ssr";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const prefetch = usePrefetchRoute();

  return (
    <a href={href} onMouseEnter={() => prefetch(href)}>
      {children}
    </a>
  );
}
```

## Partial Prerendering

```tsx
import {
  createPprCache,
  extractPprShell,
  renderPprPage,
} from "@lastshotlabs/snapshot/ssr";

const cache = createPprCache();
const shell = await extractPprShell(<App />);
cache.set("/dashboard", shell);

const response = await renderPprPage({
  cache,
  url: "/dashboard",
  component: <App />,
});
```

## Integration Path

| Scenario | Use |
| --- | --- |
| File-based React routes | `createReactRenderer` |
| RSC detection | `hasUseClientDirective`, `hasUseServerDirective`, `buildComponentId` |
| Route prefetch | `usePrefetchRoute` |
| Partial prerendering | `extractPprShell`, `createPprCache`, `renderPprPage` |

## Next Steps

- [Vite Plugin](/server/vite/)
- [SSR Reference](/reference/ssr/)
- [Vite Reference](/reference/vite/)
