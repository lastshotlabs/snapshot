"use client";

import type { CSSProperties } from "react";
import { useSubscribe, usePublish, useResolveFrom } from "../../../context/index";
import { useActionExecutor } from "../../../actions/executor";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { ToggleGroupBase } from "./standalone";
import type { ToggleGroupItem } from "./standalone";
import type { ToggleGroupConfig } from "./types";

/**
 * Render a single- or multi-select toggle group that can publish selection state into the Snapshot context graph.
 */
export function ToggleGroup({ config }: { config: ToggleGroupConfig }) {
  const execute = useActionExecutor();
  const controlledValue = useSubscribe(
    config.value != null &&
      typeof config.value === "object" &&
      "from" in config.value
      ? config.value
      : undefined,
  );
  const publish = usePublish(config.publishTo);

  // Resolve item labels and disabled refs
  const resolvedItems = useResolveFrom({
    items: config.items.map((item) => ({
      label: item.label,
      disabled: item.disabled,
    })),
  });
  const resolvedItemEntries = (resolvedItems.items ?? []) as Array<{
    label?: string;
    disabled?: boolean;
  }>;

  // Resolve items: subscribe to label/disabled refs
  const items: ToggleGroupItem[] = config.items.map((item, i) => ({
    value: item.value,
    label: typeof resolvedItemEntries[i]?.label === "string"
      ? resolvedItemEntries[i].label
      : typeof item.label === "string" ? item.label : undefined,
    icon: item.icon,
    disabled: typeof resolvedItemEntries[i]?.disabled === "boolean"
      ? resolvedItemEntries[i].disabled
      : typeof item.disabled === "boolean" ? item.disabled : undefined,
    slots: item.slots,
  }));

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <ToggleGroupBase
      id={config.id ?? config.publishTo}
      items={items}
      mode={config.mode}
      value={controlledValue as string | string[] | undefined}
      defaultValue={config.defaultValue}
      variant={config.variant}
      size={config.size}
      onChange={(next) => {
        if (config.publishTo) publish(next);
        void executeEventAction(execute, config.on?.change, {
          id: config.id ?? config.publishTo,
          value: next,
        });
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
