"use client";

import { useMemo } from "react";

/**
 * Stable, fast hash for CSS strings used as the dedup key.
 * djb2 — collision-resistant enough for content-addressed style tags.
 */
function hashCss(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Render a component's CSS as a React 19 hoistable `<style>` element.
 *
 * `href` + `precedence` hand ownership of dedup and placement to React
 * itself: multiple instances with the same content-addressed `href` render
 * the stylesheet once, React hoists it into `document.head`, and — critically
 * — hydration matches hoistables by `href` anywhere in the document rather
 * than by tree position, so server- and client-rendered trees never disagree.
 *
 * The previous implementation dedup'd through a module-level registry seeded
 * from SSR-emitted tags. That produced a guaranteed hydration mismatch on
 * every SSR'd page: the server (which skipped the registry) emitted a tag per
 * component instance, while the seeded client rendered none of them. React
 * then discarded the entire server tree and re-rendered from scratch —
 * negating SSR. Do not reintroduce manual registries here; React's hoistable
 * contract is the mechanism that keeps both sides consistent.
 */
export function SurfaceStyles({ css }: { css?: string }) {
  const hash = useMemo(() => (css ? hashCss(css) : null), [css]);
  if (!css || !hash) return null;
  // React owns hoistable attributes: it serialises `href`/`precedence` as
  // `data-href`/`data-precedence` on the emitted tag and strips anything
  // else, so no custom marker attribute survives — select emitted tags via
  // `style[data-precedence="sn-component"]` if needed.
  return (
    <style
      href={`sn-${hash}`}
      precedence="sn-component"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
