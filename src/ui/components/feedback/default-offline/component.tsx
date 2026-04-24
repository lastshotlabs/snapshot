"use client";

import type { CSSProperties } from "react";
import { useResolveFrom } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { DefaultOfflineBase } from "./standalone";
import type { OfflineBannerConfig } from "./types";

export function DefaultOffline({ config }: { config: OfflineBannerConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    title: config.title,
    description: config.description,
  });
  const resolvedTitle = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const resolvedDescription = resolveOptionalPrimitiveValue(
    resolvedConfig.description,
    primitiveOptions,
  );

  return (
    <DefaultOfflineBase
      title={resolvedTitle}
      description={resolvedDescription}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
