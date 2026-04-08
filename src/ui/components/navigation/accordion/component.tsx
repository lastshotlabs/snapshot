import React, { useState, useCallback } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import type { AccordionConfig } from "./types";

/**
 * Resolves the initial set of open indices from the config.
 */
function resolveDefaultOpen(
  defaultOpen: number | number[] | undefined,
): Set<number> {
  if (defaultOpen === undefined) return new Set();
  if (typeof defaultOpen === "number") return new Set([defaultOpen]);
  return new Set(defaultOpen);
}

/**
 * Chevron indicator component for accordion headers.
 */
function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        transition: `transform var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)`,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        flexShrink: 0,
      }}
    >
      ▼
    </span>
  );
}

/**
 * Accordion component — renders expandable/collapsible content sections.
 *
 * Supports single-open and multi-open modes, three visual variants
 * (default, bordered, separated), and renders child content via
 * ComponentRenderer for recursive manifest composition.
 *
 * @param props.config - The accordion config from the manifest
 */
export function AccordionComponent({ config }: { config: AccordionConfig }) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(() =>
    resolveDefaultOpen(config.defaultOpen),
  );

  const mode = config.mode ?? "single";
  const variant = config.variant ?? "default";
  const iconPosition = config.iconPosition ?? "right";

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          if (mode === "single") {
            next.clear();
          }
          next.add(index);
        }
        return next;
      });
    },
    [mode],
  );

  const containerStyle: React.CSSProperties =
    variant === "bordered"
      ? {
          border: "1px solid var(--sn-color-border, #e5e7eb)",
          borderRadius: "var(--sn-radius-md, 0.5rem)",
          overflow: "hidden",
        }
      : variant === "separated"
        ? {
            display: "flex",
            flexDirection: "column",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          }
        : {};

  return (
    <div
      data-snapshot-component="accordion"
      data-testid="accordion"
      className={config.className}
      style={{
        ...containerStyle,
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{`
        [data-snapshot-component="accordion"] button:not([disabled]):hover {
          background: var(--sn-color-secondary, #f3f4f6);
        }
        [data-snapshot-component="accordion"] button:focus {
          outline: none;
        }
        [data-snapshot-component="accordion"] button:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
      `}</style>
      {config.items.map((item, index) => {
        const isOpen = openIndices.has(index);
        const isDisabled = item.disabled === true;

        const itemStyle: React.CSSProperties =
          variant === "separated"
            ? {
                border: "1px solid var(--sn-color-border, #e5e7eb)",
                borderRadius: "var(--sn-radius-md, 0.5rem)",
                boxShadow: "var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
                backgroundColor: "var(--sn-color-card, #ffffff)",
                overflow: "hidden",
              }
            : {};

        const showDivider =
          variant !== "separated" && index < config.items.length - 1;

        return (
          <div
            key={index}
            data-testid={`accordion-item-${index}`}
            style={itemStyle}
          >
            {/* Header */}
            <button
              type="button"
              id={`accordion-${config.id ?? "default"}-btn-${index}`}
              data-testid={`accordion-header-${index}`}
              onClick={() => !isDisabled && toggle(index)}
              aria-expanded={isOpen}
              aria-controls={`accordion-${config.id ?? "default"}-panel-${index}`}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: iconPosition === "left" ? "row-reverse" : "row",
                width: "100%",
                padding: "var(--sn-spacing-md, 1rem)",
                border: "none",
                background: "none",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? "var(--sn-opacity-disabled, 0.5)" : 1,
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                fontWeight:
                  "var(--sn-font-weight-semibold, 600)" as unknown as number,
                color: "var(--sn-color-foreground, #111827)",
                textAlign: "left",
                gap: "var(--sn-spacing-sm, 0.5rem)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-xs, 0.25rem)",
                  flex: 1,
                }}
              >
                {item.icon && (
                  <span
                    aria-hidden="true"
                    style={{
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                      fontSize: "var(--sn-font-size-md, 1rem)",
                    }}
                  >
                    {item.icon}
                  </span>
                )}
                {item.title}
              </span>
              <Chevron open={isOpen} />
            </button>

            {/* Content panel — uses CSS grid row trick for smooth height animation */}
            <div
              id={`accordion-${config.id ?? "default"}-panel-${index}`}
              data-testid={`accordion-panel-${index}`}
              role="region"
              aria-labelledby={`accordion-${config.id ?? "default"}-btn-${index}`}
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: `grid-template-rows var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)`,
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: `0 var(--sn-spacing-md, 1rem) var(--sn-spacing-md, 1rem)`,
                    opacity: isOpen ? 1 : 0,
                    transition: `opacity var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)`,
                  }}
                >
                  {item.content.map((child, childIndex) => (
                    <ComponentRenderer
                      key={
                        (child as ComponentConfig).id ??
                        `accordion-${index}-child-${childIndex}`
                      }
                      config={child as ComponentConfig}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Divider for default/bordered variants */}
            {showDivider && (
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--sn-color-border, #e5e7eb)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
