'use client';

import { useMemo, useEffect, useRef, useCallback, type CSSProperties, type ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { formatDateSeparator, formatRelativeTime, getInitials, getNestedField } from "../../_base/utils";
import { sanitizeMessageHtml } from "./message-renderer";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface MessageThreadBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Message records. */
  messages?: Record<string, unknown>[];
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: ReactNode;
  /** Empty state text. */
  emptyText?: string;
  /** Field name for message content. Default: "content". */
  contentField?: string;
  /** Field name for author name. Default: "author.name". */
  authorNameField?: string;
  /** Field name for author avatar URL. Default: "author.avatar". */
  authorAvatarField?: string;
  /** Field name for timestamp. Default: "timestamp". */
  timestampField?: string;
  /** Show timestamps. Default: true. */
  showTimestamps?: boolean;
  /** Field for embeds. Default: "embeds". */
  embedsField?: string;
  /** Show embeds. Default: true. */
  showEmbeds?: boolean;
  /** Group messages by date. Default: true. */
  groupByDate?: boolean;
  /** Max height for scrollable area. */
  maxHeight?: string;
  /** Called when a message is clicked. */
  onMessageClick?: (message: Record<string, unknown>) => void;
  /** Render function for embed items. */
  renderEmbed?: (embed: Record<string, unknown>, index: number) => ReactNode;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MessageAvatar({ rootId, messageId, slots, src, name }: { rootId: string; messageId: string; slots?: Record<string, Record<string, unknown>>; src?: string | null; name: string }) {
  const initials = getInitials(name) || "?";
  if (src) {
    const s = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${messageId}-avatarImage`, implementationBase: { style: { width: 32, height: 32, borderRadius: "var(--sn-radius-full, 9999px)", objectFit: "cover", flexShrink: 0 } }, componentSurface: slots?.avatarImage });
    return (<><img src={src} alt={name} data-snapshot-id={`${rootId}-message-${messageId}-avatarImage`} className={s.className} style={s.style} /><SurfaceStyles css={s.scopedCss} /></>);
  }
  const s = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${messageId}-avatarFallback`, implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", fontSize: "xs", fontWeight: "semibold", color: "var(--sn-color-primary-foreground, #ffffff)", bg: "var(--sn-color-primary, #2563eb)", style: { width: 32, height: 32, borderRadius: "var(--sn-radius-full, 9999px)", flexShrink: 0 } }, componentSurface: slots?.avatarFallback });
  return (<><div data-snapshot-id={`${rootId}-message-${messageId}-avatarFallback`} className={s.className} style={s.style}>{initials}</div><SurfaceStyles css={s.scopedCss} /></>);
}

function MessageSkeleton({ rootId, index, slots }: { rootId: string; index: number; slots?: Record<string, Record<string, unknown>> }) {
  const rowId = `${rootId}-loading-${index}`;
  const row = resolveSurfacePresentation({ surfaceId: rowId, implementationBase: { display: "flex", gap: "sm", paddingY: "sm", paddingX: "md" }, componentSurface: slots?.loadingItem });
  const av = resolveSurfacePresentation({ surfaceId: `${rowId}-avatar`, implementationBase: { bg: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, style: { width: 32, height: 32, borderRadius: "var(--sn-radius-full, 9999px)", flexShrink: 0 } }, componentSurface: slots?.loadingAvatar });
  const ti = resolveSurfacePresentation({ surfaceId: `${rowId}-title`, implementationBase: { bg: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, borderRadius: "xs", style: { height: "0.875rem", width: "30%", marginBottom: "var(--sn-spacing-xs, 0.25rem)" } }, componentSurface: slots?.loadingTitle });
  const bo = resolveSurfacePresentation({ surfaceId: `${rowId}-body`, implementationBase: { bg: "var(--sn-color-muted, #e5e7eb)", opacity: 0.3, borderRadius: "xs", style: { height: "0.75rem", width: "70%" } }, componentSurface: slots?.loadingBody });
  return (<><div data-snapshot-id={rowId} className={row.className} style={row.style}><div data-snapshot-id={`${rowId}-avatar`} className={av.className} style={av.style} /><div style={{ flex: 1 }}><div data-snapshot-id={`${rowId}-title`} className={ti.className} style={ti.style} /><div data-snapshot-id={`${rowId}-body`} className={bo.className} style={bo.style} /></div></div><SurfaceStyles css={row.scopedCss} /><SurfaceStyles css={av.scopedCss} /><SurfaceStyles css={ti.scopedCss} /><SurfaceStyles css={bo.scopedCss} /></>);
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone MessageThread — scrollable message list with avatars, date separators,
 * auto-scroll, embed rendering, and consecutive-message grouping. No manifest context required.
 *
 * @example
 * ```tsx
 * <MessageThreadBase
 *   messages={[
 *     { id: "1", author: { name: "Alice" }, content: "Hello!", timestamp: "2026-01-15T10:00:00Z" },
 *     { id: "2", author: { name: "Bob" }, content: "Hi there!", timestamp: "2026-01-15T10:01:00Z" },
 *   ]}
 *   showTimestamps
 *   groupByDate
 * />
 * ```
 */
export function MessageThreadBase({
  id,
  messages = [],
  loading = false,
  error,
  emptyText = "No messages yet",
  contentField = "content",
  authorNameField = "author.name",
  authorAvatarField = "author.avatar",
  timestampField = "timestamp",
  showTimestamps = true,
  embedsField = "embeds",
  showEmbeds = true,
  groupByDate = true,
  maxHeight,
  onMessageClick,
  renderEmbed,
  className,
  style,
  slots,
}: MessageThreadBaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "message-thread";

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      const el = scrollRef.current;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current && !loading) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [loading]);

  type MessageGroup = { dateLabel: string; messages: Record<string, unknown>[] };
  const grouped: MessageGroup[] = useMemo(() => {
    if (!groupByDate || messages.length === 0) return [{ dateLabel: "", messages }];
    const groups: MessageGroup[] = [];
    let currentDate = "";
    for (const msg of messages) {
      const raw = getNestedField(msg, timestampField);
      const ts = raw ? new Date(String(raw)) : null;
      const key = ts ? `${ts.getFullYear()}-${ts.getMonth()}-${ts.getDate()}` : "unknown";
      if (key !== currentDate) { currentDate = key; groups.push({ dateLabel: ts ? formatDateSeparator(ts) : "", messages: [msg] }); }
      else groups[groups.length - 1]!.messages.push(msg);
    }
    return groups;
  }, [groupByDate, messages, timestampField]);

  const rootSurface = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: { display: "flex", flexDirection: "column", flex: "1", overflow: "hidden", bg: "var(--sn-color-card, #ffffff)", style: { minHeight: 0 } }, componentSurface: className || style ? { className, style } : undefined, itemSurface: slots?.root });
  const scrollSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-scrollArea`, implementationBase: { flex: "1", overflow: "auto", style: { maxHeight: maxHeight ?? "auto" } }, componentSurface: slots?.scrollArea });
  const errorSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-errorState`, implementationBase: { padding: "md", textAlign: "center", fontSize: "sm", color: "var(--sn-color-destructive, #ef4444)" }, componentSurface: slots?.errorState });
  const emptySurface = resolveSurfacePresentation({ surfaceId: `${rootId}-emptyState`, implementationBase: { padding: "xl", textAlign: "center", fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.emptyState });

  return (
    <>
      <div data-snapshot-component="message-thread" data-testid="message-thread" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        <div ref={scrollRef} role="log" aria-live="polite" aria-label="Messages" data-snapshot-id={`${rootId}-scrollArea`} className={scrollSurface.className} style={scrollSurface.style}>
          {loading ? <><MessageSkeleton rootId={rootId} index={0} slots={slots} /><MessageSkeleton rootId={rootId} index={1} slots={slots} /><MessageSkeleton rootId={rootId} index={2} slots={slots} /></> : null}
          {error ? <div data-snapshot-id={`${rootId}-errorState`} className={errorSurface.className} style={errorSurface.style}>{error}</div> : null}
          {!loading && !error && messages.length === 0 ? <div data-snapshot-id={`${rootId}-emptyState`} className={emptySurface.className} style={emptySurface.style}>{emptyText}</div> : null}
          {!loading && !error ? grouped.map((group, gi) => (
            <div key={group.dateLabel || gi}>
              {group.dateLabel ? (() => {
                const sepId = `${rootId}-date-${gi}`;
                const sepS = resolveSurfacePresentation({ surfaceId: sepId, implementationBase: { display: "flex", alignItems: "center", gap: "sm", paddingY: "sm", paddingX: "md" }, componentSurface: slots?.dateSeparator });
                const ruleS = resolveSurfacePresentation({ surfaceId: `${sepId}-rule`, implementationBase: { bg: "var(--sn-color-border, #e5e7eb)", flex: "1", style: { height: "1px" } }, componentSurface: slots?.dateRule });
                const labS = resolveSurfacePresentation({ surfaceId: `${sepId}-label`, implementationBase: { fontSize: "xs", fontWeight: "medium", color: "var(--sn-color-muted-foreground, #6b7280)", style: { letterSpacing: "var(--sn-tracking-wide, 0.05em)", whiteSpace: "nowrap" } }, componentSurface: slots?.dateLabel });
                return (<div data-testid="date-separator" data-snapshot-id={sepId} className={sepS.className} style={sepS.style}><div data-snapshot-id={`${sepId}-rule`} className={ruleS.className} style={ruleS.style} /><span data-snapshot-id={`${sepId}-label`} className={labS.className} style={labS.style}>{group.dateLabel}</span><div data-snapshot-id={`${sepId}-rule-tail`} className={ruleS.className} style={ruleS.style} /><SurfaceStyles css={sepS.scopedCss} /><SurfaceStyles css={ruleS.scopedCss} /><SurfaceStyles css={labS.scopedCss} /></div>);
              })() : null}
              {group.messages.map((msg, mi) => {
                const msgId = typeof msg.id === "string" || typeof msg.id === "number" ? String(msg.id) : `${gi}-${mi}`;
                const content = String(getNestedField(msg, contentField) ?? "");
                const authorName = String(getNestedField(msg, authorNameField) ?? "Unknown");
                const authorAvatar = getNestedField(msg, authorAvatarField) as string | null;
                const rawTs = getNestedField(msg, timestampField);
                const ts = rawTs ? new Date(String(rawTs)) : null;
                const prev = mi > 0 ? group.messages[mi - 1] : null;
                const prevAuthor = prev ? String(getNestedField(prev, authorNameField) ?? "") : "";
                const prevTs = prev ? getNestedField(prev, timestampField) : null;
                const prevTime = prevTs ? new Date(String(prevTs)) : null;
                const isGrouped = prevAuthor === authorName && prevTime != null && ts != null && ts.getTime() - prevTime.getTime() < 5 * 60 * 1000;
                const msgS = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${msgId}`, implementationBase: { display: "flex", gap: "sm", cursor: onMessageClick ? "pointer" : "default", hover: { bg: "color-mix(in oklch, var(--sn-color-muted, #f3f4f6) 50%, transparent)" }, style: { padding: isGrouped ? "var(--sn-spacing-2xs, 2px) var(--sn-spacing-md, 1rem) var(--sn-spacing-2xs, 2px) calc(32px + var(--sn-spacing-sm, 0.5rem) + var(--sn-spacing-md, 1rem))" : "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)", transition: "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)" } }, componentSurface: slots?.messageItem });
                const colS = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${msgId}-contentColumn`, implementationBase: { flex: "1", style: { minWidth: 0 } }, componentSurface: slots?.contentColumn });
                const hdS = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${msgId}-header`, implementationBase: { display: "flex", alignItems: "baseline", gap: "sm", style: { marginBottom: "var(--sn-spacing-2xs, 2px)" } }, componentSurface: slots?.header });
                const auS = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${msgId}-author`, implementationBase: { fontSize: "sm", fontWeight: "semibold", color: "var(--sn-color-foreground, #111827)" }, componentSurface: slots?.authorName });
                const tsS = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${msgId}-timestamp`, implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.timestamp });
                const bdS = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${msgId}-body`, implementationBase: { fontSize: "sm", color: "var(--sn-color-foreground, #111827)", lineHeight: "normal", style: { wordBreak: "break-word" } }, componentSurface: slots?.body });
                const emS = resolveSurfacePresentation({ surfaceId: `${rootId}-message-${msgId}-embeds`, implementationBase: { display: "flex", flexDirection: "column", gap: "sm", style: { marginTop: "var(--sn-spacing-sm, 0.5rem)" } }, componentSurface: slots?.embeds });
                const sanitized = sanitizeMessageHtml(content);
                const rawEmbeds = getNestedField(msg, embedsField);
                const embeds = Array.isArray(rawEmbeds) ? (rawEmbeds as Record<string, unknown>[]) : [];
                return (
                  <div key={msgId}>
                    <div data-testid="message-item" data-snapshot-id={`${rootId}-message-${msgId}`} onClick={onMessageClick ? () => onMessageClick(msg) : undefined} className={msgS.className} style={msgS.style}>
                      {!isGrouped ? <MessageAvatar rootId={rootId} messageId={msgId} slots={slots} src={authorAvatar} name={authorName} /> : null}
                      <div data-snapshot-id={`${rootId}-message-${msgId}-contentColumn`} className={colS.className} style={colS.style}>
                        {!isGrouped ? (<div data-snapshot-id={`${rootId}-message-${msgId}-header`} className={hdS.className} style={hdS.style}><span data-snapshot-id={`${rootId}-message-${msgId}-author`} className={auS.className} style={auS.style}>{authorName}</span>{showTimestamps && ts ? <span data-snapshot-id={`${rootId}-message-${msgId}-timestamp`} className={tsS.className} style={tsS.style} title={ts.toLocaleString()}>{formatRelativeTime(ts)}</span> : null}</div>) : null}
                        <div data-snapshot-id={`${rootId}-message-${msgId}-body`} className={bdS.className} style={bdS.style} dangerouslySetInnerHTML={{ __html: sanitized }} />
                        {showEmbeds && embeds.length > 0 && renderEmbed ? (<div data-snapshot-id={`${rootId}-message-${msgId}-embeds`} className={emS.className} style={emS.style}>{embeds.map((embed, ei) => renderEmbed(embed, ei))}</div>) : null}
                      </div>
                    </div>
                    <SurfaceStyles css={msgS.scopedCss} /><SurfaceStyles css={colS.scopedCss} /><SurfaceStyles css={hdS.scopedCss} /><SurfaceStyles css={auS.scopedCss} /><SurfaceStyles css={tsS.scopedCss} /><SurfaceStyles css={bdS.scopedCss} /><SurfaceStyles css={emS.scopedCss} />
                  </div>
                );
              })}
            </div>
          )) : null}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} /><SurfaceStyles css={scrollSurface.scopedCss} /><SurfaceStyles css={errorSurface.scopedCss} /><SurfaceStyles css={emptySurface.scopedCss} />
    </>
  );
}
