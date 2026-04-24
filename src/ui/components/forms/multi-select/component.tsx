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
import { MultiSelectField } from "./standalone";
import type { MultiSelectFieldOption } from "./standalone";
import type { MultiSelectConfig, MultiSelectOption } from "./types";

export function MultiSelect({ config }: { config: MultiSelectConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const primitiveOptions = usePrimitiveValueOptions();

  const visible = useSubscribe(config.visible ?? true);
  const resolvedValue = useSubscribe(config.value) as string[] | undefined;
  const resolvedDisabled = Boolean(useSubscribe(config.disabled ?? false));
  const resolvedConfig = useResolveFrom({
    label: config.label,
    placeholder: config.placeholder,
    options: config.options,
  });
  const dataResult = useComponentData(config.data ?? "");

  const labelField = config.labelField ?? "label";
  const valueField = config.valueField ?? "value";
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const placeholder =
    resolveOptionalPrimitiveValue(resolvedConfig.placeholder, primitiveOptions) ??
    "Select...";
  const staticOptions =
    (resolvedConfig.options as MultiSelectOption[] | undefined)?.map(
      (option) => ({
        ...option,
        label: resolveOptionalPrimitiveValue(option.label, primitiveOptions) ?? option.value,
      }),
    ) ?? config.options?.map((option: MultiSelectOption) => ({
      ...option,
      label: resolveOptionalPrimitiveValue(option.label, primitiveOptions) ?? option.value,
    }));

  const options = useMemo<MultiSelectFieldOption[]>(() => {
    if (staticOptions) {
      return staticOptions;
    }

    if (Array.isArray(dataResult.data)) {
      return dataResult.data.map((item) => ({
        label: String(item[labelField] ?? ""),
        value: String(item[valueField] ?? ""),
        icon: item.icon ? String(item.icon) : undefined,
        disabled: item.disabled === true,
      }));
    }

    return [];
  }, [dataResult.data, labelField, staticOptions, valueField]);

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <MultiSelectField
      id={config.id}
      label={resolvedLabel}
      placeholder={placeholder}
      options={options}
      value={resolvedValue}
      disabled={resolvedDisabled}
      searchable={config.searchable !== false}
      maxSelected={config.maxSelected}
      loading={dataResult.isLoading && options.length === 0}
      error={dataResult.error ? "Failed to load options" : null}
      onRetry={dataResult.refetch}
      onChange={(next) => {
        publish?.({ value: next });
        void executeEventAction(execute, config.on?.change, {
          id: config.id,
          value: next,
        });
        void executeEventAction(execute, config.on?.input, {
          id: config.id,
          value: next,
        });
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
