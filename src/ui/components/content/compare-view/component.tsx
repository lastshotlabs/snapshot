'use client';

import type { RefObject } from "react";
import { useCallback, useMemo, useRef } from "react";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import type { CompareViewConfig, DiffLine } from "./types";

function computeDiff(leftText: string, rightText: string): DiffLine[] {
  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");
  const m = leftLines.length;
  const n = rightLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      result.push({
        type: "unchanged",
        text: leftLines[i - 1]!,
        leftNum: i,
        rightNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      result.push({
        type: "added",
        text: rightLines[j - 1]!,
        rightNum: j,
      });
      j--;
    } else {
      result.push({
        type: "removed",
        text: leftLines[i - 1]!,
        leftNum: i,
      });
      i--;
    }
  }

  return result.reverse();
}

const LINE_PREFIX: Record<DiffLine["type"], string> = {
  unchanged: " ",
  added: "+",
  removed: "-",
};

function lineStyles(type: DiffLine["type"]): Record<string, string> | undefined {
  switch (type) {
    case "removed":
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-destructive, #ef4444) 15%, var(--sn-color-card, #ffffff))",
        color: "var(--sn-color-destructive, #ef4444)",
      };
    case "added":
      return {
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-success, #22c55e) 15%, var(--sn-color-card, #ffffff))",
        color: "var(--sn-color-success, #22c55e)",
      };
    default:
      return {
        color: "var(--sn-color-foreground, #111827)",
      };
  }
}

function ComparePane({
  config,
  rootId,
  side,
  lines,
  maxHeight,
  showLineNumbers,
  paneRef,
  onScroll,
}: {
  config: CompareViewConfig;
  rootId: string;
  side: "left" | "right";
  lines: DiffLine[];
  maxHeight: string;
  showLineNumbers: boolean;
  paneRef: RefObject<HTMLDivElement | null>;
  onScroll: (side: "left" | "right") => void;
}) {
  const paneId = `${rootId}-${side}`;
  const paneSurface = resolveSurfacePresentation({
    surfaceId: `${paneId}-pane`,
    implementationBase: {
      flex: "1 1 min(50%, 400px)",
      style: {
        minWidth: "min(100%, 300px)",
        overflow: "auto",
        maxHeight,
      },
    },
    componentSurface: config.slots?.pane,
  });

  return (
    <>
      <div
        ref={paneRef}
        data-testid={`compare-${side}`}
        data-snapshot-id={`${paneId}-pane`}
        onScroll={() => onScroll(side)}
        className={paneSurface.className}
        style={paneSurface.style}
      >
        {lines.map((line, idx) => {
          const resolvedType =
            line.type === "unchanged"
              ? "unchanged"
              : side === "left"
                ? "removed"
                : "added";
          const lineSurface = resolveSurfacePresentation({
            surfaceId: `${paneId}-line-${idx}`,
            implementationBase: {
              display: "flex",
              alignItems: "baseline",
              style: {
                padding: "0 var(--sn-spacing-sm, 0.5rem)",
                minHeight: "1.5em",
                lineHeight: "var(--sn-leading-normal, 1.5)",
                ...(lineStyles(resolvedType) ?? {}),
              },
            },
            componentSurface: config.slots?.line,
          });
          const lineNumberSurface = resolveSurfacePresentation({
            surfaceId: `${paneId}-lineNumber-${idx}`,
            implementationBase: {
              color: "var(--sn-color-muted-foreground, #6b7280)",
              opacity: 0.6,
              style: {
                display: "inline-block",
                width: "3ch",
                textAlign: "right",
                marginRight: "var(--sn-spacing-sm, 0.5rem)",
                userSelect: "none",
                flexShrink: 0,
              },
            },
            componentSurface: config.slots?.lineNumber,
          });
          const prefixSurface = resolveSurfacePresentation({
            surfaceId: `${paneId}-prefix-${idx}`,
            implementationBase: {
              color: "var(--sn-color-muted-foreground, #6b7280)",
              style: {
                whiteSpace: "pre",
                marginRight: "var(--sn-spacing-xs, 0.25rem)",
                userSelect: "none",
              },
            },
            componentSurface: config.slots?.prefix,
          });
          const textSurface = resolveSurfacePresentation({
            surfaceId: `${paneId}-text-${idx}`,
            implementationBase: {
              flex: "1",
              style: {
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              },
            },
            componentSurface: config.slots?.text,
          });
          const num = side === "left" ? line.leftNum : line.rightNum;
          const prefix =
            line.type === "unchanged"
              ? LINE_PREFIX.unchanged
              : side === "left"
                ? LINE_PREFIX.removed
                : LINE_PREFIX.added;

          return (
            <div key={idx}>
              <div
                data-snapshot-id={`${paneId}-line-${idx}`}
                className={lineSurface.className}
                style={lineSurface.style}
              >
                {showLineNumbers ? (
                  <span
                    data-snapshot-id={`${paneId}-lineNumber-${idx}`}
                    className={lineNumberSurface.className}
                    style={lineNumberSurface.style}
                  >
                    {num ?? ""}
                  </span>
                ) : null}
                <span
                  data-snapshot-id={`${paneId}-prefix-${idx}`}
                  className={prefixSurface.className}
                  style={prefixSurface.style}
                >
                  {prefix}
                </span>
                <span
                  data-snapshot-id={`${paneId}-text-${idx}`}
                  className={textSurface.className}
                  style={textSurface.style}
                >
                  {line.text}
                </span>
              </div>
              <SurfaceStyles css={lineSurface.scopedCss} />
              <SurfaceStyles css={lineNumberSurface.scopedCss} />
              <SurfaceStyles css={prefixSurface.scopedCss} />
              <SurfaceStyles css={textSurface.scopedCss} />
            </div>
          );
        })}
      </div>
      <SurfaceStyles css={paneSurface.scopedCss} />
    </>
  );
}

export function CompareView({ config }: { config: CompareViewConfig }) {
  const leftText = useSubscribe(config.left) as string;
  const rightText = useSubscribe(config.right) as string;
  const leftLabel = (useSubscribe(config.leftLabel) as string | undefined) ?? "Original";
  const rightLabel = (useSubscribe(config.rightLabel) as string | undefined) ?? "Modified";
  const visible = useSubscribe(config.visible ?? true);
  const rootId = config.id ?? "compare-view";

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);

  const maxHeight = config.maxHeight ?? "400px";
  const showLineNumbers = config.showLineNumbers ?? true;

  const diff = useMemo(
    () => computeDiff(leftText ?? "", rightText ?? ""),
    [leftText, rightText],
  );
  const leftDiff = useMemo(() => diff.filter((d) => d.type !== "added"), [diff]);
  const rightDiff = useMemo(() => diff.filter((d) => d.type !== "removed"), [diff]);

  const handleScroll = useCallback((source: "left" | "right") => {
    if (scrollingRef.current) {
      return;
    }
    scrollingRef.current = true;

    const from = source === "left" ? leftPaneRef.current : rightPaneRef.current;
    const to = source === "left" ? rightPaneRef.current : leftPaneRef.current;
    if (from && to) {
      to.scrollTop = from.scrollTop;
    }

    requestAnimationFrame(() => {
      scrollingRef.current = false;
    });
  }, []);

  if (visible === false) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "lg",
      overflow: "hidden",
      bg: "var(--sn-color-card, #ffffff)",
      style: {
        fontFamily: "var(--sn-font-mono, monospace)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["maxHeight"] }),
    itemSurface: config.slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      style: {
        borderBottom:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.header,
  });
  const labelBase = {
    flex: "1",
    paddingY: "sm",
    paddingX: "md",
    fontSize: "sm",
    fontWeight: "semibold",
    color: "var(--sn-color-foreground, #111827)",
    bg: "var(--sn-color-muted, #f3f4f6)",
    style: {
      fontFamily: "var(--sn-font-sans, sans-serif)",
    },
  } as const;
  const leftLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-leftLabel`,
    implementationBase: labelBase,
    componentSurface: config.slots?.leftLabel,
  });
  const rightLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-rightLabel`,
    implementationBase: labelBase,
    componentSurface: config.slots?.rightLabel,
  });
  const dividerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-divider`,
    implementationBase: {
      bg: "var(--sn-color-border, #e5e7eb)",
      style: {
        width: "var(--sn-border-thin, 1px)",
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.divider,
  });
  const panesSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panes`,
    implementationBase: {
      display: "flex",
      style: {
        flexWrap: "wrap",
      },
    },
    componentSurface: config.slots?.panes,
  });

  return (
    <>
      <div
        data-snapshot-component="compare-view"
        data-testid="compare-view"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-header`}
          className={headerSurface.className}
          style={headerSurface.style}
        >
          <div
            data-testid="compare-left-label"
            data-snapshot-id={`${rootId}-leftLabel`}
            className={leftLabelSurface.className}
            style={leftLabelSurface.style}
          >
            {leftLabel}
          </div>
          <div
            data-snapshot-id={`${rootId}-divider-top`}
            className={dividerSurface.className}
            style={dividerSurface.style}
          />
          <div
            data-testid="compare-right-label"
            data-snapshot-id={`${rootId}-rightLabel`}
            className={rightLabelSurface.className}
            style={rightLabelSurface.style}
          >
            {rightLabel}
          </div>
        </div>

        <div
          data-snapshot-id={`${rootId}-panes`}
          className={panesSurface.className}
          style={panesSurface.style}
        >
          <ComparePane
            config={config}
            rootId={rootId}
            side="left"
            lines={leftDiff}
            maxHeight={maxHeight}
            showLineNumbers={showLineNumbers}
            paneRef={leftPaneRef}
            onScroll={handleScroll}
          />
          <div
            data-snapshot-id={`${rootId}-divider-middle`}
            className={dividerSurface.className}
            style={dividerSurface.style}
          />
          <ComparePane
            config={config}
            rootId={rootId}
            side="right"
            lines={rightDiff}
            maxHeight={maxHeight}
            showLineNumbers={showLineNumbers}
            paneRef={rightPaneRef}
            onScroll={handleScroll}
          />
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={leftLabelSurface.scopedCss} />
      <SurfaceStyles css={rightLabelSurface.scopedCss} />
      <SurfaceStyles css={dividerSurface.scopedCss} />
      <SurfaceStyles css={panesSurface.scopedCss} />
    </>
  );
}
