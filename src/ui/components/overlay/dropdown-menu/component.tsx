"use client";

import type { CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import {
  DropdownMenuBase,
  type DropdownMenuBaseEntry,
  type DropdownMenuBaseItem,
} from "./standalone";
import type { DropdownMenuConfig } from "./types";

type DropdownMenuItem = DropdownMenuConfig["items"][number];

/**
 * Manifest-driven dropdown menu adapter.
 *
 * Resolves primitive values and actions from manifest config, then delegates
 * all rendering to `DropdownMenuBase`.
 */
export function DropdownMenu({ config }: { config: DropdownMenuConfig }) {
  const execute = useActionExecutor();
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    trigger: config.trigger,
    items: config.items,
  });

  const trigger =
    (resolvedConfig.trigger as DropdownMenuConfig["trigger"] | undefined) ??
    config.trigger;
  const resolvedTrigger = {
    label: resolveOptionalPrimitiveValue(trigger.label, primitiveOptions),
    icon: trigger.icon,
    variant: trigger.variant,
  };

  const items = (
    ((resolvedConfig.items as DropdownMenuConfig["items"] | undefined) ??
      config.items) as DropdownMenuConfig["items"]
  ).map((entry: DropdownMenuItem): DropdownMenuBaseEntry => {
    if (entry.type === "item") {
      return {
        type: "item",
        label:
          resolveOptionalPrimitiveValue(entry.label, primitiveOptions) ?? "",
        icon: entry.icon,
        disabled: entry.disabled,
        destructive: entry.destructive,
        slots: entry.slots as Record<string, Record<string, unknown>>,
      };
    }

    if (entry.type === "label") {
      return {
        type: "label",
        text: resolveOptionalPrimitiveValue(entry.text, primitiveOptions) ?? "",
        slots: entry.slots as Record<string, Record<string, unknown>>,
      };
    }

    return {
      type: "separator",
      slots: entry.slots as Record<string, Record<string, unknown>>,
    };
  });

  // Keep a reference to the original config items so we can look up actions
  const originalItems =
    (resolvedConfig.items as DropdownMenuConfig["items"] | undefined) ??
    config.items;

  const handleSelect = (item: DropdownMenuBaseItem, index: number) => {
    const configItem = originalItems[index];
    if (configItem && configItem.type === "item" && configItem.action) {
      void execute(configItem.action as Parameters<typeof execute>[0]);
    }
  };

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <DropdownMenuBase
      id={config.id}
      trigger={resolvedTrigger}
      items={items}
      onSelect={handleSelect}
      align={config.align}
      side={config.side}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
