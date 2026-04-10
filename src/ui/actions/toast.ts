import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { useManifestRuntime } from "../manifest/runtime";

type ToastVariant = "success" | "error" | "warning" | "info";
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** A single toast notification in the queue. */
export interface ToastItem {
  /** Unique identifier for this toast. */
  id: string;
  /** The message to display. */
  message: string;
  /** Visual variant. */
  variant: ToastVariant;
  /** Auto-dismiss duration in ms. 0 means no auto-dismiss. */
  duration: number;
  /** Optional icon text configured by manifest.toast.variants. */
  icon?: string;
  /** Optional color override configured by manifest.toast.variants. */
  color?: string;
  /** Optional action button. */
  action?: { label: string; onClick: () => void };
}

/** Options for showing a toast (id is generated automatically). */
export interface ShowToastOptions {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  icon?: string;
  color?: string;
  action?: { label: string; onClick: () => void };
}

/**
 * Atom holding the current toast queue.
 * New toasts are appended; dismissed toasts are removed.
 */
export const toastQueueAtom = atom<ToastItem[]>([]);

/** Return type of useToastManager. */
export interface ToastManager {
  /** Show a new toast. Returns the generated toast id. */
  show: (options: ShowToastOptions) => string;
  /** Dismiss a specific toast by id. */
  dismiss: (id: string) => void;
}

let toastCounter = 0;

/**
 * Hook to manage the toast notification queue.
 * Toasts auto-dismiss after their duration unless duration is 0.
 *
 * @returns A ToastManager with show and dismiss methods
 *
 * @example
 * ```tsx
 * const { show, dismiss } = useToastManager()
 * show({ message: 'Saved!', variant: 'success', duration: 3000 })
 * ```
 */
export function useToastManager(): ToastManager {
  const runtime = useManifestRuntime();
  const [, setQueue] = useAtom(toastQueueAtom);
  const manifestToast = runtime?.toast;

  const show = useCallback(
    (options: ShowToastOptions): string => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      const variant = options.variant ?? "info";
      const variantDefaults = manifestToast?.variants?.[variant];
      const toast: ToastItem = {
        id,
        message: options.message,
        variant,
        duration:
          options.duration ??
          variantDefaults?.duration ??
          manifestToast?.duration ??
          4000,
        icon: options.icon ?? variantDefaults?.icon,
        color: options.color ?? variantDefaults?.color,
        action: options.action,
      };
      setQueue((prev) => [...prev, toast]);

      if (toast.duration !== 0) {
        setTimeout(() => {
          setQueue((prev) => prev.filter((t) => t.id !== id));
        }, toast.duration);
      }

      return id;
    },
    [manifestToast?.duration, manifestToast?.variants, setQueue],
  );

  const dismiss = useCallback(
    (id: string) => {
      setQueue((prev) => prev.filter((t) => t.id !== id));
    },
    [setQueue],
  );

  return { show, dismiss };
}

// --- Variant styles for toast rendering ---

const variantStyles: Record<ToastItem["variant"], string> = {
  success:
    "background: var(--sn-color-success, #22c55e); color: var(--sn-color-success-foreground, #fff);",
  error:
    "background: var(--sn-color-destructive, #ef4444); color: var(--sn-color-destructive-foreground, #fff);",
  warning:
    "background: var(--sn-color-warning, #f59e0b); color: var(--sn-color-warning-foreground, #fff);",
  info: "background: var(--sn-color-info, #3b82f6); color: var(--sn-color-info-foreground, #fff);",
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

/**
 * Renders the toast notification queue. Place once at the app root.
 * Uses basic HTML + semantic token styling. Will be upgraded to polished
 * components (shadcn/sonner) in a future phase.
 *
 * @example
 * ```tsx
 * <App>
 *   <ToastContainer />
 * </App>
 * ```
 */
export function ToastContainer(): ReactNode {
  const runtime = useManifestRuntime();
  const [queue, setQueue] = useAtom(toastQueueAtom);
  const position = runtime?.toast?.position ?? "bottom-right";

  if (queue.length === 0) return null;

  return createElement(
    "div",
    {
      style: {
        position: "fixed",
        ...resolveToastContainerPositionStyle(position),
        zIndex: "var(--sn-z-index-toast, 9999)" as unknown as number,
        display: "flex",
        flexDirection: "column" as const,
        gap: "var(--sn-spacing-sm, 0.5rem)",
        maxWidth: "24rem",
      },
      "data-snapshot-toasts": true,
    },
    ...queue.map((toast) =>
      createElement(
        "div",
        {
          key: toast.id,
          style: {
            padding: "var(--sn-spacing-sm, 0.75rem) var(--sn-spacing-md, 1rem)",
            borderRadius: "var(--sn-radius-md, 0.5rem)",
            boxShadow: "var(--sn-shadow-md, 0 2px 8px rgba(0,0,0,0.15))",
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            ...(parseCssString(variantStyles[toast.variant]) as Record<
              string,
              string
            >),
            ...(toast.color
              ? {
                  backgroundColor: toast.color,
                  color: "var(--sn-color-foreground, #fff)",
                }
              : null),
          },
          role: "status",
          "aria-live": "polite" as const,
        },
        toast.icon
          ? createElement(
              "span",
              {
                "aria-hidden": true,
              },
              toast.icon,
            )
          : null,
        createElement("span", { style: { flex: 1 } }, toast.message),
        toast.action
          ? createElement(
              "button",
              {
                onClick: toast.action.onClick,
                type: "button",
                style: {
                  background: "transparent",
                  border: "var(--sn-border-default, 1px) solid currentColor",
                  color: "inherit",
                  cursor: "pointer",
                  padding:
                    "var(--sn-spacing-2xs, 0.25rem) var(--sn-spacing-xs, 0.5rem)",
                  borderRadius: "var(--sn-radius-sm, 0.25rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                },
              },
              toast.action.label,
            )
          : null,
        createElement(
          "button",
          {
            type: "button",
            onClick: () =>
              setQueue((prev) => prev.filter((t) => t.id !== toast.id)),
            style: {
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "var(--sn-spacing-2xs, 0.25rem)",
              fontSize: "var(--sn-font-size-md, 1rem)",
              lineHeight: "var(--sn-leading-none, 1)",
            },
            "aria-label": "Dismiss",
          },
          "\u00d7",
        ),
      ),
    ),
  );
}

/** Parse a CSS string like "background: red; color: white;" into a style object. */
function parseCssString(css: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const declaration of css.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon === -1) continue;
    const prop = declaration.slice(0, colon).trim();
    const val = declaration.slice(colon + 1).trim();
    if (prop && val) {
      // Convert CSS property to camelCase for React style
      const camel = prop.replace(/-([a-z])/g, (_, c: string) =>
        c.toUpperCase(),
      );
      result[camel] = val;
    }
  }
  return result;
}
