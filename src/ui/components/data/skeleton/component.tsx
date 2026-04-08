import { useSubscribe } from "../../../context/hooks";
import type { SkeletonConfig } from "./types";

/** Width pattern for text lines to create a natural staggered look. */
const LINE_WIDTHS = ["100%", "90%", "75%", "60%", "85%", "70%", "95%", "65%"];

/**
 * Normalize a width/height value to a CSS string.
 */
function toCss(value: string | number | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Skeleton component — a loading placeholder that mimics the shape of
 * content before it loads.
 *
 * Supports text (multiple lines), circular, rectangular, and card variants
 * with an optional pulse animation.
 *
 * @param props - Component props containing the skeleton configuration
 *
 * @example
 * ```json
 * {
 *   "type": "skeleton",
 *   "variant": "card",
 *   "animated": true
 * }
 * ```
 */
export function Skeleton({ config }: { config: SkeletonConfig }) {
  // Check visibility
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  const variant = config.variant ?? "text";
  const animated = config.animated ?? true;
  const lines = config.lines ?? 3;

  const animationStyle = animated
    ? "sn-pulse var(--sn-duration-slow, 2s) var(--sn-ease-in-out, ease-in-out) infinite"
    : "none";

  const baseStyle: React.CSSProperties = {
    backgroundColor: "var(--sn-color-muted, #e5e7eb)",
    borderRadius: "var(--sn-radius-md, 0.375rem)",
  };

  if (variant === "text") {
    return (
      <div
        data-snapshot-component="skeleton"
        data-testid="skeleton"
        className={config.className}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          width: toCss(config.width, "100%"),
          ...(config.style as React.CSSProperties),
        }}
      >
        {animated && (
          <style>{`
            @keyframes sn-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: var(--sn-opacity-muted, 0.5); }
            }
          `}</style>
        )}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{
              ...baseStyle,
              width: LINE_WIDTHS[i % LINE_WIDTHS.length],
              height: "var(--sn-font-size-md, 1rem)",
              animation: animationStyle,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circular") {
    const size = toCss(config.width, "48px");
    return (
      <div
        data-snapshot-component="skeleton"
        data-testid="skeleton"
        className={config.className}
        style={config.style as React.CSSProperties}
      >
        {animated && (
          <style>{`
            @keyframes sn-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: var(--sn-opacity-muted, 0.5); }
            }
          `}</style>
        )}
        <div
          style={{
            ...baseStyle,
            width: size,
            height: toCss(config.height, size),
            borderRadius: "var(--sn-radius-full, 9999px)",
            animation: animationStyle,
          }}
        />
      </div>
    );
  }

  if (variant === "rectangular") {
    return (
      <div
        data-snapshot-component="skeleton"
        data-testid="skeleton"
        className={config.className}
        style={config.style as React.CSSProperties}
      >
        {animated && (
          <style>{`
            @keyframes sn-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: var(--sn-opacity-muted, 0.5); }
            }
          `}</style>
        )}
        <div
          style={{
            ...baseStyle,
            width: toCss(config.width, "100%"),
            height: toCss(config.height, "100px"),
            animation: animationStyle,
          }}
        />
      </div>
    );
  }

  // Card variant
  return (
    <div
      data-snapshot-component="skeleton"
      data-testid="skeleton"
      className={config.className}
      style={{
        width: toCss(config.width, "100%"),
        height: toCss(config.height, "200px"),
        backgroundColor: "var(--sn-color-card, #ffffff)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        padding: "var(--sn-spacing-lg, 1.5rem)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-md, 1rem)",
        ...(config.style as React.CSSProperties),
      }}
    >
      {animated && (
        <style>{`
          @keyframes sn-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      )}
      {/* Title skeleton */}
      <div
        style={{
          ...baseStyle,
          width: "60%",
          height: "var(--sn-font-size-lg, 1.125rem)",
          animation: animationStyle,
        }}
      />
      {/* Body skeleton lines */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          flex: 1,
        }}
      >
        <div
          style={{
            ...baseStyle,
            width: "100%",
            height: "var(--sn-font-size-md, 1rem)",
            animation: animationStyle,
          }}
        />
        <div
          style={{
            ...baseStyle,
            width: "85%",
            height: "var(--sn-font-size-md, 1rem)",
            animation: animationStyle,
          }}
        />
        <div
          style={{
            ...baseStyle,
            width: "70%",
            height: "var(--sn-font-size-md, 1rem)",
            animation: animationStyle,
          }}
        />
      </div>
    </div>
  );
}
