import React, { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { DropdownMenuConfig } from "./types";

const ANIMATION_DURATION = 150;

/**
 * Style map for trigger button variants.
 */
const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--sn-color-primary, #2563eb)",
    color: "var(--sn-color-primary-foreground, #fff)",
    border: "1px solid transparent",
  },
  secondary: {
    backgroundColor: "var(--sn-color-secondary, #f1f5f9)",
    color: "var(--sn-color-secondary-foreground, #0f172a)",
    border: "1px solid transparent",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--sn-color-foreground, #111827)",
    border: "1px solid var(--sn-color-border, #e5e7eb)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--sn-color-foreground, #111827)",
    border: "1px solid transparent",
  },
};

/**
 * DropdownMenu component — a trigger button that opens a positioned dropdown
 * with items, separators, labels, and keyboard navigation.
 *
 * @param props.config - The dropdown menu config from the manifest
 *
 * @example
 * ```json
 * {
 *   "type": "dropdown-menu",
 *   "trigger": { "label": "Actions", "variant": "outline" },
 *   "items": [
 *     { "type": "item", "label": "Edit", "action": { "type": "navigate", "to": "/edit" } },
 *     { "type": "separator" },
 *     { "type": "item", "label": "Delete", "destructive": true, "action": { "type": "api", "method": "DELETE", "endpoint": "/items/1" } }
 *   ]
 * }
 * ```
 */
export function DropdownMenu({ config }: { config: DropdownMenuConfig }) {
  const execute = useActionExecutor();
  const [isOpen, setIsOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const variant = config.trigger.variant ?? "default";
  const align = config.align ?? "start";
  const side = config.side ?? "bottom";

  // Collect actionable item indices for keyboard navigation
  const actionableIndices = config.items
    .map((item, i) => (item.type === "item" && !item.disabled ? i : -1))
    .filter((i) => i !== -1);

  const open = useCallback(() => {
    setIsOpen(true);
    setMounted(true);
    setFocusedIndex(-1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimating(true));
    });
  }, []);

  const close = useCallback(() => {
    setAnimating(false);
    setTimeout(() => {
      setMounted(false);
      setIsOpen(false);
      setFocusedIndex(-1);
    }, ANIMATION_DURATION);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, close]);

  const handleItemClick = useCallback(
    (index: number) => {
      const item = config.items[index];
      if (!item || item.type !== "item" || item.disabled) return;
      void execute(item.action);
      close();
    },
    [config.items, execute, close],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
          return;
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const currentPos = actionableIndices.indexOf(focusedIndex);
        const nextPos =
          currentPos < actionableIndices.length - 1 ? currentPos + 1 : 0;
        setFocusedIndex(actionableIndices[nextPos] ?? 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentPos = actionableIndices.indexOf(focusedIndex);
        const prevPos =
          currentPos > 0 ? currentPos - 1 : actionableIndices.length - 1;
        setFocusedIndex(actionableIndices[prevPos] ?? 0);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleItemClick(focusedIndex);
        }
      }
    },
    [isOpen, focusedIndex, actionableIndices, open, handleItemClick],
  );

  // Alignment styles for menu positioning
  const alignStyle: React.CSSProperties =
    align === "end"
      ? { right: 0 }
      : align === "center"
        ? { left: "50%", transform: "translateX(-50%)" }
        : { left: 0 };

  const sideStyle: React.CSSProperties =
    side === "top"
      ? { bottom: "100%", marginBottom: "var(--sn-spacing-xs, 0.25rem)" }
      : { top: "100%", marginTop: "var(--sn-spacing-xs, 0.25rem)" };

  return (
    <div
      ref={containerRef}
      data-snapshot-component="dropdown-menu"
      data-testid="dropdown-menu"
      className={config.className}
      style={{
        position: "relative",
        display: "inline-block",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{`
        [data-snapshot-component="dropdown-menu"] > button:focus { outline: none; }
        [data-snapshot-component="dropdown-menu"] > button:hover {
          filter: brightness(0.95);
        }
        [data-snapshot-component="dropdown-menu"] > button:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        [data-snapshot-component="dropdown-menu"] [role="menuitem"]:focus { outline: none; }
        [data-snapshot-component="dropdown-menu"] [role="menuitem"]:hover {
          background-color: var(--sn-color-secondary, #f3f4f6);
        }
        [data-snapshot-component="dropdown-menu"] [role="menuitem"]:focus-visible {
          background-color: var(--sn-color-secondary, #f3f4f6);
        }
      `}</style>
      {/* Trigger button */}
      <button
        type="button"
        data-testid="dropdown-menu-trigger"
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{
          ...VARIANT_STYLES[variant],
          padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
          borderRadius: "var(--sn-radius-md, 0.375rem)",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          fontFamily: "inherit",
          lineHeight: 1.5,
        }}
      >
        {config.trigger.icon && <Icon name={config.trigger.icon} size={16} />}
        {config.trigger.label && <span>{config.trigger.label}</span>}
      </button>

      {/* Menu */}
      {mounted && (
        <div
          ref={menuRef}
          role="menu"
          data-testid="dropdown-menu-content"
          onKeyDown={handleKeyDown}
          style={{
            position: "absolute",
            ...alignStyle,
            ...sideStyle,
            zIndex: "var(--sn-z-index-dropdown, 10)" as unknown as number,
            minWidth: "180px",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            border: "1px solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            boxShadow:
              "var(--sn-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1))",
            padding: "var(--sn-spacing-xs, 0.25rem) 0",
            opacity: animating ? 1 : 0,
            transform: animating ? "scale(1)" : "scale(0.95)",
            transformOrigin: side === "top" ? "bottom" : "top",
            transition: `opacity ${ANIMATION_DURATION}ms ease, transform ${ANIMATION_DURATION}ms ease`,
          }}
        >
          {config.items.map((entry, i) => {
            if (entry.type === "separator") {
              return (
                <div
                  key={`sep-${i}`}
                  role="separator"
                  data-testid="dropdown-menu-separator"
                  style={{
                    height: "1px",
                    backgroundColor: "var(--sn-color-border, #e5e7eb)",
                    margin: "var(--sn-spacing-xs, 0.25rem) 0",
                  }}
                />
              );
            }

            if (entry.type === "label") {
              return (
                <div
                  key={`label-${i}`}
                  data-testid="dropdown-menu-label"
                  style={{
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    fontWeight: "var(--sn-font-weight-semibold, 600)",
                    color: "var(--sn-color-muted-foreground, #6b7280)",
                    padding:
                      "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                    userSelect: "none",
                  }}
                >
                  {entry.text}
                </div>
              );
            }

            // type === "item"
            const isFocused = focusedIndex === i;
            const isDisabled = entry.disabled === true;

            return (
              <div
                key={`item-${i}`}
                role="menuitem"
                data-testid="dropdown-menu-item"
                tabIndex={-1}
                aria-disabled={isDisabled || undefined}
                onClick={() => !isDisabled && handleItemClick(i)}
                onMouseEnter={() => !isDisabled && setFocusedIndex(i)}
                onMouseLeave={() => setFocusedIndex(-1)}
                style={{
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  color: entry.destructive
                    ? "var(--sn-color-destructive, #dc2626)"
                    : "var(--sn-color-foreground, #111827)",
                  backgroundColor: isFocused
                    ? "var(--sn-color-accent, #f1f5f9)"
                    : "transparent",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled
                    ? "var(--sn-opacity-disabled, 0.5)"
                    : undefined,
                  pointerEvents: undefined,
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-xs, 0.25rem)",
                  userSelect: "none",
                  transition:
                    "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                }}
              >
                {entry.icon && <Icon name={entry.icon} size={16} />}
                <span>{entry.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
