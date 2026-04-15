'use client';

import React, { useCallback, useRef } from "react";
import { Icon } from "../../../icons/icon";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { useTabs } from "./hook";
import type { TabsConfig } from "./schema";

const VARIANT_STYLES: Record<
  string,
  {
    bar: Record<string, unknown>;
    tab: (active: boolean, disabled: boolean) => Record<string, unknown>;
  }
> = {
  default: {
    bar: {
      display: "flex",
      gap: "xs",
      style: {
        borderBottom:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        marginBottom: "var(--sn-spacing-md, 1rem)",
      },
    },
    tab: (active, disabled) => ({
      color: disabled
        ? "var(--sn-color-muted-foreground, #9ca3af)"
        : active
          ? "var(--sn-color-primary, #2563eb)"
          : "var(--sn-color-foreground, #111827)",
      cursor: disabled ? "not-allowed" : "pointer",
      hover: disabled ? undefined : { bg: "var(--sn-color-accent, #f3f4f6)" },
      focus: { ring: true },
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
        border: "none",
        borderBottom: active
          ? "var(--sn-border-thick, 2px) solid var(--sn-color-primary, #2563eb)"
          : "var(--sn-border-thick, 2px) solid transparent",
        background: "none",
        fontWeight: active
          ? "var(--sn-font-weight-semibold, 600)"
          : "var(--sn-font-weight-normal, 400)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        opacity: disabled ? "var(--sn-opacity-disabled, 0.5)" : 1,
        marginBottom: "-1px",
        transition:
          "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
        whiteSpace: "nowrap",
      },
    }),
  },
  underline: {
    bar: {
      display: "flex",
      gap: "md",
      style: {
        borderBottom:
          "var(--sn-border-thick, 2px) solid var(--sn-color-border, #e5e7eb)",
        marginBottom: "var(--sn-spacing-md, 1rem)",
      },
    },
    tab: (active, disabled) => ({
      color: disabled
        ? "var(--sn-color-muted-foreground, #9ca3af)"
        : active
          ? "var(--sn-color-primary, #2563eb)"
          : "var(--sn-color-muted-foreground, #6b7280)",
      cursor: disabled ? "not-allowed" : "pointer",
      hover: disabled
        ? undefined
        : { color: "var(--sn-color-foreground, #111827)" },
      focus: { ring: true },
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-xs, 0.25rem)",
        border: "none",
        borderBottom: active
          ? "var(--sn-border-thick, 2px) solid var(--sn-color-primary, #2563eb)"
          : "var(--sn-border-thick, 2px) solid transparent",
        background: "none",
        fontWeight: active
          ? "var(--sn-font-weight-semibold, 600)"
          : "var(--sn-font-weight-normal, 400)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        opacity: disabled ? "var(--sn-opacity-disabled, 0.5)" : 1,
        marginBottom: "-2px",
        transition:
          "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
        whiteSpace: "nowrap",
      },
    }),
  },
  pills: {
    bar: {
      display: "flex",
      gap: "xs",
      style: {
        marginBottom: "var(--sn-spacing-md, 1rem)",
      },
    },
    tab: (active, disabled) => ({
      color: disabled
        ? "var(--sn-color-muted-foreground, #9ca3af)"
        : active
          ? "var(--sn-color-primary-foreground, #fff)"
          : "var(--sn-color-foreground, #111827)",
      cursor: disabled ? "not-allowed" : "pointer",
      hover: disabled
        ? undefined
        : {
            bg: active
              ? "var(--sn-color-primary, #2563eb)"
              : "var(--sn-color-accent, #f3f4f6)",
          },
      focus: { ring: true },
      style: {
        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
        border: "none",
        borderRadius: "var(--sn-radius-full, 9999px)",
        background: active ? "var(--sn-color-primary, #2563eb)" : "transparent",
        fontWeight: active
          ? "var(--sn-font-weight-semibold, 600)"
          : "var(--sn-font-weight-normal, 400)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        opacity: disabled ? "var(--sn-opacity-disabled, 0.5)" : 1,
        transition:
          "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
        whiteSpace: "nowrap",
      },
    }),
  },
};

export function TabsComponent({ config }: { config: TabsConfig }) {
  const { activeTab, setActiveTab, tabs } = useTabs(config);
  const variant = config.variant ?? "default";
  const resolvedStyles = VARIANT_STYLES[variant] ?? VARIANT_STYLES["default"]!;
  const rootId = config.id ?? "tabs";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: resolvedStyles.bar,
    componentSurface: config.slots?.list,
  });

  const mountedRef = useRef<Set<number>>(new Set([config.defaultTab ?? 0]));
  mountedRef.current.add(activeTab);

  const handleTablistKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();

      const enabledIndices = tabs
        .map((tab, index) => (!tab.disabled ? index : -1))
        .filter((index) => index !== -1);
      if (enabledIndices.length === 0) return;

      const currentPos = enabledIndices.indexOf(activeTab);
      const nextPos =
        event.key === "ArrowRight"
          ? currentPos === -1
            ? 0
            : (currentPos + 1) % enabledIndices.length
          : currentPos <= 0
            ? enabledIndices.length - 1
            : currentPos - 1;
      const nextIndex = enabledIndices[nextPos]!;

      setActiveTab(nextIndex);
      const buttons =
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons[nextIndex]?.focus();
    },
    [activeTab, setActiveTab, tabs],
  );

  return (
    <div
      data-snapshot-component="tabs"
      data-testid="tabs"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        role="tablist"
        data-tab-list=""
        data-snapshot-id={`${rootId}-list`}
        className={listSurface.className}
        style={listSurface.style}
        onKeyDown={handleTablistKeyDown}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;
          const tabSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-tab-${index}`,
            implementationBase: resolvedStyles.tab(isActive, !!tab.disabled),
            componentSurface: config.slots?.tab,
            itemSurface: tab.slots?.tab,
            activeStates: [
              ...(isActive ? ["selected", "current"] : []),
              ...(tab.disabled ? ["disabled"] : []),
            ] as Array<"selected" | "current" | "disabled">,
          });
          const labelSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-tab-label-${index}`,
            componentSurface: config.slots?.tabLabel,
            itemSurface: tab.slots?.tabLabel,
          });
          const iconSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-tab-icon-${index}`,
            implementationBase: {
              display: "inline-flex",
              alignItems: "center",
              style: { marginRight: "var(--sn-spacing-xs, 0.25rem)" },
            },
            componentSurface: config.slots?.tabIcon,
            itemSurface: tab.slots?.tabIcon,
          });

          return (
            <React.Fragment key={index}>
              <ButtonControl
                type="button"
                variant="ghost"
                size="md"
                disabled={tab.disabled}
                role="tab"
                ariaSelected={isActive}
                ariaCurrent={isActive ? "page" : undefined}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(index)}
                surfaceId={`${rootId}-tab-${index}`}
                surfaceConfig={tabSurface.resolvedConfigForWrapper}
                activeStates={[
                  ...(isActive ? ["selected", "current"] : []),
                  ...(tab.disabled ? ["disabled"] : []),
                ] as Array<"selected" | "current" | "disabled">}
              >
                {tab.icon ? (
                  <span
                    data-tab-icon=""
                    data-snapshot-id={`${rootId}-tab-icon-${index}`}
                    className={iconSurface.className}
                    style={iconSurface.style}
                  >
                    <Icon name={tab.icon} size={16} />
                  </span>
                ) : null}
                <span
                  data-snapshot-id={`${rootId}-tab-label-${index}`}
                  className={labelSurface.className}
                  style={labelSurface.style}
                >
                  {tab.label}
                </span>
              </ButtonControl>
              <SurfaceStyles css={labelSurface.scopedCss} />
              <SurfaceStyles css={iconSurface.scopedCss} />
            </React.Fragment>
          );
        })}
      </div>

      {tabs.map((tab, index) => {
        if (!mountedRef.current.has(index)) return null;

        const panelSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-panel-${index}`,
          implementationBase: {
            display: index === activeTab ? "flex" : "none",
            flexDirection: "column",
            gap: "md",
          },
          componentSurface: config.slots?.panel,
          itemSurface: tab.slots?.panel,
          activeStates: index === activeTab ? ["active"] : [],
        });

        return (
          <div
            key={index}
            role="tabpanel"
            data-tab-content=""
            aria-hidden={index !== activeTab}
            data-snapshot-id={`${rootId}-panel-${index}`}
            className={panelSurface.className}
            style={panelSurface.style}
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
            <SurfaceStyles css={panelSurface.scopedCss} />
          </div>
        );
      })}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
    </div>
  );
}
