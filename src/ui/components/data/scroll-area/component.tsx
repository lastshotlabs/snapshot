'use client';

import type { CSSProperties } from "react";
import React, { useId, useMemo } from "react";
import { useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ScrollAreaConfig } from "./types";

/**
 * ScrollArea component — a scrollable container with custom-styled thin scrollbars.
 *
 * Supports vertical, horizontal, or bidirectional scrolling.
 * Scrollbar visibility can be always, hover-only, or auto.
 * Uses a scoped `<style>` tag for webkit scrollbar pseudo-element styling.
 *
 * @param props.config - The scroll area config from the manifest
 */
export function ScrollArea({ config }: { config: ScrollAreaConfig }) {
  const scopeId = useId();
  const visible = useSubscribe(config.visible ?? true);
  const scopeClass = `sn-scroll-${scopeId.replace(/:/g, "")}`;

  const orientation = config.orientation ?? "vertical";
  const maxHeight = config.maxHeight ?? "400px";
  const showScrollbar = config.showScrollbar ?? "auto";
  const rootId = config.id ?? "scroll-area";

  const overflowX =
    orientation === "horizontal" || orientation === "both" ? "auto" : "hidden";
  const overflowY =
    orientation === "vertical" || orientation === "both" ? "auto" : "hidden";

  const scrollbarStyles = useMemo(() => {
    const alwaysShow = showScrollbar === "always";
    const hoverOnly = showScrollbar === "hover";

    // Base scrollbar styles
    let css = `
.${scopeClass}::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.${scopeClass}::-webkit-scrollbar-track {
  background: var(--sn-color-secondary, #f3f4f6);
  border-radius: var(--sn-radius-full, 9999px);
}
.${scopeClass}::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%);
  border-radius: var(--sn-radius-full, 9999px);
}
.${scopeClass}::-webkit-scrollbar-thumb:hover {
  background: var(--sn-color-muted-foreground, #6b7280);
}`;

    if (hoverOnly) {
      css += `
.${scopeClass}::-webkit-scrollbar-thumb {
  background: transparent;
}
.${scopeClass}:hover::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%);
}
.${scopeClass}:hover::-webkit-scrollbar-thumb:hover {
  background: var(--sn-color-muted-foreground, #6b7280);
}`;
    }

    // Firefox scrollbar styling
    if (alwaysShow || !hoverOnly) {
      css += `
.${scopeClass} {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%) var(--sn-color-secondary, #f3f4f6);
}`;
    } else {
      css += `
.${scopeClass} {
  scrollbar-width: thin;
  scrollbar-color: transparent var(--sn-color-secondary, #f3f4f6);
}
.${scopeClass}:hover {
  scrollbar-color: color-mix(in oklch, var(--sn-color-muted-foreground, #6b7280), transparent 50%) var(--sn-color-secondary, #f3f4f6);
}`;
    }

    return css;
  }, [scopeClass, showScrollbar]);

  const content = config.content ?? [];

  // Visibility check
  if (visible === false) return null;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const viewportSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-viewport`,
    implementationBase: {
      style: {
        maxHeight,
        maxWidth: config.maxWidth,
        overflowX,
        overflowY,
      },
    },
    componentSurface: config.slots?.viewport,
  });

  return (
    <div
      data-snapshot-component="scroll-area"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...((config.style as CSSProperties | undefined) ?? {}),
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div
        data-snapshot-id={`${rootId}-viewport`}
        className={[scopeClass, viewportSurface.className].filter(Boolean).join(" ")}
        style={{
          ...(viewportSurface.style ?? {}),
        }}
      >
        {content.map((child, i) => (
          <ComponentRenderer
            key={(child as ComponentConfig).id ?? `scroll-child-${i}`}
            config={child as ComponentConfig}
          />
        ))}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={viewportSurface.scopedCss} />
    </div>
  );
}
