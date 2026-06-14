import { atom } from "jotai";
import { useAtom } from "jotai/react";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SurfaceStyles } from "../components/_base/surface-styles";
import { resolveSurfacePresentation } from "../components/_base/style-surfaces";
import { ButtonControl } from "../components/forms/button";
import { InputControl } from "../components/forms/input";

/** Internal confirm-dialog request stored in the atom-backed manager queue. */
export interface ConfirmRequest {
  title?: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  requireInput?: string;
  resolve: (confirmed: boolean) => void;
}

/** Options accepted when opening a confirmation dialog. */
export type ConfirmOptions = Omit<ConfirmRequest, "resolve">;

export const confirmAtom = atom<ConfirmRequest | null>(null);

/** Imperative API for opening a confirmation dialog from app actions or custom UI. */
export interface ConfirmManager {
  show: (options: ConfirmOptions) => Promise<boolean>;
}

/** Return the shared confirmation manager for the current Snapshot UI tree. */
export function useConfirmManager(): ConfirmManager {
  const [, setConfirm] = useAtom(confirmAtom);

  const show = useCallback(
    (options: ConfirmOptions): Promise<boolean> =>
      new Promise<boolean>((resolve) => {
        setConfirm({ ...options, resolve });
      }),
    [setConfirm],
  );

  return { show };
}

/** Render the global confirmation dialog for requests queued through `useConfirmManager`. */
export function ConfirmDialog(): ReactNode {
  const [request, setRequest] = useAtom(confirmAtom);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue("");
  }, [request]);

  if (!request) {
    return null;
  }

  const title = request.title ?? "Confirmation";
  const description = request.description ?? request.message;
  const isDestructive = request.variant === "destructive";
  const requiresInput = typeof request.requireInput === "string";
  const isInputValid = !requiresInput || inputValue === request.requireInput;
  const overlaySurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-overlay",
    implementationBase: {
      position: "fixed",
      inset: 0,
      zIndex: "var(--sn-z-index-modal, 10000)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      style: {
        padding: "var(--sn-spacing-lg, 1.5rem)",
        background:
          "color-mix(in oklch, var(--sn-color-foreground, #111) 30%, transparent)",
      },
    },
  });
  const dialogSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-dialog",
    implementationBase: {
      width: "min(100%, var(--sn-container-sm, 28rem))",
      display: "grid",
      gap: "var(--sn-spacing-md, 1rem)",
      style: {
        background: "var(--sn-color-card, #fff)",
        color: "var(--sn-color-foreground, #111)",
        border:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        boxShadow:
          "var(--sn-shadow-xl, 0 25px 50px -12px rgba(0,0,0,0.25))",
        padding: "var(--sn-spacing-lg, 1.5rem)",
      },
    },
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-header",
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-title",
    implementationBase: {
      fontSize: "lg",
      fontWeight: "semibold",
      style: {
        margin: 0,
      },
    },
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-description",
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        margin: 0,
      },
    },
  });
  const inputGroupSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-input-group",
    implementationBase: {
      display: "grid",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
  });
  const inputLabelSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-input-label",
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
    },
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: "snapshot-confirm-actions",
    implementationBase: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    },
  });

  const handleConfirm = () => {
    if (!isInputValid) {
      return;
    }
    request.resolve(true);
    setRequest(null);
  };

  const handleCancel = () => {
    request.resolve(false);
    setRequest(null);
  };

  return (
    <>
      <div
        data-snapshot-confirm=""
        className={overlaySurface.className}
        style={overlaySurface.style}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="snapshot-confirm-title"
          aria-describedby="snapshot-confirm-description"
          className={dialogSurface.className}
          style={dialogSurface.style}
        >
          <div className={headerSurface.className} style={headerSurface.style}>
            <h2
              id="snapshot-confirm-title"
              className={titleSurface.className}
              style={titleSurface.style}
            >
              {title}
            </h2>
            {description ? (
              <p
                id="snapshot-confirm-description"
                className={descriptionSurface.className}
                style={descriptionSurface.style}
              >
                {description}
              </p>
            ) : null}
          </div>

          {requiresInput ? (
            <div
              className={inputGroupSurface.className}
              style={inputGroupSurface.style}
            >
              <label
                htmlFor="snapshot-confirm-input"
                className={inputLabelSurface.className}
                style={inputLabelSurface.style}
              >
                Type {request.requireInput} to confirm
              </label>
              <InputControl
                inputId="snapshot-confirm-input"
                type="text"
                value={inputValue}
                onChangeText={setInputValue}
                ariaLabel={`Type ${request.requireInput} to confirm`}
              />
            </div>
          ) : null}

          <div className={actionsSurface.className} style={actionsSurface.style}>
            <ButtonControl
              onClick={handleCancel}
              type="button"
              variant="outline"
              size="sm"
            >
              {request.cancelLabel ?? "Cancel"}
            </ButtonControl>
            <ButtonControl
              onClick={handleConfirm}
              type="button"
              disabled={!isInputValid}
              variant={isDestructive ? "destructive" : "default"}
              size="sm"
            >
              {request.confirmLabel ?? "Confirm"}
            </ButtonControl>
          </div>
        </div>
      </div>
      <SurfaceStyles css={overlaySurface.scopedCss} />
      <SurfaceStyles css={dialogSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={inputGroupSurface.scopedCss} />
      <SurfaceStyles css={inputLabelSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
    </>
  );
}
