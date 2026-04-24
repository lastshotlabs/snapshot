"use client";

import type { CSSProperties } from "react";
import { useResolveFrom } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { DefaultErrorBase } from "./standalone";
import type { ErrorPageConfig } from "./types";

export function DefaultError({ config }: { config: ErrorPageConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    title: config.title,
    description: config.description,
    retryLabel: config.retryLabel,
  });
  const resolvedTitle = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const resolvedDescription = resolveOptionalPrimitiveValue(
    resolvedConfig.description,
    primitiveOptions,
  );
  const resolvedRetryLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.retryLabel,
    primitiveOptions,
  );

  return (
    <DefaultErrorBase
      title={resolvedTitle}
      description={resolvedDescription}
      showRetry={config.showRetry}
      retryLabel={resolvedRetryLabel}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
