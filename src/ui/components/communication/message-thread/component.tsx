'use client';

import { useMemo, useEffect, useRef, useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { LinkEmbed } from "../../content/link-embed/component";
import type { LinkEmbedConfig } from "../../content/link-embed/types";
import {
  formatDateSeparator,
  formatRelativeTime,
  getInitials,
  getNestedField,
} from "../../_base/utils";
import { sanitizeMessageHtml } from "./message-renderer";
import type { MessageThreadConfig } from "./types";

type MessageRecord = Record<string, unknown>;

function MessageAvatar({
  rootId,
  messageId,
  slots,
  src,
  name,
}: {
  rootId: string;
  messageId: string;
  slots: MessageThreadConfig["slots"];
  src?: string | null;
  name: string;
}) {
  const initials = getInitials(name) || "?";

  if (src) {
    const avatarImageSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-message-${messageId}-avatarImage`,
      implementationBase: {
        style: {
          width: 32,
          height: 32,
          borderRadius: "var(--sn-radius-full, 9999px)",
          objectFit: "cover",
          flexShrink: 0,
        },
      },
      componentSurface: slots?.avatarImage,
    });

    return (
      <>
        <img
          src={src}
          alt={name}
          data-snapshot-id={`${rootId}-message-${messageId}-avatarImage`}
          className={avatarImageSurface.className}
          style={avatarImageSurface.style}
        />
        <SurfaceStyles css={avatarImageSurface.scopedCss} />
      </>
    );
  }

  const avatarFallbackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-message-${messageId}-avatarFallback`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "xs",
      fontWeight: "semibold",
      color: "var(--sn-color-primary-foreground, #ffffff)",
      bg: "var(--sn-color-primary, #2563eb)",
      style: {
        width: 32,
        height: 32,
        borderRadius: "var(--sn-radius-full, 9999px)",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.avatarFallback,
  });

  return (
    <>
      <div
        data-snapshot-id={`${rootId}-message-${messageId}-avatarFallback`}
        className={avatarFallbackSurface.className}
        style={avatarFallbackSurface.style}
      >
        {initials}
      </div>
      <SurfaceStyles css={avatarFallbackSurface.scopedCss} />
    </>
  );
}

function MessageSkeleton({
  rootId,
  index,
  slots,
}: {
  rootId: string;
  index: number;
  slots: MessageThreadConfig["slots"];
}) {
  const rowId = `${rootId}-loading-${index}`;
  const rowSurface = resolveSurfacePresentation({
    surfaceId: rowId,
    implementationBase: {
      display: "flex",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
    },
    componentSurface: slots?.loadingItem,
  });
  const avatarSurface = resolveSurfacePresentation({
    surfaceId: `${rowId}-avatar`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      style: {
        width: 32,
        height: 32,
        borderRadius: "var(--sn-radius-full, 9999px)",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.loadingAvatar,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rowId}-title`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      borderRadius: "xs",
      style: {
        height: "0.875rem",
        width: "30%",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: slots?.loadingTitle,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${rowId}-body`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.3,
      borderRadius: "xs",
      style: {
        height: "0.75rem",
        width: "70%",
      },
    },
    componentSurface: slots?.loadingBody,
  });

  return (
    <>
      <div
        data-snapshot-id={rowId}
        className={rowSurface.className}
        style={rowSurface.style}
      >
        <div
          data-snapshot-id={`${rowId}-avatar`}
          className={avatarSurface.className}
          style={avatarSurface.style}
        />
        <div style={{ flex: 1 }}>
          <div
            data-snapshot-id={`${rowId}-title`}
            className={titleSurface.className}
            style={titleSurface.style}
          />
          <div
            data-snapshot-id={`${rowId}-body`}
            className={bodySurface.className}
            style={bodySurface.style}
          />
        </div>
      </div>
      <SurfaceStyles css={rowSurface.scopedCss} />
      <SurfaceStyles css={avatarSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
    </>
  );
}

export function MessageThread({ config }: { config: MessageThreadConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootId = config.id ?? "message-thread";

  const contentField = config.contentField ?? "content";
  const authorNameField = config.authorNameField ?? "author.name";
  const authorAvatarField = config.authorAvatarField ?? "author.avatar";
  const timestampField = config.timestampField ?? "timestamp";
  const showTimestamps = config.showTimestamps ?? true;
  const embedsField = config.embedsField ?? "embeds";
  const showEmbeds = config.showEmbeds ?? true;
  const groupByDate = config.groupByDate ?? true;

  const messages: MessageRecord[] = useMemo(() => {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data as MessageRecord[];
    }

    for (const key of ["data", "items", "results", "messages"]) {
      if (Array.isArray(data[key])) {
        return data[key] as MessageRecord[];
      }
    }

    return [];
  }, [data]);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const element = scrollRef.current;
      const isNearBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < 100;
      if (isNearBottom) {
        element.scrollTop = element.scrollHeight;
      }
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isLoading]);

  const handleMessageClick = useCallback(
    (message: MessageRecord) => {
      if (config.messageAction) {
        void execute(config.messageAction, { ...message });
      }
      publish?.({ selectedMessage: message });
    },
    [config.messageAction, execute, publish],
  );

  if (visible === false) {
    return null;
  }

  type MessageGroup = {
    dateLabel: string;
    messages: MessageRecord[];
  };

  const grouped: MessageGroup[] = useMemo(() => {
    if (!groupByDate || messages.length === 0) {
      return [{ dateLabel: "", messages }];
    }

    const groups: MessageGroup[] = [];
    let currentDate = "";

    for (const message of messages) {
      const raw = getNestedField(message, timestampField);
      const timestamp = raw ? new Date(String(raw)) : null;
      const dateKey = timestamp
        ? `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`
        : "unknown";

      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({
          dateLabel: timestamp ? formatDateSeparator(timestamp) : "",
          messages: [message],
        });
      } else {
        groups[groups.length - 1]!.messages.push(message);
      }
    }

    return groups;
  }, [groupByDate, messages, timestampField]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      flex: "1",
      overflow: "hidden",
      bg: "var(--sn-color-card, #ffffff)",
      style: {
        minHeight: 0,
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["maxHeight"] }),
    itemSurface: config.slots?.root,
  });
  const scrollAreaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-scrollArea`,
    implementationBase: {
      flex: "1",
      overflow: "auto",
      style: {
        maxHeight: config.maxHeight ?? "auto",
      },
    },
    componentSurface: config.slots?.scrollArea,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorState`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: config.slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: {
      padding: "xl",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.emptyState,
  });

  return (
    <>
      <div
        data-snapshot-component="message-thread"
        data-testid="message-thread"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Messages"
          data-snapshot-id={`${rootId}-scrollArea`}
          className={scrollAreaSurface.className}
          style={scrollAreaSurface.style}
        >
          {isLoading ? (
            <>
              <MessageSkeleton rootId={rootId} index={0} slots={config.slots} />
              <MessageSkeleton rootId={rootId} index={1} slots={config.slots} />
              <MessageSkeleton rootId={rootId} index={2} slots={config.slots} />
            </>
          ) : null}

          {error ? (
            <div
              data-snapshot-id={`${rootId}-errorState`}
              className={errorStateSurface.className}
              style={errorStateSurface.style}
            >
              Error: {error.message}
            </div>
          ) : null}

          {!isLoading && !error && messages.length === 0 ? (
            <div
              data-snapshot-id={`${rootId}-emptyState`}
              className={emptyStateSurface.className}
              style={emptyStateSurface.style}
            >
              {config.emptyMessage ?? "No messages yet"}
            </div>
          ) : null}

          {!isLoading && !error
            ? grouped.map((group, groupIndex) => (
                <div key={group.dateLabel || groupIndex}>
                  {group.dateLabel ? (
                    (() => {
                      const separatorId = `${rootId}-date-${groupIndex}`;
                      const separatorSurface = resolveSurfacePresentation({
                        surfaceId: separatorId,
                        implementationBase: {
                          display: "flex",
                          alignItems: "center",
                          gap: "sm",
                          paddingY: "sm",
                          paddingX: "md",
                        },
                        componentSurface: config.slots?.dateSeparator,
                      });
                      const ruleSurface = resolveSurfacePresentation({
                        surfaceId: `${separatorId}-rule`,
                        implementationBase: {
                          bg: "var(--sn-color-border, #e5e7eb)",
                          flex: "1",
                          style: {
                            height: "1px",
                          },
                        },
                        componentSurface: config.slots?.dateRule,
                      });
                      const labelSurface = resolveSurfacePresentation({
                        surfaceId: `${separatorId}-label`,
                        implementationBase: {
                          fontSize: "xs",
                          fontWeight: "medium",
                          color: "var(--sn-color-muted-foreground, #6b7280)",
                          style: {
                            letterSpacing: "var(--sn-tracking-wide, 0.05em)",
                            whiteSpace: "nowrap",
                          },
                        },
                        componentSurface: config.slots?.dateLabel,
                      });

                      return (
                        <div
                          data-testid="date-separator"
                          data-snapshot-id={separatorId}
                          className={separatorSurface.className}
                          style={separatorSurface.style}
                        >
                          <div
                            data-snapshot-id={`${separatorId}-rule`}
                            className={ruleSurface.className}
                            style={ruleSurface.style}
                          />
                          <span
                            data-snapshot-id={`${separatorId}-label`}
                            className={labelSurface.className}
                            style={labelSurface.style}
                          >
                            {group.dateLabel}
                          </span>
                          <div
                            data-snapshot-id={`${separatorId}-rule-tail`}
                            className={ruleSurface.className}
                            style={ruleSurface.style}
                          />
                          <SurfaceStyles css={separatorSurface.scopedCss} />
                          <SurfaceStyles css={ruleSurface.scopedCss} />
                          <SurfaceStyles css={labelSurface.scopedCss} />
                        </div>
                      );
                    })()
                  ) : null}

                  {group.messages.map((message, messageIndex) => {
                    const id = message.id;
                    const messageId =
                      typeof id === "string" || typeof id === "number"
                        ? String(id)
                        : `${groupIndex}-${messageIndex}`;
                    const content = String(
                      getNestedField(message, contentField) ?? "",
                    );
                    const authorName = String(
                      getNestedField(message, authorNameField) ?? "Unknown",
                    );
                    const authorAvatar = getNestedField(
                      message,
                      authorAvatarField,
                    ) as string | null;
                    const rawTimestamp = getNestedField(message, timestampField);
                    const timestamp = rawTimestamp
                      ? new Date(String(rawTimestamp))
                      : null;

                    const previousMessage =
                      messageIndex > 0 ? group.messages[messageIndex - 1] : null;
                    const previousAuthor = previousMessage
                      ? String(getNestedField(previousMessage, authorNameField) ?? "")
                      : "";
                    const previousTimestamp = previousMessage
                      ? getNestedField(previousMessage, timestampField)
                      : null;
                    const previousTime = previousTimestamp
                      ? new Date(String(previousTimestamp))
                      : null;
                    const isGrouped =
                      previousAuthor === authorName &&
                      previousTime != null &&
                      timestamp != null &&
                      timestamp.getTime() - previousTime.getTime() <
                        5 * 60 * 1000;

                    const messageSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-message-${messageId}`,
                      implementationBase: {
                        display: "flex",
                        gap: "sm",
                        cursor: config.messageAction ? "pointer" : "default",
                        hover: {
                          bg: "color-mix(in oklch, var(--sn-color-muted, #f3f4f6) 50%, transparent)",
                        },
                        style: {
                          padding: isGrouped
                            ? "var(--sn-spacing-2xs, 2px) var(--sn-spacing-md, 1rem) var(--sn-spacing-2xs, 2px) calc(32px + var(--sn-spacing-sm, 0.5rem) + var(--sn-spacing-md, 1rem))"
                            : "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                          transition:
                            "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                        },
                      },
                      componentSurface: config.slots?.messageItem,
                    });
                    const contentColumnSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-message-${messageId}-contentColumn`,
                      implementationBase: {
                        flex: "1",
                        style: {
                          minWidth: 0,
                        },
                      },
                      componentSurface: config.slots?.contentColumn,
                    });
                    const headerSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-message-${messageId}-header`,
                      implementationBase: {
                        display: "flex",
                        alignItems: "baseline",
                        gap: "sm",
                        style: {
                          marginBottom: "var(--sn-spacing-2xs, 2px)",
                        },
                      },
                      componentSurface: config.slots?.header,
                    });
                    const authorSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-message-${messageId}-author`,
                      implementationBase: {
                        fontSize: "sm",
                        fontWeight: "semibold",
                        color: "var(--sn-color-foreground, #111827)",
                      },
                      componentSurface: config.slots?.authorName,
                    });
                    const timestampSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-message-${messageId}-timestamp`,
                      implementationBase: {
                        fontSize: "xs",
                        color: "var(--sn-color-muted-foreground, #6b7280)",
                      },
                      componentSurface: config.slots?.timestamp,
                    });
                    const bodySurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-message-${messageId}-body`,
                      implementationBase: {
                        fontSize: "sm",
                        color: "var(--sn-color-foreground, #111827)",
                        lineHeight: "normal",
                        style: {
                          wordBreak: "break-word",
                        },
                      },
                      componentSurface: config.slots?.body,
                    });
                    const embedsSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-message-${messageId}-embeds`,
                      implementationBase: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "sm",
                        style: {
                          marginTop: "var(--sn-spacing-sm, 0.5rem)",
                        },
                      },
                      componentSurface: config.slots?.embeds,
                    });
                    const sanitizedHtml = sanitizeMessageHtml(content);
                    const rawEmbeds = getNestedField(message, embedsField);
                    const embeds = Array.isArray(rawEmbeds)
                      ? (rawEmbeds as MessageRecord[])
                      : [];

                    return (
                      <div key={messageId}>
                        <div
                          data-testid="message-item"
                          data-snapshot-id={`${rootId}-message-${messageId}`}
                          onClick={() => handleMessageClick(message)}
                          className={messageSurface.className}
                          style={messageSurface.style}
                        >
                          {!isGrouped ? (
                            <MessageAvatar
                              rootId={rootId}
                              messageId={messageId}
                              slots={config.slots}
                              src={authorAvatar}
                              name={authorName}
                            />
                          ) : null}

                          <div
                            data-snapshot-id={`${rootId}-message-${messageId}-contentColumn`}
                            className={contentColumnSurface.className}
                            style={contentColumnSurface.style}
                          >
                            {!isGrouped ? (
                              <div
                                data-snapshot-id={`${rootId}-message-${messageId}-header`}
                                className={headerSurface.className}
                                style={headerSurface.style}
                              >
                                <span
                                  data-snapshot-id={`${rootId}-message-${messageId}-author`}
                                  className={authorSurface.className}
                                  style={authorSurface.style}
                                >
                                  {authorName}
                                </span>
                                {showTimestamps && timestamp ? (
                                  <span
                                    data-snapshot-id={`${rootId}-message-${messageId}-timestamp`}
                                    className={timestampSurface.className}
                                    style={timestampSurface.style}
                                    title={timestamp.toLocaleString()}
                                  >
                                    {formatRelativeTime(timestamp)}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}

                            <div
                              data-snapshot-id={`${rootId}-message-${messageId}-body`}
                              className={bodySurface.className}
                              style={bodySurface.style}
                              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                            />

                            {showEmbeds && embeds.length > 0 ? (
                              <div
                                data-snapshot-id={`${rootId}-message-${messageId}-embeds`}
                                className={embedsSurface.className}
                                style={embedsSurface.style}
                              >
                                {embeds.map((embed, embedIndex) => (
                                  <LinkEmbed
                                    key={embedIndex}
                                    config={{
                                      type: "link-embed",
                                      url: String(embed.url ?? ""),
                                      meta: embed.meta as LinkEmbedConfig["meta"],
                                      maxWidth: "min(400px, 100%)",
                                    }}
                                  />
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <SurfaceStyles css={messageSurface.scopedCss} />
                        <SurfaceStyles css={contentColumnSurface.scopedCss} />
                        <SurfaceStyles css={headerSurface.scopedCss} />
                        <SurfaceStyles css={authorSurface.scopedCss} />
                        <SurfaceStyles css={timestampSurface.scopedCss} />
                        <SurfaceStyles css={bodySurface.scopedCss} />
                        <SurfaceStyles css={embedsSurface.scopedCss} />
                      </div>
                    );
                  })}
                </div>
              ))
            : null}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={scrollAreaSurface.scopedCss} />
      <SurfaceStyles css={errorStateSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
    </>
  );
}
