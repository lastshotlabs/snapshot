"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface InlineEditFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Current display value of the field. */
  value?: string;
  /** Placeholder shown when value is empty. */
  placeholder?: string;
  /** HTML input type used when editing. */
  inputType?: "text" | "email" | "password" | "number" | "url" | "tel" | "search";
  /** Whether pressing Escape cancels the edit and reverts the value. */
  cancelOnEscape?: boolean;
  /** CSS font-size applied to both display text and the editing input. */
  fontSize?: string;
  /** Called when the user confirms an edit (Enter key or blur). */
  onSave?: (value: string) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

/**
 * Standalone InlineEditField -- a click-to-edit text field that toggles between
 * display and input modes. No manifest context required.
 *
 * @example
 * ```tsx
 * <InlineEditField
 *   value={title}
 *   placeholder="Click to edit"
 *   onSave={(newTitle) => updateTitle(newTitle)}
 * />
 * ```
 */
export function InlineEditField({
  id,
  value: valueProp = "",
  placeholder: placeholderProp,
  inputType = "text",
  cancelOnEscape: cancelOnEscapeProp = true,
  fontSize: fontSizeProp,
  onSave,
  className,
  style,
  slots,
}: InlineEditFieldProps) {
  const rootId = id ?? "inline-edit";
  const displayValue = valueProp;
  const placeholder = placeholderProp ?? "Click to edit";
  const cancelOnEscape = cancelOnEscapeProp;
  const fontSize = fontSizeProp ?? "var(--sn-font-size-md, 1rem)";

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayValue);
  const [displayHovered, setDisplayHovered] = useState(false);
  const [displayFocused, setDisplayFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setEditValue(displayValue);
    }
  }, [displayValue, editing]);

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
    if (editValue !== displayValue) {
      onSave?.(editValue);
    }
  }, [displayValue, editValue, onSave]);

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
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
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
    componentSurface: slots?.display,
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
    componentSurface: slots?.displayText,
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
    componentSurface: slots?.displayIcon,
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
    componentSurface: slots?.input,
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
