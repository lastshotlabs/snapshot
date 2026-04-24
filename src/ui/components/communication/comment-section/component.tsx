'use client';

import { useMemo, useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { getNestedField } from "../../_base/utils";
import { RichInput } from "../../content/rich-input/component";
import type { RichInputConfig } from "../../content/rich-input/types";
import { CommentSectionBase } from "./standalone";
import type { CommentSectionConfig } from "./types";

/**
 * Manifest adapter — resolves data endpoint, wires actions, delegates to CommentSectionBase.
 */
export function CommentSection({ config }: { config: CommentSectionConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const surfaceConfig = extractSurfaceConfig(config);

  const comments: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results", "comments"]) {
      if (Array.isArray(data[key])) return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  const handleDelete = useCallback(
    (comment: Record<string, unknown>) => {
      if (config.deleteAction) void execute(config.deleteAction, { ...comment });
    },
    [config.deleteAction, execute],
  );

  if (visible === false) return null;

  const inputConfig: RichInputConfig = {
    type: "rich-input",
    placeholder: config.inputPlaceholder ?? "Write a comment...",
    sendOnEnter: false,
    sendAction: config.submitAction,
    minHeight: "2.5rem",
    maxHeight: "8rem",
    features: (config.inputFeatures as RichInputConfig["features"]) ?? ["bold", "italic", "code", "link"],
  };

  return (
    <CommentSectionBase
      id={config.id}
      comments={comments}
      loading={isLoading}
      error={error ? `Error: ${error.message}` : undefined}
      emptyText={emptyMessage}
      authorNameField={config.authorNameField}
      authorAvatarField={config.authorAvatarField}
      contentField={config.contentField}
      timestampField={config.timestampField}
      sortOrder={config.sortOrder}
      showDelete={Boolean(config.deleteAction)}
      onDelete={config.deleteAction ? handleDelete : undefined}
      inputSlot={config.submitAction ? <RichInput config={inputConfig} /> : undefined}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
