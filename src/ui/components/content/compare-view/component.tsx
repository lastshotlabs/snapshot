import { useRef, useCallback, useMemo } from "react";
import { useSubscribe } from "../../../context/hooks";
import type { CompareViewConfig, DiffLine } from "./types";

/**
 * Compute a simple line-based diff using longest common subsequence (LCS).
 *
 * Returns an array of DiffLine entries representing unchanged, added,
 * and removed lines with their respective line numbers.
 */
function computeDiff(leftText: string, rightText: string): DiffLine[] {
  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");
  const m = leftLines.length;
  const n = rightLines.length;

  // Build LCS table
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

  // Backtrack to produce diff
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

/** Style for a diff line based on its type. */
function getLineStyle(type: DiffLine["type"]): React.CSSProperties {
  switch (type) {
    case "removed":
      return {
        backgroundColor: "color-mix(in oklch, var(--sn-color-destructive, #ef4444) 15%, var(--sn-color-card, #ffffff))",
        color: "var(--sn-color-destructive, #ef4444)",
      };
    case "added":
      return {
        backgroundColor: "color-mix(in oklch, var(--sn-color-success, #22c55e) 15%, var(--sn-color-card, #ffffff))",
        color: "var(--sn-color-success, #22c55e)",
      };
    default:
      return {
        color: "var(--sn-color-foreground, #111827)",
      };
  }
}

/** Prefix character for each line type. */
const LINE_PREFIX: Record<DiffLine["type"], string> = {
  unchanged: " ",
  added: "+",
  removed: "-",
};

/**
 * CompareView component — a config-driven side-by-side diff viewer
 * for comparing two text values.
 *
 * Uses a simple LCS-based line diff algorithm. Removed lines are
 * highlighted in red, added lines in green, and unchanged lines
 * render normally. Supports synced scrolling between panes.
 *
 * @param props - Component props containing the compare view configuration
 *
 * @example
 * ```json
 * {
 *   "type": "compare-view",
 *   "left": "line 1\nline 2",
 *   "right": "line 1\nline 2 modified",
 *   "leftLabel": "Original",
 *   "rightLabel": "Modified"
 * }
 * ```
 */
export function CompareView({ config }: { config: CompareViewConfig }) {
  const leftText = useSubscribe(config.left) as string;
  const rightText = useSubscribe(config.right) as string;
  const visible = useSubscribe(config.visible ?? true);

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);

  if (visible === false) return null;

  const leftLabel = config.leftLabel ?? "Original";
  const rightLabel = config.rightLabel ?? "Modified";
  const maxHeight = config.maxHeight ?? "400px";
  const showLineNumbers = config.showLineNumbers ?? true;

  const diff = useMemo(
    () => computeDiff(leftText ?? "", rightText ?? ""),
    [leftText, rightText],
  );

  // Split diff into left-side and right-side entries
  const leftDiff = useMemo(
    () => diff.filter((d) => d.type !== "added"),
    [diff],
  );
  const rightDiff = useMemo(
    () => diff.filter((d) => d.type !== "removed"),
    [diff],
  );

  /** Sync scroll between left and right panes. */
  const handleScroll = useCallback(
    (source: "left" | "right") => {
      if (scrollingRef.current) return;
      scrollingRef.current = true;

      const from = source === "left" ? leftPaneRef.current : rightPaneRef.current;
      const to = source === "left" ? rightPaneRef.current : leftPaneRef.current;

      if (from && to) {
        to.scrollTop = from.scrollTop;
      }

      requestAnimationFrame(() => {
        scrollingRef.current = false;
      });
    },
    [],
  );

  const lineNumberStyle: React.CSSProperties = {
    display: "inline-block",
    width: "3ch",
    textAlign: "right",
    marginRight: "var(--sn-spacing-sm, 0.5rem)",
    color: "var(--sn-color-muted-foreground, #6b7280)",
    opacity: 0.6,
    userSelect: "none",
    flexShrink: 0,
  };

  const renderPane = (
    lines: DiffLine[],
    side: "left" | "right",
    ref: React.RefObject<HTMLDivElement | null>,
  ) => (
    <div
      ref={ref}
      data-testid={`compare-${side}`}
      onScroll={() => handleScroll(side)}
      style={{
        flex: 1,
        overflow: "auto",
        maxHeight,
      }}
    >
      {lines.map((line, idx) => {
        const lineStyle = getLineStyle(
          line.type === "unchanged" ? "unchanged" : side === "left" ? "removed" : "added",
        );
        const num = side === "left" ? line.leftNum : line.rightNum;
        const prefix = line.type === "unchanged"
          ? LINE_PREFIX.unchanged
          : side === "left"
            ? LINE_PREFIX.removed
            : LINE_PREFIX.added;

        return (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "baseline",
              padding: "0 var(--sn-spacing-sm, 0.5rem)",
              minHeight: "1.5em",
              lineHeight: "var(--sn-leading-normal, 1.5)",
              ...lineStyle,
            }}
          >
            {showLineNumbers && (
              <span style={lineNumberStyle}>{num ?? ""}</span>
            )}
            <span
              style={{
                whiteSpace: "pre",
                marginRight: "var(--sn-spacing-xs, 0.25rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                userSelect: "none",
              }}
            >
              {prefix}
            </span>
            <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1 }}>
              {line.text}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      data-snapshot-component="compare-view"
      data-testid="compare-view"
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        overflow: "hidden",
        fontFamily: "var(--sn-font-mono, monospace)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          borderBottom: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        }}
      >
        <div
          data-testid="compare-left-label"
          style={{
            flex: 1,
            padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-muted, #f3f4f6)",
            fontFamily: "var(--sn-font-sans, sans-serif)",
          }}
        >
          {leftLabel}
        </div>
        <div
          style={{
            width: "var(--sn-border-thin, 1px)",
            backgroundColor: "var(--sn-color-border, #e5e7eb)",
          }}
        />
        <div
          data-testid="compare-right-label"
          style={{
            flex: 1,
            padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "var(--sn-color-muted, #f3f4f6)",
            fontFamily: "var(--sn-font-sans, sans-serif)",
          }}
        >
          {rightLabel}
        </div>
      </div>

      {/* Diff panes */}
      <div style={{ display: "flex" }}>
        {renderPane(leftDiff, "left", leftPaneRef)}
        <div
          style={{
            width: "var(--sn-border-thin, 1px)",
            backgroundColor: "var(--sn-color-border, #e5e7eb)",
            flexShrink: 0,
          }}
        />
        {renderPane(rightDiff, "right", rightPaneRef)}
      </div>
    </div>
  );
}
