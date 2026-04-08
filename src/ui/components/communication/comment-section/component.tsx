import React, { useMemo, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { RichInput } from "../../content/rich-input/component";
import { sanitizeMessageHtml } from "../message-thread/message-renderer";
import type { CommentSectionConfig } from "./types";
import type { RichInputConfig } from "../../content/rich-input/types";

// ── Helpers ───────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
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

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ── Comment item ──────────────────────────────────────────────────────────

function CommentItem({
  comment,
  config,
  execute,
}: {
  comment: Record<string, unknown>;
  config: CommentSectionConfig;
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const authorNameField = config.authorNameField ?? "author.name";
  const authorAvatarField = config.authorAvatarField ?? "author.avatar";
  const contentField = config.contentField ?? "content";
  const timestampField = config.timestampField ?? "timestamp";

  const authorName = String(getNestedField(comment, authorNameField) ?? "Unknown");
  const authorAvatar = getNestedField(comment, authorAvatarField) as string | null;
  const content = String(getNestedField(comment, contentField) ?? "");
  const rawTs = getNestedField(comment, timestampField);
  const timestamp = rawTs ? new Date(String(rawTs)) : null;
  const sanitizedHtml = sanitizeMessageHtml(content);

  const handleDelete = useCallback(() => {
    if (config.deleteAction) {
      void execute(config.deleteAction, { ...comment });
    }
  }, [config.deleteAction, comment, execute]);

  return (
    <div
      data-testid="comment-item"
      style={{
        display: "flex",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        padding: "var(--sn-spacing-sm, 0.5rem) 0",
      }}
    >
      {/* Avatar */}
      {authorAvatar ? (
        <img
          src={authorAvatar}
          alt={authorName}
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--sn-radius-full, 9999px)",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
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
          {getInitials(authorName) || "?"}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
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
              color: "var(--sn-color-foreground, #111827)",
            }}
          >
            {authorName}
          </span>
          {timestamp && (
            <span
              style={{
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
              title={timestamp.toLocaleString()}
            >
              {formatRelativeTime(timestamp)}
            </span>
          )}
          {config.deleteAction && (
            <button
              onClick={handleDelete}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                padding: "var(--sn-spacing-xs, 0.25rem)",
                cursor: "pointer",
                color: "var(--sn-color-muted-foreground, #9ca3af)",
                display: "flex",
                alignItems: "center",
                borderRadius: "var(--sn-radius-sm, 0.25rem)",
                transition: "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
              }}
              title="Delete comment"
            >
              <Icon name="trash-2" size={12} />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function CommentSkeleton() {
  return (
    <div style={{ display: "flex", gap: "var(--sn-spacing-sm, 0.5rem)", padding: "var(--sn-spacing-sm, 0.5rem) 0" }}>
      <div style={{ width: 28, height: 28, borderRadius: "var(--sn-radius-full, 9999px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: "0.75rem", width: "25%", borderRadius: "var(--sn-radius-xs, 2px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, marginBottom: "var(--sn-spacing-xs, 0.25rem)" }} />
        <div style={{ height: "0.75rem", width: "60%", borderRadius: "var(--sn-radius-xs, 2px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)", opacity: 0.3 }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

/**
 * CommentSection — displays a list of comments with author avatars,
 * timestamps, and an embedded rich input for posting new comments.
 *
 * @param props - Component props containing the comment section configuration
 */
export function CommentSection({
  config,
}: {
  config: CommentSectionConfig;
}) {
  const visible = useSubscribe(config.visible ?? true);
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const sortOrder = config.sortOrder ?? "newest";

  // Extract comments
  const comments: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    let items: Record<string, unknown>[];
    if (Array.isArray(data)) {
      items = data as Record<string, unknown>[];
    } else {
      items = [];
      for (const key of ["data", "items", "results", "comments"]) {
        if (Array.isArray(data[key])) {
          items = data[key] as Record<string, unknown>[];
          break;
        }
      }
    }

    // Sort
    const tsField = config.timestampField ?? "timestamp";
    return [...items].sort((a, b) => {
      const aTs = getNestedField(a, tsField);
      const bTs = getNestedField(b, tsField);
      const aTime = aTs ? new Date(String(aTs)).getTime() : 0;
      const bTime = bTs ? new Date(String(bTs)).getTime() : 0;
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [data, sortOrder, config.timestampField]);

  if (visible === false) return null;

  // Build rich-input config for the comment box
  const inputConfig: RichInputConfig = {
    type: "rich-input" as const,
    placeholder: config.inputPlaceholder ?? "Write a comment...",
    sendOnEnter: false,
    sendAction: config.submitAction,
    minHeight: "2.5rem",
    maxHeight: "8rem",
    features: (config.inputFeatures as RichInputConfig["features"]) ?? [
      "bold",
      "italic",
      "code",
      "link",
    ],
  };

  return (
    <div
      data-snapshot-component="comment-section"
      data-testid="comment-section"
      className={config.className}
      style={{
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        overflow: "hidden",
      }}
    >
      <style>{`
[data-snapshot-component="comment-section"] button[title="Delete comment"]:hover {
  background-color: color-mix(in oklch, var(--sn-color-destructive, #ef4444) 10%, transparent);
  color: var(--sn-color-destructive, #ef4444) !important;
}
      `}</style>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          padding:
            "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
          borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
        }}
      >
        <Icon name="message-square" size={16} />
        <span
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight:
              "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          Comments
        </span>
        {!isLoading && comments.length > 0 && (
          <span
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            ({comments.length})
          </span>
        )}
      </div>

      {/* Comment list */}
      <div
        style={{
          padding: "0 var(--sn-spacing-md, 1rem)",
          maxHeight: "clamp(200px, 50vh, 400px)",
          overflowY: "auto",
        }}
      >
        {isLoading && (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        )}

        {error && (
          <div
            style={{
              padding: "var(--sn-spacing-md, 1rem) 0",
              color: "var(--sn-color-destructive, #ef4444)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              textAlign: "center",
            }}
          >
            Error: {error.message}
          </div>
        )}

        {!isLoading && !error && comments.length === 0 && (
          <div
            style={{
              padding: "var(--sn-spacing-lg, 1.5rem) 0",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              textAlign: "center",
            }}
          >
            {config.emptyMessage ?? "No comments yet"}
          </div>
        )}

        {!isLoading &&
          !error &&
          comments.map((comment, i) => {
            const id = comment["id"];
            const key =
              typeof id === "string" || typeof id === "number" ? id : i;
            return (
              <div
                key={key}
                style={{
                  borderBottom:
                    i < comments.length - 1
                      ? "1px solid var(--sn-color-border, #e5e7eb)"
                      : undefined,
                }}
              >
                <CommentItem
                  comment={comment}
                  config={config}
                  execute={execute}
                />
              </div>
            );
          })}
      </div>

      {/* Input area */}
      {config.submitAction && (
        <div
          style={{
            borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
            padding: "var(--sn-spacing-sm, 0.5rem)",
          }}
        >
          <RichInput config={inputConfig} />
        </div>
      )}
    </div>
  );
}
