'use client';

import { useMemo, type CSSProperties } from "react";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveTemplate } from "../../../expressions/template";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../resolve-value";
import { OAuthButtonsBase } from "./standalone";
import type { OAuthProvider } from "./standalone";
import type { OAuthButtonsConfig } from "./types";

function titleCase(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function OAuthButtons({ config }: { config: OAuthButtonsConfig }) {
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  useSubscribe({ from: "global.locale" });
  const primitiveOptions = usePrimitiveValueOptions();
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
    Object.prototype.hasOwnProperty.call(screenOptions.labels, "providersHeading")
      ? (screenOptions.labels as Record<string, unknown>).providersHeading
      : undefined);
  const resolvedConfig = useResolveFrom({
    heading,
  });
  const resolvedHeading = resolveOptionalPrimitiveValue(resolvedConfig.heading, {
    ...primitiveOptions,
  });
  const templateContext = primitiveOptions.context;
  const templateOptions = {
    locale: primitiveOptions.locale,
    i18n: primitiveOptions.i18n,
  };

  const resolvedProviders: OAuthProvider[] = providers.map(([providerName, provider]) => {
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

    const autoRedirect = typeof providerRecord.autoRedirect === "boolean"
      ? providerRecord.autoRedirect
      : undefined;

    return { name: providerName, label, description, url, autoRedirect };
  });

  return (
    <OAuthButtonsBase
      heading={resolvedHeading}
      providers={resolvedProviders}
      providerMode={providerMode as "buttons" | "auto"}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
