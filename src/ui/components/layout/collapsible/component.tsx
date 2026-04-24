"use client";

import type { CSSProperties } from "react";
import { useSubscribe, usePublish } from "../../../context/index";
import { useEvaluateExpression } from "../../../expressions/use-expression";
import { ComponentRenderer } from "../../../manifest/renderer";
import { CollapsibleBase } from "./standalone";
import type { CollapsibleConfig } from "./types";

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

  const resolvedOpen = isControlled
    ? openExpr !== undefined
      ? exprOpen
      : typeof config.open === "boolean"
        ? config.open
        : Boolean(controlledOpen)
    : undefined;

  const publish = usePublish(config.publishTo);

  const handleOpenChange = (open: boolean) => {
    if (config.publishTo) {
      publish(open);
    }
  };

  return (
    <CollapsibleBase
      id={config.id}
      open={resolvedOpen as boolean | undefined}
      defaultOpen={config.defaultOpen}
      duration={config.duration}
      onOpenChange={handleOpenChange}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
      trigger={
        config.trigger ? (
          <ComponentRenderer config={config.trigger} />
        ) : undefined
      }
    >
      {config.children.map((child, index) => (
        <ComponentRenderer
          key={(child as { id?: string }).id ?? index}
          config={child}
        />
      ))}
    </CollapsibleBase>
  );
}
