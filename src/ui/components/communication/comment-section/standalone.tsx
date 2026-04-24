'use client';

import { useMemo, useCallback, type CSSProperties, type ReactNode } from "react";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { formatRelativeTime, getInitials, getNestedField } from "../../_base/utils";
import { ButtonControl } from "../../forms/button";
import { sanitizeMessageHtml } from "../message-thread/message-renderer";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface CommentSectionBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Comment records. */
  comments?: Record<string, unknown>[];
  /** Loading state. */
  loading?: boolean;
  /** Error message. */
  error?: ReactNode;
  /** Empty state text. */
  emptyText?: string;
  /** Field name for author name. Default: "author.name". */
  authorNameField?: string;
  /** Field name for author avatar. Default: "author.avatar". */
  authorAvatarField?: string;
  /** Field name for comment content. Default: "content". */
  contentField?: string;
  /** Field name for timestamp. Default: "timestamp". */
  timestampField?: string;
  /** Sort order. Default: "newest". */
  sortOrder?: "newest" | "oldest";
  /** Whether delete is available. */
  showDelete?: boolean;
  /** Called when delete is clicked. */
  onDelete?: (comment: Record<string, unknown>) => void;
  /** Input area rendered at the bottom. Uses ReactNode to allow any input component. */
  inputSlot?: ReactNode;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CommentSkeleton({ rootId, index, slots }: { rootId: string; index: number; slots?: Record<string, Record<string, unknown>> }) {
  const itemId = `${rootId}-loading-${index}`;
  const itemS = resolveSurfacePresentation({ surfaceId: itemId, implementationBase: { display: "flex", gap: "sm", paddingY: "sm" }, componentSurface: slots?.loadingItem });
  const avS = resolveSurfacePresentation({ surfaceId: `${itemId}-avatar`, implementationBase: { bg: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, style: { width: 28, height: 28, borderRadius: "var(--sn-radius-full, 9999px)", flexShrink: 0 } }, componentSurface: slots?.loadingAvatar });
  const tiS = resolveSurfacePresentation({ surfaceId: `${itemId}-title`, implementationBase: { bg: "var(--sn-color-muted, #e5e7eb)", opacity: 0.5, borderRadius: "xs", style: { height: "0.75rem", width: "25%", marginBottom: "var(--sn-spacing-xs, 0.25rem)" } }, componentSurface: slots?.loadingTitle });
  const boS = resolveSurfacePresentation({ surfaceId: `${itemId}-body`, implementationBase: { bg: "var(--sn-color-muted, #e5e7eb)", opacity: 0.3, borderRadius: "xs", style: { height: "0.75rem", width: "60%" } }, componentSurface: slots?.loadingBody });
  return (<><div data-snapshot-id={itemId} className={itemS.className} style={itemS.style}><div data-snapshot-id={`${itemId}-avatar`} className={avS.className} style={avS.style} /><div style={{ flex: 1 }}><div data-snapshot-id={`${itemId}-title`} className={tiS.className} style={tiS.style} /><div data-snapshot-id={`${itemId}-body`} className={boS.className} style={boS.style} /></div></div><SurfaceStyles css={itemS.scopedCss} /><SurfaceStyles css={avS.scopedCss} /><SurfaceStyles css={tiS.scopedCss} /><SurfaceStyles css={boS.scopedCss} /></>);
}

function CommentItem({ rootId, index, comment, authorNameField, authorAvatarField, contentField, timestampField, showDelete, onDelete, slots }: { rootId: string; index: number; comment: Record<string, unknown>; authorNameField: string; authorAvatarField: string; contentField: string; timestampField: string; showDelete: boolean; onDelete?: (c: Record<string, unknown>) => void; slots?: Record<string, Record<string, unknown>> }) {
  const authorName = String(getNestedField(comment, authorNameField) ?? "Unknown");
  const authorAvatar = getNestedField(comment, authorAvatarField) as string | null;
  const content = String(getNestedField(comment, contentField) ?? "");
  const rawTs = getNestedField(comment, timestampField);
  const ts = rawTs ? new Date(String(rawTs)) : null;
  const sanitized = sanitizeMessageHtml(content);
  const itemId = `${rootId}-comment-${index}`;

  const itemS = resolveSurfacePresentation({ surfaceId: itemId, implementationBase: { display: "flex", gap: "sm", paddingY: "sm" }, componentSurface: slots?.commentItem });
  const avImgS = resolveSurfacePresentation({ surfaceId: `${itemId}-avatarImage`, implementationBase: { style: { width: 32, height: 32, borderRadius: "var(--sn-radius-full, 9999px)", objectFit: "cover", flexShrink: 0 } }, componentSurface: slots?.avatarImage });
  const avFbS = resolveSurfacePresentation({ surfaceId: `${itemId}-avatarFallback`, implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", fontSize: "xs", fontWeight: "semibold", color: "var(--sn-color-primary-foreground, #ffffff)", bg: "var(--sn-color-primary, #2563eb)", style: { width: 32, height: 32, borderRadius: "var(--sn-radius-full, 9999px)", flexShrink: 0 } }, componentSurface: slots?.avatarFallback });
  const colS = resolveSurfacePresentation({ surfaceId: `${itemId}-contentColumn`, implementationBase: { flex: "1", style: { minWidth: 0 } }, componentSurface: slots?.contentColumn });
  const hdS = resolveSurfacePresentation({ surfaceId: `${itemId}-header`, implementationBase: { display: "flex", alignItems: "baseline", gap: "sm", style: { marginBottom: "var(--sn-spacing-2xs, 2px)" } }, componentSurface: slots?.commentHeader });
  const auS = resolveSurfacePresentation({ surfaceId: `${itemId}-author`, implementationBase: { fontSize: "sm", fontWeight: "semibold", color: "var(--sn-color-foreground, #111827)" }, componentSurface: slots?.authorName });
  const tsS = resolveSurfacePresentation({ surfaceId: `${itemId}-timestamp`, implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.timestamp });
  const delS = resolveSurfacePresentation({ surfaceId: `${itemId}-deleteButton`, implementationBase: { display: "flex", alignItems: "center", color: "var(--sn-color-muted-foreground, #9ca3af)", borderRadius: "sm", cursor: "pointer", hover: { bg: "color-mix(in oklch, var(--sn-color-destructive, #ef4444) 10%, transparent)", color: "var(--sn-color-destructive, #ef4444)" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-destructive, #ef4444))" }, style: { marginLeft: "auto", background: "none", border: "none", padding: "var(--sn-spacing-xs, 0.25rem)", transition: "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)" } }, componentSurface: slots?.deleteButton });
  const bdS = resolveSurfacePresentation({ surfaceId: `${itemId}-body`, implementationBase: { fontSize: "sm", color: "var(--sn-color-foreground, #111827)", lineHeight: "normal", style: { wordBreak: "break-word" } }, componentSurface: slots?.body });

  return (
    <>
      <div data-testid="comment-item" data-snapshot-id={itemId} className={itemS.className} style={itemS.style}>
        {authorAvatar ? <img src={authorAvatar} alt={authorName} data-snapshot-id={`${itemId}-avatarImage`} className={avImgS.className} style={avImgS.style} /> : <div data-snapshot-id={`${itemId}-avatarFallback`} className={avFbS.className} style={avFbS.style}>{getInitials(authorName) || "?"}</div>}
        <div data-snapshot-id={`${itemId}-contentColumn`} className={colS.className} style={colS.style}>
          <div data-snapshot-id={`${itemId}-header`} className={hdS.className} style={hdS.style}>
            <span data-snapshot-id={`${itemId}-author`} className={auS.className} style={auS.style}>{authorName}</span>
            {ts ? <span data-snapshot-id={`${itemId}-timestamp`} className={tsS.className} style={tsS.style} title={ts.toLocaleString()}>{formatRelativeTime(ts, { short: true })}</span> : null}
            {showDelete && onDelete ? <ButtonControl type="button" onClick={() => onDelete(comment)} surfaceId={`${itemId}-deleteButton`} surfaceConfig={delS.resolvedConfigForWrapper} title="Delete comment" ariaLabel="Delete comment" variant="ghost" size="icon"><Icon name="trash-2" size={12} /></ButtonControl> : null}
          </div>
          <div data-snapshot-id={`${itemId}-body`} className={bdS.className} style={bdS.style} dangerouslySetInnerHTML={{ __html: sanitized }} />
        </div>
      </div>
      <SurfaceStyles css={itemS.scopedCss} /><SurfaceStyles css={avImgS.scopedCss} /><SurfaceStyles css={avFbS.scopedCss} /><SurfaceStyles css={colS.scopedCss} /><SurfaceStyles css={hdS.scopedCss} /><SurfaceStyles css={auS.scopedCss} /><SurfaceStyles css={tsS.scopedCss} /><SurfaceStyles css={delS.scopedCss} /><SurfaceStyles css={bdS.scopedCss} />
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone CommentSection — threaded comment list with avatars, timestamps,
 * optional delete actions, and a composable input slot. No manifest context required.
 *
 * @example
 * ```tsx
 * <CommentSectionBase
 *   comments={[{ author: { name: "Alice" }, content: "Great work!", timestamp: "2026-01-15T10:00:00Z" }]}
 *   sortOrder="newest"
 *   showDelete
 *   onDelete={(c) => console.log("delete", c)}
 * />
 * ```
 */
export function CommentSectionBase({
  id, comments = [], loading = false, error, emptyText = "No comments yet",
  authorNameField = "author.name", authorAvatarField = "author.avatar",
  contentField = "content", timestampField = "timestamp",
  sortOrder = "newest", showDelete = false, onDelete, inputSlot,
  className, style, slots,
}: CommentSectionBaseProps) {
  const rootId = id ?? "comment-section";

  const sorted = useMemo(() => {
    return [...comments].sort((a, b) => {
      const aTs = getNestedField(a, timestampField);
      const bTs = getNestedField(b, timestampField);
      const aTime = aTs ? new Date(String(aTs)).getTime() : 0;
      const bTime = bTs ? new Date(String(bTs)).getTime() : 0;
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [comments, timestampField, sortOrder]);

  const rootS = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: { overflow: "hidden", borderRadius: "md", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", bg: "var(--sn-color-card, #ffffff)" }, componentSurface: className || style ? { className, style } : undefined, itemSurface: slots?.root });
  const headerS = resolveSurfacePresentation({ surfaceId: `${rootId}-header`, implementationBase: { display: "flex", alignItems: "center", gap: "sm", paddingY: "sm", paddingX: "md", style: { borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.header });
  const hIconS = resolveSurfacePresentation({ surfaceId: `${rootId}-headerIcon`, implementationBase: { color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.headerIcon });
  const hTitleS = resolveSurfacePresentation({ surfaceId: `${rootId}-headerTitle`, implementationBase: { fontSize: "sm", fontWeight: "semibold", color: "var(--sn-color-foreground, #111827)" }, componentSurface: slots?.headerTitle });
  const hCountS = resolveSurfacePresentation({ surfaceId: `${rootId}-headerCount`, implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.headerCount });
  const listS = resolveSurfacePresentation({ surfaceId: `${rootId}-list`, implementationBase: { paddingX: "md", overflow: "auto", style: { maxHeight: "clamp(200px, 50vh, 400px)" } }, componentSurface: slots?.list });
  const errS = resolveSurfacePresentation({ surfaceId: `${rootId}-errorState`, implementationBase: { paddingY: "md", textAlign: "center", fontSize: "sm", color: "var(--sn-color-destructive, #ef4444)" }, componentSurface: slots?.errorState });
  const emptyS = resolveSurfacePresentation({ surfaceId: `${rootId}-emptyState`, implementationBase: { paddingY: "lg", textAlign: "center", fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.emptyState });
  const inputS = resolveSurfacePresentation({ surfaceId: `${rootId}-inputArea`, implementationBase: { padding: "sm", style: { borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.inputArea });

  return (
    <>
      <div data-snapshot-component="comment-section" data-testid="comment-section" aria-label="Comments" data-snapshot-id={rootId} className={rootS.className} style={rootS.style}>
        <div data-snapshot-id={`${rootId}-header`} className={headerS.className} style={headerS.style}>
          <span aria-hidden="true" data-snapshot-id={`${rootId}-headerIcon`} className={hIconS.className} style={hIconS.style}><Icon name="message-square" size={16} /></span>
          <span data-snapshot-id={`${rootId}-headerTitle`} className={hTitleS.className} style={hTitleS.style}>Comments</span>
          {!loading && sorted.length > 0 ? <span data-snapshot-id={`${rootId}-headerCount`} className={hCountS.className} style={hCountS.style}>({sorted.length})</span> : null}
        </div>
        <div data-snapshot-id={`${rootId}-list`} className={listS.className} style={listS.style}>
          {loading ? <><CommentSkeleton rootId={rootId} index={0} slots={slots} /><CommentSkeleton rootId={rootId} index={1} slots={slots} /></> : null}
          {error ? <div data-snapshot-id={`${rootId}-errorState`} className={errS.className} style={errS.style}>{error}</div> : null}
          {!loading && !error && sorted.length === 0 ? <div data-snapshot-id={`${rootId}-emptyState`} className={emptyS.className} style={emptyS.style}>{emptyText}</div> : null}
          {!loading && !error ? sorted.map((comment, idx) => {
            const wS = resolveSurfacePresentation({ surfaceId: `${rootId}-commentWrapper-${idx}`, implementationBase: { style: { borderBottom: idx < sorted.length - 1 ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" : undefined } }, componentSurface: slots?.commentWrapper });
            return (<div key={typeof comment.id === "string" || typeof comment.id === "number" ? String(comment.id) : idx} data-snapshot-id={`${rootId}-commentWrapper-${idx}`} className={wS.className} style={wS.style}><CommentItem rootId={rootId} index={idx} comment={comment} authorNameField={authorNameField} authorAvatarField={authorAvatarField} contentField={contentField} timestampField={timestampField} showDelete={showDelete} onDelete={onDelete} slots={slots} /><SurfaceStyles css={wS.scopedCss} /></div>);
          }) : null}
        </div>
        {inputSlot ? <div data-snapshot-id={`${rootId}-inputArea`} className={inputS.className} style={inputS.style}>{inputSlot}</div> : null}
      </div>
      <SurfaceStyles css={rootS.scopedCss} /><SurfaceStyles css={headerS.scopedCss} /><SurfaceStyles css={hIconS.scopedCss} /><SurfaceStyles css={hTitleS.scopedCss} /><SurfaceStyles css={hCountS.scopedCss} /><SurfaceStyles css={listS.scopedCss} /><SurfaceStyles css={errS.scopedCss} /><SurfaceStyles css={emptyS.scopedCss} /><SurfaceStyles css={inputS.scopedCss} />
    </>
  );
}
