import React, { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import type { ActionConfig } from "../../../actions/types";
import { useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import { OverlayRuntimeProvider } from "../../../manifest/runtime";
import type { ComponentConfig } from "../../../manifest/types";
import {
  getButtonStyle,
  BUTTON_INTERACTIVE_CSS,
} from "../../_base/button-styles";
import { useDrawer } from "./hook";
import type { DrawerConfig } from "./schema";

/**
 * Size to width mapping for drawer panels.
 */
const SIZE_MAP: Record<string, string> = {
  sm: "20rem",
  md: "28rem",
  lg: "36rem",
  xl: "48rem",
  full: "100vw",
};

const ANIMATION_DURATION = 200;

/** Maps footer align value to CSS justifyContent. */
const ALIGN_MAP: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

/**
 * Drawer component — renders a slide-in panel from the left or right edge.
 *
 * Controlled by the modal manager (open-modal/close-modal actions).
 * Content is rendered via ComponentRenderer for recursive composition.
 * Supports FromRef trigger for auto-open behavior.
 *
 * @param props.config - The drawer config from the manifest
 */
export function DrawerComponent({ config }: { config: DrawerConfig }) {
  const { isOpen, close, payload } = useDrawer(config);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayId = config.id ?? "";

  const side: "left" | "right" = config.side ?? "right";
  const size: keyof typeof SIZE_MAP = config.size ?? "md";
  const width: string = SIZE_MAP[size] ?? SIZE_MAP.md!;

  // Handle mount/unmount with animation.
  // Uses setTimeout(0) instead of double-rAF for reliable animation
  // trigger across React 18+ batching and strict mode.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const enterTimer = setTimeout(() => setAnimating(true), 10);
      return () => clearTimeout(enterTimer);
    } else if (mounted) {
      setAnimating(false);
      const exitTimer = setTimeout(() => setMounted(false), ANIMATION_DURATION);
      return () => clearTimeout(exitTimer);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the panel when it opens
  useEffect(() => {
    if (isOpen && animating && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen, animating]);

  // Escape key closes the drawer
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    },
    [close],
  );

  // Click on overlay closes the drawer
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close],
  );

  if (!mounted) return null;

  const translateValue =
    side === "left"
      ? animating
        ? "translateX(0)"
        : "translateX(-100%)"
      : animating
        ? "translateX(0)"
        : "translateX(100%)";

  return (
    <OverlayRuntimeProvider
      value={{ id: overlayId, kind: "drawer", payload }}
    >
      <DrawerSurface
        config={config}
        panelRef={panelRef}
        side={side}
        width={width}
        animating={animating}
        translateValue={translateValue}
        close={close}
        handleKeyDown={handleKeyDown}
        handleOverlayClick={handleOverlayClick}
      />
    </OverlayRuntimeProvider>
  );
}

function DrawerSurface({
  config,
  panelRef,
  side,
  width,
  animating,
  translateValue,
  close,
  handleKeyDown,
  handleOverlayClick,
}: {
  config: DrawerConfig;
  panelRef: React.RefObject<HTMLDivElement | null>;
  side: string;
  width: string;
  animating: boolean;
  translateValue: string;
  close: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleOverlayClick: (e: React.MouseEvent) => void;
}) {
  const execute = useActionExecutor();
  const title = useSubscribe(config.title) as string | undefined;

  return (
    <div
      data-snapshot-component="drawer"
      className={config.className}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: "var(--sn-z-index-modal, 40)" as unknown as number,
        display: "flex",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <div
        data-snapshot-drawer-overlay=""
        onClick={handleOverlayClick}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--sn-modal-overlay, rgba(0, 0, 0, 0.5))",
          opacity: animating ? 1 : 0,
          transition: `opacity var(--sn-duration-normal, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease)`,
          zIndex: -1,
        }}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-snapshot-drawer-panel=""
        data-side={side}
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          [side === "left" ? "left" : "right"]: 0,
          width,
          maxWidth: "100vw",
          backgroundColor: "var(--sn-color-surface, #fff)",
          boxShadow:
            "var(--sn-shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.25))",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          outline: "none",
          transform: translateValue,
          transition: `transform var(--sn-duration-normal, ${ANIMATION_DURATION}ms) var(--sn-ease-out, cubic-bezier(0.32, 0.72, 0, 1))`,
        }}
      >
        <style>{`
          [data-snapshot-component="drawer"] [data-snapshot-drawer-close]:focus { outline: none; }
          [data-snapshot-component="drawer"] [data-snapshot-drawer-close]:hover {
            background-color: var(--sn-color-secondary, #f3f4f6);
          }
          [data-snapshot-component="drawer"] [data-snapshot-drawer-close]:focus-visible {
            outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
            outline-offset: var(--sn-ring-offset, 2px);
          }
          ${BUTTON_INTERACTIVE_CSS}
        `}</style>

        {/* Header */}
        {title && (
          <div
            data-snapshot-drawer-header=""
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding:
                "var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem)",
              borderBottom:
                "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "var(--sn-font-size-lg, 1.125rem)",
                fontWeight: "var(--sn-font-weight-semibold, 600)",
                color: "var(--sn-color-foreground, #111)",
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              data-snapshot-drawer-close=""
              data-testid="drawer-close"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "var(--sn-spacing-xs, 0.25rem)",
                borderRadius: "var(--sn-radius-sm, 0.25rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                fontSize: "var(--sn-font-size-lg, 1.125rem)",
                lineHeight: "var(--sn-leading-none, 1)",
              }}
            >
              {"\u00D7"}
            </button>
          </div>
        )}

        {/* Content */}
        <div
          data-snapshot-drawer-content=""
          style={{
            padding: "var(--sn-spacing-lg, 1.5rem)",
            overflow: "auto",
            flex: 1,
          }}
        >
          {config.content.map((child, i) => (
            <ComponentRenderer
              key={(child as ComponentConfig).id ?? `drawer-child-${i}`}
              config={child as ComponentConfig}
            />
          ))}
        </div>

        {/* Footer */}
        {config.footer?.actions && config.footer.actions.length > 0 && (
          <div
            data-snapshot-drawer-footer=""
            style={{
              display: "flex",
              gap: "var(--sn-spacing-sm, 0.5rem)",
              justifyContent:
                ALIGN_MAP[config.footer.align ?? "right"] ?? "flex-end",
              borderTop:
                "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
              padding:
                "var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem)",
            }}
          >
            {config.footer.actions.map((btn, i) => (
              <button
                key={i}
                type="button"
                data-sn-button=""
                data-variant={btn.variant ?? "default"}
                onClick={() => {
                  if (btn.action) {
                    execute(btn.action as ActionConfig);
                  }
                  if (btn.dismiss) {
                    close();
                  }
                }}
                style={getButtonStyle(btn.variant ?? "default", "sm")}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
