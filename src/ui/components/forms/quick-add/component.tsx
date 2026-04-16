'use client';

import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import type { QuickAddConfig } from "./types";

export function QuickAdd({ config }: { config: QuickAddConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const resolvedPlaceholder = useSubscribe(config.placeholder) as
    | string
    | undefined;
  const resolvedButtonText = useSubscribe(config.buttonText) as
    | string
    | undefined;
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const rootId = config.id ?? "quick-add";

  const [value, setValue] = useState("");

  const placeholder = resolvedPlaceholder ?? "Add new item...";
  const icon = config.icon ?? "plus";
  const submitOnEnter = config.submitOnEnter ?? true;
  const showButton = config.showButton ?? true;
  const buttonText = resolvedButtonText ?? "Add";
  const clearOnSubmit = config.clearOnSubmit ?? true;
  const canSubmit = value.trim().length > 0;

  useEffect(() => {
    if (publish) {
      publish({ value });
    }
  }, [publish, value]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (config.submitAction) {
      void execute(config.submitAction);
    }

    if (clearOnSubmit) {
      setValue("");
    }
  }, [clearOnSubmit, config.submitAction, execute, value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (submitOnEnter && event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, submitOnEnter],
  );

  if (visible === false) {
    return null;
  }

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
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.icon,
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
    componentSurface: config.slots?.input,
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
    componentSurface: config.slots?.button,
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
