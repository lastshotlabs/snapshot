"use client";

import type { CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { DatePickerField } from "./standalone";
import type { DatePickerConfig } from "./types";

export function DatePicker({ config }: { config: DatePickerConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    label: config.label,
    placeholder: config.placeholder,
    presets: config.presets,
  });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const presets =
    (resolvedConfig.presets as DatePickerConfig["presets"] | undefined)?.map(
      (preset) => ({
        ...preset,
        label: resolveOptionalPrimitiveValue(preset.label, primitiveOptions) ?? preset.start,
      }),
    ) ?? config.presets?.map((preset) => ({
      ...preset,
      label: resolveOptionalPrimitiveValue(preset.label, primitiveOptions) ?? preset.start,
    }));

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <DatePickerField
      id={config.id}
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      mode={config.mode}
      format={config.format}
      valueFormat={config.valueFormat}
      min={config.min}
      max={config.max}
      presets={presets}
      disabledDates={config.disabledDates}
      onChange={(value) => {
        publish?.(value);
        void executeEventAction(execute, config.on?.change, { id: config.id, value });
        void executeEventAction(execute, config.on?.input, { id: config.id, value });
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
