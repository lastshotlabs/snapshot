import React, { useRef } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/renderer";
import { useTabs } from "./hook";
import type { TabsConfig } from "./schema";

/**
 * Variant-specific styles for the tab bar and individual tabs.
 */
const VARIANT_STYLES: Record<
  string,
  {
    bar: React.CSSProperties;
    tab: (active: boolean, disabled: boolean) => React.CSSProperties;
  }
> = {
  default: {
    bar: {
      display: "flex",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
      marginBottom: "var(--sn-spacing-md, 1rem)",
    },
    tab: (active, disabled) => ({
      padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      border: "none",
      borderBottom: active
        ? "2px solid var(--sn-color-primary, #2563eb)"
        : "2px solid transparent",
      background: "none",
      color: disabled
        ? "var(--sn-color-muted, #9ca3af)"
        : active
          ? "var(--sn-color-primary, #2563eb)"
          : "var(--sn-color-foreground, #111)",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: active
        ? "var(--sn-font-weight-semibold, 600)"
        : "var(--sn-font-weight-normal, 400)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      opacity: disabled ? 0.5 : 1,
      marginBottom: "-1px",
    }),
  },
  underline: {
    bar: {
      display: "flex",
      gap: "var(--sn-spacing-md, 1rem)",
      borderBottom: "2px solid var(--sn-color-border, #e5e7eb)",
      marginBottom: "var(--sn-spacing-md, 1rem)",
    },
    tab: (active, disabled) => ({
      padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-xs, 0.25rem)",
      border: "none",
      borderBottom: active
        ? "2px solid var(--sn-color-primary, #2563eb)"
        : "2px solid transparent",
      background: "none",
      color: disabled
        ? "var(--sn-color-muted, #9ca3af)"
        : active
          ? "var(--sn-color-primary, #2563eb)"
          : "var(--sn-color-muted, #6b7280)",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: active
        ? "var(--sn-font-weight-semibold, 600)"
        : "var(--sn-font-weight-normal, 400)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      opacity: disabled ? 0.5 : 1,
      marginBottom: "-2px",
    }),
  },
  pills: {
    bar: {
      display: "flex",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      marginBottom: "var(--sn-spacing-md, 1rem)",
    },
    tab: (active, disabled) => ({
      padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
      border: "none",
      borderRadius: "var(--sn-radius-full, 9999px)",
      background: active ? "var(--sn-color-primary, #2563eb)" : "transparent",
      color: disabled
        ? "var(--sn-color-muted, #9ca3af)"
        : active
          ? "var(--sn-color-primary-foreground, #fff)"
          : "var(--sn-color-foreground, #111)",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: active
        ? "var(--sn-font-weight-semibold, 600)"
        : "var(--sn-font-weight-normal, 400)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      opacity: disabled ? 0.5 : 1,
    }),
  },
};

/**
 * Tabs component — renders a tab bar with content panels.
 *
 * Each tab's content is rendered via ComponentRenderer for recursive composition.
 * Publishes `{ activeTab, label }` when the component has an id.
 * Lazy-renders tab content: only mounts a tab when first activated, then keeps it mounted.
 *
 * @param props.config - The tabs config from the manifest
 */
export function TabsComponent({ config }: { config: TabsConfig }) {
  const { activeTab, setActiveTab, tabs } = useTabs(config);
  const variant = config.variant ?? "default";
  const resolvedStyles = VARIANT_STYLES[variant];
  const barStyle = resolvedStyles?.bar ?? VARIANT_STYLES["default"]!.bar;
  const tabStyle = resolvedStyles?.tab ?? VARIANT_STYLES["default"]!.tab;

  // Track which tabs have been mounted (for lazy rendering)
  const mountedRef = useRef<Set<number>>(new Set([config.defaultTab ?? 0]));
  mountedRef.current.add(activeTab);

  return (
    <div data-snapshot-component="tabs">
      {/* Tab Bar */}
      <div role="tablist" data-snapshot-tabs-bar="" style={barStyle}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            type="button"
            aria-selected={index === activeTab}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            onClick={() => setActiveTab(index)}
            data-snapshot-tab=""
            data-active={index === activeTab ? "" : undefined}
            style={tabStyle(index === activeTab, !!tab.disabled)}
          >
            {tab.icon && (
              <span
                data-snapshot-tab-icon=""
                style={{ marginRight: "var(--sn-spacing-xs, 0.25rem)" }}
              >
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels — lazy mounted, stays mounted after first activation */}
      {tabs.map((tab, index) => {
        if (!mountedRef.current.has(index)) return null;

        return (
          <div
            key={index}
            role="tabpanel"
            data-snapshot-tab-panel=""
            aria-hidden={index !== activeTab}
            style={{
              display: index === activeTab ? "block" : "none",
            }}
          >
            {tab.content.map((child, childIndex) => (
              <ComponentRenderer
                key={
                  (child as ComponentConfig).id ??
                  `tab-${index}-child-${childIndex}`
                }
                config={child as ComponentConfig}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
