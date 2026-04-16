'use client';

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { EmojiPicker } from "../emoji-picker/component";
import type { EmojiPickerConfig } from "../emoji-picker/types";
import type { ReactionBarConfig } from "./types";

export function ReactionBar({ config }: { config: ReactionBarConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const [showPicker, setShowPicker] = useState(false);
  const pickerPopoverRef = useRef<HTMLDivElement>(null);
  const rootId = config.id ?? "reaction-bar";

  useEffect(() => {
    if (!showPicker) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (
        pickerPopoverRef.current &&
        !pickerPopoverRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPicker]);

  const reactions = config.reactions ?? [];
  const showAddButton = config.showAddButton ?? true;

  const handleReactionClick = useCallback(
    (emoji: string, active: boolean) => {
      if (active && config.removeAction) {
        void execute(config.removeAction, { emoji });
      } else if (!active && config.addAction) {
        void execute(config.addAction, { emoji });
      }

      if (publish) {
        publish({ emoji, action: active ? "remove" : "add" });
      }
    },
    [config.addAction, config.removeAction, execute, publish],
  );

  if (visible === false) {
    return null;
  }

  const pickerConfig: EmojiPickerConfig = {
    type: "emoji-picker",
    maxHeight: "200px",
    perRow: 8,
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "xs",
      position: "relative",
      overflow: "visible",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const addWrapperSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-addWrapper`,
    implementationBase: {
      position: "relative",
    },
    componentSurface: config.slots?.addWrapper,
  });
  const addButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-addButton`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "2rem",
      height: "2rem",
      borderRadius: "full",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      cursor: "pointer",
      hover: {
        bg: "var(--sn-color-accent, #f3f4f6)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        padding: 0,
      },
    },
    componentSurface: config.slots?.addButton,
    activeStates: showPicker ? ["open"] : [],
  });
  const pickerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-picker`,
    implementationBase: {
      position: "absolute",
      zIndex: "popover",
      style: {
        bottom: "calc(100% + 4px)",
        left: 0,
      },
    },
    componentSurface: config.slots?.picker,
    activeStates: showPicker ? ["open"] : [],
  });

  return (
    <>
      <div
        data-snapshot-component="reaction-bar"
        data-testid="reaction-bar"
        data-snapshot-id={rootId}
        className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
        style={{
          ...(rootSurface.style ?? {}),
          ...((config.style as CSSProperties | undefined) ?? {}),
        }}
      >
        {reactions.map((reaction, idx) => {
          const reactionId = `${rootId}-reaction-${idx}`;
          const reactionSurface = resolveSurfacePresentation({
            surfaceId: reactionId,
            implementationBase: {
              display: "inline-flex",
              alignItems: "center",
              gap: "xs",
              paddingY: "xs",
              paddingX: "sm",
              borderRadius: "full",
              cursor: "pointer",
              transition: "all",
              style: {
                border: `1px solid ${
                  reaction.active
                    ? "var(--sn-color-primary, #2563eb)"
                    : "var(--sn-color-border, #e5e7eb)"
                }`,
                backgroundColor: reaction.active
                  ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, transparent)"
                  : "var(--sn-color-card, #ffffff)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
              },
              hover: {
                transform: "scale(1.05)",
                shadow: "sm",
              },
              focus: {
                ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
              },
            },
            componentSurface: config.slots?.reaction,
            activeStates: reaction.active ? ["active"] : [],
          });
          const emojiSurface = resolveSurfacePresentation({
            surfaceId: `${reactionId}-emoji`,
            implementationBase: {},
            componentSurface: config.slots?.emoji,
          });
          const countSurface = resolveSurfacePresentation({
            surfaceId: `${reactionId}-count`,
            implementationBase: {
              fontSize: "xs",
              color: reaction.active
                ? "var(--sn-color-primary, #2563eb)"
                : "var(--sn-color-muted-foreground, #6b7280)",
              fontWeight: "medium",
            },
            componentSurface: config.slots?.count,
            activeStates: reaction.active ? ["active"] : [],
          });

          return (
            <div key={`${reaction.emoji}-${idx}`}>
              <ButtonControl
                type="button"
                testId="reaction-button"
                ariaLabel={`React with ${reaction.emoji}`}
                surfaceId={reactionId}
                onClick={() =>
                  handleReactionClick(reaction.emoji, reaction.active ?? false)
                }
                variant="ghost"
                size="sm"
                surfaceConfig={reactionSurface.resolvedConfigForWrapper}
                activeStates={reaction.active ? ["active"] : []}
              >
                <span
                  data-snapshot-id={`${reactionId}-emoji`}
                  className={emojiSurface.className}
                  style={emojiSurface.style}
                >
                  {reaction.emoji}
                </span>
                <span
                  data-snapshot-id={`${reactionId}-count`}
                  className={countSurface.className}
                  style={countSurface.style}
                >
                  {reaction.count}
                </span>
              </ButtonControl>
              <SurfaceStyles css={emojiSurface.scopedCss} />
              <SurfaceStyles css={countSurface.scopedCss} />
            </div>
          );
        })}

        {showAddButton ? (
          <div
            data-snapshot-id={`${rootId}-addWrapper`}
            className={addWrapperSurface.className}
            style={addWrapperSurface.style}
          >
            <ButtonControl
              type="button"
              testId="reaction-add"
              ariaLabel="Add reaction"
              surfaceId={`${rootId}-addButton`}
              onClick={() => setShowPicker(!showPicker)}
              variant="ghost"
              size="icon"
              surfaceConfig={addButtonSurface.resolvedConfigForWrapper}
              activeStates={showPicker ? ["open"] : []}
            >
              <Icon name="plus" size={14} />
            </ButtonControl>

            {showPicker ? (
              <div
                ref={pickerPopoverRef}
                data-snapshot-id={`${rootId}-picker`}
                className={pickerSurface.className}
                style={pickerSurface.style}
              >
                <EmojiPicker
                  config={{
                    ...pickerConfig,
                    selectAction: undefined,
                  }}
                />
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
