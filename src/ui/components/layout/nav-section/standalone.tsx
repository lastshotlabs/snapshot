'use client';

import { useState, type CSSProperties, type ReactNode } from "react";
import type { SlotOverrides } from "../../_base/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NavSectionBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Section label/header. */
  label?: string;
  /** Whether the section is collapsible. */
  collapsible?: boolean;
  /** Default collapsed state. */
  defaultCollapsed?: boolean;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, header, headerLabel, content). */
  slots?: SlotOverrides;
  /** React children rendered as the section content. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone NavSection -- a labeled, optionally collapsible group within navigation.
 * Works with plain React props.
 *
 * @example
 * ```tsx
 * <NavSectionBase label="Admin" collapsible>
 *   <NavLinkBase label="Users" path="/admin/users" />
 *   <NavLinkBase label="Settings" path="/admin/settings" />
 * </NavSectionBase>
 * ```
 */
export function NavSectionBase({
  id,
  label,
  collapsible = false,
  defaultCollapsed = false,
  className,
  style,
  slots,
  children,
}: NavSectionBaseProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const showItems = !collapsible || !isCollapsed;
  const rootId = id ?? "nav-section";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const headerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    componentSurface: slots?.headerLabel,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
    },
    componentSurface: slots?.content,
    activeStates: showItems ? ["open"] : [],
  });

  return (
    <div
      data-snapshot-component="nav-section"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {label ? (
        <div
          role={collapsible ? "button" : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onClick={collapsible ? () => setIsCollapsed((value) => !value) : undefined}
          onKeyDown={collapsible ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsCollapsed((value) => !value);
            }
          } : undefined}
          aria-expanded={collapsible ? showItems : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)" as any,
            textTransform: "uppercase" as const,
            letterSpacing: "var(--sn-tracking-wide, 0.025em)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            cursor: collapsible ? "pointer" : undefined,
            border: "none",
            background: "none",
          }}
        >
          <span
            data-snapshot-id={`${rootId}-header-label`}
            className={headerLabelSurface.className}
            style={headerLabelSurface.style}
          >
            {label}
          </span>
        </div>
      ) : null}
      {showItems ? (
        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {children}
        </div>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerLabelSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
