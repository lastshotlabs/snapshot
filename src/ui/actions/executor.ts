import { useCallback, useContext, useMemo } from "react";
import { useAtomValue } from "jotai/react";
import { AppRegistryContext, PageRegistryContext } from "../context/providers";
import { useSubscribe } from "../context/hooks";
import { isFromRef } from "../context/utils";
import { useConfirmManager } from "./confirm";
import { resolveTemplateValue } from "../expressions/template";
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
import {
  buildExpressionContext,
  resolveFromRef,
} from "../context/from-ref";
import { evaluateExpression } from "../expressions/parser";
import { createAnalyticsDispatcher } from "../analytics/dispatch";
import { resolveTokens } from "../tokens/resolve";
import { runWorkflow } from "../workflows/engine";
import { debounceAction, throttleAction } from "./timing";
import { wsManagerAtom } from "../../ws/atom";
import type { AtomRegistry } from "../context/types";
import type { ActionConfig, ActionExecuteFn } from "./types";
import type { WorkflowDefinition, WorkflowMap } from "../workflows/types";
import { SnapshotApiProvider, useApiClient } from "../state";

const WORKFLOW_CANCELLED = Symbol("snapshot.workflow.cancelled");

const _warnedTemplateKeys = new Set<string>();

/**
 * In dev mode, warn when a workflow context key would be shadowed by the
 * built-in template context (e.g. `auth`, `app`, `route`).  Template strings
 * like `"{auth.me}"` resolve against a merged context where manifest config
 * keys overwrite workflow context keys of the same name.
 */
function warnTemplateShadowing(context: Record<string, unknown>): void {
  if (
    typeof process !== "undefined" &&
    process.env?.["NODE_ENV"] === "production"
  ) {
    return;
  }
  const shadowedKeys = ["auth", "app", "route"];
  for (const key of shadowedKeys) {
    if (key in context && !_warnedTemplateKeys.has(key)) {
      _warnedTemplateKeys.add(key);
      console.warn(
        `[snapshot] Workflow context key "${key}" is shadowed by the built-in ` +
          `template context. Template strings like "{${key}.foo}" will resolve ` +
          `against the manifest ${key} config, not the workflow context. ` +
          `Use a FromRef ({ from: "..." }) or rename the context key.`,
      );
    }
  }
}

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

/** Backward-compatible provider shim that writes the API client into Jotai state. */
export const SnapshotApiContext = {
  Provider: SnapshotApiProvider,
  displayName: "SnapshotApiProvider",
} as const;

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
    return resolveFromRef(value, {
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
    });
  }

  if (
    value &&
    typeof value === "object" &&
    "expr" in value &&
    typeof (value as { expr: unknown }).expr === "string"
  ) {
    return evaluateExpression(
      (value as { expr: string }).expr,
      buildExpressionContext({
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
      }),
    );
  }

  if (typeof value === "string") {
    warnTemplateShadowing(context);
    const routeContext =
      (context["route"] as Record<string, unknown> | undefined) ?? {};
    return resolveTemplateValue(
      value,
      {
        ...context,
        app: manifestRuntime?.app ?? {},
        auth: {
          ...(manifestRuntime?.raw.auth ?? {}),
          ...(manifestRuntime?.auth ?? {}),
        },
        route: {
          id: routeRuntime?.currentRoute?.id ?? routeContext["id"],
          path: routeRuntime?.currentPath ?? routeContext["path"],
          pattern: routeRuntime?.currentRoute?.path ?? routeContext["pattern"],
          params:
            routeRuntime?.params ??
            (routeContext["params"] as Record<string, string> | undefined),
          query:
            routeRuntime?.query ??
            (routeContext["query"] as Record<string, string> | undefined),
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

function getActionTimingKey(action: ActionConfig): string {
  const { debounce, throttle, ...stableAction } = action;

  switch (stableAction.type) {
    case "set-value":
      return JSON.stringify({
        type: stableAction.type,
        target: stableAction.target,
      });
    case "refresh":
      return JSON.stringify({
        type: stableAction.type,
        target: stableAction.target,
      });
    case "submit-form":
    case "reset-form":
      return JSON.stringify({
        type: stableAction.type,
        formId: stableAction.formId,
      });
    case "scroll-to":
      return JSON.stringify({
        type: stableAction.type,
        target: stableAction.target,
        behavior: stableAction.behavior,
        block: stableAction.block,
      });
    case "navigate":
      return JSON.stringify({
        type: stableAction.type,
        to: stableAction.to,
        replace: stableAction.replace,
      });
    case "navigate-external":
      return JSON.stringify({
        type: stableAction.type,
        to: stableAction.to,
        target: stableAction.target,
      });
    case "open-modal":
      return JSON.stringify({
        type: stableAction.type,
        modal: stableAction.modal,
        resultTarget: stableAction.resultTarget,
      });
    case "close-modal":
      return JSON.stringify({
        type: stableAction.type,
        modal: stableAction.modal,
      });
    case "emit":
      return JSON.stringify({
        type: stableAction.type,
        event: stableAction.event,
      });
    case "track":
      return JSON.stringify({
        type: stableAction.type,
        event: stableAction.event,
      });
    case "run-workflow":
      return JSON.stringify({
        type: stableAction.type,
        workflow: stableAction.workflow,
      });
    case "ws-send":
      return JSON.stringify({
        type: stableAction.type,
        event: stableAction.event,
      });
    default:
      return JSON.stringify(stableAction);
  }
}

/**
 * Return the action executor bound to the active runtime, registries, overlays,
 * workflows, and optional API client.
 */
export function useActionExecutor(): ActionExecuteFn {
  const api = useApiClient();
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
  const wsManager = useAtomValue(wsManagerAtom);
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(runtime?.raw.i18n, localeState);

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
        const executeBuiltinActionNow = async (): Promise<unknown> => {
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
                  "useActionExecutor: API client not provided. " +
                    "Provide it through the app state runtime.",
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
              const endpoint = buildRequestUrl(
                request.endpoint,
                request.params,
              );
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
                  for (const invalidation of runtime?.resources?.[
                    target.resource
                  ]?.invalidates ?? []) {
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
                  await execute(builtin.onSuccess, {
                    ...builtinContext,
                    result,
                  });
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
                  "useActionExecutor: API client not provided for download action.",
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
              const endpoint = buildRequestUrl(
                request.endpoint,
                request.params,
              );
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

            case "copy-to-clipboard": {
              if (
                typeof navigator === "undefined" ||
                typeof navigator.clipboard?.writeText !== "function"
              ) {
                return undefined;
              }

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
              if (builtin.toast) {
                toastManager.show({
                  message: String(
                    resolveWorkflowValue(
                      builtin.toast,
                      { ...builtinContext, text },
                      pageRegistry,
                      appRegistry,
                      activeLocale,
                      runtime,
                      routeRuntime,
                      overlayRuntime,
                    ),
                  ),
                  variant: "success",
                });
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
                window.dispatchEvent(
                  new CustomEvent("snapshot:set-theme", {
                    detail: { mode: builtin.mode },
                  }),
                );
              }
              return nextTheme;
            }

            case "confirm": {
              const title =
                builtin.title !== undefined
                  ? String(
                      resolveWorkflowValue(
                        builtin.title,
                        builtinContext,
                        pageRegistry,
                        appRegistry,
                        activeLocale,
                        runtime,
                        routeRuntime,
                        overlayRuntime,
                      ),
                    )
                  : undefined;
              const descriptionSource =
                builtin.description ?? builtin.message ?? title ?? "";
              const description = String(
                resolveWorkflowValue(
                  descriptionSource,
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
                title,
                description,
                message: description,
                confirmLabel: builtin.confirmLabel,
                cancelLabel: builtin.cancelLabel,
                variant: builtin.variant,
                requireInput: builtin.requireInput,
              });
              if (!confirmed) {
                if (builtin.onCancel) {
                  await execute(builtin.onCancel, builtinContext);
                }
                throw WORKFLOW_CANCELLED;
              }
              if (builtin.onConfirm) {
                await execute(builtin.onConfirm, builtinContext);
              }
              return true;
            }

            case "scroll-to": {
              if (typeof document === "undefined") {
                return undefined;
              }

              const target = String(
                resolveWorkflowValue(
                  builtin.target,
                  builtinContext,
                  pageRegistry,
                  appRegistry,
                  activeLocale,
                  runtime,
                  routeRuntime,
                  overlayRuntime,
                ),
              );
              const resolvedTarget = target.startsWith("#")
                ? document.querySelector(target)
                : document.querySelector(
                    `[data-snapshot-id="${target}"], [data-component-id="${target}"], #${target}`,
                  );
              resolvedTarget?.scrollIntoView({
                behavior:
                  builtin.behavior === "instant"
                    ? "auto"
                    : (builtin.behavior ?? "smooth"),
                block: builtin.block ?? "start",
              });
              return target;
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
                undo: builtin.undo
                  ? {
                      label: builtin.undo.label,
                      action: builtin.undo.action,
                      duration: builtin.undo.duration,
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
              const auditSink = (
                runtime?.raw as {
                  observability?: { audit?: { sink?: string } };
                }
              )?.observability?.audit?.sink;
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
                builtin.level === "debug"
                  ? console.debug
                  : console[builtin.level];
              logger?.(message, data);
              return message;
            }

            case "branch": {
              const matches = Boolean(
                evaluateExpression(
                  builtin.condition,
                  buildExpressionContext({
                    context: builtinContext,
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
                    manifest: runtime,
                  }),
                ),
              );
              const nextAction = matches ? builtin.then : builtin.else;
              if (nextAction) {
                await execute(nextAction, builtinContext);
              }
              return matches;
            }

            case "for-each": {
              const resolvedItems = resolveWorkflowValue(
                builtin.items,
                builtinContext,
                pageRegistry,
                appRegistry,
                activeLocale,
                runtime,
                routeRuntime,
                overlayRuntime,
              );
              const items = Array.isArray(resolvedItems) ? resolvedItems : [];

              for (let index = 0; index < items.length; index += 1) {
                await execute(builtin.action, {
                  ...builtinContext,
                  item: items[index],
                  index,
                  items,
                });
              }

              if (builtin.onComplete) {
                await execute(builtin.onComplete, builtinContext);
              }

              return items.length;
            }

            case "ws-send": {
              if (!wsManager) {
                return undefined;
              }

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
              const data =
                builtin.data === undefined
                  ? undefined
                  : (resolveWorkflowValue(
                      builtin.data,
                      builtinContext,
                      pageRegistry,
                      appRegistry,
                      activeLocale,
                      runtime,
                      routeRuntime,
                      overlayRuntime,
                    ) as Record<string, unknown>);
              wsManager.send(event, data);
              return data;
            }

            case "run-workflow":
              return;
          }
        };

        const executeWithTiming = (): Promise<unknown> => {
          const baseKey = getActionTimingKey(builtin);
          const throttled = builtin.throttle
            ? () =>
                throttleAction(
                  `${baseKey}:throttle`,
                  executeBuiltinActionNow,
                  builtin.throttle!,
                )
            : executeBuiltinActionNow;

          if (builtin.debounce) {
            return debounceAction(
              `${baseKey}:debounce`,
              throttled,
              builtin.debounce,
            );
          }

          return throttled();
        };

        return executeWithTiming();
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
      wsManager,
    ],
  );

  return execute;
}
