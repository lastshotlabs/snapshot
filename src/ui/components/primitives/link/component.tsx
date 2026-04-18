'use client';

import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { renderIcon } from "../../../icons/render";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  resolvePrimitiveValue,
} from "../resolve-value";
import type { LinkConfig } from "./types";

function isClientNavigableHref(to: string): boolean {
  return /^\/(?!\/)/.test(to);
}

function getVariantSurfaceBase(
  variant: NonNullable<LinkConfig["variant"]>,
): Record<string, unknown> {
  if (variant === "button") {
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
      bg: "var(--sn-color-primary)",
      color: "var(--sn-color-primary-foreground)",
      style: {
        textDecoration: "none",
      },
    };
  }

  if (variant === "navigation") {
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "var(--sn-nav-link-justify, flex-start)",
      gap: "var(--sn-nav-link-gap, var(--sn-spacing-xs, 0.5rem))",
      minHeight: "2.25rem",
      padding: "var(--sn-nav-link-padding, 0.25rem 0.75rem)",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      color: "var(--sn-color-foreground, #111827)",
      whiteSpace: "nowrap",
      minWidth: 0,
      style: {
        textDecoration: "none",
        boxSizing: "border-box",
      },
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--sn-spacing-xs, 0.25rem)",
    color:
      variant === "muted"
        ? "var(--sn-color-muted-foreground)"
        : "var(--sn-color-primary)",
    style: {
      textDecoration: "none",
    },
  };
}

export function Link({
  config,
  onNavigate,
}: {
  config: LinkConfig;
  onNavigate?: (to: string) => void;
}) {
  const routeRuntime = useRouteRuntime();
  const manifest = useManifestRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const templateContext = {
    app: manifest?.app ?? {},
    auth: manifest?.auth ?? {},
    route: {
      ...(routeRuntime?.currentRoute ?? {}),
      path: routeRuntime?.currentPath,
      params: routeRuntime?.params,
      query: routeRuntime?.query,
    },
  };
  const templateOptions = {
    locale: activeLocale,
    i18n: manifest?.raw.i18n,
  };
  const resolvedConfig = useResolveFrom({
    text: config.text,
    to: config.to,
    badge: config.badge,
  });
  const text = resolvePrimitiveValue(resolvedConfig.text, {
    context: templateContext,
    ...templateOptions,
  });
  const to = resolvePrimitiveValue(resolvedConfig.to, {
    context: templateContext,
    ...templateOptions,
  });
  const badge = resolveOptionalPrimitiveValue(resolvedConfig.badge, {
    context: templateContext,
    ...templateOptions,
  });
  const rootId = config.id ?? "link";
  const align = config.align ?? "left";
  const isDisabled = config.disabled === true;
  const currentPath = routeRuntime?.currentPath;
  const routeIsCurrent =
    typeof currentPath === "string" && typeof to === "string"
      ? config.matchChildren !== false
        ? currentPath === to || currentPath.startsWith(`${to}/`)
        : currentPath === to
      : false;
  const isCurrent = config.current ?? routeIsCurrent;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      ...getVariantSurfaceBase(config.variant ?? "default"),
      cursor: isDisabled ? "not-allowed" : "pointer",
      textAlign: align,
      hover:
        config.variant === "navigation"
          ? {
              bg: "var(--sn-color-accent, #f3f4f6)",
              color: "var(--sn-color-foreground, #111827)",
            }
          : {
              opacity: 0.84,
            },
      focus: {
        ring: true,
      },
      states: {
        current:
          config.variant === "navigation"
            ? {
                bg: "color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent)",
                color: "var(--sn-color-foreground, #111827)",
                fontWeight: "var(--sn-font-weight-semibold, 600)",
              }
            : undefined,
        disabled: {
          opacity: "var(--sn-opacity-disabled, 0.5)",
        },
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
    activeStates: [isCurrent ? "current" : undefined, isDisabled ? "disabled" : undefined].filter(
      Boolean,
    ) as Array<"current" | "disabled">,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    componentSurface: config.slots?.label,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      style: { flexShrink: 0 },
    },
    componentSurface: config.slots?.icon,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-badge`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 var(--sn-spacing-xs, 0.25rem)",
      borderRadius: "var(--sn-radius-full, 9999px)",
      bg: "var(--sn-color-secondary, #f1f5f9)",
      color: "var(--sn-color-secondary-foreground, #0f172a)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
    },
    componentSurface: config.slots?.badge,
  });

  const contents = (
    <>
      {config.icon ? (
        <span
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          {renderIcon(config.icon, 16)}
        </span>
      ) : null}
      <span
        data-snapshot-id={`${rootId}-label`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {text}
      </span>
      {badge ? (
        <span
          data-snapshot-id={`${rootId}-badge`}
          className={badgeSurface.className}
          style={badgeSurface.style}
        >
          {badge}
        </span>
      ) : null}
    </>
  );

  return (
    <>
      <a
        data-snapshot-component="link"
        data-snapshot-id={`${rootId}-root`}
        data-current={isCurrent ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        href={to}
        target={config.external ? "_blank" : undefined}
        rel={config.external ? "noreferrer noopener" : undefined}
        aria-current={isCurrent ? "page" : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={(event) => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }

          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          if (!isClientNavigableHref(to) || config.external) {
            return;
          }

          event.preventDefault();
          if (onNavigate) {
            onNavigate(to);
            return;
          }

          if (routeRuntime?.navigate) {
            routeRuntime.navigate(to);
          }
        }}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {contents}
      </a>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
    </>
  );
}
