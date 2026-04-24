'use client';

import { useMemo, useCallback, type ReactNode } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { LinkEmbed } from "../../content/link-embed/component";
import type { LinkEmbedConfig } from "../../content/link-embed/types";
import { MessageThreadBase } from "./standalone";
import type { MessageThreadConfig } from "./types";

/**
 * Manifest adapter — resolves data endpoint, wires actions/publish, delegates to MessageThreadBase.
 */
export function MessageThread({ config }: { config: MessageThreadConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const surfaceConfig = extractSurfaceConfig(config, { omit: ["maxHeight"] });

  const messages: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results", "messages"]) {
      if (Array.isArray(data[key])) return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  const handleMessageClick = useCallback(
    (message: Record<string, unknown>) => {
      if (config.messageAction) void execute(config.messageAction, { ...message });
      publish?.({ selectedMessage: message });
    },
    [config.messageAction, execute, publish],
  );

  const renderEmbed = useCallback(
    (embed: Record<string, unknown>, index: number): ReactNode => (
      <LinkEmbed
        key={index}
        config={{ type: "link-embed", url: String(embed.url ?? ""), meta: embed.meta as LinkEmbedConfig["meta"], maxWidth: "min(400px, 100%)" }}
      />
    ),
    [],
  );

  if (visible === false) return null;

  return (
    <MessageThreadBase
      id={config.id}
      messages={messages}
      loading={isLoading}
      error={error ? `Error: ${error.message}` : undefined}
      emptyText={emptyMessage}
      contentField={config.contentField}
      authorNameField={config.authorNameField}
      authorAvatarField={config.authorAvatarField}
      timestampField={config.timestampField}
      showTimestamps={config.showTimestamps}
      embedsField={config.embedsField}
      showEmbeds={config.showEmbeds}
      groupByDate={config.groupByDate}
      maxHeight={config.maxHeight}
      onMessageClick={handleMessageClick}
      renderEmbed={renderEmbed}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
