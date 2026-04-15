'use client';

import { useEffect, useMemo, useRef } from "react";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveTemplate } from "../../../expressions/template";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { renderIcon } from "../../../icons/render";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { resolveOptionalPrimitiveValue } from "../resolve-value";
import type { OAuthButtonsConfig } from "./types";

const PROVIDER_ICON_MAP: Record<string, string> = {
  google: "mail",
  github: "globe",
  microsoft: "globe",
  apple: "globe",
  facebook: "globe",
  discord: "globe",
};

function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function OAuthButtons({ config }: { config: OAuthButtonsConfig }) {
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const autoRedirectedRef = useRef(false);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const routeId = routeRuntime?.currentRoute?.id;
  const rootId = config.id ?? "oauth-buttons";
  const screenOptions = useMemo(
    () =>
      routeId &&
      manifest?.auth?.screenOptions &&
      typeof manifest.auth.screenOptions === "object"
        ? (
            manifest.auth.screenOptions as Record<string, Record<string, unknown>>
          )[routeId]
        : undefined,
    [manifest?.auth?.screenOptions, routeId],
  );
  const providers = useMemo(() => {
    const configuredProviders = Object.entries(manifest?.auth?.providers ?? {});
    const allowedProviders = Array.isArray(screenOptions?.providers)
      ? new Set(
          screenOptions.providers.filter(
            (value): value is string => typeof value === "string",
          ),
        )
      : null;

    return configuredProviders.filter(([providerName]) =>
      allowedProviders ? allowedProviders.has(providerName) : true,
    );
  }, [manifest?.auth?.providers, screenOptions?.providers]);
  const hasProviders = providers.length > 0;

  const providerMode =
    (typeof screenOptions?.providerMode === "string"
      ? screenOptions.providerMode
      : undefined) ??
    manifest?.auth?.providerMode ??
    "buttons";
  const oauthStart =
    typeof manifest?.auth?.contract?.endpoints?.oauthStart === "string"
      ? manifest.auth.contract.endpoints.oauthStart
      : undefined;
  const apiBase =
    typeof manifest?.app?.apiUrl === "string"
      ? manifest.app.apiUrl.replace(/\/$/, "")
      : undefined;
  const heading =
    config.heading ??
    (screenOptions?.labels &&
    typeof screenOptions.labels === "object" &&
    typeof (screenOptions.labels as Record<string, unknown>).providersHeading ===
      "string"
      ? String(
          (screenOptions.labels as Record<string, unknown>).providersHeading,
        )
      : undefined);
  const resolvedConfig = useResolveFrom({
    heading,
  });
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
  const resolvedHeading = resolveOptionalPrimitiveValue(resolvedConfig.heading, {
    context: templateContext,
    ...templateOptions,
  });
  const resolvedProviders = providers.map(([providerName, provider]) => {
    const providerRecord = provider as Record<string, unknown>;
    const label = resolveTemplate(
      typeof providerRecord.label === "string"
        ? providerRecord.label
        : `Continue with ${titleCase(providerName)}`,
      templateContext,
      templateOptions,
    );
    const description =
      typeof providerRecord.description === "string"
        ? resolveTemplate(
            providerRecord.description,
            templateContext,
            templateOptions,
          )
        : undefined;
    const url = resolveTemplate(
      (typeof providerRecord.startUrl === "string"
        ? providerRecord.startUrl
        : apiBase
          ? `${apiBase}/auth/${providerName}`
          : oauthStart?.replace("{provider}", providerName) ??
            `/auth/${providerName}`) as string,
      {
        ...templateContext,
        provider: providerName,
      },
      templateOptions,
    );

    return {
      providerName,
      providerRecord,
      label,
      description,
      url,
    };
  });

  useEffect(() => {
    if (
      !hasProviders ||
      providerMode !== "auto" ||
      autoRedirectedRef.current ||
      resolvedProviders.length !== 1
    ) {
      return;
    }

    const provider = resolvedProviders[0]!;
    const autoRedirect =
      (provider.providerRecord["autoRedirect"] as boolean | undefined) !== false;
    if (!autoRedirect) {
      return;
    }

    autoRedirectedRef.current = true;
    window.dispatchEvent(
      new CustomEvent("snapshot:auth-provider-redirect", {
        detail: {
          provider: provider.providerName,
          url: provider.url,
        },
      }),
    );
    const form = document.createElement("form");
    form.method = "POST";
    form.action = provider.url;
    document.body.appendChild(form);
    form.submit();
  }, [hasProviders, providerMode, resolvedProviders]);

  if (!hasProviders) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const headingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-heading`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: 500,
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.heading,
  });
  const providerButtonSurface = config.slots?.provider;
  const providerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-provider-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      style: { flexShrink: 0 },
    },
    componentSurface: config.slots?.providerIcon,
  });
  const providerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-provider-label`,
    componentSurface: config.slots?.providerLabel,
  });
  const providerDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-provider-description`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      textAlign: "center",
    },
    componentSurface: config.slots?.providerDescription,
  });

  return (
    <>
      <div
        data-snapshot-component="oauth-buttons"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {resolvedHeading ? (
          <div
            data-snapshot-id={`${rootId}-heading`}
            className={headingSurface.className}
            style={headingSurface.style}
          >
            {resolvedHeading}
          </div>
        ) : null}
        {resolvedProviders.map((provider, index) => {
          const descriptionId = `sn-oauth-provider-${provider.providerName}`;

          return (
            <div
              key={provider.providerName}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--sn-spacing-2xs, 0.125rem)",
              }}
            >
              <ButtonControl
                surfaceId={`${rootId}-provider-${index}`}
                surfaceConfig={providerButtonSurface}
                variant="outline"
                size="sm"
                ariaLabel={provider.label}
                ariaDescribedBy={provider.description ? descriptionId : undefined}
                ariaHasPopup={false}
                onClick={() => {
                  const form = document.createElement("form");
                  form.method = "POST";
                  form.action = provider.url;
                  document.body.appendChild(form);
                  form.submit();
                }}
              >
                <span
                  data-snapshot-id={`${rootId}-provider-icon-${index}`}
                  className={providerIconSurface.className}
                  style={providerIconSurface.style}
                >
                  {renderIcon(
                    PROVIDER_ICON_MAP[provider.providerName] ?? "globe",
                    16,
                  )}
                </span>
                <span
                  data-snapshot-id={`${rootId}-provider-label-${index}`}
                  className={providerLabelSurface.className}
                  style={providerLabelSurface.style}
                >
                  {provider.label}
                </span>
              </ButtonControl>
              {provider.description ? (
                <div
                  id={descriptionId}
                  data-snapshot-id={`${rootId}-provider-description-${index}`}
                  className={providerDescriptionSurface.className}
                  style={providerDescriptionSurface.style}
                >
                  {provider.description}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headingSurface.scopedCss} />
      <SurfaceStyles css={providerIconSurface.scopedCss} />
      <SurfaceStyles css={providerLabelSurface.scopedCss} />
      <SurfaceStyles css={providerDescriptionSurface.scopedCss} />
    </>
  );
}
