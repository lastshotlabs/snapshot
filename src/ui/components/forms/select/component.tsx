'use client';

import { useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import {
  executeEventAction,
  focusEventPayload,
  keyEventPayload,
  mouseEventPayload,
} from "../../_base/events";
import { useComponentData } from "../../_base/use-component-data";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { CSSProperties } from "react";
import { SelectField } from "./standalone";
import type { SelectConfig } from "./types";

// Re-export SelectControl from its canonical location for backwards compatibility.
export { SelectControl } from "./control";

type SelectOption = {
  label: string;
  value: string;
};

function toOptions(
  raw: unknown,
  labelField?: string,
  valueField?: string,
): SelectOption[] {
  const normalizedLabelField = labelField ?? "label";
  const normalizedValueField = valueField ?? "value";
  const payload =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : undefined;
  const items = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : ((payload?.results ??
        payload?.data ??
        payload?.items ??
        []) as Record<string, unknown>[]);

  return items.map((item) => ({
    label: String(
      item.label ??
        item[normalizedLabelField] ??
        item.name ??
        item.title ??
        item.id ??
        "",
    ),
    value: String(
      item.value ??
        item[normalizedValueField] ??
        item.id ??
        item.key ??
        "",
    ),
  }));
}

export function Select({ config }: { config: SelectConfig }) {
  const execute = useActionExecutor();
  const publish = config.id ? usePublish(config.id) : null;
  const resolvedDefault = useSubscribe(config.default ?? "");
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    placeholder: config.placeholder,
    options: Array.isArray(config.options) ? config.options : undefined,
  });

  const dataResult = useComponentData(
    !Array.isArray(config.options) && config.options ? config.options : "",
  );

  const options = useMemo(() => {
    const staticOptions = resolvedConfig.options as SelectConfig["options"];

    if (Array.isArray(staticOptions)) {
      return staticOptions.map((option) => ({
        label:
          resolveOptionalPrimitiveValue(option.label, primitiveOptions) ?? option.value,
        value: option.value,
      }));
    }

    return toOptions(dataResult.data, config.labelField, config.valueField);
  }, [
    config.labelField,
    config.valueField,
    dataResult.data,
    primitiveOptions,
    resolvedConfig.options,
  ]);

  const defaultValue =
    typeof resolvedDefault === "string"
      ? resolvedDefault
      : String(resolvedDefault ?? "");
  const placeholder =
    resolveOptionalPrimitiveValue(resolvedConfig.placeholder, primitiveOptions) ?? "";

  const isLoading =
    !Array.isArray(config.options) &&
    Boolean(config.options) &&
    dataResult.isLoading &&
    options.length === 0;

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <SelectField
      id={config.id}
      placeholder={placeholder}
      defaultValue={defaultValue}
      options={options}
      loading={isLoading}
      onChange={(nextValue) => {
        publish?.(nextValue);
        const payload = { id: config.id, value: nextValue };
        void executeEventAction(execute, config.on?.input, payload);
        void executeEventAction(execute, config.on?.change, payload);
      }}
      onBlur={(event) => {
        void executeEventAction(
          execute,
          config.on?.blur,
          focusEventPayload(event, { id: config.id, value: "" }),
        );
      }}
      onFocus={(event) => {
        void executeEventAction(
          execute,
          config.on?.focus,
          focusEventPayload(event, { id: config.id, value: "" }),
        );
      }}
      onClick={(event) => {
        void executeEventAction(
          execute,
          config.on?.click,
          mouseEventPayload(event, { id: config.id, value: "" }),
        );
      }}
      onKeyDown={(event) => {
        void executeEventAction(
          execute,
          config.on?.keyDown,
          keyEventPayload(event, { id: config.id, value: "" }),
        );
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
