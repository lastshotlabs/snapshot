'use client';

import { useCallback, useEffect, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { executeEventAction } from "../../_base/events";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import type { SwitchConfig } from "./types";

const SIZE_MAP = {
  sm: { trackW: 32, trackH: 18, thumb: 14 },
  md: { trackW: 44, trackH: 24, thumb: 20 },
  lg: { trackW: 56, trackH: 30, thumb: 26 },
} as const;

export function Switch({ config }: { config: SwitchConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedDescription = useSubscribe(config.description) as
    | string
    | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;

  const size = config.size ?? "md";
  const dims = SIZE_MAP[size];
  const [checked, setChecked] = useState(config.defaultChecked ?? false);

  useEffect(() => {
    publish?.({ checked });
  }, [checked, publish]);

  const handleToggle = useCallback(() => {
    if (resolvedDisabled) {
      return;
    }

    const nextChecked = !checked;
    setChecked(nextChecked);
    void executeEventAction(execute, config.on?.change, {
      id: config.id,
      checked: nextChecked,
      value: nextChecked,
    });
  }, [checked, config.id, config.on?.change, execute, resolvedDisabled]);

  if (visible === false) {
    return null;
  }

  const thumbOffset = 2;
  const thumbTranslate = checked
    ? dims.trackW - dims.thumb - thumbOffset * 2
    : 0;
  const rootId = config.id ?? "switch";
  const states = [
    ...(checked ? (["selected"] as const) : []),
    ...(resolvedDisabled ? (["disabled"] as const) : []),
  ];
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "auto",
      minHeight: "auto",
      padding: 0,
      gap: "var(--sn-spacing-sm, 0.5rem)",
      cursor: resolvedDisabled ? "not-allowed" : "pointer",
      style: {
        justifyContent: "flex-start",
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
    activeStates: states,
  });

  const trackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-track`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "full",
      style: {
        position: "relative",
        width: dims.trackW,
        height: dims.trackH,
        flexShrink: 0,
        backgroundColor: checked
          ? `var(--sn-color-${config.color ?? "primary"}, #2563eb)`
          : "var(--sn-color-secondary, #e5e7eb)",
        transition:
          "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
      },
    },
    componentSurface: config.slots?.track,
    activeStates: states,
  });
  const thumbSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-thumb`,
    implementationBase: {
      borderRadius: "full",
      style: {
        position: "absolute",
        top: thumbOffset,
        left: thumbOffset,
        width: dims.thumb,
        height: dims.thumb,
        backgroundColor: "var(--sn-color-card, #ffffff)",
        boxShadow: "var(--sn-shadow-sm, 0 1px 3px rgba(0,0,0,0.2))",
        transform: `translateX(${thumbTranslate}px)`,
        transition:
          "transform var(--sn-duration-fast, 150ms) var(--sn-ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1))",
      },
    },
    componentSurface: config.slots?.thumb,
    activeStates: states,
  });
  const labelGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label-group`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      style: {
        textAlign: "left",
      },
    },
    componentSurface: config.slots?.labelGroup,
    activeStates: states,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "sm",
      fontWeight: "medium",
    },
    componentSurface: config.slots?.label,
    activeStates: states,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "xs",
    },
    componentSurface: config.slots?.description,
    activeStates: states,
  });

  return (
    <div data-snapshot-component="switch">
      <ButtonControl
        type="button"
        variant="ghost"
        size="icon"
        disabled={resolvedDisabled}
        onClick={handleToggle}
        surfaceId={rootId}
        surfaceConfig={rootSurface.resolvedConfigForWrapper}
        activeStates={states}
        ariaLabel={resolvedLabel ?? resolvedDescription ?? "Toggle"}
        ariaChecked={checked}
        role="switch"
        testId="switch"
      >
        <span
          data-snapshot-id={`${rootId}-track`}
          className={trackSurface.className}
          style={trackSurface.style}
        >
          <span
            data-snapshot-id={`${rootId}-thumb`}
            className={thumbSurface.className}
            style={thumbSurface.style}
          />
        </span>
        {resolvedLabel || resolvedDescription ? (
          <span
            data-snapshot-id={`${rootId}-label-group`}
            className={labelGroupSurface.className}
            style={labelGroupSurface.style}
          >
            {resolvedLabel ? (
              <span
                data-snapshot-id={`${rootId}-label`}
                className={labelSurface.className}
                style={labelSurface.style}
              >
                {resolvedLabel}
              </span>
            ) : null}
            {resolvedDescription ? (
              <span
                data-snapshot-id={`${rootId}-description`}
                className={descriptionSurface.className}
                style={descriptionSurface.style}
              >
                {resolvedDescription}
              </span>
            ) : null}
          </span>
        ) : null}
      </ButtonControl>
      <SurfaceStyles css={trackSurface.scopedCss} />
      <SurfaceStyles css={thumbSurface.scopedCss} />
      <SurfaceStyles css={labelGroupSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
