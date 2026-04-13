"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { usePrefetchRoute } from "../../../../ssr/prefetch";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { PrefetchLinkProps } from "./schema";

function SurfaceStyles({ css }: { css?: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

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
export function PrefetchLink({
  id,
  to,
  prefetch = "hover",
  children,
  className,
  style,
  slots,
  target,
  rel,
}: PrefetchLinkProps) {
  const prefetchRoute = usePrefetchRoute();
  const ref = useRef<HTMLAnchorElement>(null);
  const rootId = id ?? "prefetch-link";

  // Viewport prefetch via IntersectionObserver.
  // Only active when prefetch === 'viewport'.
  useEffect(() => {
    if ((prefetch !== "viewport" && prefetch !== "visible") || !ref.current) {
      return;
    }

    // IntersectionObserver is not available in SSR — guard it.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          prefetchRoute(to);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, prefetch, prefetchRoute]);

  useEffect(() => {
    if (prefetch !== "eager") {
      return;
    }

    prefetchRoute(to);
  }, [prefetch, prefetchRoute, to]);

  const handlePrefetch =
    prefetch === "hover" ? () => prefetchRoute(to) : undefined;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      color: "var(--sn-color-primary, #2563eb)",
      cursor: "pointer",
      focus: {
        ring: true,
      },
      hover: {
        opacity: 0.84,
      },
      style: {
        textDecoration: "none",
      },
    },
    componentSurface: {
      className,
      style,
    },
    itemSurface: slots?.root,
  });

  return (
    <>
      <a
        ref={ref}
        href={to}
        onPointerEnter={handlePrefetch}
        onFocus={handlePrefetch}
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style as CSSProperties | undefined}
        target={target}
        rel={rel}
      >
        {children}
      </a>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
