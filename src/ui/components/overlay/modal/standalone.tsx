'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { useFocusTrap } from "../../_base/use-focus-trap";
import { ButtonControl } from "../../forms/button";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ModalBaseFooterAction {
  /** Button label. */
  label: string;
  /** Button variant. */
  variant?: "default" | "destructive" | "secondary" | "outline" | "ghost";
  /** Called when clicked. */
  onClick?: () => void;
}

export interface ModalBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Modal title. */
  title?: string;
  /** Modal size. */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the modal should close. */
  onClose: () => void;
  /** Whether to trap focus inside the modal. */
  trapFocus?: boolean;
  /** Selector for the element to focus on open. */
  initialFocus?: string;
  /** Whether to return focus on close. */
  returnFocus?: boolean;
  /** Footer actions. */
  footer?: ModalBaseFooterAction[];
  /** Footer alignment. */
  footerAlign?: "left" | "center" | "right";
  /** Called when the modal opens. */
  onOpen?: () => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;

  /** React children — rendered as the modal body. */
  children?: ReactNode;
}

// ── Constants ───────────────────────────────────────────────────────────────

const SIZE_MAP: Record<string, string> = {
  sm: "var(--sn-modal-size-sm, 24rem)",
  md: "var(--sn-modal-size-md, 32rem)",
  lg: "var(--sn-modal-size-lg, 42rem)",
  xl: "var(--sn-modal-size-xl, 56rem)",
  full: "100vw",
};

const ANIMATION_DURATION = 200;

const ALIGN_MAP: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Modal — a centered overlay dialog with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <ModalBase
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Profile"
 *   footer={[
 *     { label: "Cancel", variant: "secondary", onClick: () => setIsOpen(false) },
 *     { label: "Save", onClick: handleSave },
 *   ]}
 * >
 *   <form>...</form>
 * </ModalBase>
 * ```
 */
export function ModalBase({
  id,
  title,
  size = "md",
  open,
  onClose,
  trapFocus = true,
  initialFocus,
  returnFocus = true,
  footer,
  footerAlign = "right",
  onOpen,
  className,
  style,
  slots,
  children,
}: ModalBaseProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const previousOpenRef = useRef<boolean | undefined>(undefined);
  const rootId = id ?? "modal";
  const maxWidth: string = SIZE_MAP[size] ?? SIZE_MAP.md!;

  useEffect(() => {
    if (open) {
      setMounted(true);
      const enterTimer = setTimeout(() => setAnimating(true), 10);
      return () => clearTimeout(enterTimer);
    } else if (mounted) {
      setAnimating(false);
      const exitTimer = setTimeout(() => setMounted(false), ANIMATION_DURATION);
      return () => clearTimeout(exitTimer);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && animating && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [animating, open]);

  useEffect(() => {
    const previousOpen = previousOpenRef.current;
    previousOpenRef.current = open;

    if (open && previousOpen !== true) {
      onOpen?.();
    }
  }, [open, onOpen]);

  useFocusTrap(
    open && animating && trapFocus,
    dialogRef,
    { initialFocus, returnFocus },
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  if (!mounted) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "fixed",
      inset: 0,
      zIndex: "var(--sn-z-index-modal, 40)",
      display: "flex",
      alignItems: size === "full" ? "stretch" : "center",
      justifyContent: "center",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
    activeStates: open ? ["open"] : [],
  });
  const overlaySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-overlay`,
    implementationBase: {
      position: "fixed",
      inset: 0,
      backgroundColor: "var(--sn-modal-overlay, rgba(0, 0, 0, 0.5))",
      style: {
        opacity: animating ? 1 : 0,
        transition: `opacity var(--sn-duration-normal, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease)`,
        zIndex: -1,
      },
    },
    componentSurface: slots?.overlay,
    activeStates: open ? ["open"] : [],
  });
  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      position: "relative",
      width: "100%",
      maxWidth,
      maxHeight: size === "full" ? "100vh" : "85vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      outline: "none",
      backgroundColor: "var(--sn-color-surface, #fff)",
      borderRadius: size === "full" ? "0" : "var(--sn-radius-lg, 0.5rem)",
      boxShadow:
        "var(--sn-shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.25))",
      style: {
        opacity: animating ? 1 : 0,
        transform: animating ? "scale(1)" : "scale(0.95)",
        transition: `opacity var(--sn-duration-normal, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease), transform var(--sn-duration-normal, ${ANIMATION_DURATION}ms) var(--sn-ease-out, cubic-bezier(0.32, 0.72, 0, 1))`,
      },
    },
    componentSurface: slots?.panel,
    activeStates: open ? ["open"] : [],
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem)",
      borderBottom:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    },
    componentSurface: slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      margin: 0,
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-foreground, #111)",
    },
    componentSurface: slots?.title,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-body`,
    implementationBase: {
      padding: "var(--sn-spacing-lg, 1.5rem)",
      overflow: "auto",
      flex: 1,
    },
    componentSurface: slots?.body,
  });
  const footerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-footer`,
    implementationBase: {
      display: "flex",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      justifyContent: ALIGN_MAP[footerAlign] ?? "flex-end",
      borderTop:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      padding: "var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem)",
    },
    componentSurface: slots?.footer,
  });

  return (
    <div
      data-snapshot-component="modal"
      data-snapshot-id={`${rootId}-root`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-modal-overlay=""
        data-testid="modal-overlay"
        data-snapshot-id={`${rootId}-overlay`}
        onClick={handleOverlayClick}
        className={overlaySurface.className}
        style={overlaySurface.style}
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-modal-content=""
        data-snapshot-id={`${rootId}-panel`}
        className={panelSurface.className}
        style={panelSurface.style}
      >
        {title ? (
          <div
            data-modal-header=""
            data-snapshot-id={`${rootId}-header`}
            className={headerSurface.className}
            style={headerSurface.style}
          >
            <h2
              data-snapshot-id={`${rootId}-title`}
              className={titleSurface.className}
              style={titleSurface.style}
            >
              {title}
            </h2>
            <ButtonControl
              variant="ghost"
              size="icon"
              onClick={onClose}
              surfaceId={`${rootId}-close`}
              surfaceConfig={slots?.closeButton}
              testId="modal-close"
              ariaLabel="Close"
            >
              x
            </ButtonControl>
          </div>
        ) : null}

        <div
          data-modal-body=""
          data-snapshot-id={`${rootId}-body`}
          className={bodySurface.className}
          style={bodySurface.style}
        >
          {children}
        </div>

        {footer && footer.length > 0 ? (
          <div
            data-modal-footer=""
            data-snapshot-id={`${rootId}-footer`}
            className={footerSurface.className}
            style={footerSurface.style}
          >
            {footer.map((button, index) => (
              <ButtonControl
                key={`${rootId}-footer-action-${index}`}
                variant={button.variant ?? "default"}
                size="sm"
                onClick={button.onClick}
                surfaceId={`${rootId}-footer-action-${index}`}
                surfaceConfig={slots?.footerAction}
              >
                {button.label}
              </ButtonControl>
            ))}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={overlaySurface.scopedCss} />
      <SurfaceStyles css={panelSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
      <SurfaceStyles css={footerSurface.scopedCss} />
    </div>
  );
}
