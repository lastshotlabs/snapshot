import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { useCallback } from "react";
import type { ReactNode } from "react";
import { createElement } from "react";

/**
 * A pending confirmation request with a resolve callback.
 * The resolve callback is called with `true` (confirmed) or `false` (cancelled).
 */
export interface ConfirmRequest {
  /** Message to display in the confirmation dialog. */
  message: string;
  /** Confirm button text. Default: "Confirm". */
  confirmLabel?: string;
  /** Cancel button text. Default: "Cancel". */
  cancelLabel?: string;
  /** Visual variant. */
  variant?: "default" | "destructive";
  /** Callback to resolve the promise. */
  resolve: (confirmed: boolean) => void;
}

/** Options for showing a confirmation dialog (resolve is added internally). */
export type ConfirmOptions = Omit<ConfirmRequest, "resolve">;

/**
 * Atom holding the current confirm request, or null if no dialog is active.
 */
export const confirmAtom = atom<ConfirmRequest | null>(null);

/** Return type of useConfirmManager. */
export interface ConfirmManager {
  /** Show a confirmation dialog. Returns a promise that resolves to true (confirm) or false (cancel). */
  show: (options: ConfirmOptions) => Promise<boolean>;
}

/**
 * Hook to manage promise-based confirmation dialogs.
 * Only one confirmation dialog can be active at a time.
 *
 * @returns A ConfirmManager with a show method
 *
 * @example
 * ```tsx
 * const { show } = useConfirmManager()
 * const confirmed = await show({ message: 'Delete this item?' })
 * if (confirmed) { ... }
 * ```
 */
export function useConfirmManager(): ConfirmManager {
  const [, setConfirm] = useAtom(confirmAtom);

  const show = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setConfirm({ ...options, resolve });
      });
    },
    [setConfirm],
  );

  return { show };
}

/**
 * Renders the confirmation dialog when a confirm request is active.
 * Place once at the app root alongside ToastContainer.
 * Uses basic HTML + semantic token styling. Will be upgraded to
 * shadcn AlertDialog in a future phase.
 *
 * @example
 * ```tsx
 * <App>
 *   <ConfirmDialog />
 * </App>
 * ```
 */
export function ConfirmDialog(): ReactNode {
  const [request, setRequest] = useAtom(confirmAtom);

  if (!request) return null;

  const handleConfirm = () => {
    request.resolve(true);
    setRequest(null);
  };

  const handleCancel = () => {
    request.resolve(false);
    setRequest(null);
  };

  const isDestructive = request.variant === "destructive";

  return createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: "var(--sn-z-index-modal, 10000)" as unknown as number,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.5)",
      },
      "data-snapshot-confirm": true,
    },
    createElement(
      "div",
      {
        role: "alertdialog",
        "aria-modal": true,
        "aria-label": "Confirmation",
        style: {
          background: "var(--sn-color-surface, #fff)",
          color: "var(--sn-color-foreground, #111)",
          borderRadius: "var(--sn-radius-lg, 0.75rem)",
          padding: "var(--sn-spacing-lg, 1.5rem)",
          maxWidth: "var(--sn-container-sm, 28rem)",
          width: "90%",
          boxShadow: "var(--sn-shadow-lg, 0 4px 24px rgba(0, 0, 0, 0.2))",
        },
      },
      createElement(
        "p",
        {
          style: {
            margin: "0 0 var(--sn-spacing-md, 1rem) 0",
            fontSize: "var(--sn-font-size-md, 1rem)",
          },
        },
        request.message,
      ),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          },
        },
        createElement(
          "button",
          {
            onClick: handleCancel,
            type: "button",
            style: {
              padding:
                "var(--sn-spacing-xs, 0.5rem) var(--sn-spacing-md, 1rem)",
              borderRadius: "var(--sn-radius-md, 0.375rem)",
              border:
                "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
              background: "transparent",
              color: "var(--sn-color-foreground, #111)",
              cursor: "pointer",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontFamily: "inherit",
            },
          },
          request.cancelLabel ?? "Cancel",
        ),
        createElement(
          "button",
          {
            onClick: handleConfirm,
            type: "button",
            style: {
              padding:
                "var(--sn-spacing-xs, 0.5rem) var(--sn-spacing-md, 1rem)",
              borderRadius: "var(--sn-radius-md, 0.375rem)",
              border: "none",
              background: isDestructive
                ? "var(--sn-color-destructive, #ef4444)"
                : "var(--sn-color-primary, #2563eb)",
              color: isDestructive
                ? "var(--sn-color-destructive-foreground, #fff)"
                : "var(--sn-color-primary-foreground, #fff)",
              cursor: "pointer",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontFamily: "inherit",
            },
          },
          request.confirmLabel ?? "Confirm",
        ),
      ),
    ),
  );
}
