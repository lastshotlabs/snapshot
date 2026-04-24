"use client";

import type { CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { useModal } from "../modal/hook";
import type { ConfirmDialogConfig } from "./types";
import { ConfirmDialogBase } from "./standalone";

/**
 * Manifest-driven confirmation dialog adapter.
 *
 * Resolves primitive values and actions from manifest config, then delegates
 * all rendering to `ConfirmDialogBase`.
 */
export function ConfirmDialogComponent({
  config,
}: {
  config: ConfirmDialogConfig;
}) {
  const execute = useActionExecutor();
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    title: config.title,
    description: config.description,
    confirmLabel: config.confirmLabel,
    cancelLabel: config.cancelLabel,
  });

  const { isOpen, close } = useModal({
    type: "modal",
    id: config.id ?? "",
    content: [],
    trigger: (config as Record<string, unknown>).trigger as undefined,
    urlParam: config.urlParam,
    trapFocus: config.trapFocus ?? true,
    initialFocus: config.initialFocus,
    returnFocus: config.returnFocus ?? true,
    onOpen: config.onOpen,
    onClose: config.onClose,
  });

  const title = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const description =
    resolveOptionalPrimitiveValue(
      resolvedConfig.description,
      primitiveOptions,
    ) ?? "";
  const confirmLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.confirmLabel,
    primitiveOptions,
  );
  const cancelLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.cancelLabel,
    primitiveOptions,
  );
  const surfaceConfig = extractSurfaceConfig(config);

  const handleConfirm = () => {
    if (config.confirmAction) {
      void execute(config.confirmAction as Parameters<typeof execute>[0]);
    }
    if (config.dismissOnConfirm ?? true) {
      close();
    }
  };

  const handleCancel = () => {
    if (config.cancelAction) {
      void execute(config.cancelAction as Parameters<typeof execute>[0]);
    }
    if (config.dismissOnCancel ?? true) {
      close();
    }
  };

  return (
    <ConfirmDialogBase
      id={config.id}
      title={title}
      description={description}
      confirmLabel={confirmLabel ?? "Confirm"}
      cancelLabel={cancelLabel ?? "Cancel"}
      confirmVariant={config.confirmVariant ?? "default"}
      cancelVariant={config.cancelVariant ?? "secondary"}
      open={isOpen}
      onClose={close}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      size={config.size ?? "sm"}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
