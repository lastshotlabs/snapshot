'use client';

import type { CSSProperties } from "react";
import { useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { VoteConfig } from "./types";

export function Vote({ config }: { config: VoteConfig }) {
  const execute = useActionExecutor();
  const resolvedValue = useSubscribe(config.value ?? 0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const value = typeof resolvedValue === "number" ? resolvedValue : 0;
  const displayValue = value + (voted === "up" ? 1 : voted === "down" ? -1 : 0);
  const rootId = config.id ?? "vote";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.upvote,
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
    componentSurface: config.slots?.value,
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
    componentSurface: config.slots?.downvote,
    activeStates: voted === "down" ? ["active"] : [],
  });

  return (
    <div
      data-snapshot-component="vote"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...((config.style as CSSProperties | undefined) ?? {}),
      }}
    >
      <ButtonControl
        type="button"
        onClick={() => {
          setVoted(voted === "up" ? null : "up");
          if (config.upAction) {
            void execute(config.upAction);
          }
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
          if (config.downAction) {
            void execute(config.downAction);
          }
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
