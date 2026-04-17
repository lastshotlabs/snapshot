import type { PrefetchLinkProps } from "./schema";
/**
 * `<PrefetchLink>` — a prefetch primitive that renders a plain `<a>` anchor and
 * automatically injects `<link rel="prefetch">` tags for the matching route's JS
 * chunks and CSS files.
 *
 * Prefetch is triggered by the `prefetch` config field:
 * - `'hover'`    — prefetch when the user mouses over the link (default)
 * - `'viewport'` — prefetch as soon as the link scrolls into view
 * - `'none'`     — no automatic prefetching
 *
 * This component renders a plain `<a>` tag and does **not** import TanStack
 * Router's `<Link>`. It is a prefetch primitive — consumers wire their own router.
 * This design avoids a peer dependency on TanStack Router in the component library.
 *
 * @param config - Config object validated by `prefetchLinkSchema`.
 */
export declare function PrefetchLink(config: PrefetchLinkProps): import("react/jsx-runtime").JSX.Element;
