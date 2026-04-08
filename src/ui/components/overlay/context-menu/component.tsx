import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { ContextMenuConfig } from "./types";

/**
 * ContextMenu component — renders a right-click context menu at cursor position.
 *
 * Provides a trigger area that responds to contextmenu events.
 * Menu items support icons, destructive variants, separators, and disabled states.
 * Each item can dispatch an action when clicked.
 *
 * @param props.config - The context menu config from the manifest
 */
export function ContextMenu({ config }: { config: ContextMenuConfig }) {
  const execute = useActionExecutor();
  const publish = config.id ? usePublish(config.id) : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const items = config.items ?? [];

  // Publish open state
  useEffect(() => {
    publish?.({ isOpen });
  }, [isOpen, publish]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPosition({ x: e.clientX, y: e.clientY });
      setIsOpen(true);
    },
    [],
  );

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let { x, y } = position;
    if (x + rect.width > vw) x = vw - rect.width - 8;
    if (y + rect.height > vh) y = vh - rect.height - 8;
    if (x < 0) x = 8;
    if (y < 0) y = 8;

    if (x !== position.x || y !== position.y) {
      setPosition({ x, y });
    }
  }, [isOpen, position]);

  const handleItemClick = useCallback(
    (item: NonNullable<ContextMenuConfig["items"]>[number]) => {
      if (item.disabled || item.separator) return;
      close();
      if (item.action) {
        void execute(item.action);
      }
    },
    [close, execute],
  );

  // Visibility check
  if (config.visible === false) return null;

  return (
    <div
      data-snapshot-component="context-menu"
      className={config.className}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* Trigger area */}
      <div
        ref={triggerRef}
        data-testid="context-menu-area"
        onContextMenu={handleContextMenu}
        style={{
          cursor: "context-menu",
          padding: "var(--sn-spacing-sm, 0.5rem)",
          userSelect: "none",
        }}
      >
        {config.triggerText && (
          <span
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {config.triggerText}
          </span>
        )}
      </div>

      {/* Floating menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          data-testid="context-menu-dropdown"
          style={{
            position: "fixed",
            top: position.y,
            left: position.x,
            zIndex: "var(--sn-z-index-popover, 60)",
            minWidth: "160px",
            backgroundColor: "var(--sn-color-popover, #fff)",
            color: "var(--sn-color-popover-foreground, #111)",
            border: "1px solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            boxShadow: "var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))",
            padding: "var(--sn-spacing-2xs, 0.125rem) 0",
            overflow: "hidden",
          }}
        >
          {items.map((item, i) => {
            if (item.separator) {
              return (
                <div
                  key={`sep-${i}`}
                  role="separator"
                  style={{
                    height: "1px",
                    backgroundColor: "var(--sn-color-border, #e5e7eb)",
                    margin: "var(--sn-spacing-2xs, 0.125rem) 0",
                  }}
                />
              );
            }

            const isDestructive = item.variant === "destructive";
            const isDisabled = item.disabled === true;

            return (
              <button
                key={`item-${i}`}
                type="button"
                role="menuitem"
                disabled={isDisabled}
                onClick={() => handleItemClick(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  width: "100%",
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  border: "none",
                  background: "none",
                  cursor: isDisabled ? "default" : "pointer",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  lineHeight: "var(--sn-leading-normal, 1.5)",
                  color: isDisabled
                    ? "var(--sn-color-muted-foreground, #6b7280)"
                    : isDestructive
                      ? "var(--sn-color-destructive, #ef4444)"
                      : "var(--sn-color-popover-foreground, #111)",
                  opacity: isDisabled
                    ? "var(--sn-opacity-disabled, 0.5)"
                    : 1,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--sn-color-accent, #f3f4f6)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                {item.icon && (
                  <Icon
                    name={item.icon}
                    size={14}
                    color={
                      isDestructive
                        ? "var(--sn-color-destructive, #ef4444)"
                        : "currentColor"
                    }
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
