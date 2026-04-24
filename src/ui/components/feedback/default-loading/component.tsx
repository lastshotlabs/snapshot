"use client";

import type { CSSProperties } from "react";
import { useResolveFrom } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { DefaultLoadingBase } from "./standalone";
import type { SpinnerConfig } from "./types";

export function DefaultLoading({ config }: { config: SpinnerConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );

  return (
    <DefaultLoadingBase
      label={resolvedLabel}
      size={config.size}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
