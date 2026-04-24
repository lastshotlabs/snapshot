'use client';

import React, { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import {
  FloatingMenuStyles,
  FloatingPanel,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "../../primitives/floating-menu";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface DropdownMenuBaseItem {
  /** Entry type discriminant. Defaults to `"item"`. */
  type?: "item";
  /** Display label. */
  label: string;
  /** Icon name. */
  icon?: string;
  /** Whether this item is disabled. */
  disabled?: boolean;
  /** Whether this is a destructive action. */
  destructive?: boolean;
  /** Per-item slot overrides. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface DropdownMenuBaseSeparator {
  /** Entry type discriminant. */
  type: "separator";
  /** Per-separator slot overrides. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface DropdownMenuBaseLabel {
  /** Entry type discriminant. */
  type: "label";
  /** Label text. */
  text: string;
  /** Per-label slot overrides. */
  slots?: Record<string, Record<string, unknown>>;
}

export type DropdownMenuBaseEntry =
  | DropdownMenuBaseItem
  | DropdownMenuBaseSeparator
  | DropdownMenuBaseLabel;

export interface DropdownMenuBaseTrigger {
  /** Trigger button label. */
  label?: string;
  /** Trigger icon name. */
  icon?: string;
  /** Button variant. */
  variant?: "default" | "destructive" | "secondary" | "outline" | "ghost";
}

export interface DropdownMenuBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Trigger button configuration. */
  trigger: DropdownMenuBaseTrigger;
  /** Menu items. */
  items: DropdownMenuBaseEntry[];
  /** Called when a menu item is selected. */
  onSelect?: (item: DropdownMenuBaseItem, index: number) => void;
  /** Panel alignment relative to trigger. */
  align?: "start" | "center" | "end";
  /** Panel side relative to trigger. */
  side?: "top" | "bottom" | "left" | "right";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone DropdownMenu — a button-triggered floating menu with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <DropdownMenuBase
 *   trigger={{ label: "Options", icon: "more-vertical" }}
 *   items={[
 *     { label: "Edit", icon: "edit" },
 *     { type: "separator" },
 *     { label: "Delete", destructive: true },
 *   ]}
 *   onSelect={(item) => handleAction(item.label)}
 * />
 * ```
 */
export function DropdownMenuBase({
  id,
  trigger,
  items,
  onSelect,
  align = "start",
  side = "bottom",
  className,
  style,
  slots,
}: DropdownMenuBaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "dropdown-menu";
  const variant = trigger.variant ?? "default";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const triggerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: slots?.triggerLabel,
  });
  const triggerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: slots?.triggerIcon,
  });

  const actionableIndices = items
    .map((item, index) =>
      (item.type === undefined || item.type === "item") && !(item as DropdownMenuBaseItem).disabled ? index : -1,
    )
    .filter((index) => index !== -1);

  const open = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  const handleItemClick = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item || (item.type !== undefined && item.type !== "item") || (item as DropdownMenuBaseItem).disabled) {
        return;
      }

      onSelect?.(item as DropdownMenuBaseItem, index);
      close();
    },
    [close, items, onSelect],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const nextPosition =
          currentPosition < actionableIndices.length - 1 ? currentPosition + 1 : 0;
        setFocusedIndex(actionableIndices[nextPosition] ?? 0);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const previousPosition =
          currentPosition > 0 ? currentPosition - 1 : actionableIndices.length - 1;
        setFocusedIndex(actionableIndices[previousPosition] ?? 0);
        return;
      }

      if ((event.key === "Enter" || event.key === " ") && focusedIndex >= 0) {
        event.preventDefault();
        handleItemClick(focusedIndex);
      }
    },
    [actionableIndices, focusedIndex, handleItemClick, isOpen, open],
  );

  return (
    <div
      ref={containerRef}
      data-snapshot-component="dropdown-menu"
      data-testid="dropdown-menu"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <FloatingMenuStyles />
      <ButtonControl
        variant={variant}
        onClick={() => (isOpen ? close() : open())}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={slots?.trigger}
        testId="dropdown-menu-trigger"
        ariaExpanded={isOpen}
        ariaHasPopup="menu"
        activeStates={isOpen ? ["open"] : []}
      >
        {trigger.icon ? (
          <span
            data-snapshot-id={`${rootId}-trigger-icon`}
            className={triggerIconSurface.className}
            style={triggerIconSurface.style}
          >
            {renderIcon(trigger.icon, 16)}
          </span>
        ) : null}
        {trigger.label ? (
          <span
            data-snapshot-id={`${rootId}-trigger-label`}
            className={triggerLabelSurface.className}
            style={triggerLabelSurface.style}
          >
            {trigger.label}
          </span>
        ) : null}
      </ButtonControl>

      <FloatingPanel
        open={isOpen}
        onClose={close}
        containerRef={containerRef}
        side={side}
        align={align}
        surfaceId={`${rootId}-panel`}
        slot={slots?.panel}
        activeStates={isOpen ? ["open"] : []}
      >
        <div onKeyDown={handleKeyDown} data-testid="dropdown-menu-content">
          {items.map((entry, index) => {
            if (entry.type === "separator") {
              return (
                <MenuSeparator
                  key={`separator-${index}`}
                  surfaceId={`${rootId}-separator-${index}`}
                  slot={slots?.separator}
                />
              );
            }

            if (entry.type === "label") {
              return (
                <MenuLabel
                  key={`label-${index}`}
                  text={entry.text}
                  surfaceId={`${rootId}-label-${index}`}
                  slot={entry.slots?.label ?? slots?.label}
                />
              );
            }

            const item = entry as DropdownMenuBaseItem;
            return (
              <MenuItem
                key={`item-${index}`}
                label={item.label}
                icon={item.icon}
                onClick={() => handleItemClick(index)}
                disabled={item.disabled}
                destructive={item.destructive}
                active={focusedIndex === index}
                surfaceId={`${rootId}-item-${index}`}
                slot={item.slots?.item ?? slots?.item}
                labelSlot={item.slots?.itemLabel ?? slots?.itemLabel}
                iconSlot={item.slots?.itemIcon ?? slots?.itemIcon}
              />
            );
          })}
        </div>
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={triggerLabelSurface.scopedCss} />
      <SurfaceStyles css={triggerIconSurface.scopedCss} />
    </div>
  );
}
