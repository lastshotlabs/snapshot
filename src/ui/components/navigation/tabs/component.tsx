import React, { useRef, useCallback } from "react";
import { Icon } from "../../../icons/icon";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
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
        ? "var(--sn-color-muted-foreground, #9ca3af)"
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
      transition:
        "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
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
        ? "var(--sn-color-muted-foreground, #9ca3af)"
        : active
          ? "var(--sn-color-primary, #2563eb)"
          : "var(--sn-color-muted-foreground, #6b7280)",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: active
        ? "var(--sn-font-weight-semibold, 600)"
        : "var(--sn-font-weight-normal, 400)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      opacity: disabled ? 0.5 : 1,
      marginBottom: "-2px",
      transition:
        "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
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
        ? "var(--sn-color-muted-foreground, #9ca3af)"
        : active
          ? "var(--sn-color-primary-foreground, #fff)"
          : "var(--sn-color-foreground, #111)",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: active
        ? "var(--sn-font-weight-semibold, 600)"
        : "var(--sn-font-weight-normal, 400)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      opacity: disabled ? 0.5 : 1,
      transition:
        "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
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

  /** Keyboard navigation for the tablist (ArrowLeft / ArrowRight). */
  const handleTablistKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      const enabledIndices = tabs
        .map((t, i) => (!t.disabled ? i : -1))
        .filter((i) => i !== -1);
      if (enabledIndices.length === 0) return;

      const currentPos = enabledIndices.indexOf(activeTab);
      let nextPos: number;
      if (e.key === "ArrowRight") {
        nextPos =
          currentPos === -1 ? 0 : (currentPos + 1) % enabledIndices.length;
      } else {
        nextPos = currentPos <= 0 ? enabledIndices.length - 1 : currentPos - 1;
      }
      const nextIndex = enabledIndices[nextPos]!;
      setActiveTab(nextIndex);

      // Focus the newly active tab button
      const tablist = e.currentTarget;
      const buttons =
        tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons[nextIndex]?.focus();
    },
    [tabs, activeTab, setActiveTab],
  );

  return (
    <div
      data-snapshot-component="tabs"
      data-testid="tabs"
      style={{
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{`
        [data-snapshot-component="tabs"] [role="tab"]:not([aria-disabled="true"]):hover {
          background: color-mix(in oklch, var(--sn-color-muted) 50%, transparent);
        }
        [data-snapshot-component="tabs"] [role="tab"]:focus {
          outline: none;
        }
        [data-snapshot-component="tabs"] [role="tab"]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
      `}</style>
      {/* Tab Bar */}
      <div
        role="tablist"
        data-snapshot-tabs-bar=""
        style={barStyle}
        onKeyDown={handleTablistKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            type="button"
            aria-selected={index === activeTab}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            tabIndex={index === activeTab ? 0 : -1}
            onClick={() => setActiveTab(index)}
            data-snapshot-tab=""
            data-active={index === activeTab ? "" : undefined}
            style={tabStyle(index === activeTab, !!tab.disabled)}
          >
            {tab.icon && (
              <span
                data-snapshot-tab-icon=""
                style={{
                  marginRight: "var(--sn-spacing-xs, 0.25rem)",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <Icon name={tab.icon} size={16} />
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
