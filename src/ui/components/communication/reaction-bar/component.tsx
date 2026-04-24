'use client';

import { useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { EmojiPicker } from "../emoji-picker/component";
import { ReactionBarBase } from "./standalone";
import type { ReactionBarConfig } from "./types";

/**
 * Manifest adapter — wires actions/publish and delegates to ReactionBarBase.
 */
export function ReactionBar({ config }: { config: ReactionBarConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const surfaceConfig = extractSurfaceConfig(config);

  const handleReactionClick = useCallback(
    (emoji: string, wasActive: boolean) => {
      if (wasActive && config.removeAction) void execute(config.removeAction, { emoji });
      else if (!wasActive && config.addAction) void execute(config.addAction, { emoji });
      if (publish) publish({ emoji, action: wasActive ? "remove" : "add" });
    },
    [config.addAction, config.removeAction, execute, publish],
  );

  if (visible === false) return null;

  return (
    <ReactionBarBase
      id={config.id}
      reactions={config.reactions?.map((r) => ({ emoji: r.emoji, count: r.count, active: r.active })) ?? []}
      showAddButton={config.showAddButton}
      onReactionClick={handleReactionClick}
      EmojiPickerComponent={EmojiPicker as never}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
