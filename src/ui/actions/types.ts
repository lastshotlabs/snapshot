import { z } from "zod";
import {
  endpointTargetSchema,
  type EndpointTarget,
} from "../manifest/resources";

export const ACTION_TYPES = [
  "navigate",
  "api",
  "open-modal",
  "close-modal",
  "refresh",
  "set-value",
  "download",
  "confirm",
  "toast",
  "track",
  "run-workflow",
] as const;

/**
 * A reference to another component's published value.
 * Reused from context types for schema validation.
 */
const fromRefSchema = z.object({
  from: z.string(),
});

/**
 * Navigate to a route.
 */
export interface NavigateAction {
  type: "navigate";
  /** Route path. Supports `{param}` interpolation from context. */
  to: string;
  /** Replace history entry instead of pushing. */
  replace?: boolean;
}

/**
 * Call an API endpoint.
 */
export interface ApiAction {
  type: "api";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Endpoint path. Supports `{param}` interpolation. */
  endpoint: EndpointTarget;
  /** Request body. Can include `{ from: 'id' }` refs. */
  body?: Record<string, unknown> | { from: string };
  /** Query parameters. */
  params?: Record<string, unknown>;
  /** Named resources to invalidate after a successful request. */
  invalidates?: string[];
  /** Actions to execute on success. Response data available as `{result}`. */
  onSuccess?: ActionConfig | ActionConfig[];
  /** Actions to execute on error. Error available as `{error}`. */
  onError?: ActionConfig | ActionConfig[];
}

/**
 * Open a modal or drawer by id.
 */
export interface OpenModalAction {
  type: "open-modal";
  /** The id of the modal/drawer component to open. */
  modal: string;
  /** Optional runtime payload exposed to the overlay. */
  payload?: unknown;
  /** Optional state binding target that receives the overlay result on close. */
  resultTarget?: string;
}

/**
 * Close a modal or drawer.
 */
export interface CloseModalAction {
  type: "close-modal";
  /** Specific modal id. Omit to close the topmost. */
  modal?: string;
  /** Optional result written to the opener's configured result target. */
  result?: unknown;
}

/**
 * Re-fetch a component's data.
 */
export interface RefreshAction {
  type: "refresh";
  /** Component id to refresh. Can be a comma-separated list for multiple. */
  target: string;
}

/**
 * Set another component's published value.
 */
export interface SetValueAction {
  type: "set-value";
  /** Component id. */
  target: string;
  /** Value to set. Supports `{param}` interpolation when a string. */
  value: unknown;
}

/**
 * Download a file from an endpoint.
 */
export interface DownloadAction {
  type: "download";
  /** Endpoint path. Supports `{param}` interpolation. */
  endpoint: EndpointTarget;
  /** Suggested filename. */
  filename?: string;
}

/**
 * Show a confirmation dialog. Stops the chain if cancelled.
 */
export interface ConfirmAction {
  type: "confirm";
  /** Message to display. Supports `{param}` interpolation. */
  message: string;
  /** Confirm button text. Default: "Confirm". */
  confirmLabel?: string;
  /** Cancel button text. Default: "Cancel". */
  cancelLabel?: string;
  /** Visual variant. */
  variant?: "default" | "destructive";
}

/**
 * Show a toast notification.
 */
export interface ToastAction {
  type: "toast";
  /** Message. Supports `{param}` interpolation. */
  message: string;
  /** Visual variant. */
  variant?: "success" | "error" | "warning" | "info";
  /** Auto-dismiss duration in ms. Default: 5000. 0 = no auto-dismiss. */
  duration?: number;
  /** Optional action button in the toast. */
  action?: { label: string; action: ActionConfig };
}

/**
 * Track an analytics event through all manifest-configured providers.
 */
export interface TrackAction {
  type: "track";
  /** Analytics event name. Supports `{param}` interpolation. */
  event: string;
  /** Optional event properties. Supports nested `{ from: "..." }` refs. */
  props?: Record<string, unknown>;
}

/**
 * Run a named manifest workflow.
 */
export interface RunWorkflowAction {
  type: "run-workflow";
  /** Workflow id declared in manifest.workflows. */
  workflow: string;
  /** Additional context merged into the workflow run. */
  input?: Record<string, unknown>;
}

/**
 * All possible action configs. Discriminated union on `type`.
 */
export type ActionConfig =
  | NavigateAction
  | ApiAction
  | OpenModalAction
  | CloseModalAction
  | RefreshAction
  | SetValueAction
  | DownloadAction
  | ConfirmAction
  | ToastAction
  | TrackAction
  | RunWorkflowAction;

/**
 * The execute function returned by useActionExecutor.
 */
export type ActionExecuteFn = (
  action: ActionConfig | ActionConfig[],
  context?: Record<string, unknown>,
) => Promise<void>;

// --- Zod Schemas ---
// Because ApiAction and ToastAction have recursive references to ActionConfig,
// all schemas that participate in the recursion use z.lazy().

/** Schema for navigate action. */
export const navigateActionSchema = z
  .object({
    type: z.literal("navigate"),
    to: z.string(),
    replace: z.boolean().optional(),
  })
  .strict();

/** Schema for open-modal action. */
export const openModalActionSchema = z
  .object({
    type: z.literal("open-modal"),
    modal: z.string(),
    payload: z.unknown().optional(),
    resultTarget: z.string().optional(),
  })
  .strict();

/** Schema for close-modal action. */
export const closeModalActionSchema = z
  .object({
    type: z.literal("close-modal"),
    modal: z.string().optional(),
    result: z.unknown().optional(),
  })
  .strict();

/** Schema for refresh action. */
export const refreshActionSchema = z
  .object({
    type: z.literal("refresh"),
    target: z.string(),
  })
  .strict();

/** Schema for set-value action. */
export const setValueActionSchema = z
  .object({
    type: z.literal("set-value"),
    target: z.string(),
    value: z.unknown(),
  })
  .strict();

/** Schema for download action. */
export const downloadActionSchema = z
  .object({
    type: z.literal("download"),
    endpoint: endpointTargetSchema,
    filename: z.string().optional(),
  })
  .strict();

/** Schema for confirm action. */
export const confirmActionSchema = z
  .object({
    type: z.literal("confirm"),
    message: z.string(),
    confirmLabel: z.string().optional(),
    cancelLabel: z.string().optional(),
    variant: z.enum(["default", "destructive"]).optional(),
  })
  .strict();

/** Schema for run-workflow action. */
export const runWorkflowActionSchema = z
  .object({
    type: z.literal("run-workflow"),
    workflow: z.string().min(1),
    input: z.record(z.unknown()).optional(),
  })
  .strict();

/**
 * Builds the api action schema. Separated into a function because it
 * references actionSchema recursively via z.lazy().
 */
function buildApiActionSchema(): z.ZodType<ApiAction> {
  return z
    .object({
      type: z.literal("api"),
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
      endpoint: endpointTargetSchema,
      body: z.union([z.record(z.unknown()), fromRefSchema]).optional(),
      params: z.record(z.unknown()).optional(),
      invalidates: z.array(z.string().min(1)).optional(),
      onSuccess: z
        .union([
          z.lazy(() => actionSchema),
          z.array(z.lazy(() => actionSchema)),
        ])
        .optional(),
      onError: z
        .union([
          z.lazy(() => actionSchema),
          z.array(z.lazy(() => actionSchema)),
        ])
        .optional(),
    })
    .strict();
}

/**
 * Builds the toast action schema. Separated into a function because it
 * references actionSchema recursively via z.lazy().
 */
function buildToastActionSchema(): z.ZodType<ToastAction> {
  return z
    .object({
      type: z.literal("toast"),
      message: z.string(),
      variant: z.enum(["success", "error", "warning", "info"]).optional(),
      duration: z.number().optional(),
      action: z
        .object({
          label: z.string(),
          action: z.lazy(() => actionSchema),
        })
        .optional(),
    })
    .strict();
}

/** Schema for track action. */
export const trackActionSchema = z
  .object({
    type: z.literal("track"),
    event: z.string().min(1),
    props: z.record(z.unknown()).optional(),
  })
  .strict();

/** Schema for api action. Uses z.lazy() for recursive onSuccess/onError. */
export const apiActionSchema: z.ZodType<ApiAction> = buildApiActionSchema();

/** Schema for toast action. Uses z.lazy() for recursive action. */
export const toastActionSchema: z.ZodType<ToastAction> =
  buildToastActionSchema();

/**
 * Discriminated union schema for all action types.
 * Uses z.union (not z.discriminatedUnion) because some member schemas
 * use z.lazy() for recursion, which is incompatible with
 * z.discriminatedUnion's type requirements.
 */
export const actionSchema: z.ZodType<ActionConfig> = z.lazy(() =>
  z.union([
    navigateActionSchema,
    openModalActionSchema,
    closeModalActionSchema,
    refreshActionSchema,
    setValueActionSchema,
    downloadActionSchema,
    confirmActionSchema,
    apiActionSchema,
    toastActionSchema,
    trackActionSchema,
    runWorkflowActionSchema,
  ]),
) as z.ZodType<ActionConfig>;
