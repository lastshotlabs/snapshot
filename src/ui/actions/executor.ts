import { createContext, useCallback, useContext, useMemo } from "react";
import { AppRegistryContext, PageRegistryContext } from "../context/providers";
import { useSubscribe } from "../context/hooks";
import { isFromRef } from "../context/utils";
import { useConfirmManager } from "./confirm";
import { resolveTemplate } from "../expressions/template";
import { resolveRuntimeLocale } from "../i18n/resolve";
import { useModalManager } from "./modal-manager";
import { useToastManager } from "./toast";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
} from "../manifest/resources";
import {
  useManifestResourceCache,
  useManifestRuntime,
  useOverlayRuntime,
  useRouteRuntime,
} from "../manifest/runtime";
import { resolveFromRef } from "../context/from-ref";
import { createAnalyticsDispatcher } from "../analytics/dispatch";
import { resolveTokens } from "../tokens/resolve";
import { runWorkflow } from "../workflows/engine";
import type { AtomRegistry } from "../context/types";
import type { ApiClient } from "../../api/client";
import type { ActionConfig, ActionExecuteFn } from "./types";
import type { WorkflowDefinition, WorkflowMap } from "../workflows/types";

const WORKFLOW_CANCELLED = Symbol("snapshot.workflow.cancelled");

function dispatchPopStateEvent(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof PopStateEvent === "function") {
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }

  window.dispatchEvent(new Event("popstate"));
}

export const SnapshotApiContext = createContext<ApiClient | null>(null);
SnapshotApiContext.displayName = "SnapshotApiContext";

function resolveRegistry(
  target: string,
  pageRegistry: AtomRegistry | null,
  appRegistry: AtomRegistry | null,
): { registry: AtomRegistry | null; targetId: string } {
  if (target.startsWith("global.")) {
    return {
      registry: appRegistry,
      targetId: target.slice(7),
    };
  }

  if (target.startsWith("state.")) {
    const targetId = target.slice(6);
    if (pageRegistry?.get(targetId)) {
      return { registry: pageRegistry, targetId };
    }
    if (appRegistry?.get(targetId)) {
      return { registry: appRegistry, targetId };
    }
    return {
      registry: pageRegistry ?? appRegistry,
      targetId,
    };
  }

  if (pageRegistry?.get(target)) {
    return { registry: pageRegistry, targetId: target };
  }
  if (appRegistry?.get(target)) {
    return { registry: appRegistry, targetId: target };
  }

  return {
    registry: pageRegistry,
    targetId: target,
  };
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function normalizeWorkflowMap(
  workflows: Record<string, unknown> | undefined,
): WorkflowMap | undefined {
  if (!workflows) {
    return undefined;
  }

  const result: WorkflowMap = {};
  for (const [name, definition] of Object.entries(workflows)) {
    if (name === "actions") {
      continue;
    }

    result[name] = definition as WorkflowDefinition;
  }

  return result;
}

function resolveWorkflowValue(
  value: unknown,
  context: Record<string, unknown>,
  pageRegistry: AtomRegistry | null,
  appRegistry: AtomRegistry | null,
  locale: string | undefined,
  manifestRuntime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: {
    currentPath?: string;
    currentRoute?: { id?: string; path?: string } | null;
    params?: Record<string, string>;
    query?: Record<string, string>;
  } | null,
  overlayRuntime: {
    id?: string;
    kind?: string;
    payload?: unknown;
    result?: unknown;
  } | null,
): unknown {
  if (isFromRef(value)) {
    return resolveFromRef(
      value,
      {
        context,
        pageRegistry,
        appRegistry,
        route: {
          id: routeRuntime?.currentRoute?.id,
          path: routeRuntime?.currentPath,
          pattern: routeRuntime?.currentRoute?.path,
          params: routeRuntime?.params,
          query: routeRuntime?.query,
        },
        overlay: overlayRuntime,
        manifest: manifestRuntime,
      },
    );
  }

  if (typeof value === "string") {
    return resolveTemplate(
      value,
      {
        ...context,
        app: manifestRuntime?.app ?? {},
        auth: manifestRuntime?.auth ?? {},
        route: {
          id: routeRuntime?.currentRoute?.id,
          path: routeRuntime?.currentPath,
          pattern: routeRuntime?.currentRoute?.path,
          params: routeRuntime?.params,
          query: routeRuntime?.query,
        },
      },
      {
        locale,
        i18n: manifestRuntime?.raw.i18n,
      },
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      resolveWorkflowValue(
        item,
        context,
        pageRegistry,
        appRegistry,
        locale,
        manifestRuntime,
        routeRuntime,
        overlayRuntime,
      ),
    );
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        resolveWorkflowValue(
          nested,
          context,
          pageRegistry,
          appRegistry,
          locale,
          manifestRuntime,
          routeRuntime,
          overlayRuntime,
        ),
      ]),
    );
  }

  return value;
}

export function useActionExecutor(): ActionExecuteFn {
  const api = useContext(SnapshotApiContext);
  const pageRegistry = useContext(PageRegistryContext);
  const appRegistry = useContext(AppRegistryContext);
  const modalManager = useModalManager();
  const toastManager = useToastManager();
  const confirmManager = useConfirmManager();
  const runtime = useManifestRuntime();
  const analyticsDispatcher = useMemo(
    () => createAnalyticsDispatcher(runtime?.analytics),
    [runtime?.analytics],
  );
  const resourceCache = useManifestResourceCache();
  const routeRuntime = useRouteRuntime();
  const overlayRuntime = useOverlayRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(
    runtime?.raw.i18n,
    localeState,
  );

  const execute: ActionExecuteFn = useCallback(
    async (
      action: ActionConfig | ActionConfig[],
      context: Record<string, unknown> = {},
    ): Promise<void> => {
      const executionContext = {
        ...context,
        ...(context.route === undefined && routeRuntime
          ? {
              route: {
                id: routeRuntime.currentRoute?.id,
                path: routeRuntime.currentPath,
                pattern: routeRuntime.currentRoute?.path,
                params: routeRuntime.params,
                query: routeRuntime.query,
              },
            }
          : null),
        ...(context.params === undefined && routeRuntime
          ? { params: routeRuntime.params }
          : null),
        ...(context.overlay === undefined && overlayRuntime
          ? { overlay: overlayRuntime }
          : null),
      };
      const executeBuiltinAction = async (
        builtin: ActionConfig,
        builtinContext: Record<string, unknown>,
      ): Promise<unknown> => {
        switch (builtin.type) {
          case "navigate": {
            const to = String(
              resolveWorkflowValue(
                builtin.to,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            if (builtin.replace) {
              window.history.replaceState({}, "", to);
            } else {
              window.history.pushState({}, "", to);
            }
            dispatchPopStateEvent();
            return to;
          }

          case "navigate-external": {
            const to = String(
              resolveWorkflowValue(
                builtin.to,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            if (builtin.target === "_blank") {
              window.open(to, "_blank", "noopener");
            } else {
              window.location.assign(to);
            }
            return to;
          }

          case "api": {
            if (!api) {
              throw new Error(
                "useActionExecutor: SnapshotApiContext not provided. " +
                  "Wrap your app in <SnapshotApiContext.Provider value={apiClient}>.",
              );
            }

            const target =
              typeof builtin.endpoint === "string"
                ? String(
                    resolveWorkflowValue(
                      builtin.endpoint,
                      builtinContext,
                      pageRegistry,
                      appRegistry,
                      activeLocale,
                      runtime,
                      routeRuntime,
                      overlayRuntime,
                    ),
                  )
                : (resolveWorkflowValue(
                    builtin.endpoint,
                    builtinContext,
                    pageRegistry,
                    appRegistry,
                    activeLocale,
                    runtime,
                    routeRuntime,
                    overlayRuntime,
                  ) as typeof builtin.endpoint);

            const params =
              builtin.params &&
              (resolveWorkflowValue(
                builtin.params,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ) as Record<string, unknown>);

            const request = resolveEndpointTarget(
              target,
              runtime?.resources,
              typeof target === "string"
                ? params
                : { ...(target.params ?? {}), ...(params ?? {}) },
              builtin.method,
            );
            const endpoint = buildRequestUrl(request.endpoint, request.params);
            const body =
              builtin.body &&
              resolveWorkflowValue(
                builtin.body,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              );

            try {
              let result: unknown;
              switch (request.method) {
                case "GET":
                  result = await api.get(endpoint);
                  break;
                case "POST":
                  result = await api.post(endpoint, body);
                  break;
                case "PUT":
                  result = await api.put(endpoint, body);
                  break;
                case "PATCH":
                  result = await api.patch(endpoint, body);
                  break;
                case "DELETE":
                  result = await api.delete(endpoint, body);
                  break;
              }
              const configuredInvalidations = new Set<string>();
              for (const targetName of builtin.invalidates ?? []) {
                configuredInvalidations.add(targetName);
              }
              if (isResourceRef(target)) {
                for (const invalidation of runtime?.resources?.[target.resource]
                  ?.invalidates ?? []) {
                  if (typeof invalidation === "string") {
                    configuredInvalidations.add(invalidation);
                    continue;
                  }

                  resourceCache?.invalidateQueryKey(invalidation.key);
                }
              }
              for (const resourceName of configuredInvalidations) {
                resourceCache?.invalidateResource(resourceName);
              }
              if (builtin.onSuccess) {
                await execute(builtin.onSuccess, { ...builtinContext, result });
              }
              return result;
            } catch (error) {
              if (builtin.onError) {
                await execute(builtin.onError, { ...builtinContext, error });
              } else {
                throw error;
              }
              return undefined;
            }
          }

          case "open-modal":
            modalManager.open(
              builtin.modal,
              builtin.payload !== undefined
                ? resolveWorkflowValue(
                    builtin.payload,
                    builtinContext,
                    pageRegistry,
                    appRegistry,
                    activeLocale,
                    runtime,
                    routeRuntime,
                    overlayRuntime,
                  )
                : undefined,
              builtin.resultTarget,
            );
            return builtin.payload;

          case "close-modal": {
            const overlayId =
              builtin.modal ??
              modalManager.stack[modalManager.stack.length - 1];
            const resultTarget = overlayId
              ? modalManager.getResultTarget(overlayId)
              : undefined;
            const resolvedResult =
              builtin.result !== undefined
                ? resolveWorkflowValue(
                    builtin.result,
                    builtinContext,
                    pageRegistry,
                    appRegistry,
                    activeLocale,
                    runtime,
                    routeRuntime,
                    overlayRuntime,
                  )
                : undefined;
            if (resultTarget && builtin.result !== undefined) {
              const { registry, targetId } = resolveRegistry(
                resultTarget,
                pageRegistry,
                appRegistry,
              );
              if (registry) {
                const targetAtom = registry.register(targetId);
                registry.store.set(targetAtom, resolvedResult);
              }
            }
            modalManager.close(overlayId, resolvedResult);
            return resolvedResult;
          }

          case "refresh": {
            const targets = builtin.target
              .split(",")
              .map((target) => target.trim());
            for (const target of targets) {
              if (target.startsWith("resource:")) {
                const resourceName = target.slice(9);
                if (resourceName && runtime?.resources?.[resourceName]) {
                  resourceCache?.invalidateResource(resourceName);
                }
                continue;
              }
              const { registry } = resolveRegistry(
                `__refresh_${target}`,
                pageRegistry,
                appRegistry,
              );
              if (registry) {
                const refreshAtom = registry.register(`__refresh_${target}`);
                registry.store.set(refreshAtom, Date.now());
              }
            }
            return builtin.target;
          }

          case "set-value": {
            const value = resolveWorkflowValue(
              builtin.value,
              builtinContext,
              pageRegistry,
              appRegistry,
              activeLocale,
              runtime,
              routeRuntime,
              overlayRuntime,
            );
            const { registry, targetId } = resolveRegistry(
              builtin.target,
              pageRegistry,
              appRegistry,
            );
            if (registry) {
              const targetAtom = registry.register(targetId);
              registry.store.set(targetAtom, value);
            }
            return value;
          }

          case "download": {
            if (!api) {
              throw new Error(
                "useActionExecutor: SnapshotApiContext not provided for download action.",
              );
            }

            const target =
              typeof builtin.endpoint === "string"
                ? String(
                    resolveWorkflowValue(
                      builtin.endpoint,
                      builtinContext,
                      pageRegistry,
                      appRegistry,
                      activeLocale,
                      runtime,
                      routeRuntime,
                      overlayRuntime,
                    ),
                  )
                : (resolveWorkflowValue(
                    builtin.endpoint,
                    builtinContext,
                    pageRegistry,
                    appRegistry,
                    activeLocale,
                    runtime,
                    routeRuntime,
                    overlayRuntime,
                  ) as typeof builtin.endpoint);

            const request = resolveEndpointTarget(
              target,
              runtime?.resources,
              isResourceRef(target) ? target.params : undefined,
            );
            const endpoint = buildRequestUrl(request.endpoint, request.params);
            const blob = await api.get<Blob>(endpoint);
            triggerBrowserDownload(blob, builtin.filename ?? "download");
            return blob;
          }

          case "copy": {
            const text = String(
              resolveWorkflowValue(
                builtin.text,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            await navigator.clipboard.writeText(text);
            if (builtin.onSuccess) {
              await execute(builtin.onSuccess, { ...builtinContext, text });
            }
            return text;
          }

          case "emit": {
            const eventName = String(
              resolveWorkflowValue(
                builtin.event,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            window.dispatchEvent(
              new CustomEvent(`snapshot:${eventName}`, {
                detail: resolveWorkflowValue(
                  builtin.payload,
                  builtinContext,
                  pageRegistry,
                  appRegistry,
                  activeLocale,
                  runtime,
                  routeRuntime,
                  overlayRuntime,
                ),
              }),
            );
            return eventName;
          }

          case "submit-form":
            window.dispatchEvent(
              new CustomEvent("snapshot:submit-form", {
                detail: { formId: builtin.formId },
              }),
            );
            return builtin.formId;

          case "reset-form":
            window.dispatchEvent(
              new CustomEvent("snapshot:reset-form", {
                detail: { formId: builtin.formId },
              }),
            );
            return builtin.formId;

          case "set-theme": {
            const nextTheme = {
              ...(runtime?.theme ?? {}),
              ...(builtin.flavor ? { flavor: builtin.flavor } : null),
            };
            const styleEl = document.getElementById(
              "snapshot-tokens",
            ) as HTMLStyleElement | null;
            if (styleEl) {
              styleEl.textContent = resolveTokens(nextTheme);
            }
            if (builtin.mode) {
              const root = document.documentElement;
              if (builtin.mode === "dark") {
                root.classList.add("dark");
              } else if (builtin.mode === "light") {
                root.classList.remove("dark");
              } else {
                const dark = window.matchMedia(
                  "(prefers-color-scheme: dark)",
                ).matches;
                root.classList.toggle("dark", dark);
              }
            }
            return nextTheme;
          }

          case "confirm": {
            const message = String(
              resolveWorkflowValue(
                builtin.message,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            const confirmed = await confirmManager.show({
              message,
              confirmLabel: builtin.confirmLabel,
              cancelLabel: builtin.cancelLabel,
              variant: builtin.variant,
            });
            if (!confirmed) {
              throw WORKFLOW_CANCELLED;
            }
            return true;
          }

          case "toast": {
            const message = String(
              resolveWorkflowValue(
                builtin.message,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            toastManager.show({
              message,
              variant: builtin.variant,
              duration: builtin.duration,
              action: builtin.action
                ? {
                    label: builtin.action.label,
                    onClick: () =>
                      void execute(builtin.action!.action, builtinContext),
                  }
                : undefined,
            });
            return message;
          }

          case "track": {
            const event = String(
              resolveWorkflowValue(
                builtin.event,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            const props = builtin.props
              ? (resolveWorkflowValue(
                  builtin.props,
                  builtinContext,
                  pageRegistry,
                  appRegistry,
                  activeLocale,
                  runtime,
                  routeRuntime,
                  overlayRuntime,
                ) as Record<string, unknown>)
              : undefined;
            await analyticsDispatcher.track(event, props);
            return event;
          }

          case "log": {
            const message = String(
              resolveWorkflowValue(
                builtin.message,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              ),
            );
            const data = builtin.data
              ? (resolveWorkflowValue(
                  builtin.data,
                  builtinContext,
                  pageRegistry,
                  appRegistry,
                  activeLocale,
                  runtime,
                  routeRuntime,
                  overlayRuntime,
                ) as Record<string, unknown>)
              : undefined;
            const auditSink = (runtime?.raw as { observability?: { audit?: { sink?: string } } })
              ?.observability?.audit?.sink;
            if (auditSink && api) {
              void api.post(auditSink, {
                level: builtin.level,
                message,
                data,
                timestamp: new Date().toISOString(),
                route: routeRuntime?.currentPath,
              });
            }
            const logger =
              builtin.level === "debug" ? console.debug : console[builtin.level];
            logger?.(message, data);
            return message;
          }

          case "run-workflow":
            return;
        }
      };

      try {
        await runWorkflow(action, {
          workflows: normalizeWorkflowMap(runtime?.raw.workflows),
          context: executionContext,
          resolveValue: (value, nextContext) =>
            resolveWorkflowValue(
              value,
              nextContext,
              pageRegistry,
              appRegistry,
              activeLocale,
              runtime,
              routeRuntime,
              overlayRuntime,
            ),
          executeAction: executeBuiltinAction,
        });
      } catch (error) {
        if (error === WORKFLOW_CANCELLED) {
          return;
        }
        throw error;
      }
    },
    [
      api,
      appRegistry,
      confirmManager,
      modalManager,
      pageRegistry,
      analyticsDispatcher,
      activeLocale,
      overlayRuntime,
      resourceCache,
      routeRuntime,
      toastManager,
      runtime,
    ],
  );

  return execute;
}
