import { createContext, useCallback, useContext } from "react";
import { PageRegistryContext, AppRegistryContext } from "../context/providers";
import { interpolate } from "./interpolate";
import { useModalManager } from "./modal-manager";
import { useToastManager } from "./toast";
import { useConfirmManager } from "./confirm";
import type { ActionConfig, ActionExecuteFn } from "./types";
import type { AtomRegistry } from "../context/types";
import type { ApiClient } from "../../api/client";

/**
 * React context providing the API client instance to the action executor.
 * This must be provided by the app root (e.g., ManifestApp) so that
 * actions can call API endpoints.
 *
 * @example
 * ```tsx
 * <SnapshotApiContext.Provider value={apiClient}>
 *   <App />
 * </SnapshotApiContext.Provider>
 * ```
 */
export const SnapshotApiContext = createContext<ApiClient | null>(null);
SnapshotApiContext.displayName = "SnapshotApiContext";

/**
 * Resolve which registry a component id belongs to.
 * Page registry is checked first, then app registry.
 */
function resolveRegistry(
  target: string,
  pageRegistry: AtomRegistry | null,
  appRegistry: AtomRegistry | null,
): AtomRegistry | null {
  if (pageRegistry?.get(target)) return pageRegistry;
  if (appRegistry?.get(target)) return appRegistry;
  // Default to page registry if neither has the atom — it may be registered later
  return pageRegistry;
}

/**
 * Trigger a browser file download from a Blob.
 *
 * @param blob - The file data
 * @param filename - Suggested filename for the download
 */
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

/**
 * Hook that returns an `execute` function for dispatching actions.
 * Captures all necessary dependencies (API client, router, registries,
 * modal/toast/confirm managers) from React context.
 *
 * Actions are processed sequentially. A `confirm` action that is cancelled
 * stops the entire chain. An `api` action populates `{result}` in the
 * context for downstream actions.
 *
 * @returns An execute function that accepts a single action or an array of actions
 *
 * @example
 * ```tsx
 * function DeleteButton({ userId }: { userId: number }) {
 *   const execute = useActionExecutor()
 *
 *   return (
 *     <button onClick={() => execute([
 *       { type: 'confirm', message: 'Delete this user?' },
 *       { type: 'api', method: 'DELETE', endpoint: `/api/users/${userId}` },
 *       { type: 'toast', message: 'User deleted', variant: 'success' },
 *     ])}>
 *       Delete
 *     </button>
 *   )
 * }
 * ```
 */
export function useActionExecutor(): ActionExecuteFn {
  const api = useContext(SnapshotApiContext);
  const pageRegistry = useContext(PageRegistryContext);
  const appRegistry = useContext(AppRegistryContext);
  const modalManager = useModalManager();
  const toastManager = useToastManager();
  const confirmManager = useConfirmManager();

  // Keep refs stable — these don't change between renders
  const execute: ActionExecuteFn = useCallback(
    async (
      action: ActionConfig | ActionConfig[],
      context: Record<string, unknown> = {},
    ): Promise<void> => {
      const actions = Array.isArray(action) ? action : [action];

      for (const a of actions) {
        switch (a.type) {
          case "navigate": {
            const to = interpolate(a.to, context);
            // Use window.location for navigation. TanStack Router's useRouter()
            // can't be called conditionally, and the executor may run outside
            // a router context. This is the simplest portable approach.
            if (a.replace) {
              window.location.replace(to);
            } else {
              window.location.href = to;
            }
            break;
          }

          case "api": {
            if (!api) {
              throw new Error(
                "useActionExecutor: SnapshotApiContext not provided. " +
                  "Wrap your app in <SnapshotApiContext.Provider value={apiClient}>.",
              );
            }
            const endpoint = interpolate(a.endpoint, context);
            const body = a.body;
            try {
              let result: unknown;
              switch (a.method) {
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
              if (a.onSuccess) {
                await execute(a.onSuccess, { ...context, result });
              }
            } catch (error) {
              if (a.onError) {
                await execute(a.onError, { ...context, error });
              } else {
                throw error;
              }
            }
            break;
          }

          case "open-modal":
            modalManager.open(a.modal);
            break;

          case "close-modal":
            modalManager.close(a.modal);
            break;

          case "refresh": {
            const targets = a.target.split(",").map((t) => t.trim());
            for (const target of targets) {
              const registry = resolveRegistry(
                `__refresh_${target}`,
                pageRegistry,
                appRegistry,
              );
              if (registry) {
                // Register the refresh atom if it doesn't exist yet
                const refreshAtom = registry.register(`__refresh_${target}`);
                registry.store.set(refreshAtom, Date.now());
              }
            }
            break;
          }

          case "set-value": {
            const value =
              typeof a.value === "string"
                ? interpolate(a.value, context)
                : a.value;
            const registry = resolveRegistry(
              a.target,
              pageRegistry,
              appRegistry,
            );
            if (registry) {
              const targetAtom = registry.get(a.target);
              if (targetAtom) {
                registry.store.set(targetAtom, value);
              }
            }
            break;
          }

          case "download": {
            if (!api) {
              throw new Error(
                "useActionExecutor: SnapshotApiContext not provided for download action.",
              );
            }
            const endpoint = interpolate(a.endpoint, context);
            const blob = await api.get<Blob>(endpoint);
            triggerBrowserDownload(blob, a.filename ?? "download");
            break;
          }

          case "confirm": {
            const message = interpolate(a.message, context);
            const confirmed = await confirmManager.show({
              message,
              confirmLabel: a.confirmLabel,
              cancelLabel: a.cancelLabel,
              variant: a.variant,
            });
            if (!confirmed) return; // Stop the chain
            break;
          }

          case "toast": {
            const message = interpolate(a.message, context);
            toastManager.show({
              message,
              variant: a.variant ?? "info",
              duration: a.duration ?? 5000,
              action: a.action
                ? {
                    label: a.action.label,
                    onClick: () => void execute(a.action!.action, context),
                  }
                : undefined,
            });
            break;
          }
        }
      }
    },
    [
      api,
      pageRegistry,
      appRegistry,
      modalManager,
      toastManager,
      confirmManager,
    ],
  );

  return execute;
}
