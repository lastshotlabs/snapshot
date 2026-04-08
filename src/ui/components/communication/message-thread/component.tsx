import React, { useMemo, useEffect, useRef, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { sanitizeMessageHtml } from "./message-renderer";
import { LinkEmbed } from "../../content/link-embed/component";
import type { LinkEmbedConfig } from "../../content/link-embed/types";
import {
  formatRelativeTime,
  formatDateSeparator,
  getNestedField,
  getInitials,
} from "../../_base/utils";
import type { MessageThreadConfig } from "./types";

// ── Avatar subcomponent ───────────────────────────────────────────────────

function MessageAvatar({ src, name }: { src?: string | null; name: string }) {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--sn-radius-full, 9999px)",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: "var(--sn-color-primary, #2563eb)",
        color: "var(--sn-color-primary-foreground, #ffffff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        fontWeight:
          "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function MessageSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--sn-radius-full, 9999px)",
          backgroundColor: "var(--sn-color-muted, #e5e7eb)",
          opacity: "var(--sn-opacity-muted, 0.5)",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "0.875rem",
            width: "30%",
            borderRadius: "var(--sn-radius-xs, 2px)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            opacity: "var(--sn-opacity-muted, 0.5)",
            marginBottom: "var(--sn-spacing-xs, 0.25rem)",
          }}
        />
        <div
          style={{
            height: "0.75rem",
            width: "70%",
            borderRadius: "var(--sn-radius-xs, 2px)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            opacity: "var(--sn-opacity-disabled, 0.3)",
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

/**
 * MessageThread — scrollable message list with avatars, timestamps,
 * message grouping, and date separators. Renders HTML content from
 * TipTap or other sources with sanitization.
 *
 * @param props - Component props containing the message thread configuration
 */
export function MessageThread({ config }: { config: MessageThreadConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const contentField = config.contentField ?? "content";
  const authorNameField = config.authorNameField ?? "author.name";
  const authorAvatarField = config.authorAvatarField ?? "author.avatar";
  const timestampField = config.timestampField ?? "timestamp";
  const showTimestamps = config.showTimestamps ?? true;
  const embedsField = config.embedsField ?? "embeds";
  const showEmbeds = config.showEmbeds ?? true;
  const groupByDate = config.groupByDate ?? true;

  // Extract messages from data
  const messages: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results", "messages"]) {
      if (Array.isArray(data[key]))
        return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const el = scrollRef.current;
      // Only auto-scroll if already near bottom
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages.length]);

  // Initial scroll to bottom
  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isLoading]);

  const handleMessageClick = useCallback(
    (msg: Record<string, unknown>) => {
      if (config.messageAction) {
        void execute(config.messageAction, { ...msg });
      }
      if (publish) {
        publish({ selectedMessage: msg });
      }
    },
    [config.messageAction, execute, publish],
  );

  if (visible === false) return null;

  // Group messages by date
  type MessageGroup = {
    dateLabel: string;
    messages: Record<string, unknown>[];
  };

  const grouped: MessageGroup[] = useMemo(() => {
    if (!groupByDate || messages.length === 0) {
      return [{ dateLabel: "", messages }];
    }

    const groups: MessageGroup[] = [];
    let currentDate = "";

    for (const msg of messages) {
      const raw = getNestedField(msg, timestampField);
      const ts = raw ? new Date(String(raw)) : null;
      const dateKey = ts
        ? `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}`
        : "unknown";

      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({
          dateLabel: ts ? formatDateSeparator(ts) : "",
          messages: [msg],
        });
      } else {
        groups[groups.length - 1]!.messages.push(msg);
      }
    }
    return groups;
  }, [messages, groupByDate, timestampField]);

  return (
    <div
      data-snapshot-component="message-thread"
      data-testid="message-thread"
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        ...(config.style as React.CSSProperties),
      }}
    >
      <style>{`
[data-snapshot-component="message-thread"] [data-testid="message-item"]:hover {
  background-color: color-mix(in oklch, var(--sn-color-muted, #f3f4f6) 50%, transparent);
}
      `}</style>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Messages"
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: config.maxHeight ?? "auto",
        }}
      >
        {/* Loading */}
        {isLoading && (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "var(--sn-spacing-md, 1rem)",
              color: "var(--sn-color-destructive, #ef4444)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              textAlign: "center",
            }}
          >
            Error: {error.message}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && messages.length === 0 && (
          <div
            style={{
              padding: "var(--sn-spacing-xl, 1.5rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              textAlign: "center",
            }}
          >
            {config.emptyMessage ?? "No messages yet"}
          </div>
        )}

        {/* Messages */}
        {!isLoading &&
          !error &&
          grouped.map((group, gi) => (
            <div key={group.dateLabel || gi}>
              {/* Date separator */}
              {group.dateLabel && (
                <div
                  data-testid="date-separator"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--sn-spacing-sm, 0.5rem)",
                    padding:
                      "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      backgroundColor: "var(--sn-color-border, #e5e7eb)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "var(--sn-font-size-xs, 0.75rem)",
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                      fontWeight:
                        "var(--sn-font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
                      letterSpacing: "var(--sn-tracking-wide, 0.05em)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {group.dateLabel}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      backgroundColor: "var(--sn-color-border, #e5e7eb)",
                    }}
                  />
                </div>
              )}

              {/* Message items */}
              {group.messages.map((msg, mi) => {
                const id = msg["id"];
                const key =
                  typeof id === "string" || typeof id === "number"
                    ? id
                    : `${gi}-${mi}`;
                const content = String(getNestedField(msg, contentField) ?? "");
                const authorName = String(
                  getNestedField(msg, authorNameField) ?? "Unknown",
                );
                const authorAvatar = getNestedField(msg, authorAvatarField) as
                  | string
                  | null;
                const rawTs = getNestedField(msg, timestampField);
                const timestamp = rawTs ? new Date(String(rawTs)) : null;

                // Check if previous message is from same author (for grouping)
                const prevMsg = mi > 0 ? group.messages[mi - 1] : null;
                const prevAuthor = prevMsg
                  ? String(getNestedField(prevMsg, authorNameField) ?? "")
                  : "";
                const prevTs = prevMsg
                  ? getNestedField(prevMsg, timestampField)
                  : null;
                const prevTime = prevTs ? new Date(String(prevTs)) : null;

                // Group if same author within 5 minutes
                const isGrouped =
                  prevAuthor === authorName &&
                  prevTime &&
                  timestamp &&
                  timestamp.getTime() - prevTime.getTime() < 5 * 60 * 1000;

                const sanitizedHtml = sanitizeMessageHtml(content);

                return (
                  <div
                    key={key}
                    data-testid="message-item"
                    onClick={() => handleMessageClick(msg)}
                    style={{
                      display: "flex",
                      gap: "var(--sn-spacing-sm, 0.5rem)",
                      padding: isGrouped
                        ? "var(--sn-spacing-2xs, 2px) var(--sn-spacing-md, 1rem) var(--sn-spacing-2xs, 2px) calc(32px + var(--sn-spacing-sm, 0.5rem) + var(--sn-spacing-md, 1rem))"
                        : "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                      cursor: config.messageAction ? "pointer" : "default",
                      transition:
                        "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                    }}
                  >
                    {/* Avatar (hidden when grouped) */}
                    {!isGrouped && (
                      <MessageAvatar src={authorAvatar} name={authorName} />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Author + timestamp header (hidden when grouped) */}
                      {!isGrouped && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "var(--sn-spacing-sm, 0.5rem)",
                            marginBottom: "var(--sn-spacing-2xs, 2px)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--sn-font-size-sm, 0.875rem)",
                              fontWeight:
                                "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                              color: "var(--sn-color-foreground, #111827)",
                            }}
                          >
                            {authorName}
                          </span>
                          {showTimestamps && timestamp && (
                            <span
                              style={{
                                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                                color:
                                  "var(--sn-color-muted-foreground, #6b7280)",
                              }}
                              title={timestamp.toLocaleString()}
                            >
                              {formatRelativeTime(timestamp)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message content */}
                      <div
                        style={{
                          fontSize: "var(--sn-font-size-sm, 0.875rem)",
                          color: "var(--sn-color-foreground, #111827)",
                          lineHeight: "var(--sn-leading-normal, 1.5)",
                          wordBreak: "break-word",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: sanitizedHtml,
                        }}
                      />

                      {/* Link embeds */}
                      {showEmbeds &&
                        (() => {
                          const rawEmbeds = getNestedField(msg, embedsField);
                          const embeds = Array.isArray(rawEmbeds)
                            ? (rawEmbeds as Record<string, unknown>[])
                            : [];
                          if (embeds.length === 0) return null;
                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "var(--sn-spacing-sm, 0.5rem)",
                                marginTop: "var(--sn-spacing-sm, 0.5rem)",
                              }}
                            >
                              {embeds.map((embed, ei) => (
                                <LinkEmbed
                                  key={ei}
                                  config={{
                                    type: "link-embed" as const,
                                    url: String(embed.url ?? ""),
                                    meta: embed.meta as LinkEmbedConfig["meta"],
                                    maxWidth: "min(400px, 100%)",
                                  }}
                                />
                              ))}
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}
