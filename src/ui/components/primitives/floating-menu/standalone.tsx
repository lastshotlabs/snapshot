'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { FloatingPanel, MenuItem, MenuSeparator, MenuLabel } from "./shared";

// ── Standalone item types ────────────────────────────────────────────────────

export interface FloatingMenuBaseItem {
  /** Entry type discriminator. */
  type: "item";
  /** Pre-resolved display label. */
  label: string;
  /** Icon name. */
  icon?: string;
  /** Disable the item. */
  disabled?: boolean;
  /** Mark item as destructive. */
  destructive?: boolean;
  /** Callback fired when item is selected. */
  onAction?: () => void;
  /** Slot overrides for this item. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface FloatingMenuBaseSeparator {
  /** Entry type discriminator. */
  type: "separator";
  /** Slot overrides for this separator. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface FloatingMenuBaseLabel {
  /** Entry type discriminator. */
  type: "label";
  /** Pre-resolved label text. */
  text: string;
  /** Slot overrides for this label. */
  slots?: Record<string, Record<string, unknown>>;
}

export type FloatingMenuBaseEntry =
  | FloatingMenuBaseItem
  | FloatingMenuBaseSeparator
  | FloatingMenuBaseLabel;

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface FloatingMenuBaseProps {
  /** Pre-resolved trigger label text. */
  triggerLabel?: string;
  /** Icon name for the trigger button. */
  triggerIcon?: string;
  /** Menu entries — items, separators, and labels with pre-resolved text. */
  items?: FloatingMenuBaseEntry[];
  /** Controlled open state. */
  open?: boolean;
  /** Menu alignment. */
  align?: "start" | "center" | "end";
  /** Menu side. */
  side?: "top" | "bottom" | "left" | "right";

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, trigger, panel, item, separator, label, itemLabel, itemIcon). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation,
 * and pre-resolved items. No manifest context required.
 *
 * @example
 * ```tsx
 * <FloatingMenuBase
 *   triggerLabel="Actions"
 *   items={[
 *     { type: "item", label: "Edit", onAction: () => {} },
 *     { type: "separator" },
 *     { type: "item", label: "Delete", destructive: true, onAction: () => {} },
 *   ]}
 * />
 * ```
 */
export function FloatingMenuBase({
  triggerLabel = "Open menu",
  triggerIcon,
  items = [],
  open: controlledOpen,
  align = "start",
  side = "bottom",
  id,
  className,
  style,
  slots,
}: FloatingMenuBaseProps) {
  const [isOpen, setIsOpen] = useState(Boolean(controlledOpen));
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (typeof controlledOpen === "boolean") {
      setIsOpen(controlledOpen);
      if (!controlledOpen) {
        setFocusedIndex(-1);
      }
    }
  }, [controlledOpen]);

  const rootId = id ?? "floating-menu";
  const componentSurface = className || style ? { className, style } : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface,
    itemSurface: slots?.root,
  });

  const actionableIndices = items
    .map((item, index) =>
      item.type === "item" && item.disabled !== true ? index : -1,
    )
    .filter((index) => index !== -1);

  const openMenu = useCallback((nextFocusedIndex = -1) => {
    setIsOpen(true);
    setFocusedIndex(nextFocusedIndex);
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    setFocusedIndex(-1);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  const handleItemClick = useCallback(
    (entry: FloatingMenuBaseEntry) => {
      if (entry.type !== "item" || entry.disabled) {
        return;
      }

      if (entry.onAction) {
        entry.onAction();
      }
      closeMenu();
    },
    [closeMenu],
  );

  useEffect(() => {
    if (!isOpen || focusedIndex < 0) {
      return;
    }

    itemRefs.current[focusedIndex]?.focus();
  }, [focusedIndex, isOpen]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!isOpen) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          openMenu(actionableIndices[0] ?? -1);
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          openMenu(actionableIndices[actionableIndices.length - 1] ?? -1);
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMenu(actionableIndices[0] ?? -1);
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const nextPosition =
          currentPosition === -1 || currentPosition >= actionableIndices.length - 1
            ? 0
            : currentPosition + 1;
        setFocusedIndex(actionableIndices[nextPosition] ?? -1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const previousPosition =
          currentPosition <= 0
            ? actionableIndices.length - 1
            : currentPosition - 1;
        setFocusedIndex(actionableIndices[previousPosition] ?? -1);
        return;
      }

      if ((event.key === "Enter" || event.key === " ") && focusedIndex >= 0) {
        event.preventDefault();
        const entry = items[focusedIndex];
        if (entry) {
          handleItemClick(entry);
        }
      }
    },
    [actionableIndices, focusedIndex, handleItemClick, isOpen, items, openMenu],
  );

  return (
    <>
      <div
        ref={containerRef}
        data-snapshot-component="floating-menu"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <ButtonControl
          buttonRef={triggerRef}
          variant="ghost"
          onClick={() => (isOpen ? closeMenu() : openMenu())}
          onKeyDown={handleKeyDown}
          surfaceId={`${rootId}-trigger`}
          surfaceConfig={slots?.trigger}
          ariaLabel={triggerLabel}
          ariaExpanded={isOpen}
          ariaHasPopup="menu"
          activeStates={isOpen ? ["open"] : []}
        >
          {triggerIcon ? renderIcon(triggerIcon, 16) : null}
          {triggerLabel}
        </ButtonControl>

        <FloatingPanel
          open={isOpen}
          onClose={closeMenu}
          containerRef={containerRef}
          side={side}
          align={align}
          surfaceId={`${rootId}-panel`}
          slot={slots?.panel}
          activeStates={isOpen ? ["open"] : []}
        >
          <div onKeyDown={handleKeyDown}>
            {items.map((entry, index) => {
              if (entry.type === "separator") {
                return (
                  <MenuSeparator
                    key={`separator-${index}`}
                    surfaceId={`${rootId}-separator-${index}`}
                    slot={entry.slots?.separator ?? slots?.separator}
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

              return (
                <MenuItem
                  key={`item-${index}`}
                  label={entry.label}
                  icon={entry.icon}
                  onClick={() => handleItemClick(entry)}
                  disabled={entry.disabled}
                  destructive={entry.destructive}
                  active={focusedIndex === index}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  buttonRef={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  surfaceId={`${rootId}-item-${index}`}
                  slot={entry.slots?.item ?? slots?.item}
                  labelSlot={entry.slots?.itemLabel ?? slots?.itemLabel}
                  iconSlot={entry.slots?.itemIcon ?? slots?.itemIcon}
                />
              );
            })}
          </div>
        </FloatingPanel>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
