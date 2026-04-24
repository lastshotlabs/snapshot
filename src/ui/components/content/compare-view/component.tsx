'use client';

import { useSubscribe } from "../../../context/hooks";
import { CompareViewBase } from "./standalone";
import type { CompareViewConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and delegates to CompareViewBase.
 */
export function CompareView({ config }: { config: CompareViewConfig }) {
  const leftText = useSubscribe(config.left) as string;
  const rightText = useSubscribe(config.right) as string;
  const leftLabel = (useSubscribe(config.leftLabel) as string | undefined) ?? "Original";
  const rightLabel = (useSubscribe(config.rightLabel) as string | undefined) ?? "Modified";
  const visible = useSubscribe(config.visible ?? true);

  if (visible === false) {
    return null;
  }

  return (
    <CompareViewBase
      id={config.id}
      left={leftText ?? ""}
      right={rightText ?? ""}
      leftLabel={leftLabel}
      rightLabel={rightLabel}
      maxHeight={config.maxHeight}
      showLineNumbers={config.showLineNumbers}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
