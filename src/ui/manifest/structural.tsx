/**
 * Built-in structural components.
 *
 * These are the foundational layout and interaction components that ship
 * with the manifest system. Each registers itself in both the component
 * registry (for rendering) and the schema registry (for validation).
 */

import { useState, type CSSProperties } from "react";
import { useSubscribe, usePublish } from "../context/index";
import {
  registerComponent,
  getRegisteredComponent,
} from "./component-registry";
import type {
  RowConfig,
  HeadingConfig,
  ButtonConfig,
  SelectConfig,
  ComponentConfig,
} from "./types";

// ── Spacing token map ───────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  xs: "var(--sn-spacing-xs, 0.25rem)",
  sm: "var(--sn-spacing-sm, 0.5rem)",
  md: "var(--sn-spacing-md, 1rem)",
  lg: "var(--sn-spacing-lg, 1.5rem)",
  xl: "var(--sn-spacing-xl, 2rem)",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
};

const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

// ── Responsive value resolution ─────────────────────────────────────────────

/**
 * Resolve a responsive value to its default/flat value.
 * For Phase 4, responsive breakpoint maps resolve to the `default` key.
 * Full responsive CSS will be added in a later phase.
 */
function resolveResponsive<T>(value: T | { default: T }): T {
  if (value !== null && typeof value === "object" && "default" in value) {
    return (value as { default: T }).default;
  }
  return value as T;
}

// ── ComponentRenderer (inline for structural children) ──────────────────────

/**
 * Renders a single component config by looking up its type in the component registry.
 * Used internally by Row to render children.
 */
function InlineComponentRenderer({ config }: { config: ComponentConfig }) {
  const visible = useSubscribe(
    config.visible !== undefined ? config.visible : true,
  );
  if (visible === false) return null;

  const Component = getRegisteredComponent(config.type);
  if (!Component) {
    return null;
  }

  const span = config.span ? resolveResponsive(config.span) : undefined;
  const style: CSSProperties | undefined = span
    ? { gridColumn: `span ${span}` }
    : undefined;

  return (
    <div
      data-snapshot-component={config.type}
      className={config.className}
      style={style}
    >
      <Component config={config as Record<string, unknown>} />
    </div>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────

/**
 * Row — flex/grid container with gap, justify, align, and wrap.
 * Renders children recursively via ComponentRenderer.
 * Uses CSS grid when children have span values, flex otherwise.
 */
function Row({ config }: { config: Record<string, unknown> }) {
  const rowConfig = config as unknown as RowConfig;
  const gap = rowConfig.gap ? resolveResponsive(rowConfig.gap) : "md";
  const hasSpans = rowConfig.children.some((child) => child.span !== undefined);

  const style: CSSProperties = hasSpans
    ? {
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: GAP_MAP[gap] ?? GAP_MAP["md"],
        justifyContent: rowConfig.justify
          ? JUSTIFY_MAP[rowConfig.justify]
          : undefined,
        alignItems: rowConfig.align ? ALIGN_MAP[rowConfig.align] : undefined,
      }
    : {
        display: "flex",
        gap: GAP_MAP[gap] ?? GAP_MAP["md"],
        justifyContent: rowConfig.justify
          ? JUSTIFY_MAP[rowConfig.justify]
          : undefined,
        alignItems: rowConfig.align ? ALIGN_MAP[rowConfig.align] : undefined,
        flexWrap: rowConfig.wrap ? "wrap" : undefined,
      };

  return (
    <div style={style} data-snapshot-row>
      {rowConfig.children.map((child, i) => (
        <InlineComponentRenderer
          key={child.id ?? `row-child-${i}`}
          config={child}
        />
      ))}
    </div>
  );
}

// ── Heading ─────────────────────────────────────────────────────────────────

/**
 * Heading — renders h1-h6 with text from config or FromRef.
 * Uses token-based font sizing.
 */
function Heading({ config }: { config: Record<string, unknown> }) {
  const headingConfig = config as unknown as HeadingConfig;
  const text = useSubscribe(headingConfig.text);
  const level = headingConfig.level ?? 2;
  const Tag = `h${level}` as const;

  return <Tag>{typeof text === "string" ? text : String(text ?? "")}</Tag>;
}

// ── Button ──────────────────────────────────────────────────────────────────

/**
 * Button — click dispatches action config.
 * Supports variant, size, disabled (static or FromRef).
 */
function Button({ config }: { config: Record<string, unknown> }) {
  const buttonConfig = config as unknown as ButtonConfig;
  const disabled = useSubscribe(
    buttonConfig.disabled !== undefined ? buttonConfig.disabled : false,
  );

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      backgroundColor: "var(--sn-color-primary, #2563eb)",
      color: "var(--sn-color-primary-foreground, #fff)",
      border: "none",
    },
    secondary: {
      backgroundColor: "var(--sn-color-secondary, #6b7280)",
      color: "var(--sn-color-secondary-foreground, #fff)",
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--sn-color-primary, #2563eb)",
      border: "1px solid var(--sn-color-border, #e5e7eb)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--sn-color-primary, #2563eb)",
      border: "none",
    },
    destructive: {
      backgroundColor: "var(--sn-color-destructive, #dc2626)",
      color: "var(--sn-color-destructive-foreground, #fff)",
      border: "none",
    },
    link: {
      backgroundColor: "transparent",
      color: "var(--sn-color-primary, #2563eb)",
      border: "none",
      textDecoration: "underline",
    },
  };

  const sizeStyles: Record<string, CSSProperties> = {
    sm: { padding: "0.25rem 0.5rem", fontSize: "0.875rem" },
    md: { padding: "0.5rem 1rem", fontSize: "1rem" },
    lg: { padding: "0.75rem 1.5rem", fontSize: "1.125rem" },
    icon: {
      padding: "0.5rem",
      fontSize: "1rem",
      width: "2.5rem",
      height: "2.5rem",
    },
  };

  const variant = buttonConfig.variant ?? "default";
  const size = buttonConfig.size ?? "md";

  const handleClick = () => {
    if (disabled) return;
    // Action dispatch is handled by the action executor system.
    // For Phase 4, we dispatch a custom event that the action system can listen to.
    const actionEvent = new CustomEvent("snapshot:action", {
      detail: {
        action: buttonConfig.action,
        source: buttonConfig.id,
      },
      bubbles: true,
    });
    document.dispatchEvent(actionEvent);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!!disabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        borderRadius: "var(--sn-radius, 0.375rem)",
      }}
      data-variant={variant}
      data-size={size}
    >
      {buttonConfig.label}
    </button>
  );
}

// ── Select ──────────────────────────────────────────────────────────────────

/**
 * Select — dropdown that publishes its value via usePublish when id is set.
 * Options can be a static array or an endpoint string (endpoint fetching in later phases).
 */
function Select({ config }: { config: Record<string, unknown> }) {
  const selectConfig = config as unknown as SelectConfig;
  const publish = selectConfig.id ? usePublish(selectConfig.id) : null;
  const [value, setValue] = useState(selectConfig.default ?? "");

  const options = Array.isArray(selectConfig.options)
    ? selectConfig.options
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (publish) {
      publish(newValue);
    }
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      style={{
        padding: "0.5rem",
        borderRadius: "var(--sn-radius, 0.375rem)",
        border: "1px solid var(--sn-color-border, #e5e7eb)",
      }}
    >
      {selectConfig.placeholder && (
        <option value="" disabled>
          {selectConfig.placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Register all structural components ──────────────────────────────────────

registerComponent("row", Row);
registerComponent("heading", Heading);
registerComponent("button", Button);
registerComponent("select", Select);
