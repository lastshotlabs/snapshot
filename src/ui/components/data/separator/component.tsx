import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import type { SeparatorConfig } from "./types";

/**
 * Separator component — a simple visual divider line (horizontal or vertical).
 *
 * Renders a thin line using the border color token. When a label is provided,
 * it renders centered text flanked by lines on each side (common for
 * "or" dividers, date separators, etc.).
 *
 * @param props.config - The separator config from the manifest
 *
 * @example
 * ```json
 * { "type": "separator" }
 * ```
 *
 * @example
 * ```json
 * { "type": "separator", "label": "Or continue with", "orientation": "horizontal" }
 * ```
 */
export function Separator({ config }: { config: SeparatorConfig }) {
  const label = useSubscribe(config.label ?? undefined) as string | undefined;
  const visible = useSubscribe(config.visible ?? true);
  const publish = config.id ? usePublish(config.id) : undefined; // eslint-disable-line react-hooks/rules-of-hooks

  useEffect(() => {
    if (publish) {
      publish({ orientation: config.orientation ?? "horizontal" });
    }
  }, [publish, config.orientation]);

  if (visible === false) return null;

  const orientation = config.orientation ?? "horizontal";
  const isVertical = orientation === "vertical";

  // Vertical separator — simple line
  if (isVertical) {
    return (
      <div
        data-snapshot-component="separator"
        role="separator"
        aria-orientation="vertical"
        className={config.className}
        style={{
          display: "inline-block",
          width: "var(--sn-border-thin, 1px)",
          alignSelf: "stretch",
          minHeight: "var(--sn-spacing-lg, 1.5rem)",
          backgroundColor: "var(--sn-color-border, #e5e7eb)",
          flexShrink: 0,
        }}
      />
    );
  }

  // Horizontal separator with label
  if (label) {
    return (
      <div
        data-snapshot-component="separator"
        role="separator"
        aria-orientation="horizontal"
        className={config.className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          width: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "var(--sn-border-thin, 1px)",
            backgroundColor: "var(--sn-color-border, #e5e7eb)",
          }}
        />
        <span
          data-snapshot-separator-label=""
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            fontWeight: "var(--sn-font-weight-medium, 500)" as string,
            color: "var(--sn-color-muted-foreground, #6b7280)",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: "var(--sn-tracking-wide, 0.05em)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            flex: 1,
            height: "var(--sn-border-thin, 1px)",
            backgroundColor: "var(--sn-color-border, #e5e7eb)",
          }}
        />
      </div>
    );
  }

  // Horizontal separator without label — simple line
  return (
    <div
      data-snapshot-component="separator"
      role="separator"
      aria-orientation="horizontal"
      className={config.className}
      style={{
        width: "100%",
        height: "var(--sn-border-thin, 1px)",
        backgroundColor: "var(--sn-color-border, #e5e7eb)",
      }}
    />
  );
}
