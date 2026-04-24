"use client";

import { useCallback, type CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import {
  useResolveFrom,
  useSubscribe,
  usePublish,
} from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import {
  ContextMenuBase,
  type ContextMenuBaseEntry,
  type ContextMenuBaseItem,
} from "./standalone";
import type { ContextMenuConfig } from "./types";

/**
 * Manifest-driven context menu adapter.
 *
 * Resolves primitive values and actions from manifest config, handles
 * visibility and state publishing, then delegates all rendering to
 * `ContextMenuBase`.
 */
export function ContextMenu({ config }: { config: ContextMenuConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    triggerText: config.triggerText,
    items: config.items,
  });
  const publish = usePublish(config.id);

  const triggerText = resolveOptionalPrimitiveValue(
    resolvedConfig.triggerText,
    primitiveOptions,
  );

  const resolvedItems =
    (resolvedConfig.items as ContextMenuConfig["items"] | undefined)?.map(
      (
        item: NonNullable<ContextMenuConfig["items"]>[number],
      ): ContextMenuBaseEntry => {
        if (item.type === "item") {
          return {
            type: "item",
            label:
              resolveOptionalPrimitiveValue(item.label, primitiveOptions) ?? "",
            icon: item.icon,
            destructive: item.variant === "destructive",
            disabled: item.disabled,
          };
        }

        if (item.type === "label") {
          return {
            type: "label",
            text:
              resolveOptionalPrimitiveValue(item.text, primitiveOptions) ?? "",
          };
        }

        return { type: "separator" };
      },
    ) ?? [];

  // Keep original items for action lookup
  const originalItems =
    (resolvedConfig.items as ContextMenuConfig["items"] | undefined) ??
    config.items;

  const handleSelect = useCallback(
    (item: ContextMenuBaseItem) => {
      // Find matching original item by label to get the action config
      const originalItem = originalItems?.find(
        (orig: NonNullable<ContextMenuConfig["items"]>[number]) =>
          orig.type === "item" &&
          (resolveOptionalPrimitiveValue(orig.label, primitiveOptions) ??
            "") === item.label,
      );
      if (originalItem && originalItem.type === "item" && originalItem.action) {
        void execute(
          originalItem.action as Parameters<typeof execute>[0],
          undefined,
        );
      }
    },
    [execute, originalItems, primitiveOptions],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      publish?.({ isOpen: open });
    },
    [publish],
  );

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <ContextMenuBase
      id={config.id}
      items={resolvedItems}
      onSelect={handleSelect}
      onOpenChange={handleOpenChange}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {triggerText ?? null}
    </ContextMenuBase>
  );
}
