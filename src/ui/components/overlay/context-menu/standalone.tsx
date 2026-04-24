"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ContextMenuBaseItem {
  /** Entry type discriminant. Defaults to `"item"`. */
  type?: "item";
  /** Display label. */
  label: string;
  /** Icon name. */
  icon?: string;
  /** Whether this is a destructive action. */
  destructive?: boolean;
  /** Whether the item is disabled. */
  disabled?: boolean;
}

export interface ContextMenuBaseSeparator {
  /** Entry type discriminant. */
  type: "separator";
}

export interface ContextMenuBaseLabel {
  /** Entry type discriminant. */
  type: "label";
  /** Label text. */
  text: string;
}

export type ContextMenuBaseEntry =
  | ContextMenuBaseItem
  | ContextMenuBaseSeparator
  | ContextMenuBaseLabel;

export interface ContextMenuBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Menu items to display. */
  items: ContextMenuBaseEntry[];
  /** Called when a menu item is selected. */
  onSelect?: (item: ContextMenuBaseItem) => void;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Content that triggers the context menu on right-click. */
  children?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clampPosition(x: number, y: number) {
  return {
    left: `min(${x}px, calc(100vw - var(--sn-spacing-xl, 2rem) - 12rem))`,
    top: `min(${y}px, calc(100vh - var(--sn-spacing-xl, 2rem) - 12rem))`,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone ContextMenu — a right-click context menu with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <ContextMenuBase
 *   items={[
 *     { label: "Copy", icon: "copy" },
 *     { type: "separator" },
 *     { label: "Delete", destructive: true },
 *   ]}
 *   onSelect={(item) => handleAction(item.label)}
 * >
 *   <div>Right-click me</div>
 * </ContextMenuBase>
 * ```
 */
export function ContextMenuBase({
  id,
  items,
  onSelect,
  onOpenChange,
  children,
  className,
  style,
  slots,
}: ContextMenuBaseProps) {
  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const rootId = id ?? "context-menu";

  useEffect(() => {
    onOpenChange?.(menuState !== null);
  }, [menuState, onOpenChange]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuState({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const handleClose = useCallback(() => {
    setMenuState(null);
  }, []);

  useEffect(() => {
    if (!menuState || typeof document === "undefined") {
      return;
    }

    const handlePointerDown = () => handleClose();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, menuState]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const triggerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger`,
    implementationBase: {
      cursor: "context-menu",
      userSelect: "none",
    },
    componentSurface: slots?.trigger,
  });
  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      position: "fixed",
      zIndex: "var(--sn-z-index-popover, 50)",
      minWidth: "12rem",
      display: "grid",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
      bg: "var(--sn-color-popover, var(--sn-color-card, #ffffff))",
      borderRadius: "md",
      shadow: "md",
      style: {
        border:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        padding: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: slots?.panel,
  });

  return (
    <div
      data-snapshot-component="context-menu"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-testid="context-menu-area"
        data-snapshot-id={`${rootId}-trigger`}
        onContextMenu={handleContextMenu}
        className={triggerSurface.className}
        style={triggerSurface.style}
      >
        {children}
      </div>
      {menuState ? (
        <div
          role="menu"
          data-snapshot-id={`${rootId}-panel`}
          className={panelSurface.className}
          style={{
            ...panelSurface.style,
            ...clampPosition(menuState.x, menuState.y),
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {items.map((entry, index) => {
            if (entry.type === "separator") {
              const separatorSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-separator-${index}`,
                implementationBase: {
                  height: "1px",
                  backgroundColor: "var(--sn-color-border, #e5e7eb)",
                  style: {
                    margin: "var(--sn-spacing-2xs, 0.125rem) 0",
                  },
                },
                componentSurface: slots?.separator,
              });
              return (
                <React.Fragment key={`separator-${index}`}>
                  <div
                    data-snapshot-id={`${rootId}-separator-${index}`}
                    className={separatorSurface.className}
                    style={separatorSurface.style}
                    role="separator"
                  />
                  <SurfaceStyles css={separatorSurface.scopedCss} />
                </React.Fragment>
              );
            }

            if (entry.type === "label") {
              const labelSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-label-${index}`,
                implementationBase: {
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  style: {
                    padding:
                      "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem)",
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    fontWeight: "var(--sn-font-weight-semibold, 600)",
                  },
                },
                componentSurface: slots?.label,
              });
              return (
                <React.Fragment key={`label-${index}`}>
                  <div
                    data-snapshot-id={`${rootId}-label-${index}`}
                    className={labelSurface.className}
                    style={labelSurface.style}
                  >
                    {entry.text}
                  </div>
                  <SurfaceStyles css={labelSurface.scopedCss} />
                </React.Fragment>
              );
            }

            const item = entry as ContextMenuBaseItem;
            const itemSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${index}`,
              implementationBase: {
                display: "flex",
                alignItems: "center",
                gap: "sm",
                borderRadius: "sm",
                cursor: item.disabled ? "not-allowed" : "pointer",
                opacity: item.disabled ? "var(--sn-opacity-disabled, 0.5)" : 1,
                color: item.destructive
                  ? "var(--sn-color-destructive, #ef4444)"
                  : "var(--sn-color-foreground, #111827)",
                hover: item.disabled
                  ? undefined
                  : {
                      bg: "var(--sn-color-accent, #f3f4f6)",
                    },
                style: {
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                },
              },
              componentSurface: slots?.item,
            });

            return (
              <React.Fragment key={`item-${index}`}>
                <div
                  role="menuitem"
                  data-snapshot-id={`${rootId}-item-${index}`}
                  className={itemSurface.className}
                  style={itemSurface.style}
                  onClick={() => {
                    if (!item.disabled) {
                      handleClose();
                      onSelect?.(item);
                    }
                  }}
                >
                  {item.icon ? (
                    <span style={{ display: "inline-flex", flexShrink: 0 }}>
                      {renderIcon(item.icon, 14)}
                    </span>
                  ) : null}
                  {item.label}
                </div>
                <SurfaceStyles css={itemSurface.scopedCss} />
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={triggerSurface.scopedCss} />
      <SurfaceStyles css={panelSurface.scopedCss} />
    </div>
  );
}
