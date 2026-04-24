'use client';

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { executeEventAction } from "../../_base/events";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { ToggleField } from "./standalone";
import type { ToggleConfig } from "./types";

export function Toggle({ config }: { config: ToggleConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const primitiveOptions = usePrimitiveValueOptions();

  const visible = useSubscribe(config.visible ?? true);
  const resolvedConfig = useResolveFrom({ label: config.label });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedPressed = useSubscribe(config.pressed ?? false) as boolean;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;

  const [pressed, setPressed] = useState(resolvedPressed);

  useEffect(() => {
    setPressed(resolvedPressed);
  }, [resolvedPressed]);

  useEffect(() => {
    publish?.({ pressed });
  }, [pressed, publish]);

  const handleChange = useCallback(
    (nextPressed: boolean) => {
      setPressed(nextPressed);
      void executeEventAction(execute, config.on?.change, {
        id: config.id,
        pressed: nextPressed,
        value: nextPressed,
      });
    },
    [config.id, config.on?.change, execute],
  );

  if (visible === false) {
    return null;
  }

  return (
    <ToggleField
      id={config.id}
      label={resolvedLabel}
      icon={config.icon}
      variant={config.variant}
      size={config.size}
      pressed={pressed}
      disabled={resolvedDisabled}
      onChange={handleChange}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
