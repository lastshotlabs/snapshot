'use client';

import { useEffect } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { ProgressConfig } from "./types";
import { ProgressBase } from "./standalone";

export function Progress({ config }: { config: ProgressConfig }) {
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedValue = useSubscribe(config.value) as number | undefined;

  const max = config.max ?? 100;
  const percentage =
    resolvedValue !== undefined
      ? Math.min(100, Math.max(0, (resolvedValue / max) * 100))
      : undefined;

  useEffect(() => {
    if (publish && percentage !== undefined) {
      publish({ value: resolvedValue, percentage });
    }
  }, [publish, resolvedValue, percentage]);

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config, { omit: ["color"] });

  return (
    <ProgressBase
      id={config.id}
      value={resolvedValue}
      max={config.max}
      label={resolvedLabel ?? undefined}
      size={config.size}
      variant={config.variant}
      showValue={config.showValue}
      color={config.color}
      segments={config.segments}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
