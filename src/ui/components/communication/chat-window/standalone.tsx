'use client';

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ChatWindowBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Header title text. */
  title?: string;
  /** Header subtitle text. */
  subtitle?: string;
  /** Show the header bar. Default: true. */
  showHeader?: boolean;
  /** Height of the chat window. Default: "clamp(300px, 70vh, 500px)". */
  height?: string;
  /** Content for the message thread area (typically a MessageThreadBase). */
  threadSlot: ReactNode;
  /** Content for the typing indicator area. */
  typingSlot?: ReactNode;
  /** Content for the input area (typically a RichInputBase). */
  inputSlot: ReactNode;
  /** Whether to show the typing indicator area. Default: true. */
  showTypingIndicator?: boolean;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone ChatWindow — composable chat container with header, message thread,
 * typing indicator, and input slots. No manifest context required.
 *
 * @example
 * ```tsx
 * <ChatWindowBase
 *   title="General"
 *   threadSlot={<MessageThreadBase messages={messages} />}
 *   inputSlot={<input placeholder="Type a message..." />}
 * />
 * ```
 */
export function ChatWindowBase({
  id, title, subtitle, showHeader = true, height = "clamp(300px, 70vh, 500px)",
  threadSlot, typingSlot, inputSlot, showTypingIndicator = true,
  className, style, slots,
}: ChatWindowBaseProps) {
  const rootId = id ?? "chat-window";

  const rootS = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: { display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "md", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", bg: "var(--sn-color-card, #ffffff)", style: { height } }, componentSurface: className || style ? { className, style } : undefined, itemSurface: slots?.root });
  const headerS = resolveSurfacePresentation({ surfaceId: `${rootId}-header`, implementationBase: { display: "flex", alignItems: "center", gap: "sm", paddingY: "sm", paddingX: "md", bg: "var(--sn-color-card, #ffffff)", style: { flexShrink: 0, borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.header });
  const hIconS = resolveSurfacePresentation({ surfaceId: `${rootId}-headerIcon`, implementationBase: { color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.headerIcon });
  const titleGrpS = resolveSurfacePresentation({ surfaceId: `${rootId}-titleGroup`, implementationBase: { flex: "1", style: { minWidth: 0 } }, componentSurface: slots?.titleGroup });
  const titleS = resolveSurfacePresentation({ surfaceId: `${rootId}-title`, implementationBase: { fontSize: "base", fontWeight: "semibold", color: "var(--sn-color-foreground, #111827)", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, componentSurface: slots?.title });
  const subtitleS = resolveSurfacePresentation({ surfaceId: `${rootId}-subtitle`, implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, componentSurface: slots?.subtitle });
  const threadS = resolveSurfacePresentation({ surfaceId: `${rootId}-threadArea`, implementationBase: { display: "flex", flexDirection: "column", flex: "1", style: { minHeight: 0 } }, componentSurface: slots?.threadArea });
  const typingS = resolveSurfacePresentation({ surfaceId: `${rootId}-typingArea`, implementationBase: { style: { flexShrink: 0, minHeight: "1.5rem" } }, componentSurface: slots?.typingArea });
  const inputS = resolveSurfacePresentation({ surfaceId: `${rootId}-inputArea`, implementationBase: { paddingY: "sm", paddingX: "md", style: { flexShrink: 0, borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.inputArea });

  return (
    <>
      <div data-snapshot-component="chat-window" data-testid="chat-window" aria-label="Chat" data-snapshot-id={rootId} className={rootS.className} style={rootS.style}>
        {showHeader ? (
          <div data-testid="chat-header" data-snapshot-id={`${rootId}-header`} className={headerS.className} style={headerS.style}>
            <span aria-hidden="true" data-snapshot-id={`${rootId}-headerIcon`} className={hIconS.className} style={hIconS.style}><Icon name="hash" size={18} /></span>
            <div data-snapshot-id={`${rootId}-titleGroup`} className={titleGrpS.className} style={titleGrpS.style}>
              {title ? <div data-snapshot-id={`${rootId}-title`} className={titleS.className} style={titleS.style}>{title}</div> : null}
              {subtitle ? <div data-snapshot-id={`${rootId}-subtitle`} className={subtitleS.className} style={subtitleS.style}>{subtitle}</div> : null}
            </div>
          </div>
        ) : null}
        <div data-snapshot-id={`${rootId}-threadArea`} className={threadS.className} style={threadS.style}>{threadSlot}</div>
        {showTypingIndicator && typingSlot ? <div data-snapshot-id={`${rootId}-typingArea`} className={typingS.className} style={typingS.style}>{typingSlot}</div> : null}
        <div data-snapshot-id={`${rootId}-inputArea`} className={inputS.className} style={inputS.style}>{inputSlot}</div>
      </div>
      <SurfaceStyles css={rootS.scopedCss} /><SurfaceStyles css={headerS.scopedCss} /><SurfaceStyles css={hIconS.scopedCss} /><SurfaceStyles css={titleGrpS.scopedCss} /><SurfaceStyles css={titleS.scopedCss} /><SurfaceStyles css={subtitleS.scopedCss} /><SurfaceStyles css={threadS.scopedCss} /><SurfaceStyles css={typingS.scopedCss} /><SurfaceStyles css={inputS.scopedCss} />
    </>
  );
}
