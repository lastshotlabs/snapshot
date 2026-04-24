'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { EmojiPickerBase as DefaultEmojiPicker } from "../emoji-picker/standalone";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ReactionEntry {
  /** Emoji character or shortcode for the reaction. */
  emoji: string;
  /** Number of times this reaction has been applied. */
  count: number;
  /** Whether the current user has applied this reaction. */
  active?: boolean;
}

export interface ReactionBarBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Array of reaction entries to display. */
  reactions?: ReactionEntry[];
  /** Whether to show the add-reaction button with emoji picker. Default: true. */
  showAddButton?: boolean;
  /** Called when a reaction button is clicked. Receives the emoji and whether it was active (for toggle). */
  onReactionClick?: (emoji: string, wasActive: boolean) => void;
  /** Called when an emoji is picked from the add-reaction picker. */
  onEmojiSelect?: (payload: { emoji: string; name: string; isCustom: boolean }) => void;
  /** Optional override for the emoji picker component (used by the manifest adapter for mockability). */
  EmojiPickerComponent?: React.ComponentType<{ maxHeight?: string; perRow?: number; onSelect?: (payload: { emoji: string; name: string; isCustom: boolean }) => void }>;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone ReactionBar — row of emoji reaction pills with counts and an
 * add-reaction button that opens an inline emoji picker. No manifest context required.
 *
 * @example
 * ```tsx
 * <ReactionBarBase
 *   reactions={[
 *     { emoji: "\ud83d\udc4d", count: 3, active: true },
 *     { emoji: "\u2764\ufe0f", count: 1 },
 *   ]}
 *   onReactionClick={(emoji, wasActive) => toggleReaction(emoji)}
 *   onEmojiSelect={({ emoji }) => addReaction(emoji)}
 * />
 * ```
 */
export function ReactionBarBase({
  id,
  reactions = [],
  showAddButton = true,
  onReactionClick,
  onEmojiSelect,
  EmojiPickerComponent,
  className,
  style,
  slots,
}: ReactionBarBaseProps) {
  const EmojiPicker = EmojiPickerComponent ?? DefaultEmojiPicker;
  const [showPicker, setShowPicker] = useState(false);
  const pickerPopoverRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "reaction-bar";

  useEffect(() => {
    if (!showPicker) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (pickerPopoverRef.current && !pickerPopoverRef.current.contains(event.target as Node)) setShowPicker(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowPicker(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("mousedown", handleMouseDown); document.removeEventListener("keydown", handleKeyDown); };
  }, [showPicker]);

  const handleReactionClick = useCallback(
    (emoji: string, active: boolean) => onReactionClick?.(emoji, active),
    [onReactionClick],
  );

  const rootSurface = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "xs", position: "relative", overflow: "visible" }, componentSurface: className || style ? { className, style } : undefined, itemSurface: slots?.root });
  const addWrapperSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-addWrapper`, implementationBase: { position: "relative" }, componentSurface: slots?.addWrapper });
  const addButtonSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-addButton`, implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "full", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", bg: "var(--sn-color-card, #ffffff)", color: "var(--sn-color-muted-foreground, #6b7280)", cursor: "pointer", hover: { bg: "var(--sn-color-accent, #f3f4f6)" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { padding: 0 } }, componentSurface: slots?.addButton, activeStates: showPicker ? ["open"] : [] });
  const pickerSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-picker`, implementationBase: { position: "absolute", zIndex: "popover", style: { bottom: "calc(100% + 4px)", left: 0 } }, componentSurface: slots?.picker, activeStates: showPicker ? ["open"] : [] });

  return (
    <>
      <div data-snapshot-component="reaction-bar" data-testid="reaction-bar" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        {reactions.map((reaction, idx) => {
          const reactionId = `${rootId}-reaction-${idx}`;
          const reactionSurface = resolveSurfacePresentation({ surfaceId: reactionId, implementationBase: { display: "inline-flex", alignItems: "center", gap: "xs", paddingY: "xs", paddingX: "sm", borderRadius: "full", cursor: "pointer", transition: "all", style: { border: `1px solid ${reaction.active ? "var(--sn-color-primary, #2563eb)" : "var(--sn-color-border, #e5e7eb)"}`, backgroundColor: reaction.active ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, transparent)" : "var(--sn-color-card, #ffffff)", fontSize: "var(--sn-font-size-sm, 0.875rem)" }, hover: { transform: "scale(1.05)", shadow: "sm" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" } }, componentSurface: slots?.reaction, activeStates: reaction.active ? ["active"] : [] });
          const emojiSurface = resolveSurfacePresentation({ surfaceId: `${reactionId}-emoji`, implementationBase: {}, componentSurface: slots?.emoji });
          const countSurface = resolveSurfacePresentation({ surfaceId: `${reactionId}-count`, implementationBase: { fontSize: "xs", color: reaction.active ? "var(--sn-color-primary, #2563eb)" : "var(--sn-color-muted-foreground, #6b7280)", fontWeight: "medium" }, componentSurface: slots?.count, activeStates: reaction.active ? ["active"] : [] });
          return (
            <div key={`${reaction.emoji}-${idx}`}>
              <ButtonControl type="button" testId="reaction-button" ariaLabel={`React with ${reaction.emoji}`} surfaceId={reactionId} onClick={() => handleReactionClick(reaction.emoji, reaction.active ?? false)} variant="ghost" size="sm" surfaceConfig={reactionSurface.resolvedConfigForWrapper} activeStates={reaction.active ? ["active"] : []}>
                <span data-snapshot-id={`${reactionId}-emoji`} className={emojiSurface.className} style={emojiSurface.style}>{reaction.emoji}</span>
                <span data-snapshot-id={`${reactionId}-count`} className={countSurface.className} style={countSurface.style}>{reaction.count}</span>
              </ButtonControl>
              <SurfaceStyles css={emojiSurface.scopedCss} />
              <SurfaceStyles css={countSurface.scopedCss} />
            </div>
          );
        })}

        {showAddButton ? (
          <div data-snapshot-id={`${rootId}-addWrapper`} className={addWrapperSurface.className} style={addWrapperSurface.style}>
            <ButtonControl type="button" testId="reaction-add" ariaLabel="Add reaction" surfaceId={`${rootId}-addButton`} onClick={() => setShowPicker(!showPicker)} variant="ghost" size="icon" surfaceConfig={addButtonSurface.resolvedConfigForWrapper} activeStates={showPicker ? ["open"] : []}>
              <Icon name="plus" size={14} />
            </ButtonControl>
            {showPicker ? (
              <div ref={pickerPopoverRef} data-snapshot-id={`${rootId}-picker`} className={pickerSurface.className} style={pickerSurface.style}>
                <EmojiPicker maxHeight="200px" perRow={8} onSelect={onEmojiSelect} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={addWrapperSurface.scopedCss} />
      <SurfaceStyles css={pickerSurface.scopedCss} />
    </>
  );
}
