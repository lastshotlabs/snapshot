'use client';

import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { CSSProperties } from "react";
import { TextareaField } from "./standalone";
import type { TextareaConfig } from "./types";

// Re-export TextareaControl from its canonical location for backwards compatibility.
export { TextareaControl } from "./control";

export function Textarea({ config }: { config: TextareaConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const primitiveOptions = usePrimitiveValueOptions();

  const visible = useSubscribe(config.visible ?? true);
  const resolvedConfig = useResolveFrom({
    label: config.label,
    placeholder: config.placeholder,
    helperText: config.helperText,
    errorText: config.errorText,
  });
  const resolvedValue = useSubscribe(config.value) as string | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const resolvedHelperText = resolveOptionalPrimitiveValue(
    resolvedConfig.helperText,
    primitiveOptions,
  );
  const resolvedErrorText = resolveOptionalPrimitiveValue(
    resolvedConfig.errorText,
    primitiveOptions,
  );

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <TextareaField
      id={config.id}
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      value={resolvedValue}
      required={config.required}
      disabled={resolvedDisabled}
      readOnly={resolvedReadonly}
      maxLength={config.maxLength}
      rows={config.rows ?? 3}
      resize={config.resize ?? "vertical"}
      helperText={resolvedHelperText}
      errorText={resolvedErrorText}
      onChange={(nextValue) => {
        publish?.({ value: nextValue });
        const payload = { id: config.id, value: nextValue };
        void executeEventAction(execute, config.on?.input, payload);
        void executeEventAction(execute, config.on?.change, payload);
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
