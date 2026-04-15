'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import { OverlayRuntimeProvider } from "../../../manifest/runtime";
import type { ComponentConfig } from "../../../manifest/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { useFocusTrap } from "../../_base/use-focus-trap";
import { ButtonControl } from "../../forms/button";
import { useDrawer } from "./hook";
import type { DrawerConfig } from "./schema";

const SIZE_MAP: Record<string, string> = {
  sm: "20rem",
  md: "28rem",
  lg: "36rem",
  xl: "48rem",
  full: "100vw",
};

const ANIMATION_DURATION = 200;

const ALIGN_MAP: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export function DrawerComponent({ config }: { config: DrawerConfig }) {
  const { isOpen, close, payload, result } = useDrawer(config);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const overlayId = config.id ?? "";

  const side: "left" | "right" = config.side ?? "right";
  const size: keyof typeof SIZE_MAP = config.size ?? "md";
  const width: string = SIZE_MAP[size] ?? SIZE_MAP.md!;

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

  useEffect(() => {
    if (isOpen && animating && panelRef.current) {
      panelRef.current.focus();
    }
  }, [animating, isOpen]);

  useFocusTrap(
    isOpen && animating && config.trapFocus !== false,
    panelRef,
    {
      initialFocus: config.initialFocus,
      returnFocus: config.returnFocus,
    },
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    },
    [close],
  );

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        close();
      }
    },
    [close],
  );

  if (!mounted) {
    return null;
  }

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
      value={{ id: overlayId, kind: "drawer", payload, result }}
    >
      <DrawerSurface
        config={config}
        isOpen={isOpen}
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
  isOpen,
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
  isOpen: boolean;
  panelRef: React.RefObject<HTMLDivElement | null>;
  side: "left" | "right";
  width: string;
  animating: boolean;
  translateValue: string;
  close: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleOverlayClick: (e: React.MouseEvent) => void;
}) {
  const execute = useActionExecutor();
  const title = useSubscribe(config.title) as string | undefined;
  const payload = useSubscribe({ from: "overlay.payload" });
  const result = useSubscribe({ from: "overlay.result" });
  const previousOpenRef = useRef<boolean | undefined>(undefined);
  const rootId = config.id ?? "drawer";

  useEffect(() => {
    const previousOpen = previousOpenRef.current;
    previousOpenRef.current = isOpen;

    const lifecycleContext = {
      overlay: {
        payload,
        result,
      },
    };

    if (isOpen && previousOpen !== true && config.onOpen) {
      if (typeof config.onOpen === "string") {
        void execute(
          { type: "run-workflow", workflow: config.onOpen },
          lifecycleContext,
        );
      } else {
        void execute(config.onOpen as never, lifecycleContext);
      }
    }

    if (!isOpen && previousOpen === true && config.onClose) {
      if (typeof config.onClose === "string") {
        void execute(
          { type: "run-workflow", workflow: config.onClose },
          lifecycleContext,
        );
      } else {
        void execute(config.onClose as never, lifecycleContext);
      }
    }
  }, [config.onClose, config.onOpen, execute, isOpen, payload, result]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "fixed",
      inset: 0,
      zIndex: "var(--sn-z-index-modal, 40)",
      display: "flex",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
    activeStates: isOpen ? ["open"] : [],
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
    componentSurface: config.slots?.overlay,
    activeStates: isOpen ? ["open"] : [],
  });
  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      position: "fixed",
      top: 0,
      bottom: 0,
      width,
      maxWidth: "100vw",
      backgroundColor: "var(--sn-color-surface, #fff)",
      boxShadow:
        "var(--sn-shadow-lg, 0 25px 50px -12px rgba(0, 0, 0, 0.25))",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      outline: "none",
      style: {
        [side === "left" ? "left" : "right"]: 0,
        transform: translateValue,
        transition: `transform var(--sn-duration-normal, ${ANIMATION_DURATION}ms) var(--sn-ease-out, cubic-bezier(0.32, 0.72, 0, 1))`,
      },
    },
    componentSurface: config.slots?.panel,
    activeStates: isOpen ? ["open"] : [],
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
    componentSurface: config.slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      margin: 0,
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)",
      color: "var(--sn-color-foreground, #111)",
    },
    componentSurface: config.slots?.title,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-body`,
    implementationBase: {
      padding: "var(--sn-spacing-lg, 1.5rem)",
      overflow: "auto",
      flex: 1,
    },
    componentSurface: config.slots?.body,
  });
  const footerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-footer`,
    implementationBase: {
      display: "flex",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      justifyContent:
        ALIGN_MAP[config.footer?.align ?? "right"] ?? "flex-end",
      borderTop:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      padding: "var(--sn-spacing-md, 1rem) var(--sn-spacing-lg, 1.5rem)",
    },
    componentSurface: config.slots?.footer,
  });

  return (
    <div
      data-snapshot-component="drawer"
      data-snapshot-id={`${rootId}-root`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-drawer-overlay=""
        data-snapshot-id={`${rootId}-overlay`}
        onClick={handleOverlayClick}
        className={overlaySurface.className}
        style={overlaySurface.style}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        data-drawer-content=""
        data-side={side}
        data-snapshot-id={`${rootId}-panel`}
        className={panelSurface.className}
        style={panelSurface.style}
      >
        {title ? (
          <div
            data-drawer-header=""
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
              onClick={close}
              surfaceId={`${rootId}-close`}
              surfaceConfig={config.slots?.closeButton}
              testId="drawer-close"
              ariaLabel="Close"
            >
              x
            </ButtonControl>
          </div>
        ) : null}

        <div
          data-drawer-body=""
          data-snapshot-id={`${rootId}-body`}
          className={bodySurface.className}
          style={bodySurface.style}
        >
          {config.content.map((child, index) => (
            <ComponentRenderer
              key={(child as ComponentConfig).id ?? `drawer-child-${index}`}
              config={child as ComponentConfig}
            />
          ))}
        </div>

        {config.footer?.actions && config.footer.actions.length > 0 ? (
          <div
            data-drawer-footer=""
            data-snapshot-id={`${rootId}-footer`}
            className={footerSurface.className}
            style={footerSurface.style}
          >
            {config.footer.actions.map((button, index) => (
              <ButtonControl
                key={`${rootId}-footer-action-${index}`}
                variant={button.variant ?? "default"}
                size="sm"
                onClick={() => {
                  if (button.action) {
                    void execute(button.action as Parameters<typeof execute>[0]);
                  }
                  if (button.dismiss) {
                    close();
                  }
                }}
                surfaceId={`${rootId}-footer-action-${index}`}
                surfaceConfig={config.slots?.footerAction}
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
