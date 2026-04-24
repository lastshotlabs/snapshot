"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { SliderField } from "./standalone";
import type { SliderConfig } from "./types";

/**
 * Render a manifest-driven slider input.
 */
export function Slider({ config }: { config: SliderConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const primitiveOptions = usePrimitiveValueOptions();
  const visible = useSubscribe(config.visible ?? true);
  const resolvedConfig = useResolveFrom({
    label: config.label,
    suffix: config.suffix,
  });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedSuffix = resolveOptionalPrimitiveValue(
    resolvedConfig.suffix,
    primitiveOptions,
  );
  const disabled = Boolean(useSubscribe(config.disabled ?? false));

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <SliderField
      id={config.id}
      label={resolvedLabel}
      min={config.min}
      max={config.max}
      step={config.step}
      defaultValue={config.defaultValue}
      range={config.range}
      showValue={config.showValue}
      showLimits={config.showLimits}
      suffix={resolvedSuffix}
      disabled={disabled}
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
