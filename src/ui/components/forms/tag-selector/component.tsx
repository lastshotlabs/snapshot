'use client';

import { useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { CSSProperties } from "react";
import { TagSelectorField } from "./standalone";
import type { TagSelectorTag } from "./standalone";
import type { TagSelectorConfig } from "./types";

export function TagSelector({ config }: { config: TagSelectorConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const resolvedValue = useSubscribe(config.value ?? []) as string[];
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    label: config.label,
    tags: config.tags,
  });
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);

  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );

  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch: apiRefetch,
  } = useComponentData(config.data ?? "");

  const availableTags = useMemo<TagSelectorTag[]>(() => {
    const tags: TagSelectorTag[] = [];

    const staticTags =
      (resolvedConfig.tags as TagSelectorConfig["tags"] | undefined)?.map(
        (tag) => ({
          ...tag,
          label: resolveOptionalPrimitiveValue(tag.label, primitiveOptions) ?? tag.value,
        }),
      ) ?? config.tags?.map((tag) => ({
        ...tag,
        label: resolveOptionalPrimitiveValue(tag.label, primitiveOptions) ?? tag.value,
      }));

    if (staticTags) {
      tags.push(...staticTags);
    }

    if (apiData) {
      const items = Array.isArray(apiData)
        ? apiData
        : Array.isArray((apiData as Record<string, unknown>).data)
          ? ((apiData as Record<string, unknown>).data as Record<string, unknown>[])
          : [];
      const labelField = config.labelField ?? "label";
      const valueField = config.valueField ?? "value";
      const colorField = config.colorField ?? "color";

      for (const item of items) {
        tags.push({
          label: String(item[labelField] ?? ""),
          value: String(item[valueField] ?? ""),
          color: item[colorField] ? String(item[colorField]) : undefined,
        });
      }
    }

    return tags;
  }, [
    apiData,
    config.colorField,
    config.labelField,
    config.valueField,
    config.tags,
    primitiveOptions,
    resolvedConfig.tags,
  ]);

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <TagSelectorField
      id={config.id}
      label={resolvedLabel}
      tags={availableTags}
      value={resolvedValue}
      allowCreate={config.allowCreate}
      maxTags={config.maxTags}
      onChange={(newValues) => {
        publish?.({ value: newValues });
        void executeEventAction(executeAction, config.on?.change, {
          id: config.id,
          value: newValues,
        });
        void executeEventAction(executeAction, config.on?.input, {
          id: config.id,
          value: newValues,
        });
      }}
      onCreate={(label, value) => {
        if (config.createAction) {
          void executeAction(config.createAction, { label, value });
        }
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
