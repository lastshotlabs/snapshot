'use client';

import { useEffect } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { SeparatorConfig } from "./types";
import { SeparatorBase } from "./standalone";

export function Separator({ config }: { config: SeparatorConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label ?? undefined });
  const label = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    publish?.({ orientation: config.orientation ?? "horizontal" });
  }, [publish, config.orientation]);

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config);

  return (
    <SeparatorBase
      id={config.id}
      orientation={config.orientation}
      label={label ?? undefined}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
