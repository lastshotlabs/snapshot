'use client';

import { useState } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface VoteBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Current vote count. */
  value?: number;
  /** Callback when upvote is clicked. */
  onUpvote?: () => void;
  /** Callback when downvote is clicked. */
  onDownvote?: () => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, upvote, value, downvote). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Vote — upvote/downvote toggle with count display.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <VoteBase
 *   value={42}
 *   onUpvote={() => api.upvote(postId)}
 *   onDownvote={() => api.downvote(postId)}
 * />
 * ```
 */
export function VoteBase({
  id,
  value = 0,
  onUpvote,
  onDownvote,
  className,
  style,
  slots,
}: VoteBaseProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const displayValue = value + (voted === "up" ? 1 : voted === "down" ? -1 : 0);
  const rootId = id ?? "vote";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const upvoteSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-upvote`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      states: {
        active: {
          color: "var(--sn-color-primary, #2563eb)",
        },
      },
      focus: {
        ring: true,
      },
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "var(--sn-spacing-2xs, 2px)",
        fontSize: "1.25rem",
        lineHeight: 1,
      },
    },
    componentSurface: slots?.upvote,
    activeStates: voted === "up" ? ["active"] : [],
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value`,
    implementationBase: {
      style: {
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)",
        color: "var(--sn-color-foreground, #111827)",
        minWidth: "2ch",
        textAlign: "center",
      },
    },
    componentSurface: slots?.value,
  });
  const downvoteSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-downvote`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      states: {
        active: {
          color: "var(--sn-color-destructive, #dc2626)",
        },
      },
      focus: {
        ring: true,
      },
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "var(--sn-spacing-2xs, 2px)",
        fontSize: "1.25rem",
        lineHeight: 1,
      },
    },
    componentSurface: slots?.downvote,
    activeStates: voted === "down" ? ["active"] : [],
  });

  return (
    <div
      data-snapshot-component="vote"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <ButtonControl
        type="button"
        onClick={() => {
          setVoted(voted === "up" ? null : "up");
          onUpvote?.();
        }}
        ariaLabel="Upvote"
        variant="ghost"
        size="icon"
        surfaceId={`${rootId}-upvote`}
        surfaceConfig={upvoteSurface.resolvedConfigForWrapper}
        activeStates={voted === "up" ? ["active"] : []}
      >
        &#x25B2;
      </ButtonControl>
      <span
        data-snapshot-id={`${rootId}-value`}
        className={valueSurface.className}
        style={valueSurface.style}
      >
        {displayValue}
      </span>
      <ButtonControl
        type="button"
        onClick={() => {
          setVoted(voted === "down" ? null : "down");
          onDownvote?.();
        }}
        ariaLabel="Downvote"
        variant="ghost"
        size="icon"
        surfaceId={`${rootId}-downvote`}
        surfaceConfig={downvoteSurface.resolvedConfigForWrapper}
        activeStates={voted === "down" ? ["active"] : []}
      >
        &#x25BC;
      </ButtonControl>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={upvoteSurface.scopedCss} />
      <SurfaceStyles css={valueSurface.scopedCss} />
      <SurfaceStyles css={downvoteSurface.scopedCss} />
    </div>
  );
}
