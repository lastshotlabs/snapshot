'use client';

import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { HighlightedTextConfig } from "./types";
import { HighlightedTextBase } from "./standalone";

export function HighlightedText({ config }: { config: HighlightedTextConfig }) {
  const resolvedText = useSubscribe(config.text) as string;
  const resolvedHighlight = useSubscribe(config.highlight ?? "");
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    if (publish && resolvedText) {
      publish({ text: resolvedText });
    }
  }, [publish, resolvedText]);

  if (visible === false) return null;

  const text = typeof resolvedText === "string" ? resolvedText : "";
  const highlight =
    typeof resolvedHighlight === "string" ? resolvedHighlight : "";

  const surface = extractSurfaceConfig(config);

  return (
    <HighlightedTextBase
      id={config.id}
      text={text}
      highlight={highlight}
      caseSensitive={config.caseSensitive}
      highlightColor={config.highlightColor}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
