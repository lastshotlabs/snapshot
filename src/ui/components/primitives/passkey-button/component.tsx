'use client';

import { useMemo, useState, type CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import {
  isPasskeySupported,
  startPasskeyAuthentication,
} from "../../../manifest/passkey";
import { useApiClient } from "../../../state";
import { resolvePrimitiveValue, usePrimitiveValueOptions } from "../resolve-value";
import { PasskeyButtonBase } from "./standalone";
import type { PasskeyButtonConfig } from "./types";

export function PasskeyButton({ config }: { config: PasskeyButtonConfig }) {
  const api = useApiClient();
  const execute = useActionExecutor();
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  useSubscribe({ from: "global.locale" });
  const [isLoading, setIsLoading] = useState(false);
  const passkeySupported = isPasskeySupported();
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
  const label =
    (screenOptions?.labels &&
    typeof screenOptions.labels === "object" &&
    Object.prototype.hasOwnProperty.call(screenOptions.labels, "passkeyButton")
      ? (screenOptions.labels as Record<string, unknown>).passkeyButton
      : config.label) ?? "Sign in with passkey";
  const resolvedConfig = useResolveFrom({
    label,
  });

  const resolvedLabel = resolvePrimitiveValue(resolvedConfig.label, {
    ...primitiveOptions,
  });

  const autoPrompt =
    screenPasskeyConfig &&
    Object.prototype.hasOwnProperty.call(screenPasskeyConfig, "autoPrompt")
      ? screenPasskeyConfig["autoPrompt"] === true
      : manifestPasskeyConfig?.["autoPrompt"] === true;

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

  return (
    <PasskeyButtonBase
      label={resolvedLabel}
      loading={isLoading}
      visible={canRender}
      autoPrompt={autoPrompt}
      onClick={handleClick}
      id={config.id}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
