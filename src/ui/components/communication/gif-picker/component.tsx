'use client';

import { useState, useMemo, useCallback, useEffect } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { resolveOptionalPrimitiveValue, usePrimitiveValueOptions } from "../../primitives/resolve-value";
import { GifPickerBase } from "./standalone";
import type { GifEntry, GifPickerConfig } from "./types";

function toGifEntries(payload: unknown, urlField: string, previewField: string, titleField: string): GifEntry[] {
  const recordData = payload && typeof payload === "object" && !Array.isArray(payload) ? (payload as Record<string, unknown>) : undefined;
  const items = Array.isArray(payload) ? (payload as Record<string, unknown>[]) : ((recordData?.results ?? recordData?.data ?? recordData?.gifs ?? []) as Record<string, unknown>[]);
  return items.map((item, index) => ({
    id: String(item.id ?? index),
    url: String(item[urlField] ?? ""),
    preview: String(item[previewField] ?? item[urlField] ?? ""),
    width: item.width as number | undefined,
    height: item.height as number | undefined,
    title: String(item[titleField] ?? ""),
  }));
}

/**
 * Manifest adapter — resolves config refs, wires actions/publish, delegates to GifPickerBase.
 */
export function GifPicker({ config }: { config: GifPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const urlField = config.urlField ?? "url";
  const previewField = config.previewField ?? "preview";
  const titleField = config.titleField ?? "title";
  const resolvedConfig = useResolveFrom({ placeholder: config.placeholder, attribution: config.attribution, gifs: config.gifs });
  const placeholder = resolveOptionalPrimitiveValue(resolvedConfig.placeholder, primitiveOptions);
  const attribution = resolveOptionalPrimitiveValue(resolvedConfig.attribution, primitiveOptions);
  const surfaceConfig = extractSurfaceConfig(config, { omit: ["maxHeight"] });

  const staticGifs = useMemo(() => {
    const gifs = (resolvedConfig.gifs ?? config.gifs) as GifPickerConfig["gifs"];
    if (!gifs) return [];
    return gifs.map((gif) => ({
      id: gif.id,
      url: gif.url,
      preview: gif.preview ?? gif.url,
      width: gif.width,
      height: gif.height,
      title: resolveOptionalPrimitiveValue(gif.title, primitiveOptions),
    }));
  }, [config.gifs, primitiveOptions, resolvedConfig.gifs]);

  const remoteTarget = staticGifs.length > 0 ? "" : debouncedSearch ? (config.searchEndpoint ?? "") : (config.trendingEndpoint ?? "");
  const remoteResults = useComponentData(remoteTarget, debouncedSearch && config.searchEndpoint ? { q: debouncedSearch } : undefined);
  const results = useMemo(() => toGifEntries(remoteResults.data, urlField, previewField, titleField), [previewField, remoteResults.data, titleField, urlField]);

  const displayGifs = staticGifs.length > 0 ? staticGifs : results;
  const loading = staticGifs.length === 0 && remoteResults.isLoading;

  const handleSelect = useCallback(
    (gif: GifEntry) => {
      publish?.({ url: gif.url, title: gif.title, id: gif.id });
      if (config.selectAction) void execute(config.selectAction, { url: gif.url, title: gif.title, id: gif.id });
    },
    [config.selectAction, execute, publish],
  );

  if (visible === false) return null;

  return (
    <GifPickerBase
      id={config.id}
      columns={config.columns}
      maxHeight={config.maxHeight}
      placeholder={placeholder ?? undefined}
      attribution={attribution ?? undefined}
      gifs={displayGifs as GifEntry[]}
      loading={loading}
      onSelect={handleSelect}
      onSearchChange={setDebouncedSearch}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
