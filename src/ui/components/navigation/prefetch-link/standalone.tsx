'use client';

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface PrefetchLinkBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** The href of the link. */
  to: string;
  /**
   * When to trigger prefetching:
   * - `'hover'`    — prefetch on pointerenter (default)
   * - `'visible'`  — prefetch when the link enters the viewport
   * - `'viewport'` — legacy alias for `'visible'`
   * - `'eager'`    — prefetch immediately on mount
   * - `'none'`     — never prefetch automatically
   */
  prefetch?: "hover" | "visible" | "viewport" | "eager" | "none";
  /** Content rendered inside the anchor. */
  children?: ReactNode;
  /** `target` attribute forwarded to the `<a>` element. */
  target?: string;
  /** `rel` attribute forwarded to the `<a>` element. */
  rel?: string;
  /** Called when a prefetch should be triggered. */
  onPrefetch?: (to: string) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root anchor. */
  className?: string;
  /** Inline style applied to the root anchor. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback
 * based on the configured strategy. No manifest or SSR context required.
 *
 * @example
 * ```tsx
 * <PrefetchLinkBase
 *   to="/dashboard"
 *   onPrefetch={(to) => router.prefetch(to)}
 * >
 *   Dashboard
 * </PrefetchLinkBase>
 * ```
 */
export function PrefetchLinkBase({
  id,
  to,
  prefetch = "hover",
  children,
  target,
  rel,
  onPrefetch,
  className,
  style,
  slots,
}: PrefetchLinkBaseProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rootId = id ?? "prefetch-link";

  const doPrefetch = () => {
    onPrefetch?.(to);
  };

  // Viewport prefetch via IntersectionObserver.
  useEffect(() => {
    if (
      (prefetch !== "viewport" && prefetch !== "visible") ||
      !ref.current
    ) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          doPrefetch();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [prefetch, to]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prefetch !== "eager") {
      return;
    }

    doPrefetch();
  }, [prefetch, to]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrefetch = prefetch === "hover" ? doPrefetch : undefined;

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
    componentSurface: className || style ? { className, style } : undefined,
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
