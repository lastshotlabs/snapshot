import type { ReactNode } from "react";
import { z } from "zod";
import { slotsSchema } from "../../_base/schema";

export const prefetchLinkSlotNames = ["root"] as const;

/**
 * Zod schema for `<PrefetchLink>` config.
 *
 * `<PrefetchLink>` is a prefetch primitive that renders a plain `<a>` tag and
 * automatically injects `<link rel="prefetch">` tags for the route's JS chunks
 * and CSS files when the user hovers over the link or when it enters the viewport.
 *
 * It is not a router-aware component — consumers wire their own router.
 * This avoids a peer dependency on TanStack Router.
 */
export const prefetchLinkSchema = z.object({
  /** The `href` of the link. Must be a non-empty string. */
  to: z.string().min(1),
  /**
   * When to trigger prefetching:
   * - `'hover'`    — prefetch on `mouseenter` (default)
   * - `'visible'`  — prefetch when the link enters the viewport
   * - `'viewport'` — legacy alias for `'visible'`
   * - `'eager'`    — prefetch immediately on mount
   * - `'none'`     — never prefetch automatically
   */
  prefetch: z
    .enum(["hover", "visible", "viewport", "eager", "none"])
    .default("hover"),
  /** Content rendered inside the anchor. */
  children: z.custom<ReactNode>().optional(),
  /** Optional id used to scope root slot CSS. */
  id: z.string().optional(),
  /** Additional CSS class name applied to the anchor. */
  className: z.string().optional(),
  /** Inline style overrides applied to the anchor. */
  style: z.record(z.union([z.string(), z.number()])).optional(),
  /** Canonical root slot overrides. */
  slots: slotsSchema(prefetchLinkSlotNames).optional(),
  /** `target` attribute forwarded to the `<a>` element. */
  target: z.string().optional(),
  /** `rel` attribute forwarded to the `<a>` element. */
  rel: z.string().optional(),
}).strict();

/**
 * The output type of `prefetchLinkSchema` — all fields fully resolved with
 * defaults applied. This is the type received by the component implementation.
 */
export type PrefetchLinkConfig = z.infer<typeof prefetchLinkSchema>;

/**
 * The input type of `prefetchLinkSchema` — mirrors what callers pass before
 * Zod applies defaults. Use this as the component's public prop type so that
 * `prefetch` and other defaulted fields are optional at the call site.
 */
export type PrefetchLinkProps = z.input<typeof prefetchLinkSchema>;
export type PrefetchLinkSlotNames = typeof prefetchLinkSlotNames;
