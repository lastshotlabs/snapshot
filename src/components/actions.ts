import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ActionRef } from "./types";

// ── Action context ───────────────────────────────────────────────────────────

/**
 * Runtime context available to action executors.
 * Provided by the rendering layer — components don't construct this.
 */
export interface ActionContext {
  api: ApiClient;
  queryClient: QueryClient;
  navigate: (to: string) => void;
  openModal: (id: string, content?: Record<string, unknown>) => void;
  closeModal: (id: string) => void;
  setPageValue: (id: string, value: unknown) => void;
  getPageValue: (id: string) => unknown;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

// ── Action types ─────────────────────────────────────────────────────────────

export interface NavigateAction extends ActionRef {
  action: "navigate";
  to: string;
}

export interface ApiAction extends ActionRef {
  action: "api";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body?: unknown;
  onSuccess?: ActionRef;
  onError?: ActionRef;
}

export interface OpenModalAction extends ActionRef {
  action: "open-modal";
  modalId: string;
  content?: Record<string, unknown>;
}

export interface CloseModalAction extends ActionRef {
  action: "close-modal";
  modalId: string;
}

export interface RefreshAction extends ActionRef {
  action: "refresh";
  target: string;
}

export interface SetValueAction extends ActionRef {
  action: "set-value";
  target: string;
  value: unknown;
}

export interface DownloadAction extends ActionRef {
  action: "download";
  endpoint: string;
  filename?: string;
}

export interface ConfirmAction extends ActionRef {
  action: "confirm";
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: ActionRef;
  onCancel?: ActionRef;
}

export interface ToastAction extends ActionRef {
  action: "toast";
  message: string;
  type?: "success" | "error" | "info";
}

export type KnownAction =
  | NavigateAction
  | ApiAction
  | OpenModalAction
  | CloseModalAction
  | RefreshAction
  | SetValueAction
  | DownloadAction
  | ConfirmAction
  | ToastAction;

// ── Value interpolation ──────────────────────────────────────────────────────

/**
 * Resolves `{from:component-id}` references in action field values.
 * Used for dynamic endpoints like `/api/users/{from:selected-user}`.
 */
function interpolateValue(value: unknown, ctx: ActionContext): unknown {
  if (typeof value !== "string") return value;

  return value.replace(/\{from:([^}]+)\}/g, (_match, id: string) => {
    const resolved = ctx.getPageValue(id);
    return resolved != null ? String(resolved) : "";
  });
}

// ── Action executor ──────────────────────────────────────────────────────────

/**
 * Executes an action from the fixed vocabulary.
 *
 * Actions are declarative — they describe what should happen, not how.
 * The executor maps each action type to its implementation using the provided context.
 *
 * Actions can compose: a `confirm` action contains an `onConfirm` action
 * that gets executed recursively on confirmation.
 */
export async function executeAction(action: ActionRef, ctx: ActionContext): Promise<void> {
  switch (action.action) {
    case "navigate": {
      const { to } = action as NavigateAction;
      ctx.navigate(interpolateValue(to, ctx) as string);
      break;
    }

    case "api": {
      const { method, endpoint, body, onSuccess, onError } = action as ApiAction;
      const resolvedEndpoint = interpolateValue(endpoint, ctx) as string;
      try {
        switch (method) {
          case "GET":
            await ctx.api.get(resolvedEndpoint);
            break;
          case "POST":
            await ctx.api.post(resolvedEndpoint, body);
            break;
          case "PUT":
            await ctx.api.put(resolvedEndpoint, body);
            break;
          case "PATCH":
            await ctx.api.patch(resolvedEndpoint, body);
            break;
          case "DELETE":
            await ctx.api.delete(resolvedEndpoint, body);
            break;
        }
        if (onSuccess) await executeAction(onSuccess, ctx);
      } catch {
        if (onError) await executeAction(onError, ctx);
      }
      break;
    }

    case "open-modal": {
      const { modalId, content } = action as OpenModalAction;
      ctx.openModal(modalId, content);
      break;
    }

    case "close-modal": {
      const { modalId } = action as CloseModalAction;
      ctx.closeModal(modalId);
      break;
    }

    case "refresh": {
      const { target } = action as RefreshAction;
      // Invalidate queries by component ID prefix.
      // useDataSource keys as ["data-source", componentId, method, path] when id is present.
      ctx.queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "data-source" && key[1] === target;
        },
      });
      break;
    }

    case "set-value": {
      const { target, value } = action as SetValueAction;
      ctx.setPageValue(target, value);
      break;
    }

    case "download": {
      const { endpoint, filename } = action as DownloadAction;
      const resolvedEndpoint = interpolateValue(endpoint, ctx) as string;
      const response = await fetch(resolvedEndpoint);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename ?? "download";
      a.click();
      URL.revokeObjectURL(url);
      break;
    }

    case "confirm": {
      const { message, onConfirm, onCancel } = action as ConfirmAction;
      const confirmed = window.confirm(message);
      if (confirmed) {
        await executeAction(onConfirm, ctx);
      } else if (onCancel) {
        await executeAction(onCancel, ctx);
      }
      break;
    }

    case "toast": {
      const { message, type } = action as ToastAction;
      ctx.showToast(message, type);
      break;
    }

    default:
      console.warn(`[snapshot] Unknown action type: "${action.action}"`);
  }
}
