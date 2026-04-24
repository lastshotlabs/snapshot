'use client';

import { useMemo, useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { EmojiPickerBase } from "./standalone";
import type { EmojiPickerConfig } from "./types";
import { resolveEmojiRecords } from "./custom-emoji";

function toRecordArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const recordData = payload as Record<string, unknown>;
  const candidates = [recordData.results, recordData.data, recordData.items, recordData.emojis];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
  }
  return [];
}

/**
 * Manifest adapter — resolves custom emoji data, wires actions/publish, delegates to EmojiPickerBase.
 */
export function EmojiPicker({ config }: { config: EmojiPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const customEmojiResult = useComponentData(config.customEmojiData ?? "");
  const surfaceConfig = extractSurfaceConfig(config, { omit: ["maxHeight"] });

  const remoteCustomEmojis = useMemo(
    () => resolveEmojiRecords(toRecordArray(customEmojiResult.data), config.emojiUrlField, config.emojiUrlPrefix),
    [config.emojiUrlField, config.emojiUrlPrefix, customEmojiResult.data],
  );

  const customEmojis = useMemo(() => {
    const entries = [...remoteCustomEmojis, ...(config.customEmojis ?? [])];
    const seen = new Set<string>();
    return entries.filter((e) => {
      const key = e.shortcode || e.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [config.customEmojis, remoteCustomEmojis]);

  const handleSelect = useCallback(
    (payload: { emoji: string; name: string; url?: string; shortcode?: string; isCustom: boolean }) => {
      publish?.(payload);
      if (config.selectAction) void execute(config.selectAction, payload);
    },
    [config.selectAction, execute, publish],
  );

  if (visible === false) return null;

  return (
    <EmojiPickerBase
      id={config.id}
      perRow={config.perRow}
      maxHeight={config.maxHeight}
      categories={config.categories}
      customEmojis={customEmojis}
      onSelect={handleSelect}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
