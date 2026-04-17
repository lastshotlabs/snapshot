'use client';

import React, { useEffect, useRef, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { renderIcon } from "../../../icons/render";
import { ButtonControl } from "../../forms/button";
import { SurfaceStyles } from "../../_base/surface-styles";
import { FloatingPanel } from "../../primitives/floating-menu";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { PopoverConfig } from "./types";

/**
 * Floating panel component triggered by a button-like control.
 *
 * Uses the shared floating panel primitive, applies canonical slot styling to trigger and content
 * surfaces, and publishes `{ isOpen }` when an `id` is configured.
 */
export function Popover({ config }: { config: PopoverConfig }) {
  const triggerText = useSubscribe(config.trigger) as string;
  const resolvedTitle = useSubscribe(config.title) as string | undefined;
  const resolvedDescription = useSubscribe(config.description) as string | undefined;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootId = config.id ?? "popover";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-flex",
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["width"] }),
    itemSurface: config.slots?.root,
  });

  useEffect(() => {
    publish?.({ isOpen });
  }, [isOpen, publish]);

  const triggerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: config.slots?.triggerLabel,
  });
  const triggerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: config.slots?.triggerIcon,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "grid",
      gap: "0.75rem",
    },
    componentSurface: config.slots?.content,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "0.75rem",
    },
    componentSurface: config.slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontWeight: 600,
    },
    componentSurface: config.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground)",
    },
    componentSurface: config.slots?.description,
  });
  const footerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-footer`,
    implementationBase: {
      display: "grid",
      gap: "0.5rem",
    },
    componentSurface: config.slots?.footer,
  });
  const closeButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-close-button`,
    implementationBase: {
      flexShrink: 0,
    },
    componentSurface: config.slots?.closeButton,
  });

  if (visible === false) {
    return null;
  }

  return (
    <div
      data-snapshot-component="popover"
      data-snapshot-id={`${rootId}-root`}
      ref={containerRef}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <ButtonControl
        variant={config.triggerVariant ?? "outline"}
        onClick={() => setIsOpen((value) => !value)}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={config.slots?.trigger}
        ariaExpanded={isOpen}
        ariaHasPopup="dialog"
        activeStates={isOpen ? ["open"] : []}
      >
        {config.triggerIcon ? (
          <span
            data-snapshot-id={`${rootId}-trigger-icon`}
            className={triggerIconSurface.className}
            style={triggerIconSurface.style}
          >
            {renderIcon(config.triggerIcon, 16)}
          </span>
        ) : null}
        <span
          data-snapshot-id={`${rootId}-trigger-label`}
          className={triggerLabelSurface.className}
          style={triggerLabelSurface.style}
        >
          {triggerText}
        </span>
      </ButtonControl>

      <FloatingPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        containerRef={containerRef}
        side={config.placement ?? "bottom"}
        surfaceId={`${rootId}-panel`}
        slot={config.slots?.panel}
        activeStates={isOpen ? ["open"] : []}
        style={config.width ? ({ width: config.width } as React.CSSProperties) : undefined}
      >
        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {resolvedTitle || resolvedDescription ? (
            <div
              data-snapshot-id={`${rootId}-header`}
              className={headerSurface.className}
              style={headerSurface.style}
            >
              <div style={{ display: "grid", gap: "0.5rem", flex: 1 }}>
                {resolvedTitle ? (
                  <div
                    data-snapshot-id={`${rootId}-title`}
                    className={titleSurface.className}
                    style={titleSurface.style}
                  >
                    {resolvedTitle}
                  </div>
                ) : null}
                {resolvedDescription ? (
                  <div
                    data-snapshot-id={`${rootId}-description`}
                    className={descriptionSurface.className}
                    style={descriptionSurface.style}
                  >
                    {resolvedDescription}
                  </div>
                ) : null}
              </div>
              <ButtonControl
                variant="ghost"
                onClick={() => setIsOpen(false)}
                surfaceId={`${rootId}-close-button`}
                surfaceConfig={config.slots?.closeButton}
                itemSurfaceConfig={closeButtonSurface.resolvedConfigForWrapper}
                ariaLabel="Close popover"
              >
                x
              </ButtonControl>
            </div>
          ) : null}
          {config.content?.map((child, index) => (
            <ComponentRenderer
              key={(child as ComponentConfig).id ?? `popover-child-${index}`}
              config={child as ComponentConfig}
            />
          ))}
          {config.footer?.length ? (
            <div
              data-snapshot-id={`${rootId}-footer`}
              className={footerSurface.className}
              style={footerSurface.style}
            >
              {config.footer.map((child, index) => (
                <ComponentRenderer
                  key={(child as ComponentConfig).id ?? `popover-footer-${index}`}
                  config={child as ComponentConfig}
                />
              ))}
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
