'use client';

import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { PresenceIndicatorBase } from "./standalone";
import type { PresenceIndicatorConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and delegates to PresenceIndicatorBase.
 */
export function PresenceIndicator({
  config,
}: {
  config: PresenceIndicatorConfig;
}) {
  const visible = useSubscribe(config.visible ?? true);
  const status = useSubscribe(config.status) as string;
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label ?? "" });
  const label =
    resolveOptionalPrimitiveValue(resolvedConfig.label, primitiveOptions) ?? "";

  if (visible === false) return null;

  return (
    <PresenceIndicatorBase
      id={config.id}
      status={status}
      label={label}
      showDot={config.showDot}
      showLabel={config.showLabel}
      size={config.size}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
