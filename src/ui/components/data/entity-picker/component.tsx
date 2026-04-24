'use client';

import { useCallback, useEffect, useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { EntityPickerConfig } from "./types";
import { EntityPickerBase, type EntityPickerEntity } from "./standalone";

const EMPTY_ARRAY: string[] = [];

export function EntityPicker({ config }: { config: EntityPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label });
  const triggerBaseLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const externalDefault = config.multiple ? EMPTY_ARRAY : "";
  const resolvedValue = useSubscribe(config.value ?? externalDefault);
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);
  const {
    data: apiData,
    isLoading,
    error: dataError,
  } = useComponentData(config.data ?? "");

  const isMultiple = config.multiple ?? false;
  const labelField = config.labelField ?? "name";
  const valueField = config.valueField ?? "id";

  const entities: EntityPickerEntity[] = useMemo(() => {
    if (!apiData) {
      return [];
    }

    const items = Array.isArray(apiData)
      ? apiData
      : Array.isArray((apiData as Record<string, unknown>).data)
        ? ((apiData as Record<string, unknown>).data as Record<string, unknown>[])
        : [];

    return items.map((item) => ({
      label: String(item[labelField] ?? ""),
      value: String(item[valueField] ?? ""),
      description: config.descriptionField
        ? String(item[config.descriptionField] ?? "")
        : undefined,
      icon: config.iconField ? String(item[config.iconField] ?? "") : undefined,
      avatar: config.avatarField
        ? String(item[config.avatarField] ?? "")
        : undefined,
    }));
  }, [
    apiData,
    config.avatarField,
    config.descriptionField,
    config.iconField,
    labelField,
    valueField,
  ]);

  // Resolve initial value
  const initialValue = useMemo(() => {
    if (Array.isArray(resolvedValue)) {
      return resolvedValue as string[];
    }
    if (typeof resolvedValue === "string" && resolvedValue) {
      return isMultiple ? [resolvedValue] : resolvedValue;
    }
    return isMultiple ? [] : "";
  }, [resolvedValue, isMultiple]);

  const handleChange = useCallback(
    (value: string | string[]) => {
      if (publish) {
        publish({ value });
      }
      if (config.changeAction) {
        void executeAction(config.changeAction, { value });
      }
    },
    [config.changeAction, executeAction, publish],
  );

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config, { omit: ["maxHeight"] });

  return (
    <EntityPickerBase
      id={config.id}
      entities={entities}
      value={initialValue}
      label={triggerBaseLabel ?? undefined}
      multiple={config.multiple}
      searchable={config.searchable}
      maxHeight={config.maxHeight}
      isLoading={isLoading}
      error={dataError ? String(dataError) : undefined}
      onChange={handleChange}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
