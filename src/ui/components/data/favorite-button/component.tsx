'use client';

import { useEffect, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { FavoriteButtonConfig } from "./types";

const SIZE_MAP = {
  sm: { button: "sm" as const, icon: 16 },
  md: { button: "md" as const, icon: 20 },
  lg: { button: "lg" as const, icon: 24 },
} as const;

export function FavoriteButton({ config }: { config: FavoriteButtonConfig }) {
  const resolvedActive = useSubscribe(config.active ?? false) as boolean;
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [active, setActive] = useState(resolvedActive);

  useEffect(() => {
    setActive(resolvedActive);
  }, [resolvedActive]);

  useEffect(() => {
    publish?.({ active });
  }, [publish, active]);

  if (visible === false) {
    return null;
  }

  const size = SIZE_MAP[config.size ?? "md"];
  const rootId = config.id ?? "favorite-button";
  const states = active ? (["selected", "active"] as const) : [];
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: active
        ? "var(--sn-color-warning, #f59e0b)"
        : "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.icon,
    activeStates: [...states],
  });

  return (
    <div
      data-snapshot-component="favorite-button"
      className={config.className}
      style={config.style as React.CSSProperties}
    >
      <ButtonControl
        variant="ghost"
        size={size.button}
        onClick={() => {
          const next = !active;
          setActive(next);
          if (config.toggleAction) {
            void execute(config.toggleAction as Parameters<typeof execute>[0]);
          }
        }}
        surfaceId={rootId}
        surfaceConfig={config.slots?.root}
        activeStates={[...states]}
        ariaLabel={active ? "Remove from favorites" : "Add to favorites"}
        ariaPressed={active}
        testId="favorite-button"
        style={{
          padding: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        <span
          data-snapshot-id={`${rootId}-icon`}
          data-active={active}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name="star" size={size.icon} />
        </span>
      </ButtonControl>
      <SurfaceStyles css={iconSurface.scopedCss} />
    </div>
  );
}
