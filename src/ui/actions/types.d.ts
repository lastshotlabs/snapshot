import { z } from "zod";
import { type EndpointTarget } from "../manifest/resources";
export declare const ACTION_TYPES: readonly ["navigate", "navigate-external", "api", "open-modal", "close-modal", "refresh", "set-value", "download", "copy", "emit", "submit-form", "reset-form", "set-theme", "confirm", "toast", "log", "track", "run-workflow"];
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
    body?: Record<string, unknown> | {
        from: string;
    };
    /** Query parameters. */
    params?: Record<string, unknown>;
    /** Named resources to invalidate after a successful request. */
    invalidates?: string[];
    /** Actions to execute on success. Response data available as `{result}`. */
    onSuccess?: ActionConfig | ActionConfig[];
    /** Actions to execute on error. Error available as `{error}`. */
    onError?: ActionConfig | ActionConfig[];
}
export interface NavigateExternalAction {
    type: "navigate-external";
    to: string;
    target?: "_self" | "_blank";
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
export interface CopyAction {
    type: "copy";
    text: string;
    onSuccess?: ActionConfig | ActionConfig[];
}
export interface EmitAction {
    type: "emit";
    event: string;
    payload?: unknown;
}
export interface SubmitFormAction {
    type: "submit-form";
    formId: string;
}
export interface ResetFormAction {
    type: "reset-form";
    formId: string;
}
export interface SetThemeAction {
    type: "set-theme";
    flavor?: string;
    mode?: "light" | "dark" | "system";
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
    action?: {
        label: string;
        action: ActionConfig;
    };
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
export interface LogAction {
    type: "log";
    level: "info" | "warn" | "error" | "debug";
    message: string;
    data?: Record<string, unknown>;
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
export type ActionConfig = NavigateAction | NavigateExternalAction | ApiAction | OpenModalAction | CloseModalAction | RefreshAction | SetValueAction | DownloadAction | CopyAction | EmitAction | SubmitFormAction | ResetFormAction | SetThemeAction | ConfirmAction | ToastAction | LogAction | TrackAction | RunWorkflowAction;
/**
 * The execute function returned by useActionExecutor.
 */
export type ActionExecuteFn = (action: ActionConfig | ActionConfig[], context?: Record<string, unknown>) => Promise<void>;
/** Schema for navigate action. */
export declare const navigateActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"navigate">;
    to: z.ZodString;
    replace: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    type: "navigate";
    to: string;
    replace?: boolean | undefined;
}, {
    type: "navigate";
    to: string;
    replace?: boolean | undefined;
}>;
export declare const navigateExternalActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"navigate-external">;
    to: z.ZodString;
    target: z.ZodOptional<z.ZodEnum<["_self", "_blank"]>>;
}, "strict", z.ZodTypeAny, {
    type: "navigate-external";
    to: string;
    target?: "_self" | "_blank" | undefined;
}, {
    type: "navigate-external";
    to: string;
    target?: "_self" | "_blank" | undefined;
}>;
/** Schema for open-modal action. */
export declare const openModalActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"open-modal">;
    modal: z.ZodString;
    payload: z.ZodOptional<z.ZodUnknown>;
    resultTarget: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "open-modal";
    modal: string;
    payload?: unknown;
    resultTarget?: string | undefined;
}, {
    type: "open-modal";
    modal: string;
    payload?: unknown;
    resultTarget?: string | undefined;
}>;
/** Schema for close-modal action. */
export declare const closeModalActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"close-modal">;
    modal: z.ZodOptional<z.ZodString>;
    result: z.ZodOptional<z.ZodUnknown>;
}, "strict", z.ZodTypeAny, {
    type: "close-modal";
    modal?: string | undefined;
    result?: unknown;
}, {
    type: "close-modal";
    modal?: string | undefined;
    result?: unknown;
}>;
/** Schema for refresh action. */
export declare const refreshActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"refresh">;
    target: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "refresh";
    target: string;
}, {
    type: "refresh";
    target: string;
}>;
/** Schema for set-value action. */
export declare const setValueActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"set-value">;
    target: z.ZodString;
    value: z.ZodUnknown;
}, "strict", z.ZodTypeAny, {
    type: "set-value";
    target: string;
    value?: unknown;
}, {
    type: "set-value";
    target: string;
    value?: unknown;
}>;
/** Schema for download action. */
export declare const downloadActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"download">;
    endpoint: z.ZodUnion<[z.ZodString, z.ZodObject<{
        resource: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, z.ZodTypeDef, unknown>>>;
    }, "strict", z.ZodTypeAny, {
        resource: string;
        params?: Record<string, unknown> | undefined;
    }, {
        resource: string;
        params?: Record<string, unknown> | undefined;
    }>]>;
    filename: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "download";
    endpoint: string | {
        resource: string;
        params?: Record<string, unknown> | undefined;
    };
    filename?: string | undefined;
}, {
    type: "download";
    endpoint: string | {
        resource: string;
        params?: Record<string, unknown> | undefined;
    };
    filename?: string | undefined;
}>;
export declare const copyActionSchema: z.ZodType<CopyAction>;
export declare const emitActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"emit">;
    event: z.ZodString;
    payload: z.ZodOptional<z.ZodUnknown>;
}, "strict", z.ZodTypeAny, {
    type: "emit";
    event: string;
    payload?: unknown;
}, {
    type: "emit";
    event: string;
    payload?: unknown;
}>;
export declare const submitFormActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"submit-form">;
    formId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "submit-form";
    formId: string;
}, {
    type: "submit-form";
    formId: string;
}>;
export declare const resetFormActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"reset-form">;
    formId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "reset-form";
    formId: string;
}, {
    type: "reset-form";
    formId: string;
}>;
export declare const setThemeActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"set-theme">;
    flavor: z.ZodOptional<z.ZodString>;
    mode: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
}, "strict", z.ZodTypeAny, {
    type: "set-theme";
    flavor?: string | undefined;
    mode?: "system" | "dark" | "light" | undefined;
}, {
    type: "set-theme";
    flavor?: string | undefined;
    mode?: "system" | "dark" | "light" | undefined;
}>;
/** Schema for confirm action. */
export declare const confirmActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"confirm">;
    message: z.ZodString;
    confirmLabel: z.ZodOptional<z.ZodString>;
    cancelLabel: z.ZodOptional<z.ZodString>;
    variant: z.ZodOptional<z.ZodEnum<["default", "destructive"]>>;
}, "strict", z.ZodTypeAny, {
    message: string;
    type: "confirm";
    variant?: "default" | "destructive" | undefined;
    confirmLabel?: string | undefined;
    cancelLabel?: string | undefined;
}, {
    message: string;
    type: "confirm";
    variant?: "default" | "destructive" | undefined;
    confirmLabel?: string | undefined;
    cancelLabel?: string | undefined;
}>;
/** Schema for run-workflow action. */
export declare const runWorkflowActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"run-workflow">;
    workflow: z.ZodString;
    input: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    type: "run-workflow";
    workflow: string;
    input?: Record<string, unknown> | undefined;
}, {
    type: "run-workflow";
    workflow: string;
    input?: Record<string, unknown> | undefined;
}>;
/** Schema for track action. */
export declare const trackActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"track">;
    event: z.ZodString;
    props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    type: "track";
    event: string;
    props?: Record<string, unknown> | undefined;
}, {
    type: "track";
    event: string;
    props?: Record<string, unknown> | undefined;
}>;
export declare const logActionSchema: z.ZodObject<{
    type: z.ZodLiteral<"log">;
    level: z.ZodEnum<["info", "warn", "error", "debug"]>;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    message: string;
    type: "log";
    level: "info" | "warn" | "error" | "debug";
    data?: Record<string, unknown> | undefined;
}, {
    message: string;
    type: "log";
    level: "info" | "warn" | "error" | "debug";
    data?: Record<string, unknown> | undefined;
}>;
/** Schema for api action. Uses z.lazy() for recursive onSuccess/onError. */
export declare const apiActionSchema: z.ZodType<ApiAction>;
/** Schema for toast action. Uses z.lazy() for recursive action. */
export declare const toastActionSchema: z.ZodType<ToastAction>;
/**
 * Discriminated union schema for all action types.
 * Uses z.union (not z.discriminatedUnion) because some member schemas
 * use z.lazy() for recursion, which is incompatible with
 * z.discriminatedUnion's type requirements.
 */
export declare const actionSchema: z.ZodType<ActionConfig>;
