'use client';

import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import {
  FloatingMenuStyles,
  FloatingPanel,
} from "../../primitives/floating-menu";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NavDropdownBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Dropdown trigger label. */
  label?: string;
  /** Icon name for the trigger. */
  icon?: string;
  /** Whether this dropdown represents the current section. */
  current?: boolean;
  /** Whether the trigger is disabled. */
  disabled?: boolean;
  /** Panel alignment relative to trigger. Default: "start". */
  align?: "start" | "end";
  /** How the dropdown opens. Default: "click". */
  trigger?: "click" | "hover";
  /** Minimum width for the dropdown panel (CSS value). */
  width?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, trigger, triggerLabel, triggerIcon, panel, item, itemLabel, itemIcon). */
  slots?: Record<string, Record<string, unknown>>;
  /** React children rendered as dropdown panel content. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone NavDropdown -- a navigation dropdown with floating panel.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <NavDropdownBase label="Products" icon="box">
 *   <NavLinkBase label="Widget A" path="/products/a" />
 *   <NavLinkBase label="Widget B" path="/products/b" />
 * </NavDropdownBase>
 * ```
 */
export function NavDropdownBase({
  id,
  label = "",
  icon,
  current = false,
  disabled = false,
  align = "start",
  trigger: triggerMode = "click",
  width,
  className,
  style,
  slots,
  children,
}: NavDropdownBaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "nav-dropdown";

  const mergedPanelSlot = useMemo<Record<string, unknown>>(
    () => {
      const panelSlot = (slots?.panel as Record<string, unknown> | undefined) ?? {};
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
    [slots?.panel],
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
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: [
      ...(isOpen ? (["open"] as const) : []),
      ...(current ? (["current"] as const) : []),
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
    componentSurface: slots?.triggerLabel,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: slots?.triggerIcon,
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
        disabled={disabled}
        onClick={() => setIsOpen((value) => !value)}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={slots?.trigger}
        activeStates={[
          ...(isOpen ? (["open"] as const) : []),
          ...(current ? (["current"] as const) : []),
        ]}
        ariaExpanded={isOpen}
        ariaHasPopup="menu"
      >
        {icon ? (
          <span
            data-snapshot-id={`${rootId}-trigger-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(icon, 16)}
          </span>
        ) : null}
        <span
          data-snapshot-id={`${rootId}-trigger-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {label}
        </span>
      </ButtonControl>

      <FloatingPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        containerRef={containerRef}
        align={align}
        surfaceId={`${rootId}-panel`}
        slot={mergedPanelSlot}
        activeStates={isOpen ? ["open"] : []}
        minWidth={width}
      >
        {children}
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
    </div>
  );
}
