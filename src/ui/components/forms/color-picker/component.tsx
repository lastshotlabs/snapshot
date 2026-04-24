"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { ColorPickerField } from "./standalone";
import type { ColorPickerConfig } from "./types";

export function ColorPicker({ config }: { config: ColorPickerConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <ColorPickerField
      id={config.id}
      label={resolvedLabel}
      defaultValue={config.defaultValue}
      format={config.format}
      showAlpha={config.showAlpha}
      allowCustom={config.allowCustom}
      swatches={config.swatches}
      onChange={(value) => {
        publish?.(value);
        void executeEventAction(execute, config.on?.input, { id: config.id, value });
        void executeEventAction(execute, config.on?.change, { id: config.id, value });
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
