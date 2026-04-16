'use client';

import { useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { RichInput } from "../../content/rich-input/component";
import type { RichInputConfig } from "../../content/rich-input/types";
import { MessageThread } from "../message-thread/component";
import type { MessageThreadConfig } from "../message-thread/types";
import { TypingIndicator } from "../typing-indicator/component";
import type { TypingIndicatorConfig } from "../typing-indicator/types";
import type { ChatWindowConfig } from "./types";

export function ChatWindow({ config }: { config: ChatWindowConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const title = useSubscribe(config.title ?? "") as string;
  const subtitle = useSubscribe(config.subtitle ?? "") as string;
  const rootId = config.id ?? "chat-window";

  if (visible === false) {
    return null;
  }

  const showHeader = config.showHeader ?? true;
  const showTypingIndicator = config.showTypingIndicator ?? true;
  const height = config.height ?? "clamp(300px, 70vh, 500px)";

  const threadConfig: MessageThreadConfig = {
    type: "message-thread",
    data: config.data,
    contentField: config.contentField,
    authorNameField: config.authorNameField,
    authorAvatarField: config.authorAvatarField,
    timestampField: config.timestampField,
    showReactions: config.showReactions,
    showTimestamps: true,
    groupByDate: true,
  };

  const inputConfig: RichInputConfig = {
    type: "rich-input",
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

  const typingConfig: TypingIndicatorConfig = {
    type: "typing-indicator",
    users: [],
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
      style: {
        height,
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
      bg: "var(--sn-color-card, #ffffff)",
      style: {
        flexShrink: 0,
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.header,
  });
  const headerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-headerIcon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.headerIcon,
  });
  const titleGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-titleGroup`,
    implementationBase: {
      flex: "1",
      style: {
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.titleGroup,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "base",
      fontWeight: "semibold",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.title,
  });
  const subtitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-subtitle`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.subtitle,
  });
  const threadAreaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-threadArea`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      flex: "1",
      style: {
        minHeight: 0,
      },
    },
    componentSurface: config.slots?.threadArea,
  });
  const typingAreaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-typingArea`,
    implementationBase: {
      style: {
        flexShrink: 0,
        minHeight: "1.5rem",
      },
    },
    componentSurface: config.slots?.typingArea,
  });
  const inputAreaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inputArea`,
    implementationBase: {
      paddingY: "sm",
      paddingX: "md",
      style: {
        flexShrink: 0,
        borderTop:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.inputArea,
  });

  return (
    <>
      <div
        data-snapshot-component="chat-window"
        data-testid="chat-window"
        aria-label="Chat"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {showHeader ? (
          <div
            data-testid="chat-header"
            data-snapshot-id={`${rootId}-header`}
            className={headerSurface.className}
            style={headerSurface.style}
          >
            <span
              aria-hidden="true"
              data-snapshot-id={`${rootId}-headerIcon`}
              className={headerIconSurface.className}
              style={headerIconSurface.style}
            >
              <Icon name="hash" size={18} />
            </span>
            <div
              data-snapshot-id={`${rootId}-titleGroup`}
              className={titleGroupSurface.className}
              style={titleGroupSurface.style}
            >
              {title ? (
                <div
                  data-snapshot-id={`${rootId}-title`}
                  className={titleSurface.className}
                  style={titleSurface.style}
                >
                  {title}
                </div>
              ) : null}
              {subtitle ? (
                <div
                  data-snapshot-id={`${rootId}-subtitle`}
                  className={subtitleSurface.className}
                  style={subtitleSurface.style}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-threadArea`}
          className={threadAreaSurface.className}
          style={threadAreaSurface.style}
        >
          <MessageThread config={{ ...threadConfig, maxHeight: undefined }} />
        </div>

        {showTypingIndicator ? (
          <div
            data-snapshot-id={`${rootId}-typingArea`}
            className={typingAreaSurface.className}
            style={typingAreaSurface.style}
          >
            <TypingIndicator config={typingConfig} />
          </div>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-inputArea`}
          className={inputAreaSurface.className}
          style={inputAreaSurface.style}
        >
          <RichInput config={inputConfig} />
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={headerIconSurface.scopedCss} />
      <SurfaceStyles css={titleGroupSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={subtitleSurface.scopedCss} />
      <SurfaceStyles css={threadAreaSurface.scopedCss} />
      <SurfaceStyles css={typingAreaSurface.scopedCss} />
      <SurfaceStyles css={inputAreaSurface.scopedCss} />
    </>
  );
}
