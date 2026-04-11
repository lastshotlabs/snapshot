'use client';

import { useEffect, useMemo, useRef } from "react";
import { useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime } from "../../../manifest/runtime";
import { useRouteRuntime } from "../../../manifest/runtime";
import { useActionExecutor } from "../../../actions/executor";
import { resolveTemplate } from "../../../expressions/template";
import { renderIcon } from "../../../icons/render";

const PROVIDER_ICON_MAP: Record<string, string> = {
  google: "mail",
  github: "globe",
  microsoft: "globe",
  apple: "globe",
  facebook: "globe",
  discord: "globe",
};

export interface OAuthButtonsConfig {
  heading?: string;
  onSuccess?: unknown[];
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function OAuthButtons({ config }: { config: OAuthButtonsConfig }) {
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const execute = useActionExecutor();
  const autoRedirectedRef = useRef(false);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const routeId = routeRuntime?.currentRoute?.id;
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

  if (providers.length === 0) {
    return null;
  }

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
        : oauthStart?.replace("{provider}", providerName) ??
          `/auth/${providerName}/start`) as string,
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
      providerMode !== "auto" ||
      autoRedirectedRef.current ||
      resolvedProviders.length !== 1
    ) {
      return;
    }

    const provider = resolvedProviders[0]!;
    const autoRedirect =
      (provider.providerRecord["autoRedirect"] as boolean | undefined) !== false ||
      providerMode === "auto";
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
    void execute({
      type: "navigate-external",
      to: provider.url,
    } as never);
  }, [execute, providerMode, resolvedProviders]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-sm, 0.5rem)",
      }}
    >
      {heading ? (
        <div
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-medium, 500)",
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          {resolveTemplate(heading, templateContext, templateOptions)}
        </div>
      ) : null}
      {resolvedProviders.map((provider) => {
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
            <button
              type="button"
              aria-describedby={provider.description ? descriptionId : undefined}
              onClick={() =>
                void execute({
                  type: "navigate-external",
                  to: provider.url,
                } as never)
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--sn-spacing-sm, 0.5rem)",
                padding:
                  "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
                borderRadius: "var(--sn-radius-md, 0.375rem)",
                border:
                  "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
                background: "var(--sn-color-secondary, var(--sn-color-card))",
                color:
                  "var(--sn-color-secondary-foreground, var(--sn-color-foreground))",
                font: "inherit",
                cursor: "pointer",
              }}
            >
              {renderIcon(
                PROVIDER_ICON_MAP[provider.providerName] ?? "globe",
                16,
              )}
              <span>{provider.label}</span>
            </button>
            {provider.description ? (
              <div
                id={descriptionId}
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  textAlign: "center",
                }}
              >
                {provider.description}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
