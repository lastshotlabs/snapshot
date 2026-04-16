'use client';

import { useCallback, useEffect, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import type { ToggleConfig } from "./types";

const SIZE_MAP = {
  sm: {
    size: "sm" as const,
    iconSize: 14,
  },
  md: {
    size: "md" as const,
    iconSize: 16,
  },
  lg: {
    size: "lg" as const,
    iconSize: 20,
  },
} as const;

export function Toggle({ config }: { config: ToggleConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedPressed = useSubscribe(config.pressed ?? false) as boolean;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;

  const [pressed, setPressed] = useState(resolvedPressed);

  useEffect(() => {
    setPressed(resolvedPressed);
  }, [resolvedPressed]);

  useEffect(() => {
    publish?.({ pressed });
  }, [pressed, publish]);

  const handleToggle = useCallback(() => {
    if (resolvedDisabled) {
      return;
    }

    const nextPressed = !pressed;
    setPressed(nextPressed);
    if (config.changeAction) {
      void execute(config.changeAction, { pressed: nextPressed });
    }
  }, [config.changeAction, execute, pressed, resolvedDisabled]);

  if (visible === false) {
    return null;
  }

  const size = SIZE_MAP[config.size ?? "md"];
  const states = [
    ...(pressed ? (["selected"] as const) : []),
    ...(resolvedDisabled ? (["disabled"] as const) : []),
  ];
  const variant = config.variant === "outline" ? "outline" : "secondary";
  const rootId = config.id ?? "toggle";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      states: {
        selected: {
          style: {
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            borderColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #ffffff)",
          },
        },
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
    activeStates: states,
  });

  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.icon,
    activeStates: states,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: config.slots?.label,
    activeStates: states,
  });

  return (
    <div data-snapshot-component="toggle">
      <ButtonControl
        type="button"
        variant={variant}
        size={size.size}
        disabled={resolvedDisabled}
        onClick={handleToggle}
        surfaceId={rootId}
        surfaceConfig={rootSurface.resolvedConfigForWrapper}
        activeStates={states}
        ariaPressed={pressed}
        testId="toggle"
      >
        {config.icon ? (
          <span
            data-snapshot-id={`${rootId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            <Icon name={config.icon} size={size.iconSize} />
          </span>
        ) : null}
        {resolvedLabel ? (
          <span
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {resolvedLabel}
          </span>
        ) : null}
      </ButtonControl>
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </div>
  );
}
