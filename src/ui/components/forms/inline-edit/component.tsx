'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import type { InlineEditConfig } from "./types";

/**
 * InlineEdit component — click-to-edit text field.
 *
 * Toggles between a display mode and an edit mode. Enter or blur saves the
 * value; Escape reverts to the original value when `cancelOnEscape` is enabled.
 */
export function InlineEdit({ config }: { config: InlineEditConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const resolvedValue = useSubscribe(config.value);
  const resolvedPlaceholder = useSubscribe(config.placeholder) as
    | string
    | undefined;
  const displayValue =
    typeof resolvedValue === "string" || typeof resolvedValue === "number"
      ? String(resolvedValue)
      : "";

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayValue);
  const [displayHovered, setDisplayHovered] = useState(false);
  const [displayFocused, setDisplayFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootId = config.id ?? "inline-edit";

  const placeholder = resolvedPlaceholder ?? "Click to edit";
  const inputType = config.inputType ?? "text";
  const cancelOnEscape = config.cancelOnEscape !== false;
  const fontSize = config.fontSize ?? "var(--sn-font-size-md, 1rem)";

  useEffect(() => {
    if (!editing) {
      setEditValue(displayValue);
    }
  }, [displayValue, editing]);

  useEffect(() => {
    publish?.({ value: editing ? editValue : displayValue, editing });
  }, [displayValue, editValue, editing, publish]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = useCallback(() => {
    setEditValue(displayValue);
    setEditing(true);
  }, [displayValue]);

  const save = useCallback(() => {
    setEditing(false);

    if (config.saveAction && editValue !== displayValue) {
      void execute(config.saveAction, { value: editValue });
    }
  }, [config.saveAction, displayValue, editValue, execute]);

  const cancel = useCallback(() => {
    setEditValue(displayValue);
    setEditing(false);
  }, [displayValue]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        save();
        return;
      }

      if (event.key === "Escape" && cancelOnEscape) {
        event.preventDefault();
        cancel();
      }
    },
    [cancel, cancelOnEscape, save],
  );

  const displayStates = [
    ...(displayHovered ? (["hover"] as const) : []),
    ...(displayFocused ? (["focus"] as const) : []),
  ];

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      minWidth: "0",
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["fontSize"] }),
    itemSurface: config.slots?.root,
  });
  const displaySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-display`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "xs",
      borderRadius: "sm",
      cursor: "pointer",
      hover: {
        bg: "var(--sn-color-muted, #f9fafb)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
      focus: {
        ring: true,
      },
      style: {
        background: "none",
        border: "var(--sn-border-default, 1px) solid transparent",
        padding: "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
        textAlign: "left",
        transition:
          "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: config.slots?.display,
    activeStates: displayStates,
  });
  const displayTextSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-display-text`,
    implementationBase: {
      color: displayValue
        ? "var(--sn-color-foreground, #111)"
        : "var(--sn-color-muted-foreground, #6b7280)",
      fontSize,
      style: {
        fontFamily: "inherit",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.displayText,
  });
  const displayIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-display-icon`,
    implementationBase: {
      display: "inline-flex",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      opacity: 0,
      states: {
        hover: {
          opacity: 1,
        },
        focus: {
          opacity: 1,
        },
      },
      style: {
        flexShrink: 0,
        transition:
          "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: config.slots?.displayIcon,
    activeStates: displayStates,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111)",
      bg: "var(--sn-color-input, #fff)",
      borderRadius: "sm",
      focus: {
        ring: true,
      },
      style: {
        fontSize,
        fontFamily: "inherit",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-ring, #2563eb)",
        padding: "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
        outline: "none",
        width: "100%",
        minWidth: "60px",
      },
    },
    componentSurface: config.slots?.input,
  });

  return (
    <>
      <div
        data-snapshot-component="inline-edit"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {editing ? (
          <InputControl
            inputRef={inputRef}
            inputId={`${rootId}-input`}
            type={inputType}
            value={editValue}
            onChangeText={setEditValue}
            onKeyDown={handleKeyDown}
            onBlur={save}
            testId="inline-edit-input"
            surfaceId={`${rootId}-input`}
            surfaceConfig={inputSurface.resolvedConfigForWrapper}
          />
        ) : (
          <ButtonControl
            type="button"
            onClick={startEditing}
            onPointerEnter={() => setDisplayHovered(true)}
            onPointerLeave={() => setDisplayHovered(false)}
            onFocus={() => setDisplayFocused(true)}
            onBlur={() => setDisplayFocused(false)}
            testId="inline-edit-display"
            surfaceId={`${rootId}-display`}
            variant="ghost"
            size="sm"
            surfaceConfig={displaySurface.resolvedConfigForWrapper}
          >
            <span
              data-snapshot-id={`${rootId}-display-text`}
              className={displayTextSurface.className}
              style={displayTextSurface.style}
            >
              {displayValue || placeholder}
            </span>
            <span
              data-snapshot-id={`${rootId}-display-icon`}
              className={displayIconSurface.className}
              style={displayIconSurface.style}
            >
              <Icon name="pencil" size={12} />
            </span>
          </ButtonControl>
        )}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={displaySurface.scopedCss} />
      <SurfaceStyles css={displayTextSurface.scopedCss} />
      <SurfaceStyles css={displayIconSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
    </>
  );
}
