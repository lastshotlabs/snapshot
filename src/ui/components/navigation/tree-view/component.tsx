'use client';

import { useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { AutoErrorState } from "../../_base/auto-error-state";
import { useComponentData } from "../../_base/use-component-data";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
  type PrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { TreeViewBase } from "./standalone";
import type { TreeViewBaseItem } from "./standalone";
import type { TreeViewConfig, TreeItemInput } from "./types";

function normalizeTreeItems(
  items: TreeItemInput[] | undefined,
  primitiveOptions: PrimitiveValueOptions,
): TreeViewBaseItem[] {
  if (!items) {
    return [];
  }

  return items.map((item) => ({
    ...item,
    label: resolveOptionalPrimitiveValue(item.label, primitiveOptions) ?? "",
    badge: resolveOptionalPrimitiveValue(item.badge, primitiveOptions),
    children: normalizeTreeItems(item.children, primitiveOptions),
    slots: item.slots as Record<string, Record<string, unknown>>,
  }));
}

/**
 * Manifest adapter — resolves config refs, handles remote data, publishes
 * state, delegates rendering to TreeViewBase.
 */
export function TreeView({ config }: { config: TreeViewConfig }) {
  const hasEndpoint = config.data !== undefined;
  const { data, isLoading, error, refetch } = useComponentData(
    hasEndpoint ? config.data! : "",
  );
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ items: config.items });
  const selectable = config.selectable ?? true;
  const multiSelect = config.multiSelect ?? false;
  const rootId = config.id ?? "tree-view";

  const items = useMemo((): TreeViewBaseItem[] => {
    if (!hasEndpoint) {
      return normalizeTreeItems(
        ((resolvedConfig.items as TreeViewConfig["items"] | undefined) ??
          config.items) as TreeItemInput[] | undefined,
        primitiveOptions,
      );
    }
    if (!data) {
      return [];
    }

    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)["data"])
        ? ((data as Record<string, unknown>)["data"] as TreeItemInput[])
        : Array.isArray((data as Record<string, unknown>)["items"])
          ? ((data as Record<string, unknown>)["items"] as TreeItemInput[])
          : [];

    return rawItems as TreeViewBaseItem[];
  }, [config.items, data, hasEndpoint, primitiveOptions, resolvedConfig.items]);

  const handleSelect = useCallback(
    (nodeKey: string) => {
      if (config.action) {
        void execute(config.action, { value: nodeKey });
      }
    },
    [config.action, execute],
  );

  if (visible === false) {
    return null;
  }

  // Build error content for the standalone component
  const errorContent =
    error && hasEndpoint ? (
      <AutoErrorState
        config={(config.error ?? {}) as import("../../_base/auto-error-state").AutoErrorStateConfig}
        onRetry={config.error?.retry !== undefined ? refetch : undefined}
      />
    ) : undefined;

  return (
    <TreeViewBase
      id={config.id}
      items={items}
      selectable={selectable}
      multiSelect={multiSelect}
      showIcon={config.showIcon}
      showConnectors={config.showConnectors}
      onSelect={handleSelect}
      isLoading={isLoading && hasEndpoint}
      error={errorContent}
      onRetry={config.error?.retry !== undefined ? refetch : undefined}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
