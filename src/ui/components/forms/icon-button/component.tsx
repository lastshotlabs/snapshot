"use client";

import { useSubscribe } from "../../../context/index";
import { useActionExecutor } from "../../../actions/executor";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import type { IconButtonConfig } from "./types";

const SIZE_MAP = {
  xs: { size: "sm" as const, dim: "1.5rem", iconSize: 12 },
  sm: { size: "sm" as const, dim: "2rem", iconSize: 14 },
  md: { size: "md" as const, dim: "2.5rem", iconSize: 16 },
  lg: { size: "lg" as const, dim: "3rem", iconSize: 20 },
} as const;

export function IconButton({ config }: { config: IconButtonConfig }) {
  const execute = useActionExecutor();
  const resolvedDisabled = useSubscribe(
    typeof config.disabled === "object" && "from" in config.disabled
      ? config.disabled
      : undefined,
  );
  const isDisabled =
    typeof config.disabled === "boolean"
      ? config.disabled
      : typeof resolvedDisabled === "boolean"
        ? resolvedDisabled
        : false;

  const size = SIZE_MAP[config.size ?? "md"];
  const variant = config.variant ?? "ghost";
  const states = isDisabled ? (["disabled"] as const) : [];
  const rootId = config.id ?? config.ariaLabel;
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    componentSurface: config.slots?.icon,
    activeStates: [...states],
  });

  return (
    <div data-snapshot-component="icon-button">
      <ButtonControl
        type="button"
        variant={variant}
        size={size.size}
        disabled={isDisabled}
        onClick={() => {
          if (config.action) {
            void execute(config.action as Parameters<typeof execute>[0]);
          }
        }}
        surfaceId={rootId}
        surfaceConfig={extractSurfaceConfig(config)}
        itemSurfaceConfig={config.slots?.root}
        activeStates={[...states]}
        ariaLabel={config.ariaLabel}
        style={{
          width: size.dim,
          minWidth: size.dim,
          height: size.dim,
          minHeight: size.dim,
          padding: 0,
          borderRadius:
            config.shape === "square"
              ? "var(--sn-radius-md, 0.375rem)"
              : "var(--sn-radius-full, 9999px)",
        }}
      >
        <span
          title={config.tooltip ?? config.ariaLabel}
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          {renderIcon(config.icon, size.iconSize)}
        </span>
      </ButtonControl>
      <SurfaceStyles css={iconSurface.scopedCss} />
    </div>
  );
}
