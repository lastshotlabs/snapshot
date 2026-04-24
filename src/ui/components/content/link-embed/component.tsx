'use client';

import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { LinkEmbedBase } from "./standalone";
import type { LinkEmbedMeta } from "./standalone";
import type { LinkEmbedConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and delegates to LinkEmbedBase.
 */
export function LinkEmbed({ config }: { config: LinkEmbedConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const rawUrl = useSubscribe(config.url) as string;
  const resolvedConfig = useResolveFrom({ meta: config.meta });
  const url = typeof rawUrl === "string" ? rawUrl : "";
  const meta = (resolvedConfig.meta ?? config.meta) as LinkEmbedMeta | undefined;

  if (visible === false || !url) {
    return null;
  }

  return (
    <LinkEmbedBase
      id={config.id}
      url={url}
      meta={meta}
      allowIframe={config.allowIframe}
      aspectRatio={config.aspectRatio}
      maxWidth={config.maxWidth}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
