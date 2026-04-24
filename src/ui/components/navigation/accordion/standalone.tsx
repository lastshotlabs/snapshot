'use client';

import { useCallback, useState, type CSSProperties, type ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface AccordionBaseItem {
  /** Title text for the accordion header. */
  title: string;
  /** Icon name rendered before the title. */
  icon?: string;
  /** Whether this item is disabled. */
  disabled?: boolean;
  /** Content rendered inside the expanded panel. */
  content: ReactNode;
  /** Per-item slot overrides. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface AccordionBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Accordion items. */
  items: AccordionBaseItem[];
  /** Expansion mode — "single" collapses siblings; "multiple" allows any. */
  mode?: "single" | "multiple";
  /** Visual variant. */
  variant?: "default" | "bordered" | "separated";
  /** Position of the chevron icon. */
  iconPosition?: "left" | "right";
  /** Index or indices of items open by default. */
  defaultOpen?: number | number[];

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveDefaultOpen(
  defaultOpen: number | number[] | undefined,
): Set<number> {
  if (defaultOpen === undefined) return new Set();
  if (typeof defaultOpen === "number") return new Set([defaultOpen]);
  return new Set(defaultOpen);
}

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        transition:
          "transform var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        flexShrink: 0,
      }}
    >
      {"\u25be"}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Accordion — an expandable/collapsible panel list with plain React
 * children. No manifest context required.
 *
 * @example
 * ```tsx
 * <AccordionBase
 *   items={[
 *     { title: "Section 1", content: <p>Content 1</p> },
 *     { title: "Section 2", content: <p>Content 2</p> },
 *   ]}
 * />
 * ```
 */
export function AccordionBase({
  id,
  items,
  mode = "single",
  variant = "default",
  iconPosition = "right",
  defaultOpen,
  className,
  style,
  slots,
}: AccordionBaseProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(() =>
    resolveDefaultOpen(defaultOpen),
  );

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          if (mode === "single") next.clear();
          next.add(index);
        }
        return next;
      });
    },
    [mode],
  );

  const rootId = id ?? "accordion";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase:
      variant === "bordered"
        ? {
            border:
              "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 0.5rem)",
            overflow: "hidden",
          }
        : variant === "separated"
          ? {
              display: "flex",
              flexDirection: "column",
              gap: "sm",
            }
          : undefined,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <div
      data-snapshot-component="accordion"
      data-testid="accordion"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {items.map((item, index) => {
        const isOpen = openIndices.has(index);
        const isDisabled = item.disabled === true;

        const itemSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}`,
          implementationBase:
            variant === "separated"
              ? {
                  border:
                    "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
                  borderRadius: "var(--sn-radius-md, 0.5rem)",
                  shadow: "sm",
                  bg: "var(--sn-color-card, #ffffff)",
                  overflow: "hidden",
                }
              : undefined,
          componentSurface: slots?.item,
          itemSurface: item.slots?.item,
          activeStates: [
            ...(isOpen ? ["open"] : []),
            ...(isDisabled ? ["disabled"] : []),
          ] as Array<"open" | "disabled">,
        });
        const triggerSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-trigger-${index}`,
          implementationBase: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: "sm",
            paddingX: "md",
            paddingY: "sm",
            bg: "transparent",
            color: "var(--sn-color-foreground, #111827)",
            hover: isDisabled
              ? undefined
              : { bg: "var(--sn-color-secondary, #f3f4f6)" },
            focus: { ring: true },
            style: {
              border: "none",
              borderRadius: 0,
              textAlign: "left",
            },
          },
          componentSurface: slots?.trigger,
          itemSurface: item.slots?.trigger,
          activeStates: [
            ...(isOpen ? ["open"] : []),
            ...(isDisabled ? ["disabled"] : []),
          ] as Array<"open" | "disabled">,
        });
        const triggerLabelSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-trigger-label-${index}`,
          implementationBase: {
            display: "flex",
            alignItems: "center",
            gap: "xs",
            flex: "1",
            style: {
              minWidth: 0,
              whiteSpace: "nowrap",
            },
          },
          componentSurface: slots?.triggerLabel,
          itemSurface: item.slots?.triggerLabel,
        });
        const triggerIconSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-trigger-icon-${index}`,
          implementationBase: {
            display: "inline-flex",
            alignItems: "center",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            style: { flexShrink: 0 },
          },
          componentSurface: slots?.triggerIcon,
          itemSurface: item.slots?.triggerIcon,
        });
        const contentSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-content-${index}`,
          implementationBase: {
            display: "grid",
            style: {
              gridTemplateRows: isOpen ? "1fr" : "0fr",
              transition:
                "grid-template-rows var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
            },
          },
          componentSurface: slots?.content,
          itemSurface: item.slots?.content,
          activeStates: isOpen ? ["open"] : [],
        });

        const headerLabel = (
          <span
            data-snapshot-id={`${rootId}-trigger-label-${index}`}
            className={triggerLabelSurface.className}
            style={triggerLabelSurface.style}
          >
            {item.icon ? (
              <span
                aria-hidden="true"
                data-snapshot-id={`${rootId}-trigger-icon-${index}`}
                className={triggerIconSurface.className}
                style={triggerIconSurface.style}
              >
                {renderIcon(item.icon, 16)}
              </span>
            ) : null}
            {item.title}
          </span>
        );

        return (
          <div
            key={index}
            data-testid={`accordion-item-${index}`}
            data-snapshot-id={`${rootId}-item-${index}`}
            className={itemSurface.className}
            style={itemSurface.style}
          >
            <ButtonControl
              type="button"
              variant="ghost"
              size="md"
              id={`${rootId}-header-${index}`}
              data-testid={`accordion-header-${index}`}
              onClick={() => !isDisabled && toggle(index)}
              disabled={isDisabled}
              ariaExpanded={isOpen}
              surfaceId={`${rootId}-trigger-${index}`}
              surfaceConfig={triggerSurface.resolvedConfigForWrapper}
              activeStates={[
                ...(isOpen ? ["open"] : []),
                ...(isDisabled ? ["disabled"] : []),
              ] as Array<"open" | "disabled">}
            >
              {iconPosition === "left" ? <Chevron open={isOpen} /> : null}
              {headerLabel}
              {iconPosition === "right" ? <Chevron open={isOpen} /> : null}
            </ButtonControl>

            <div
              data-testid={`accordion-panel-${index}`}
              data-accordion-content=""
              role="region"
              aria-labelledby={`${rootId}-header-${index}`}
              data-snapshot-id={`${rootId}-content-${index}`}
              className={contentSurface.className}
              style={contentSurface.style}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding:
                      "0 var(--sn-spacing-md, 1rem) var(--sn-spacing-md, 1rem)",
                    opacity: isOpen ? 1 : 0,
                    transition:
                      "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
                  }}
                >
                  {item.content}
                </div>
              </div>
            </div>

            {variant !== "separated" && index < items.length - 1 ? (
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--sn-color-border, #e5e7eb)",
                }}
              />
            ) : null}
            <SurfaceStyles css={itemSurface.scopedCss} />
            <SurfaceStyles css={triggerSurface.scopedCss} />
            <SurfaceStyles css={triggerLabelSurface.scopedCss} />
            <SurfaceStyles css={triggerIconSurface.scopedCss} />
            <SurfaceStyles css={contentSurface.scopedCss} />
          </div>
        );
      })}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
