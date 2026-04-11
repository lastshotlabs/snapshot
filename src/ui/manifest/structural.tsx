/**
 * Built-in structural components.
 *
 * These are the foundational layout and interaction components that ship
 * with the manifest system. Each registers itself in both the component
 * registry (for rendering) and the schema registry (for validation).
 */

import { useState, useId, type CSSProperties } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../context/index";
import { getRegisteredComponent } from "./component-registry";
import { useActionExecutor } from "../actions/executor";
import { useResponsiveValue } from "../hooks/use-breakpoint";
import { resolveRuntimeLocale } from "../i18n/resolve";
import { evaluatePolicy } from "../policies/evaluate";
import { isPolicyRef, type PolicyExpr } from "../policies/types";
import { resolveTemplate } from "../expressions/template";
import {
  getButtonStyle,
  BUTTON_INTERACTIVE_CSS,
} from "../components/_base/button-styles";
import { useManifestRuntime, useRouteRuntime } from "./runtime";
import { renderIcon } from "../icons/render";
import type {
  RowConfig,
  HeadingConfig,
  ButtonConfig,
  SelectConfig,
  ComponentConfig,
} from "./types";

const EMPTY_POLICY_MAP: Record<string, unknown> = {};

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

// ── Shared interactive styles (injected once) ───────────────────────────────

/**
 * CSS for hover/focus-visible states on structural elements.
 * Button styles are shared via BUTTON_INTERACTIVE_CSS from _base/button-styles.
 */
const STRUCTURAL_STYLES = `
${BUTTON_INTERACTIVE_CSS}

[data-snapshot-structural-select] {
  transition: border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
              box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);
}
[data-snapshot-structural-select]:hover:not(:disabled) {
  border-color: var(--sn-color-primary, #2563eb);
}
[data-snapshot-structural-select]:focus-visible {
  outline: var(--sn-ring-width, 2px) solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
`;

/** Tracks whether the structural stylesheet has been injected. */
let stylesInjected = false;

/** Injects the shared structural styles into the document head once. */
function ensureStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-snapshot-structural-styles", "");
  style.textContent = STRUCTURAL_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
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
  const manifest = useManifestRuntime();
  const policyDefinitions = (manifest?.raw.policies ??
    EMPTY_POLICY_MAP) as Record<string, unknown>;
  const resolvedPolicies = useResolveFrom(policyDefinitions) as Record<
    string,
    unknown
  >;
  const isVisible = isPolicyRef(config.visible)
    ? evaluatePolicy(
        config.visible.policy,
        resolvedPolicies[config.visible.policy] as PolicyExpr | undefined,
        { policies: resolvedPolicies as Record<string, PolicyExpr> },
      )
    : visible !== false;
  if (!isVisible) return null;

  const Component = getRegisteredComponent(config.type);
  if (!Component) {
    return null;
  }

  const span = useResponsiveValue(config.span ?? undefined);
  const configStyle = (config as Record<string, unknown>).style as
    | Record<string, string | number>
    | undefined;
  const style: CSSProperties = {
    ...(span ? { gridColumn: `span ${span}` } : undefined),
    ...(configStyle as CSSProperties),
  };

  return (
    <div
      data-snapshot-component={config.type}
      className={config.className}
      style={Object.keys(style).length > 0 ? style : undefined}
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
  const gap = useResponsiveValue(rowConfig.gap ?? "md");
  const hasSpans = rowConfig.children.some((child) => child.span !== undefined);
  const configStyle = rowConfig.style as CSSProperties | undefined;

  const style: CSSProperties = {
    ...(hasSpans
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
        }),
    ...configStyle,
  };

  return (
    <div
      style={style}
      className={rowConfig.className}
      role="group"
      data-snapshot-row
    >
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
/** Font size token per heading level. */
const HEADING_SIZE: Record<number, string> = {
  1: "var(--sn-font-size-4xl, 2.25rem)",
  2: "var(--sn-font-size-3xl, 1.875rem)",
  3: "var(--sn-font-size-2xl, 1.5rem)",
  4: "var(--sn-font-size-xl, 1.25rem)",
  5: "var(--sn-font-size-lg, 1.125rem)",
  6: "var(--sn-font-size-md, 1rem)",
};

export function Heading({ config }: { config: Record<string, unknown> }) {
  const headingConfig = config as unknown as HeadingConfig;
  const route = useRouteRuntime();
  const text = useSubscribe(headingConfig.text);
  const localeState = useSubscribe({ from: "global.locale" });
  const manifest = useManifestRuntime();
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const level = headingConfig.level ?? 2;
  const Tag = `h${level}` as const;
  const configStyle = headingConfig.style as CSSProperties | undefined;
  const resolvedText = resolveTemplate(
    typeof text === "string" ? text : String(text ?? ""),
    {
      app: manifest?.app ?? {},
      auth: manifest?.auth ?? {},
      route:
        route
          ? {
              id: route.currentRoute?.id,
              path: route.currentPath,
              pattern: route.currentRoute?.path,
              params: route.params,
              query: route.query,
            }
          : {},
    },
    {
      locale: activeLocale,
      i18n: manifest?.raw.i18n,
    },
  );
  const displayText =
    resolvedText.trim().length > 0
      ? resolvedText
      : resolveTemplate(headingConfig.fallback ?? "", {
          app: manifest?.app ?? {},
        });

  return (
    <Tag
      className={headingConfig.className}
      style={{
        fontSize: HEADING_SIZE[level],
        fontWeight:
          level <= 2
            ? "var(--sn-font-weight-bold, 700)"
            : "var(--sn-font-weight-semibold, 600)",
        lineHeight: "var(--sn-leading-tight, 1.25)",
        textAlign: headingConfig.align ?? "left",
        letterSpacing:
          level <= 2
            ? "var(--sn-tracking-tight, -0.025em)"
            : "var(--sn-tracking-normal, 0)",
        color: "var(--sn-color-foreground, #111827)",
        margin: 0,
        ...configStyle,
      }}
    >
      {displayText}
    </Tag>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────

/**
 * Button — click dispatches action config.
 * Supports variant, size, disabled (static or FromRef).
 */
export function Button({
  config,
  onClick,
}: {
  config: Record<string, unknown>;
  onClick?: () => void;
}) {
  const buttonConfig = config as unknown as ButtonConfig;
  const label = useSubscribe(buttonConfig.label);
  const disabled = useSubscribe(
    buttonConfig.disabled !== undefined ? buttonConfig.disabled : false,
  );
  const execute = useActionExecutor();

  ensureStyles();

  const variant = buttonConfig.variant ?? "default";
  const size = buttonConfig.size ?? "md";
  const configStyle = buttonConfig.style as CSSProperties | undefined;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (disabled || !buttonConfig.action) return;
    void execute(buttonConfig.action as Parameters<typeof execute>[0]);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!!disabled}
      aria-disabled={disabled ? true : undefined}
      className={buttonConfig.className}
      data-sn-button=""
      data-variant={variant}
      data-size={size}
      style={{
        ...getButtonStyle(variant, size, !!disabled),
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sn-spacing-xs, 0.25rem)",
        ...configStyle,
      }}
    >
      <>
        {(config as Record<string, unknown>).icon && (
          <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
            {renderIcon((config as Record<string, unknown>).icon as string, 16)}
          </span>
        )}
        {typeof label === "string" ? label : String(label ?? "")}
      </>
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
  const generatedId = useId();
  const selectId = selectConfig.id ?? generatedId;

  ensureStyles();

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

  const configStyle = selectConfig.style as CSSProperties | undefined;

  return (
    <select
      id={selectId}
      value={value}
      onChange={handleChange}
      aria-label={selectConfig.placeholder ?? undefined}
      className={selectConfig.className}
      data-snapshot-structural-select=""
      style={{
        padding: "var(--sn-spacing-xs, 0.5rem)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        backgroundColor: "var(--sn-color-background, #fff)",
        color: "var(--sn-color-foreground, #111827)",
        fontSize: "var(--sn-font-size-md, 1rem)",
        fontFamily: "var(--sn-font-sans, inherit)",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        ...configStyle,
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

// ── Card ──────────────────────────────────────────────────────────────────────

interface CardConfig {
  type: "card";
  id?: string;
  title?: string;
  subtitle?: string;
  children: ComponentConfig[];
  gap?: string;
  className?: string;
  style?: Record<string, string | number>;
  visible?: unknown;
}

function Card({ config }: { config: Record<string, unknown> }) {
  const cardConfig = config as unknown as CardConfig;
  const gap = useResponsiveValue(cardConfig.gap ?? "md");
  const configStyle = cardConfig.style as CSSProperties | undefined;

  return (
    <div
      data-snapshot-card
      className={cardConfig.className}
      style={{
        backgroundColor: "var(--sn-color-card, #ffffff)",
        border: "var(--sn-card-border, 1px solid var(--sn-color-border, #e5e7eb))",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        boxShadow: "var(--sn-card-shadow, var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.1)))",
        padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
        display: "flex",
        flexDirection: "column",
        gap: GAP_MAP[gap] ?? GAP_MAP["md"],
        ...configStyle,
      }}
    >
      {(cardConfig.title || cardConfig.subtitle) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sn-spacing-2xs, 0.125rem)" }}>
          {cardConfig.title && (
            <h3 style={{
              fontSize: "var(--sn-font-size-lg, 1.125rem)",
              fontWeight: "var(--sn-font-weight-semibold, 600)" as CSSProperties["fontWeight"],
              color: "var(--sn-color-foreground, #111827)",
              lineHeight: "var(--sn-leading-tight, 1.25)",
              margin: 0,
            }}>
              {cardConfig.title}
            </h3>
          )}
          {cardConfig.subtitle && (
            <p style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              margin: 0,
            }}>
              {cardConfig.subtitle}
            </p>
          )}
        </div>
      )}
      {cardConfig.children?.map((child, i) => (
        <InlineComponentRenderer
          key={child.id ?? `card-child-${i}`}
          config={child}
        />
      ))}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface SectionConfig {
  type: "section";
  id?: string;
  heading?: string;
  description?: string;
  children: ComponentConfig[];
  gap?: string;
  divider?: boolean;
  className?: string;
  style?: Record<string, string | number>;
  visible?: unknown;
}

function Section({ config }: { config: Record<string, unknown> }) {
  const sectionConfig = config as unknown as SectionConfig;
  const gap = useResponsiveValue(sectionConfig.gap ?? "lg");
  const configStyle = sectionConfig.style as CSSProperties | undefined;

  return (
    <section
      data-snapshot-section
      className={sectionConfig.className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: GAP_MAP[gap] ?? GAP_MAP["lg"],
        ...configStyle,
      }}
    >
      {(sectionConfig.heading || sectionConfig.description) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sn-spacing-xs, 0.25rem)" }}>
          {sectionConfig.heading && (
            <h2 style={{
              fontSize: "var(--sn-font-size-xl, 1.25rem)",
              fontWeight: "var(--sn-font-weight-semibold, 600)" as CSSProperties["fontWeight"],
              color: "var(--sn-color-foreground, #111827)",
              lineHeight: "var(--sn-leading-tight, 1.25)",
              margin: 0,
            }}>
              {sectionConfig.heading}
            </h2>
          )}
          {sectionConfig.description && (
            <p style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              margin: 0,
            }}>
              {sectionConfig.description}
            </p>
          )}
        </div>
      )}
      {sectionConfig.divider !== false && (sectionConfig.heading || sectionConfig.description) && (
        <hr style={{
          border: "none",
          borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
          margin: 0,
        }} />
      )}
      {sectionConfig.children?.map((child, i) => (
        <InlineComponentRenderer
          key={child.id ?? `section-child-${i}`}
          config={child}
        />
      ))}
    </section>
  );
}

// ── Container ─────────────────────────────────────────────────────────────────

const CONTAINER_WIDTHS: Record<string, string> = {
  xs: "var(--sn-container-xs, 20rem)",
  sm: "var(--sn-container-sm, 24rem)",
  md: "var(--sn-container-md, 32rem)",
  lg: "var(--sn-container-lg, 42rem)",
  xl: "var(--sn-container-xl, 56rem)",
  "2xl": "var(--sn-container-2xl, 72rem)",
  full: "var(--sn-container-full, 100%)",
  prose: "var(--sn-container-prose, 65ch)",
};

interface ContainerConfig {
  type: "container";
  id?: string;
  maxWidth?: string;
  children: ComponentConfig[];
  className?: string;
  style?: Record<string, string | number>;
  visible?: unknown;
}

function Container({ config }: { config: Record<string, unknown> }) {
  const containerConfig = config as unknown as ContainerConfig;
  const maxWidth = containerConfig.maxWidth ?? "xl";
  const configStyle = containerConfig.style as CSSProperties | undefined;

  return (
    <div
      data-snapshot-container
      className={containerConfig.className}
      style={{
        maxWidth: CONTAINER_WIDTHS[maxWidth] ?? maxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        ...configStyle,
      }}
    >
      {containerConfig.children?.map((child, i) => (
        <InlineComponentRenderer
          key={child.id ?? `container-child-${i}`}
          config={child}
        />
      ))}
    </div>
  );
}

// ── Register all structural components ──────────────────────────────────────

/**
 * Built-in structural component implementations.
 *
 * The boot layer registers these components explicitly so importing the UI
 * package remains side-effect free.
 */
export const STRUCTURAL_COMPONENTS = {
  row: Row,
  heading: Heading,
  button: Button,
  select: Select,
  card: Card,
  section: Section,
  container: Container,
} as const;
