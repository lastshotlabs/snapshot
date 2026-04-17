"use client";

import { useState } from "react";
import { useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import { ButtonControl } from "../../forms/button";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { NavSectionConfig } from "./types";

export function NavSection({ config }: { config: NavSectionConfig }) {
  const [isCollapsed, setIsCollapsed] = useState(config.defaultCollapsed ?? false);
  const label = useSubscribe(config.label);
  const showItems = !config.collapsible || !isCollapsed;
  const rootId = config.id ?? "nav-section";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const headerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    componentSurface: config.slots?.headerLabel,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
    },
    componentSurface: config.slots?.content,
    activeStates: showItems ? ["open"] : [],
  });

  return (
    <div
      data-snapshot-component="nav-section"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {typeof label === "string" ? (
        <ButtonControl
          variant="ghost"
          onClick={config.collapsible ? () => setIsCollapsed((value) => !value) : undefined}
          surfaceId={`${rootId}-header`}
          surfaceConfig={config.slots?.header}
          activeStates={showItems ? ["open"] : []}
        >
          <span
            data-snapshot-id={`${rootId}-header-label`}
            className={headerLabelSurface.className}
            style={headerLabelSurface.style}
          >
            {label}
          </span>
        </ButtonControl>
      ) : null}
      {showItems ? (
        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {config.items.map((item, index) => (
            <ComponentRenderer key={(item as { id?: string }).id ?? index} config={item} />
          ))}
        </div>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerLabelSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
