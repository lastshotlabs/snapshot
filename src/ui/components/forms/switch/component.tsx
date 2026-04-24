'use client';

import { useCallback } from "react";
import type { CSSProperties } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { executeEventAction } from "../../_base/events";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { SwitchField } from "./standalone";
import type { SwitchConfig } from "./types";

export function Switch({ config }: { config: SwitchConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const primitiveOptions = usePrimitiveValueOptions();

  const visible = useSubscribe(config.visible ?? true);
  const resolvedConfig = useResolveFrom({
    label: config.label,
    description: config.description,
  });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedDescription = resolveOptionalPrimitiveValue(
    resolvedConfig.description,
    primitiveOptions,
  );
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;

  const handleChange = useCallback(
    (nextChecked: boolean) => {
      publish?.({ checked: nextChecked });
      void executeEventAction(execute, config.on?.change, {
        id: config.id,
        checked: nextChecked,
        value: nextChecked,
      });
    },
    [config.id, config.on?.change, execute, publish],
  );

  if (visible === false) {
    return null;
  }

  return (
    <SwitchField
      id={config.id}
      label={resolvedLabel}
      description={resolvedDescription}
      defaultChecked={config.defaultChecked}
      disabled={resolvedDisabled}
      size={config.size ?? "md"}
      color={config.color}
      onChange={handleChange}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
