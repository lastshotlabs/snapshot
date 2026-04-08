import { useState, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { EmojiPicker } from "../emoji-picker/component";
import type { ReactionBarConfig } from "./types";
import type { EmojiPickerConfig } from "../emoji-picker/types";

/**
 * ReactionBar — displays emoji reactions with counts and an optional
 * add button that opens an emoji picker popover.
 *
 * @param props - Component props containing the reaction bar configuration
 */
export function ReactionBar({ config }: { config: ReactionBarConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const [showPicker, setShowPicker] = useState(false);

  const reactions = config.reactions ?? [];
  const showAddButton = config.showAddButton ?? true;

  const handleReactionClick = useCallback(
    (emoji: string, active: boolean) => {
      if (active && config.removeAction) {
        void execute(config.removeAction, { emoji });
      } else if (!active && config.addAction) {
        void execute(config.addAction, { emoji });
      }
      if (publish) {
        publish({ emoji, action: active ? "remove" : "add" });
      }
    },
    [config.addAction, config.removeAction, execute, publish],
  );

  const handleAddEmoji = useCallback(
    (emoji: string) => {
      setShowPicker(false);
      if (config.addAction) {
        void execute(config.addAction, { emoji });
      }
      if (publish) {
        publish({ emoji, action: "add" });
      }
    },
    [config.addAction, execute, publish],
  );

  if (visible === false) return null;

  // Build an internal emoji picker config for the popover
  const pickerConfig: EmojiPickerConfig = {
    type: "emoji-picker" as const,
    maxHeight: "200px",
    perRow: 8,
  };

  return (
    <div
      data-snapshot-component="reaction-bar"
      data-testid="reaction-bar"
      className={config.className}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--sn-spacing-xs, 0.25rem)",
      }}
    >
      {reactions.map((reaction, idx) => (
        <button
          key={`${reaction.emoji}-${idx}`}
          data-testid="reaction-button"
          onClick={() =>
            handleReactionClick(reaction.emoji, reaction.active ?? false)
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderRadius: "var(--sn-radius-full, 9999px)",
            border: `1px solid ${
              reaction.active
                ? "var(--sn-color-primary, #2563eb)"
                : "var(--sn-color-border, #e5e7eb)"
            }`,
            backgroundColor: reaction.active
              ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, transparent)"
              : "var(--sn-color-card, #ffffff)",
            cursor: "pointer",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
          }}
        >
          <span>{reaction.emoji}</span>
          <span
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: reaction.active
                ? "var(--sn-color-primary, #2563eb)"
                : "var(--sn-color-muted-foreground, #6b7280)",
              fontWeight:
                "var(--sn-font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
            }}
          >
            {reaction.count}
          </span>
        </button>
      ))}

      {/* Add reaction button */}
      {showAddButton && (
        <div style={{ position: "relative" }}>
          <button
            data-testid="reaction-add"
            onClick={() => setShowPicker(!showPicker)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.75rem",
              height: "1.75rem",
              padding: 0,
              borderRadius: "var(--sn-radius-full, 9999px)",
              border: "1px solid var(--sn-color-border, #e5e7eb)",
              backgroundColor: "var(--sn-color-card, #ffffff)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              cursor: "pointer",
            }}
          >
            <Icon name="plus" size={14} />
          </button>

          {/* Emoji picker popover */}
          {showPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 4px)",
                left: 0,
                zIndex: "var(--sn-z-index-popover, 60)" as unknown as number,
              }}
            >
              <EmojiPicker
                config={{
                  ...pickerConfig,
                  selectAction: undefined,
                }}
              />
              {/* Invisible overlay to catch clicks outside */}
              <div
                onClick={() => setShowPicker(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: -1,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
