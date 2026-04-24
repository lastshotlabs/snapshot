'use client';

import React, { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { ButtonControl } from "../../forms/button";
import { SurfaceStyles } from "../../_base/surface-styles";
import { FloatingPanel } from "../../primitives/floating-menu";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface PopoverBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Trigger button text. */
  triggerLabel?: string;
  /** Trigger icon name. */
  triggerIcon?: string;
  /** Trigger button variant. */
  triggerVariant?: "default" | "destructive" | "secondary" | "outline" | "ghost" | "link";
  /** Title displayed inside the popover. */
  title?: string;
  /** Description text displayed below the title. */
  description?: string;
  /** Placement of the popover panel. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Fixed width for the panel. */
  width?: string;
  /** Called when the popover opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Footer content. */
  footer?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;

  /** React children — rendered as the popover content. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Popover — a button-triggered floating panel with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <PopoverBase
 *   triggerLabel="Open"
 *   title="Settings"
 *   description="Configure your preferences"
 * >
 *   <form>...</form>
 * </PopoverBase>
 * ```
 */
export function PopoverBase({
  id,
  triggerLabel = "",
  triggerIcon,
  triggerVariant = "outline",
  title,
  description,
  placement = "bottom",
  width,
  onOpenChange,
  footer,
  className,
  style,
  slots,
  children,
}: PopoverBaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "popover";

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onOpenChange?.(next);
  };

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-flex",
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
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "grid",
      gap: "0.75rem",
    },
    componentSurface: slots?.content,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "0.75rem",
    },
    componentSurface: slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontWeight: 600,
    },
    componentSurface: slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground)",
    },
    componentSurface: slots?.description,
  });
  const footerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-footer`,
    implementationBase: {
      display: "grid",
      gap: "0.5rem",
    },
    componentSurface: slots?.footer,
  });
  const closeButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-close-button`,
    implementationBase: {
      flexShrink: 0,
    },
    componentSurface: slots?.closeButton,
  });

  return (
    <div
      data-snapshot-component="popover"
      data-snapshot-id={`${rootId}-root`}
      ref={containerRef}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <ButtonControl
        variant={triggerVariant}
        onClick={handleToggle}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={slots?.trigger}
        ariaExpanded={isOpen}
        ariaHasPopup="dialog"
        activeStates={isOpen ? ["open"] : []}
      >
        {triggerIcon ? (
          <span
            data-snapshot-id={`${rootId}-trigger-icon`}
            className={triggerIconSurface.className}
            style={triggerIconSurface.style}
          >
            {renderIcon(triggerIcon, 16)}
          </span>
        ) : null}
        <span
          data-snapshot-id={`${rootId}-trigger-label`}
          className={triggerLabelSurface.className}
          style={triggerLabelSurface.style}
        >
          {triggerLabel}
        </span>
      </ButtonControl>

      <FloatingPanel
        open={isOpen}
        onClose={handleClose}
        containerRef={containerRef}
        side={placement}
        surfaceId={`${rootId}-panel`}
        slot={slots?.panel}
        activeStates={isOpen ? ["open"] : []}
        style={width ? ({ width } as React.CSSProperties) : undefined}
      >
        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {title || description ? (
            <div
              data-snapshot-id={`${rootId}-header`}
              className={headerSurface.className}
              style={headerSurface.style}
            >
              <div style={{ display: "grid", gap: "0.5rem", flex: 1 }}>
                {title ? (
                  <div
                    data-snapshot-id={`${rootId}-title`}
                    className={titleSurface.className}
                    style={titleSurface.style}
                  >
                    {title}
                  </div>
                ) : null}
                {description ? (
                  <div
                    data-snapshot-id={`${rootId}-description`}
                    className={descriptionSurface.className}
                    style={descriptionSurface.style}
                  >
                    {description}
                  </div>
                ) : null}
              </div>
              <ButtonControl
                variant="ghost"
                onClick={handleClose}
                surfaceId={`${rootId}-close-button`}
                surfaceConfig={slots?.closeButton}
                itemSurfaceConfig={closeButtonSurface.resolvedConfigForWrapper}
                ariaLabel="Close popover"
              >
                x
              </ButtonControl>
            </div>
          ) : null}
          {children}
          {footer ? (
            <div
              data-snapshot-id={`${rootId}-footer`}
              className={footerSurface.className}
              style={footerSurface.style}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={triggerLabelSurface.scopedCss} />
      <SurfaceStyles css={triggerIconSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={footerSurface.scopedCss} />
      <SurfaceStyles css={closeButtonSurface.scopedCss} />
    </div>
  );
}
