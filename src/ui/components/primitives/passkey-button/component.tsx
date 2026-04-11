'use client';

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { SnapshotApiContext, useActionExecutor } from "../../../actions/executor";
import { startPasskeyAuthentication, isPasskeySupported } from "../../../manifest/passkey";
import { useManifestRuntime } from "../../../manifest/runtime";
import { useRouteRuntime } from "../../../manifest/runtime";
import { resolveTemplate } from "../../../expressions/template";

export interface PasskeyButtonConfig {
  label?: string;
  onSuccess?: unknown[];
}

export function PasskeyButton({ config }: { config: PasskeyButtonConfig }) {
  const api = useContext(SnapshotApiContext);
  const execute = useActionExecutor();
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const [isLoading, setIsLoading] = useState(false);
  const autoPromptedRef = useRef(false);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);

  if (!isPasskeySupported()) {
    return null;
  }

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
  const screenPasskeyConfig = screenPasskey && typeof screenPasskey === "object"
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
  if (!passkeyEnabled) {
    return null;
  }

  const endpoints = manifest?.auth?.contract?.endpoints;
  const loginOptionsEndpoint = endpoints?.passkeyLoginOptions ?? "/auth/passkey/login-options";
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
      if (
        error instanceof DOMException &&
        error.name === "NotAllowedError"
      ) {
        return;
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const autoPrompt =
      screenPasskeyConfig?.["autoPrompt"] === true ||
      manifestPasskeyConfig?.["autoPrompt"] === true;
    if (!autoPrompt || autoPromptedRef.current || isLoading) {
      return;
    }

    autoPromptedRef.current = true;
    void handleClick();
  }, [isLoading, manifestPasskeyConfig, screenPasskeyConfig]);

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        border: "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
        background: "var(--sn-color-secondary, var(--sn-color-card))",
        color:
          "var(--sn-color-secondary-foreground, var(--sn-color-foreground))",
        cursor: isLoading ? "progress" : "pointer",
        font: "inherit",
      }}
    >
      {isLoading
        ? "Preparing passkey..."
        : resolveTemplate(label, templateContext, templateOptions)}
    </button>
  );
}
