import React, { useMemo, useEffect, useRef, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { sanitizeMessageHtml } from "./message-renderer";
import { LinkEmbed } from "../../content/link-embed/component";
import type { LinkEmbedConfig } from "../../content/link-embed/types";
import type { MessageThreadConfig } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getNestedField(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Returns initials from a name string. */
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Avatar subcomponent ───────────────────────────────────────────────────

function MessageAvatar({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
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
    <div style={{ display: "flex", gap: "var(--sn-spacing-sm, 0.5rem)", padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)" }}>
      <div style={{ width: 32, height: 32, borderRadius: "var(--sn-radius-full, 9999px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: "0.875rem", width: "30%", borderRadius: "var(--sn-radius-xs, 2px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, marginBottom: "var(--sn-spacing-xs, 0.25rem)" }} />
        <div style={{ height: "0.75rem", width: "70%", borderRadius: "var(--sn-radius-xs, 2px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)", opacity: 0.3 }} />
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
export function MessageThread({
  config,
}: {
  config: MessageThreadConfig;
}) {
  const visible = useSubscribe(config.visible ?? true);
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const publish = config.id ? usePublish(config.id) : undefined;
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
      }}
    >
      <div
        ref={scrollRef}
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
            <div key={gi}>
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
                        "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
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
                  typeof id === "string" || typeof id === "number" ? id : `${gi}-${mi}`;
                const content = String(
                  getNestedField(msg, contentField) ?? "",
                );
                const authorName = String(
                  getNestedField(msg, authorNameField) ?? "Unknown",
                );
                const authorAvatar = getNestedField(
                  msg,
                  authorAvatarField,
                ) as string | null;
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
                        ? "1px var(--sn-spacing-md, 1rem) 1px calc(32px + var(--sn-spacing-sm, 0.5rem) + var(--sn-spacing-md, 1rem))"
                        : "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                      cursor: config.messageAction ? "pointer" : "default",
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
                            marginBottom: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--sn-font-size-sm, 0.875rem)",
                              fontWeight:
                                "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                              color:
                                "var(--sn-color-foreground, #111827)",
                            }}
                          >
                            {authorName}
                          </span>
                          {showTimestamps && timestamp && (
                            <span
                              style={{
                                fontSize:
                                  "var(--sn-font-size-xs, 0.75rem)",
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
                          lineHeight: 1.5,
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
                                gap: "var(--sn-spacing-xs, 0.25rem)",
                                marginTop: "var(--sn-spacing-xs, 0.25rem)",
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
