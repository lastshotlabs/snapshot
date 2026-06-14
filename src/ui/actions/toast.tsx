import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SurfaceStyles } from "../components/_base/surface-styles";
import { resolveSurfacePresentation } from "../components/_base/style-surfaces";
import { ButtonControl } from "../components/forms/button";
import type { ActionConfig } from "./types";

type ToastVariant = "success" | "error" | "warning" | "info";
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface ToastUndoConfig {
  label: string;
  action: ActionConfig;
  duration: number;
}

/** Resolved toast entry stored in the runtime queue. */
export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  icon?: string;
  color?: string;
  action?: { label: string; onClick: () => void };
  undo?: ToastUndoConfig;
}

/** User-facing toast options accepted by the toast manager. */
export interface ShowToastOptions {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: string;
  color?: string;
  action?: { label: string; onClick: () => void };
  undo?: {
    label?: string;
    action: ActionConfig;
    duration?: number;
  };
}

export const toastQueueAtom = atom<ToastItem[]>([]);

/** Imperative API for enqueueing and dismissing transient toast messages. */
export interface ToastManager {
  show: (options: ShowToastOptions) => string;
  dismiss: (id: string) => void;
}

let toastCounter = 0;

/** Return the toast manager. */
export function useToastManager(): ToastManager {
  const [, setQueue] = useAtom(toastQueueAtom);

  const show = useCallback(
    (options: ShowToastOptions): string => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      const variant = options.variant ?? "info";
      const toast: ToastItem = {
        id,
        message: options.message,
        variant,
        duration:
          options.duration ??
          options.undo?.duration ??
          4000,
        icon: options.icon,
        color: options.color,
        action: options.action,
        undo: options.undo
          ? {
              label: options.undo.label ?? "Undo",
              action: options.undo.action,
              duration: options.undo.duration ?? 5000,
            }
          : undefined,
      };
      setQueue((currentQueue) => [...currentQueue, toast]);
      return id;
    },
    [setQueue],
  );

  const dismiss = useCallback(
    (id: string) => {
      setQueue((currentQueue) =>
        currentQueue.filter((toast) => toast.id !== id),
      );
    },
    [setQueue],
  );

  return { show, dismiss };
}

const variantStyles: Record<ToastItem["variant"], React.CSSProperties> = {
  success: {
    background: "var(--sn-color-success, #22c55e)",
    color: "var(--sn-color-success-foreground, #ffffff)",
  },
  error: {
    background: "var(--sn-color-destructive, #ef4444)",
    color: "var(--sn-color-destructive-foreground, #ffffff)",
  },
  warning: {
    background: "var(--sn-color-warning, #f59e0b)",
    color: "var(--sn-color-warning-foreground, #ffffff)",
  },
  info: {
    background: "var(--sn-color-info, #3b82f6)",
    color: "var(--sn-color-info-foreground, #ffffff)",
  },
};

function resolveToastContainerPositionStyle(position: ToastPosition): {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  transform?: string;
} {
  switch (position) {
    case "top-left":
      return {
        top: "var(--sn-spacing-md, 1rem)",
        left: "var(--sn-spacing-md, 1rem)",
      };
    case "top-center":
      return {
        top: "var(--sn-spacing-md, 1rem)",
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "top-right":
      return {
        top: "var(--sn-spacing-md, 1rem)",
        right: "var(--sn-spacing-md, 1rem)",
      };
    case "bottom-left":
      return {
        bottom: "var(--sn-spacing-md, 1rem)",
        left: "var(--sn-spacing-md, 1rem)",
      };
    case "bottom-center":
      return {
        bottom: "var(--sn-spacing-md, 1rem)",
        left: "50%",
        transform: "translateX(-50%)",
      };
    default:
      return {
        bottom: "var(--sn-spacing-md, 1rem)",
        right: "var(--sn-spacing-md, 1rem)",
      };
  }
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [remainingMs, setRemainingMs] = useState(
    toast.undo?.duration ?? toast.duration,
  );

  useEffect(() => {
    if (toast.duration === 0) {
      return;
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const timeout = toast.undo?.duration ?? toast.duration;
      const nextRemaining = Math.max(0, timeout - (Date.now() - startedAt));
      setRemainingMs(nextRemaining);
      if (nextRemaining <= 0) {
        clearInterval(timer);
        onDismiss(toast.id);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [onDismiss, toast.duration, toast.id, toast.undo?.duration]);

  const undoCountdown = useMemo(
    () => (toast.undo ? Math.max(0, Math.ceil(remainingMs / 1000)) : null),
    [remainingMs, toast.undo],
  );
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `toast-${toast.id}`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      style: {
        padding: "var(--sn-spacing-sm, 0.75rem) var(--sn-spacing-md, 1rem)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        boxShadow: "var(--sn-shadow-md, 0 2px 8px rgba(0,0,0,0.15))",
      },
    },
  });
  const messageSurface = resolveSurfacePresentation({
    surfaceId: `toast-${toast.id}-message`,
    implementationBase: {
      flex: 1,
      minWidth: 0,
    },
  });

  return (
    <>
      <div
        className={rootSurface.className}
        style={{
          ...(rootSurface.style ?? {}),
          ...variantStyles[toast.variant],
          ...(toast.color
            ? {
                backgroundColor: toast.color,
                color: "var(--sn-color-foreground, #ffffff)",
              }
            : null),
        }}
        role="status"
        aria-live="polite"
      >
        {toast.icon ? <span aria-hidden="true">{toast.icon}</span> : null}
        <span
          data-snapshot-id={`toast-${toast.id}-message`}
          className={messageSurface.className}
          style={messageSurface.style}
        >
          {toast.message}
        </span>
        {toast.action ? (
          <ButtonControl
            onClick={toast.action.onClick}
            type="button"
            variant="ghost"
            size="sm"
            style={{
              background: "transparent",
              border: "var(--sn-border-default, 1px) solid currentColor",
              color: "inherit",
            }}
          >
            {toast.action.label}
          </ButtonControl>
        ) : null}
        {toast.undo ? (
          <ButtonControl
            type="button"
            onClick={() => {
              onDismiss(toast.id);
            }}
            variant="ghost"
            size="sm"
            style={{
              background: "transparent",
              border: "var(--sn-border-default, 1px) solid currentColor",
              color: "inherit",
            }}
          >
            {toast.undo.label}{" "}
            {undoCountdown !== null ? `(${undoCountdown})` : ""}
          </ButtonControl>
        ) : null}
        <ButtonControl
          type="button"
          onClick={() => onDismiss(toast.id)}
          variant="ghost"
          size="icon"
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            width: "2rem",
            minWidth: "2rem",
            height: "2rem",
            minHeight: "2rem",
            padding: 0,
            lineHeight: "var(--sn-leading-none, 1)",
          }}
          ariaLabel="Dismiss"
        >
          x
        </ButtonControl>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={messageSurface.scopedCss} />
    </>
  );
}

/** Render the active toast queue. */
export function ToastContainer(): ReactNode {
  const [queue, setQueue] = useAtom(toastQueueAtom);
  const position: ToastPosition = "bottom-right";
  const containerSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-toasts",
    implementationBase: {
      position: "fixed",
      zIndex: "var(--sn-z-index-toast, 9999)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      style: {
        ...resolveToastContainerPositionStyle(position),
        maxWidth: "24rem",
      },
    },
  });

  if (queue.length === 0) {
    return null;
  }

  return (
    <>
      <div
        data-snapshot-toasts=""
        className={containerSurface.className}
        style={containerSurface.style}
      >
        {queue.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={(id) => {
              setQueue((currentQueue) =>
                currentQueue.filter((entry) => entry.id !== id),
              );
            }}
          />
        ))}
      </div>
      <SurfaceStyles css={containerSurface.scopedCss} />
    </>
  );
}
