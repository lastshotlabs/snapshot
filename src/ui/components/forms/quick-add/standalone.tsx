"use client";

import type { KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface QuickAddFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Placeholder text shown inside the input. */
  placeholder?: string;
  /** Icon name displayed before the input. */
  icon?: string;
  /** Whether pressing Enter submits the value. */
  submitOnEnter?: boolean;
  /** Whether to show the submit button beside the input. */
  showButton?: boolean;
  /** Label text for the submit button. */
  buttonText?: string;
  /** Whether to clear the input after a successful submit. */
  clearOnSubmit?: boolean;
  /** Called with the trimmed input value on submit. */
  onSubmit?: (value: string) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

/**
 * Standalone QuickAddField -- a compact input with submit button for quickly
 * adding items to a list. No manifest context required.
 *
 * @example
 * ```tsx
 * <QuickAddField
 *   placeholder="Add a task..."
 *   icon="plus"
 *   buttonText="Add"
 *   onSubmit={(value) => addTask(value)}
 * />
 * ```
 */
export function QuickAddField({
  id,
  placeholder: placeholderProp,
  icon: iconProp,
  submitOnEnter: submitOnEnterProp = true,
  showButton: showButtonProp = true,
  buttonText: buttonTextProp,
  clearOnSubmit: clearOnSubmitProp = true,
  onSubmit,
  className,
  style,
  slots,
}: QuickAddFieldProps) {
  const rootId = id ?? "quick-add";
  const [value, setValue] = useState("");

  const placeholder = placeholderProp ?? "Add new item...";
  const icon = iconProp ?? "plus";
  const submitOnEnter = submitOnEnterProp;
  const showButton = showButtonProp;
  const buttonText = buttonTextProp ?? "Add";
  const clearOnSubmit = clearOnSubmitProp;
  const canSubmit = value.trim().length > 0;

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    onSubmit?.(trimmed);

    if (clearOnSubmit) {
      setValue("");
    }
  }, [clearOnSubmit, onSubmit, value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (submitOnEnter && event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, submitOnEnter],
  );

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "lg",
      bg: "var(--sn-color-card, #ffffff)",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        display: "flex",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.icon,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      flex: "1",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        border: "none",
        outline: "none",
        background: "transparent",
        fontFamily: "var(--sn-font-sans, sans-serif)",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        padding: 0,
      },
    },
    componentSurface: slots?.input,
  });
  const buttonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-button`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "xs",
      paddingY: "xs",
      paddingX: "md",
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-primary-foreground, #ffffff)",
      bg: "var(--sn-color-primary, #2563eb)",
      borderRadius: "md",
      cursor: "pointer",
      opacity: 1,
      transition: "opacity",
      hover: {
        opacity: 0.9,
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      states: {
        disabled: {
          cursor: "not-allowed",
          opacity: 0.5,
          hover: {
            opacity: 0.5,
          },
        },
      },
      style: {
        border: "none",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.button,
    activeStates: canSubmit ? [] : ["disabled"],
  });

  return (
    <>
      <div
        data-snapshot-component="quick-add"
        data-snapshot-id={rootId}
        data-testid="quick-add"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <span
          aria-hidden="true"
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={icon} size={18} />
        </span>

        <InputControl
          testId="quick-add-input"
          surfaceId={`${rootId}-input`}
          type="text"
          value={value}
          onChangeText={setValue}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          surfaceConfig={inputSurface.resolvedConfigForWrapper}
        />

        {showButton ? (
          <ButtonControl
            type="button"
            testId="quick-add-button"
            surfaceId={`${rootId}-button`}
            onClick={handleSubmit}
            disabled={!canSubmit}
            variant="ghost"
            size="sm"
            surfaceConfig={buttonSurface.resolvedConfigForWrapper}
            activeStates={!canSubmit ? ["disabled"] : []}
          >
            {buttonText}
          </ButtonControl>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={buttonSurface.scopedCss} />
    </>
  );
}
