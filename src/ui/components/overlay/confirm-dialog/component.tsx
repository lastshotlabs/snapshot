'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context/hooks";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ModalComponent } from "../modal";
import type { ModalConfig } from "../modal";
import type { ConfirmDialogConfig } from "./types";

/**
 * Confirmation dialog alias built on top of the modal overlay runtime.
 */
export function ConfirmDialogComponent({
  config,
}: {
  config: ConfirmDialogConfig;
}) {
  const description = useSubscribe(config.description ?? "") as string;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: config.id ?? "confirm-dialog",
    componentSurface: {
      ...config,
      slots: undefined,
    } as Record<string, unknown>,
  });

  const modalConfig: ModalConfig = {
    type: "modal",
    id: config.id,
    title: config.title,
    size: config.size ?? "sm",
    onOpen: config.onOpen,
    onClose: config.onClose,
    urlParam: config.urlParam,
    trapFocus: config.trapFocus ?? true,
    initialFocus: config.initialFocus,
    returnFocus: config.returnFocus ?? true,
    className: [config.className, rootSurface.className].filter(Boolean).join(" ") || undefined,
    style: {
      ...(rootSurface.style ?? {}),
      ...((config.style as CSSProperties | undefined) ?? {}),
    },
    content: description
      ? [
          {
            type: "text",
            value: description,
            variant: "muted",
          },
        ]
      : [],
    footer: {
      align: "right",
      actions: [
        {
          label: config.cancelLabel ?? "Cancel",
          variant: config.cancelVariant ?? "secondary",
          action: config.cancelAction,
          dismiss: config.dismissOnCancel ?? true,
        },
        {
          label: config.confirmLabel ?? "Confirm",
          variant: config.confirmVariant ?? "default",
          action: config.confirmAction,
          dismiss: config.dismissOnConfirm ?? true,
        },
      ],
    },
    slots: config.slots as ModalConfig["slots"],
  };

  return <ModalComponent config={modalConfig} />;
}
