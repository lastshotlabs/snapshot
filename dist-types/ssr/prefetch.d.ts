/**
 * Returns a callback that prefetches the JS chunks and CSS files for a given
 * URL path by injecting `<link rel="prefetch">` tags into `document.head`.
 *
 * The prefetch manifest (`/prefetch-manifest.json`) is loaded once per page
 * load and cached. Duplicate prefetch injections for the same URL are suppressed.
 *
 * Safe to call during SSR — all `document` access is guarded. The returned
 * function is a no-op on the server.
 *
 * @returns A stable callback `(path: string) => void`. Call it with the URL path
 *   to prefetch (e.g. `"/posts/my-slug"`).
 *
 * @example
 * ```tsx
 * function MyLink() {
 *   const prefetch = usePrefetchRoute();
 *   return (
 *     <a href="/posts" onMouseEnter={() => prefetch('/posts')}>
 *       Posts
 *     </a>
 *   );
 * }
 * ```
 */
export declare function usePrefetchRoute(): (path: string) => void;
