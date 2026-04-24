'use client';

import { useResolveFrom } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { EmbedBase } from "./standalone";
import type { EmbedSchemaConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and delegates to EmbedBase.
 */
export function Embed({ config }: { config: EmbedSchemaConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    url: config.url,
    aspectRatio: config.aspectRatio,
    title: config.title,
  });
  const url = resolveOptionalPrimitiveValue(
    resolvedConfig.url,
    primitiveOptions,
  ) ?? "";
  const aspectRatio =
    resolveOptionalPrimitiveValue(resolvedConfig.aspectRatio, primitiveOptions) ??
    "16/9";
  const title = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );

  return (
    <EmbedBase
      id={config.id}
      url={url}
      aspectRatio={aspectRatio}
      title={title}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
