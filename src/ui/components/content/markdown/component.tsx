'use client';

import { useEffect } from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { MarkdownBase } from "./standalone";
import type { MarkdownConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and delegates to MarkdownBase.
 */
export function Markdown({ config }: { config: MarkdownConfig }) {
  const resolvedContent = useSubscribe(config.content) as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const content = typeof resolvedContent === "string" ? resolvedContent : "";

  useEffect(() => {
    if (publish && resolvedContent) {
      publish({ content: resolvedContent });
    }
  }, [publish, resolvedContent]);

  if (visible === false) {
    return null;
  }

  return (
    <MarkdownBase
      id={config.id}
      content={content}
      maxHeight={config.maxHeight}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
