"use client";

import { useEffect, useRef, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/index";
import { useEvaluateExpression } from "../../../expressions/use-expression";
import { ComponentRenderer } from "../../../manifest/renderer";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { CollapsibleConfig } from "./types";

const DURATION_MAP: Record<string, number> = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
};


export function Collapsible({ config }: { config: CollapsibleConfig }) {
  const openExpr =
    config.open != null &&
    typeof config.open === "object" &&
    "expr" in config.open
      ? (config.open as { expr: string }).expr
      : undefined;
  const exprOpen = useEvaluateExpression(openExpr);

  const controlledOpen = useSubscribe(
    config.open != null &&
      typeof config.open === "object" &&
      "from" in config.open
      ? config.open
      : undefined,
  );
  const isControlled =
    config.open !== undefined &&
    (typeof config.open === "boolean" ||
      controlledOpen !== undefined ||
      openExpr !== undefined);

  const [internalOpen, setInternalOpen] = useState(config.defaultOpen ?? false);
  const isOpen = isControlled
    ? openExpr !== undefined
      ? exprOpen
      : typeof config.open === "boolean"
        ? config.open
        : Boolean(controlledOpen)
    : internalOpen;

  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(isOpen ? "auto" : "0px");
  const duration = DURATION_MAP[config.duration ?? "fast"] ?? 150;
  const publish = usePublish(config.publishTo);
  const rootId = config.id ?? "collapsible";

  useEffect(() => {
    if (config.publishTo) {
      publish(isOpen);
    }
  }, [config.publishTo, isOpen, publish]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }
    if (isOpen) {
      setHeight(`${element.scrollHeight}px`);
      const timer = setTimeout(() => setHeight("auto"), duration);
      return () => clearTimeout(timer);
    }

    setHeight(`${element.scrollHeight}px`);
    requestAnimationFrame(() => setHeight("0px"));
  }, [duration, isOpen]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      overflow: "hidden",
      transition: `height ${duration}ms var(--sn-ease-default, ease)`,
    },
    componentSurface: config.slots?.content,
    activeStates: isOpen ? ["open"] : [],
  });

  const toggle = () => {
    if (!isControlled) {
      setInternalOpen((value) => !value);
    }
  };

  return (
    <div
      data-snapshot-component="collapsible"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {config.trigger ? (
        <ButtonControl
          variant="ghost"
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggle();
            }
          }}
          ariaExpanded={isOpen}
          surfaceId={`${rootId}-trigger`}
          surfaceConfig={config.slots?.trigger}
          activeStates={isOpen ? ["open"] : []}
          fullWidth
        >
          <ComponentRenderer config={config.trigger} />
        </ButtonControl>
      ) : null}
      <div
        ref={contentRef}
        data-collapsible-content=""
        data-snapshot-id={`${rootId}-content`}
        data-open={isOpen ? "true" : undefined}
        className={contentSurface.className}
        style={{
          ...(contentSurface.style ?? {}),
          height,
        }}
      >
        {config.children.map((child, index) => (
          <ComponentRenderer
            key={(child as { id?: string }).id ?? index}
            config={child}
          />
        ))}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
