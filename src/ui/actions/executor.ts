import { createContext, useCallback, useContext } from "react";
import { AppRegistryContext, PageRegistryContext } from "../context/providers";
import type { FromRef } from "../context/types";
import { applyTransform, getNestedValue, isFromRef } from "../context/utils";
import { useConfirmManager } from "./confirm";
import { interpolate } from "./interpolate";
import { useModalManager } from "./modal-manager";
import { useToastManager } from "./toast";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
} from "../manifest/resources";
import { useManifestRuntime, useOverlayRuntime } from "../manifest/runtime";
import { runWorkflow } from "../workflows/engine";
import type { ActionConfig, ActionExecuteFn } from "./types";
import type { AtomRegistry } from "../context/types";
import type { ApiClient } from "../../api/client";

const WORKFLOW_CANCELLED = Symbol("snapshot.workflow.cancelled");

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

function readRegistryValue(
  registry: AtomRegistry | null,
  id: string,
): unknown | undefined {
  const stateAtom = registry?.get(id);
  if (!stateAtom || !registry) {
    return undefined;
  }

  return registry.store.get(stateAtom);
}

function resolveFromRef(
  ref: FromRef,
  context: Record<string, unknown>,
  pageRegistry: AtomRegistry | null,
  appRegistry: AtomRegistry | null,
  overlayRuntime: { id?: string; kind?: string; payload?: unknown } | null,
): unknown {
  const refPath = ref.from;

  if (refPath.startsWith("overlay.")) {
    const overlayValue = {
      id: overlayRuntime?.id,
      kind: overlayRuntime?.kind,
      payload: overlayRuntime?.payload,
    };
    return applyTransform(
      getNestedValue(overlayValue, refPath.slice(8)),
      ref.transform,
      ref.transformArg,
    );
  }

  if (refPath.startsWith("global.")) {
    const cleanPath = refPath.slice(7);
    const dotIndex = cleanPath.indexOf(".");
    const targetId = dotIndex === -1 ? cleanPath : cleanPath.slice(0, dotIndex);
    const subPath = dotIndex === -1 ? "" : cleanPath.slice(dotIndex + 1);
    const value = readRegistryValue(appRegistry, targetId);
    return applyTransform(
      subPath ? getNestedValue(value, subPath) : value,
      ref.transform,
      ref.transformArg,
    );
  }

  const sourcePath = refPath.startsWith("state.") ? refPath.slice(6) : refPath;
  const dotIndex = sourcePath.indexOf(".");
  const targetId = dotIndex === -1 ? sourcePath : sourcePath.slice(0, dotIndex);
  const subPath = dotIndex === -1 ? "" : sourcePath.slice(dotIndex + 1);

  if (targetId in context) {
    const contextValue = context[targetId];
    const resolved = subPath ? getNestedValue(contextValue, subPath) : contextValue;
    return applyTransform(resolved, ref.transform, ref.transformArg);
  }

  const registry =
    pageRegistry?.get(targetId) != null
      ? pageRegistry
      : appRegistry?.get(targetId) != null
        ? appRegistry
        : pageRegistry;
  const value = readRegistryValue(registry, targetId);
  const resolved = subPath ? getNestedValue(value, subPath) : value;
  return applyTransform(resolved, ref.transform, ref.transformArg);
}

function resolveWorkflowValue(
  value: unknown,
  context: Record<string, unknown>,
  pageRegistry: AtomRegistry | null,
  appRegistry: AtomRegistry | null,
  overlayRuntime: { id?: string; kind?: string; payload?: unknown } | null,
): unknown {
  if (isFromRef(value)) {
    return resolveFromRef(
      value,
      context,
      pageRegistry,
      appRegistry,
      overlayRuntime,
    );
  }

  if (typeof value === "string") {
    return interpolate(value, context);
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      resolveWorkflowValue(item, context, pageRegistry, appRegistry),
    );
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        resolveWorkflowValue(nested, context, pageRegistry, appRegistry),
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
  const overlayRuntime = useOverlayRuntime();

  const execute: ActionExecuteFn = useCallback(
    async (
      action: ActionConfig | ActionConfig[],
      context: Record<string, unknown> = {},
    ): Promise<void> => {
      const executionContext =
        context.overlay === undefined && overlayRuntime
          ? { ...context, overlay: overlayRuntime }
          : context;
      const executeBuiltinAction = async (
        builtin: ActionConfig,
        builtinContext: Record<string, unknown>,
      ): Promise<void> => {
        switch (builtin.type) {
          case "navigate": {
            const to = String(
              resolveWorkflowValue(
                builtin.to,
                builtinContext,
                pageRegistry,
                appRegistry,
                overlayRuntime,
              ),
            );
            if (builtin.replace) {
              window.history.replaceState({}, "", to);
            } else {
              window.history.pushState({}, "", to);
            }
            window.dispatchEvent(new PopStateEvent("popstate"));
            return;
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
                      overlayRuntime,
                    ),
                  )
                : (resolveWorkflowValue(
                    builtin.endpoint,
                    builtinContext,
                    pageRegistry,
                    appRegistry,
                    overlayRuntime,
                  ) as typeof builtin.endpoint);

            const params =
              builtin.params &&
              (resolveWorkflowValue(
                builtin.params,
                builtinContext,
                pageRegistry,
                appRegistry,
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
              if (builtin.onSuccess) {
                await execute(builtin.onSuccess, { ...builtinContext, result });
              }
            } catch (error) {
              if (builtin.onError) {
                await execute(builtin.onError, { ...builtinContext, error });
              } else {
                throw error;
              }
            }
            return;
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
                    overlayRuntime,
                  )
                : undefined,
            );
            return;

          case "close-modal":
            modalManager.close(builtin.modal);
            return;

          case "refresh": {
            const targets = builtin.target.split(",").map((target) => target.trim());
            for (const target of targets) {
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
            return;
          }

          case "set-value": {
            const value = resolveWorkflowValue(
              builtin.value,
              builtinContext,
              pageRegistry,
              appRegistry,
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
            return;
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
                      overlayRuntime,
                    ),
                  )
                : (resolveWorkflowValue(
                    builtin.endpoint,
                    builtinContext,
                    pageRegistry,
                    appRegistry,
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
            return;
          }

          case "confirm": {
            const message = String(
              resolveWorkflowValue(
                builtin.message,
                builtinContext,
                pageRegistry,
                appRegistry,
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
            return;
          }

          case "toast": {
            const message = String(
              resolveWorkflowValue(
                builtin.message,
                builtinContext,
                pageRegistry,
                appRegistry,
                overlayRuntime,
              ),
            );
            toastManager.show({
              message,
              variant: builtin.variant ?? "info",
              duration: builtin.duration ?? 5000,
              action: builtin.action
                ? {
                    label: builtin.action.label,
                    onClick: () => void execute(builtin.action!.action, builtinContext),
                  }
                : undefined,
            });
            return;
          }

          case "run-workflow":
            return;
        }
      };

      try {
        await runWorkflow(action, {
          workflows: runtime?.raw.workflows,
          context: executionContext,
          resolveValue: (value, nextContext) =>
            resolveWorkflowValue(
              value,
              nextContext,
              pageRegistry,
              appRegistry,
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
      runtime?.raw.workflows,
      runtime?.resources,
      toastManager,
    ],
  );

  return execute;
}
