import { useSubscribe, usePublish } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { MessageThread } from "../message-thread/component";
import { RichInput } from "../../content/rich-input/component";
import { TypingIndicator } from "../typing-indicator/component";
import type { ChatWindowConfig } from "./types";
import type { MessageThreadConfig } from "../message-thread/types";
import type { RichInputConfig } from "../../content/rich-input/types";
import type { TypingIndicatorConfig } from "../typing-indicator/types";

/**
 * ChatWindow — full chat interface composing a message thread,
 * rich input, and typing indicator. Provides a Discord/Slack-style
 * chat experience in a single config-driven component.
 *
 * @param props - Component props containing the chat window configuration
 */
export function ChatWindow({ config }: { config: ChatWindowConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const title = useSubscribe(config.title ?? "") as string;
  const subtitle = useSubscribe(config.subtitle ?? "") as string;
  const publish = usePublish(config.id);

  if (visible === false) return null;

  const showHeader = config.showHeader ?? true;
  const showTypingIndicator = config.showTypingIndicator ?? true;
  const height = config.height ?? "clamp(300px, 70vh, 500px)";

  // Build MessageThread config
  const threadConfig: MessageThreadConfig = {
    type: "message-thread" as const,
    data: config.data,
    contentField: config.contentField,
    authorNameField: config.authorNameField,
    authorAvatarField: config.authorAvatarField,
    timestampField: config.timestampField,
    showReactions: config.showReactions,
    showTimestamps: true,
    groupByDate: true,
  };

  // Build RichInput config
  const inputConfig: RichInputConfig = {
    type: "rich-input" as const,
    placeholder: config.inputPlaceholder ?? "Type a message...",
    sendOnEnter: true,
    sendAction: config.sendAction,
    mentionData: config.mentionData,
    minHeight: "2.5rem",
    maxHeight: "8rem",
    features: (config.inputFeatures as RichInputConfig["features"]) ?? [
      "bold",
      "italic",
      "strike",
      "code",
      "link",
      "bullet-list",
      "ordered-list",
    ],
  };

  // Build TypingIndicator config (starts empty)
  const typingConfig: TypingIndicatorConfig = {
    type: "typing-indicator" as const,
    users: [],
  };

  return (
    <div
      data-snapshot-component="chat-window"
      data-testid="chat-window"
      aria-label="Chat"
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        height,
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        overflow: "hidden",
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Header */}
      {showHeader && (
        <div
          data-testid="chat-header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
            borderBottom:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            flexShrink: 0,
          }}
        >
          <Icon name="hash" size={18} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontSize: "var(--sn-font-size-md, 1rem)",
                  fontWeight:
                    "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                  color: "var(--sn-color-foreground, #111827)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message thread */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MessageThread
          config={{
            ...threadConfig,
            maxHeight: undefined, // Let flex handle sizing
          }}
        />
      </div>

      {/* Typing indicator */}
      {showTypingIndicator && (
        <div style={{ flexShrink: 0, minHeight: "1.5rem" }}>
          <TypingIndicator config={typingConfig} />
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          flexShrink: 0,
          borderTop:
            "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
        }}
      >
        <RichInput config={inputConfig} />
      </div>
    </div>
  );
}
