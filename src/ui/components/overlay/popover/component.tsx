import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import type { PopoverConfig } from "./types";

/**
 * Trigger button variant styles.
 */
const TRIGGER_VARIANTS: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--sn-color-primary)",
    color: "var(--sn-color-primary-foreground)",
    border: "var(--sn-border-thin, 1px) solid transparent",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--sn-color-foreground, #111)",
    border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--sn-color-foreground, #111)",
    border: "var(--sn-border-thin, 1px) solid transparent",
  },
};

/**
 * Placement → CSS positioning offsets for the popover panel.
 */
const PLACEMENT_STYLES: Record<string, React.CSSProperties> = {
  bottom: {
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginTop: "var(--sn-spacing-xs, 0.25rem)",
  },
  top: {
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginBottom: "var(--sn-spacing-xs, 0.25rem)",
  },
  left: {
    right: "100%",
    top: "50%",
    transform: "translateY(-50%)",
    marginRight: "var(--sn-spacing-xs, 0.25rem)",
  },
  right: {
    left: "100%",
    top: "50%",
    transform: "translateY(-50%)",
    marginLeft: "var(--sn-spacing-xs, 0.25rem)",
  },
};

/**
 * Popover component — a floating content container triggered by a button click.
 *
 * Renders a trigger button and, when open, shows a floating panel positioned
 * relative to the trigger. Closes on outside click or Escape key.
 * Content is rendered via ComponentRenderer for recursive composition.
 *
 * @param props.config - The popover config from the manifest
 */
export function Popover({ config }: { config: PopoverConfig }) {
  const triggerText = useSubscribe(config.trigger) as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const placement = config.placement ?? "bottom";
  const triggerVariant = config.triggerVariant ?? "outline";
  const width = config.width ?? "auto";

  // Publish open state
  useEffect(() => {
    if (publish) {
      publish({ isOpen });
    }
  }, [publish, isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      setIsOpen(false);
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (visible === false) return null;

  return (
    <div
      data-snapshot-component="popover"
      ref={containerRef}
      className={config.className}
      onKeyDown={handleKeyDown}
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* Trigger button */}
      <button
        type="button"
        data-snapshot-popover-trigger=""
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          padding:
            "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          fontWeight: "var(--sn-font-weight-medium, 500)" as string,
          borderRadius: "var(--sn-radius-md, 0.375rem)",
          cursor: "pointer",
          lineHeight: 1.5,
          fontFamily: "inherit",
          ...TRIGGER_VARIANTS[triggerVariant],
        }}
      >
        {config.triggerIcon && (
          <Icon name={config.triggerIcon} size={16} color="currentColor" />
        )}
        {triggerText}
      </button>

      {/* Floating panel */}
      {isOpen && (
        <div
          data-snapshot-popover-content=""
          role="dialog"
          style={{
            position: "absolute",
            zIndex: "var(--sn-z-index-popover, 40)" as string,
            width,
            minWidth: "8rem",
            backgroundColor: "var(--sn-color-popover, var(--sn-color-card, #fff))",
            color: "var(--sn-color-popover-foreground, var(--sn-color-foreground, #111))",
            border:
              "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-lg, 0.5rem)",
            boxShadow:
              "var(--sn-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1))",
            padding: "var(--sn-spacing-md, 1rem)",
            ...PLACEMENT_STYLES[placement],
          }}
        >
          {config.content?.map((child, i) => (
            <ComponentRenderer
              key={(child as ComponentConfig).id ?? `popover-child-${i}`}
              config={child as ComponentConfig}
            />
          ))}
        </div>
      )}
    </div>
  );
}
