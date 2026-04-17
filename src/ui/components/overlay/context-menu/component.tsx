"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import {
  ContextMenuPortal,
  type ContextMenuPortalItem,
} from "../../_base/context-menu-portal";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ContextMenuConfig } from "./types";

function resolveText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Render a right-click context menu backed by the shared context-menu portal runtime.
 */
export function ContextMenu({ config }: { config: ContextMenuConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const resolvedConfig = useResolveFrom({
    triggerText: config.triggerText,
    items: config.items,
  });
  const publish = usePublish(config.id);
  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
    context?: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    publish?.({ isOpen: menuState !== null });
  }, [menuState, publish]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuState({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${config.id ?? "context-menu"}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const triggerSurface = resolveSurfacePresentation({
    surfaceId: `${config.id ?? "context-menu"}-trigger`,
    implementationBase: {
      cursor: "context-menu",
      userSelect: "none",
    },
    componentSurface: config.slots?.trigger,
  });

  const triggerText = resolveText(resolvedConfig.triggerText);
  const resolvedItems =
    (resolvedConfig.items as ContextMenuConfig["items"] | undefined)?.map((item: NonNullable<ContextMenuConfig["items"]>[number]) =>
      item.type === "item"
        ? {
            ...item,
            label: resolveText(item.label) ?? "",
          }
        : item.type === "label"
          ? {
              ...item,
              text: resolveText(item.text) ?? "",
            }
          : item,
    ) ?? config.items;

  if (visible === false) {
    return null;
  }

  return (
    <div
      data-snapshot-component="context-menu"
      data-snapshot-id={`${config.id ?? "context-menu"}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-testid="context-menu-area"
        data-snapshot-id={`${config.id ?? "context-menu"}-trigger`}
        onContextMenu={handleContextMenu}
        className={triggerSurface.className}
        style={triggerSurface.style}
      >
        {triggerText ?? null}
      </div>
      <ContextMenuPortal
        items={(resolvedItems ?? []) as ContextMenuPortalItem[]}
        state={menuState}
        onClose={() => setMenuState(null)}
        slots={config.slots}
        idBase={config.id ?? "context-menu"}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={triggerSurface.scopedCss} />
    </div>
  );
}
