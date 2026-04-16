"use client";

import { useMemo, useRef, useState } from "react";
import { useSubscribe } from "../../../context/index";
import { renderIcon } from "../../../icons/render";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useRouteRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { FloatingMenuStyles, FloatingPanel } from "../../primitives/floating-menu";
import { NavLink } from "../nav-link";
import type { NavLinkConfig } from "../nav-link/types";
import type { NavDropdownConfig } from "./types";

function isNavLinkConfig(config: unknown): config is NavLinkConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "type" in config &&
    (config as { type?: string }).type === "nav-link"
  );
}

function matchesCurrentRoute(currentPath: string | undefined, item: NavLinkConfig): boolean {
  if (typeof currentPath !== "string" || typeof item.path !== "string") {
    return false;
  }

  return item.matchChildren !== false
    ? currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    : currentPath === item.path;
}

function inheritNavLinkSlots(
  item: NavLinkConfig,
  slots: NavDropdownConfig["slots"],
): NavLinkConfig {
  return {
    ...item,
    slots: {
      ...item.slots,
      root: item.slots?.root ?? slots?.item,
      label: item.slots?.label ?? slots?.itemLabel,
      icon: item.slots?.icon ?? slots?.itemIcon,
    },
  };
}

export function NavDropdown({
  config,
  onNavigate,
}: {
  config: NavDropdownConfig;
  onNavigate?: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerMode = config.trigger ?? "click";
  const routeRuntime = useRouteRuntime();

  const rawUser = useSubscribe({ from: "global.user" });
  const user = rawUser as { role?: string; roles?: string[] } | null;
  if (config.authenticated === true && !user) {
    return null;
  }
  if (config.authenticated === false && user) {
    return null;
  }
  if (config.roles?.length) {
    const userRoles = [...(user?.role ? [user.role] : []), ...(user?.roles ?? [])];
    if (!config.roles.some((role) => userRoles.includes(role))) {
      return null;
    }
  }

  const rootId = config.id ?? "nav-dropdown";
  const inferredCurrent = useMemo(
    () => config.items.some((item) => isNavLinkConfig(item) && matchesCurrentRoute(routeRuntime?.currentPath, item)),
    [config.items, routeRuntime?.currentPath],
  );
  const isCurrent = config.current ?? inferredCurrent;
  const mergedPanelSlot = useMemo<Record<string, unknown>>(
    () => {
      const panelSlot = (config.slots?.panel as Record<string, unknown> | undefined) ?? {};
      const panelSlotStyle = (panelSlot.style as Record<string, unknown> | undefined) ?? {};

      return {
        bg: "var(--sn-color-popover, var(--sn-color-card, #ffffff))",
        opacity: 1,
        border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "lg",
        shadow: "lg",
        ...panelSlot,
        style: {
          backgroundColor: "var(--sn-color-popover, var(--sn-color-card, #ffffff))",
          width: "max-content",
          maxWidth: "min(22rem, calc(100vw - 1rem))",
          whiteSpace: "nowrap",
          overflow: "hidden",
          backdropFilter: "none",
          ...panelSlotStyle,
        },
      };
    },
    [config.slots?.panel],
  );
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-flex",
      alignItems: "stretch",
      minWidth: 0,
      flexShrink: 0,
      overflow: "visible",
      states: {
        open: {
          zIndex: "var(--sn-z-index-popover, 50)",
        },
        current: {
          zIndex: "var(--sn-z-index-popover, 50)",
        },
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["width"] }),
    itemSurface: config.slots?.root,
    activeStates: [
      ...(isOpen ? (["open"] as const) : []),
      ...(isCurrent ? (["current"] as const) : []),
    ],
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: config.slots?.triggerLabel,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: config.slots?.triggerIcon,
  });

  return (
    <div
      ref={containerRef}
      data-snapshot-component="nav-dropdown"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
      onPointerEnter={triggerMode === "hover" ? () => setIsOpen(true) : undefined}
      onPointerLeave={triggerMode === "hover" ? () => setIsOpen(false) : undefined}
    >
      <FloatingMenuStyles />
      <ButtonControl
        variant="ghost"
        disabled={config.disabled}
        onClick={() => setIsOpen((value) => !value)}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={config.slots?.trigger}
        activeStates={[
          ...(isOpen ? (["open"] as const) : []),
          ...(isCurrent ? (["current"] as const) : []),
        ]}
        ariaExpanded={isOpen}
        ariaHasPopup="menu"
      >
        {config.icon ? (
          <span
            data-snapshot-id={`${rootId}-trigger-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(config.icon, 16)}
          </span>
        ) : null}
        <span
          data-snapshot-id={`${rootId}-trigger-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {config.label}
        </span>
      </ButtonControl>

      <FloatingPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        containerRef={containerRef}
        align={config.align ?? "start"}
        surfaceId={`${rootId}-panel`}
        slot={mergedPanelSlot}
        activeStates={isOpen ? ["open"] : []}
        minWidth={config.width}
      >
        {config.items.map((item, index) => {
          const isLinkItem = isNavLinkConfig(item);
          const itemSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-item-${index}`,
            implementationBase: {
              display: "block",
              width: "100%",
              minWidth: 0,
            },
            componentSurface: isLinkItem ? undefined : config.slots?.item,
          });

          return (
            <div
              key={(item as { id?: string }).id ?? index}
              role="none"
              data-snapshot-id={`${rootId}-item-${index}`}
              className={itemSurface.className}
              style={itemSurface.style}
            >
              {isLinkItem ? (
                <NavLink
                  config={inheritNavLinkSlots(item, config.slots)}
                  onNavigate={onNavigate}
                />
              ) : (
                <ComponentRenderer config={item} />
              )}
              <SurfaceStyles css={itemSurface.scopedCss} />
            </div>
          );
        })}
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
    </div>
  );
}
