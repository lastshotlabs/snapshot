'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import {
  isPasskeySupported,
  startPasskeyAuthentication,
} from "../../../manifest/passkey";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { useApiClient } from "../../../state";
import { resolvePrimitiveValue } from "../resolve-value";
import type { PasskeyButtonConfig } from "./types";

export function PasskeyButton({ config }: { config: PasskeyButtonConfig }) {
  const api = useApiClient();
  const execute = useActionExecutor();
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const [isLoading, setIsLoading] = useState(false);
  const autoPromptedRef = useRef(false);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const passkeySupported = isPasskeySupported();

  const routeId = routeRuntime?.currentRoute?.id;
  const rootId = config.id ?? "passkey-button";
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
  const screenPasskey = screenOptions?.passkey;
  const screenPasskeyConfig =
    screenPasskey && typeof screenPasskey === "object"
      ? (screenPasskey as Record<string, unknown>)
      : undefined;
  const manifestPasskeyConfig =
    manifest?.auth?.passkey && typeof manifest.auth.passkey === "object"
      ? (manifest.auth.passkey as Record<string, unknown>)
      : undefined;
  const passkeyEnabled =
    screenPasskey === false
      ? false
      : screenPasskeyConfig
        ? screenPasskeyConfig["enabled"] !== false
        : manifestPasskeyConfig
          ? manifestPasskeyConfig["enabled"] !== false
        : manifest?.auth?.passkey !== false;
  const canRender = passkeySupported && passkeyEnabled;

  const endpoints = manifest?.auth?.contract?.endpoints;
  const loginOptionsEndpoint =
    endpoints?.passkeyLoginOptions ?? "/auth/passkey/login-options";
  const loginEndpoint = endpoints?.passkeyLogin ?? "/auth/passkey/login";
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
  const label =
    (screenOptions?.labels &&
    typeof screenOptions.labels === "object" &&
    typeof (screenOptions.labels as Record<string, unknown>).passkeyButton ===
      "string"
      ? String((screenOptions.labels as Record<string, unknown>).passkeyButton)
      : config.label) ?? "Sign in with passkey";
  const resolvedConfig = useResolveFrom({
    label,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    componentSurface: config.slots?.label,
  });

  const handleClick = async () => {
    if (!api || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const optionsResult = (await api.post(loginOptionsEndpoint, {})) as {
        options?: unknown;
        passkeyToken?: string;
      };
      const assertion = await startPasskeyAuthentication(optionsResult.options ?? {});
      const result = await api.post(loginEndpoint, {
        passkeyToken: optionsResult.passkeyToken,
        credential: assertion,
      });
      if (config.onSuccess) {
        await execute(config.onSuccess as Parameters<typeof execute>[0], {
          result,
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        return;
      }

      if (config.onError) {
        await execute(config.onError as Parameters<typeof execute>[0], {
          error,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canRender) {
      return;
    }

    const autoPrompt =
      screenPasskeyConfig &&
      Object.prototype.hasOwnProperty.call(screenPasskeyConfig, "autoPrompt")
        ? screenPasskeyConfig["autoPrompt"] === true
        : manifestPasskeyConfig?.["autoPrompt"] === true;
    if (!autoPrompt || autoPromptedRef.current || isLoading) {
      return;
    }

    autoPromptedRef.current = true;
    void handleClick();
  }, [canRender, isLoading, manifestPasskeyConfig, screenPasskeyConfig]);

  if (!canRender) {
    return null;
  }

  const resolvedLabel = resolvePrimitiveValue(resolvedConfig.label, {
    context: templateContext,
    ...templateOptions,
  });

  return (
    <>
      <ButtonControl
        surfaceId={`${rootId}-root`}
        surfaceConfig={extractSurfaceConfig(config)}
        itemSurfaceConfig={config.slots?.root}
        variant="outline"
        size="sm"
        fullWidth
        onClick={() => void handleClick()}
        disabled={isLoading}
        activeStates={isLoading ? ["active"] : []}
      >
        <span
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {isLoading
            ? "Preparing passkey..."
            : resolvedLabel}
        </span>
      </ButtonControl>
      <SurfaceStyles css={labelSurface.scopedCss} />
    </>
  );
}
