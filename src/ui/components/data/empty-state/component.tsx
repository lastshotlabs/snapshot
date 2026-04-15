'use client';

import { useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { EmptyStateConfig } from "./types";

const ICON_SIZE_MAP = { sm: 32, md: 48, lg: 64 } as const;
const SPACING_MAP = {
  sm: "var(--sn-spacing-md, 1rem)",
  md: "var(--sn-spacing-xl, 2rem)",
  lg: "var(--sn-spacing-xl, 2rem)",
} as const;

export function EmptyState({ config }: { config: EmptyStateConfig }) {
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);

  if (visible === false) {
    return null;
  }

  const size = config.size ?? "md";
  const iconSize = ICON_SIZE_MAP[size];
  const spacing = SPACING_MAP[size];
  const rootId = config.id ?? "empty-state";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      style: {
        padding: spacing,
        gap: "var(--sn-spacing-md, 1rem)",
      },
    },
    componentSurface: config.slots?.root,
  });

  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      color: config.iconColor
        ? `var(--sn-color-${config.iconColor}, ${config.iconColor})`
        : "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        lineHeight: "var(--sn-leading-none, 1)",
      },
    },
    componentSurface: config.slots?.icon,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: size === "sm" ? "base" : size === "lg" ? "xl" : "lg",
      fontWeight: "semibold",
      style: {
        margin: 0,
      },
    },
    componentSurface: config.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
      maxWidth: "var(--sn-container-md, 400px)",
      lineHeight: "normal",
      style: {
        margin: 0,
      },
    },
    componentSurface: config.slots?.description,
  });

  return (
    <div
      data-snapshot-component="empty-state"
      data-testid="empty-state"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      {config.icon ? (
        <span
          data-testid="empty-state-icon"
          aria-hidden="true"
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={config.icon} size={iconSize} />
        </span>
      ) : null}

      <h3
        data-testid="empty-state-title"
        data-snapshot-id={`${rootId}-title`}
        className={titleSurface.className}
        style={titleSurface.style}
      >
        {config.title}
      </h3>

      {config.description ? (
        <p
          data-testid="empty-state-description"
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {config.description}
        </p>
      ) : null}

      {config.action && config.actionLabel ? (
        <ButtonControl
          variant="default"
          size="md"
          onClick={() => void execute(config.action!)}
          surfaceId={`${rootId}-action`}
          surfaceConfig={config.slots?.action}
          testId="empty-state-action"
        >
          {config.actionLabel}
        </ButtonControl>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
