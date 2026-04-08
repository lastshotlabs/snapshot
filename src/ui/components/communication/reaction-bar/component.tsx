import { useState, useCallback, useEffect, useRef } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
// Internal composition — EmojiPicker is used as a sub-component, not via from-ref binding
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
  const pickerPopoverRef = useRef<HTMLDivElement>(null);

  // Close picker on click outside
  useEffect(() => {
    if (!showPicker) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        pickerPopoverRef.current &&
        !pickerPopoverRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPicker]);

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
        position: "relative",
        overflow: "visible",
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Hover/transition/focus styles */}
      <style>{`
[data-snapshot-component="reaction-bar"] [data-testid="reaction-button"]:hover {
  transform: scale(1.05);
  box-shadow: var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
}
[data-snapshot-component="reaction-bar"] [data-testid="reaction-button"]:focus {
  outline: none;
}
[data-snapshot-component="reaction-bar"] [data-testid="reaction-button"]:focus-visible {
  outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
[data-snapshot-component="reaction-bar"] [data-testid="reaction-add"]:hover {
  background-color: var(--sn-color-accent, #f3f4f6) !important;
}
[data-snapshot-component="reaction-bar"] [data-testid="reaction-add"]:focus {
  outline: none;
}
[data-snapshot-component="reaction-bar"] [data-testid="reaction-add"]:focus-visible {
  outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
`}</style>
      {reactions.map((reaction, idx) => (
        <button
          type="button"
          key={`${reaction.emoji}-${idx}`}
          data-testid="reaction-button"
          aria-label={`React with ${reaction.emoji}`}
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
            transition:
              "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
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
            type="button"
            data-testid="reaction-add"
            aria-label="Add reaction"
            onClick={() => setShowPicker(!showPicker)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2rem",
              height: "2rem",
              padding: 0,
              borderRadius: "var(--sn-radius-full, 9999px)",
              border:
                "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
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
              ref={pickerPopoverRef}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
