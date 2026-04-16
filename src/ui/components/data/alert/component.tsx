'use client';

import { useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { AlertConfig } from "./types";

const DEFAULT_ICONS: Record<string, string> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  destructive: "alert-circle",
};

function variantColor(variant: string): string {
  switch (variant) {
    case "info":
      return "info";
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "destructive":
      return "destructive";
    default:
      return "border";
  }
}

export function Alert({ config }: { config: AlertConfig }) {
  const resolvedTitle = useSubscribe(config.title ?? "") as string;
  const resolvedDescription = useSubscribe(config.description) as string;
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [dismissed, setDismissed] = useState(false);

  if (visible === false || dismissed) {
    return null;
  }

  const variant = config.variant ?? "default";
  const colorToken = variantColor(variant);
  const icon = config.icon ?? DEFAULT_ICONS[variant] ?? null;
  const dismissible = config.dismissible ?? false;
  const rootId = config.id ?? "alert";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      alignItems: "start",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      style: {
        padding: "var(--sn-spacing-md, 0.75rem) var(--sn-spacing-lg, 1.5rem)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderLeft: `4px solid var(--sn-color-${colorToken}, #e5e7eb)`,
        backgroundColor: "var(--sn-color-card, #ffffff)",
        position: "relative",
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      color: `var(--sn-color-${colorToken === "border" ? "muted-foreground" : colorToken})`,
      style: {
        flexShrink: 0,
        marginTop: "var(--sn-spacing-2xs, 2px)",
        display: "flex",
      },
    },
    componentSurface: config.slots?.icon,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      flex: "1",
      minWidth: "0",
    },
    componentSurface: config.slots?.content,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "sm",
      fontWeight: "semibold",
      style: {
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
      lineHeight: "normal",
    },
    componentSurface: config.slots?.description,
  });
  const actionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-action`,
    implementationBase: {
      style: {
        marginTop: "var(--sn-spacing-sm, 0.5rem)",
        color: `var(--sn-color-${colorToken === "border" ? "primary" : colorToken})`,
        borderColor: `var(--sn-color-${colorToken === "border" ? "primary" : colorToken})`,
      },
    },
    componentSurface: config.slots?.action,
  });
  const dismissSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dismiss`,
    implementationBase: {
      style: {
        alignSelf: "flex-start",
        color: "var(--sn-color-muted-foreground, #6b7280)",
      },
    },
    componentSurface: config.slots?.dismiss,
  });

  return (
    <div
      data-snapshot-component="alert"
      data-testid="alert"
      data-variant={variant}
      role="alert"
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      {icon ? (
        <span
          data-testid="alert-icon"
          aria-hidden="true"
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={icon} size={18} />
        </span>
      ) : null}

      <div
        data-snapshot-id={`${rootId}-content`}
        className={contentSurface.className}
        style={contentSurface.style}
      >
        {resolvedTitle ? (
          <div
            data-testid="alert-title"
            data-snapshot-id={`${rootId}-title`}
            className={titleSurface.className}
            style={titleSurface.style}
          >
            {resolvedTitle}
          </div>
        ) : null}
        <div
          data-testid="alert-description"
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {resolvedDescription}
        </div>

        {config.action && config.actionLabel ? (
          <ButtonControl
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void execute(config.action!);
              publish?.({ action: true });
            }}
            surfaceId={`${rootId}-action`}
            surfaceConfig={actionSurface.resolvedConfigForWrapper}
            testId="alert-action"
          >
            {config.actionLabel}
          </ButtonControl>
        ) : null}
      </div>

      {dismissible ? (
        <ButtonControl
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          ariaLabel="Dismiss alert"
          surfaceId={`${rootId}-dismiss`}
          surfaceConfig={dismissSurface.resolvedConfigForWrapper}
          testId="alert-dismiss"
        >
          <Icon name="x" size={16} />
        </ButtonControl>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </div>
  );
}
