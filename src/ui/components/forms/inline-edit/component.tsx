'use client';

import type { CSSProperties } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { InlineEditField } from "./standalone";
import type { InlineEditConfig } from "./types";

/**
 * InlineEdit component — click-to-edit text field.
 *
 * Toggles between a display mode and an edit mode. Enter or blur saves the
 * value; Escape reverts to the original value when `cancelOnEscape` is enabled.
 */
export function InlineEdit({ config }: { config: InlineEditConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const resolvedValue = useSubscribe(config.value);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ placeholder: config.placeholder });
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const displayValue =
    typeof resolvedValue === "string" || typeof resolvedValue === "number"
      ? String(resolvedValue)
      : "";

  const surfaceConfig = extractSurfaceConfig(config, { omit: ["fontSize"] });

  return (
    <InlineEditField
      id={config.id}
      value={displayValue}
      placeholder={resolvedPlaceholder}
      inputType={config.inputType}
      cancelOnEscape={config.cancelOnEscape}
      fontSize={config.fontSize}
      onSave={(editValue) => {
        publish?.({ value: editValue, editing: false });
        if (config.saveAction && editValue !== displayValue) {
          void execute(config.saveAction, { value: editValue });
        }
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
