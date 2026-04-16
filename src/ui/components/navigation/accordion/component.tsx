'use client';

import { useCallback, useState } from "react";
import { renderIcon } from "../../../icons/render";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { AccordionConfig } from "./types";

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
          if (mode === "single") next.clear();
          next.add(index);
        }
        return next;
      });
    },
    [mode],
  );

  const rootId = config.id ?? "accordion";
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
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });

  return (
    <div
      data-snapshot-component="accordion"
      data-testid="accordion"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {config.items.map((item, index) => {
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
          componentSurface: config.slots?.item,
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
          componentSurface: config.slots?.trigger,
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
          componentSurface: config.slots?.triggerLabel,
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
          componentSurface: config.slots?.triggerIcon,
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
          componentSurface: config.slots?.content,
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

            {variant !== "separated" && index < config.items.length - 1 ? (
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
