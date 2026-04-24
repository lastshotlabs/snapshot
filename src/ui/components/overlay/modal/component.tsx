'use client';

import { useEffect, useRef } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import { OverlayRuntimeProvider } from "../../../manifest/runtime";
import type { ComponentConfig } from "../../../manifest/types";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { useModal } from "./hook";
import type { ModalConfig } from "./schema";
import { ModalBase } from "./standalone";
import type { ModalBaseFooterAction } from "./standalone";

export function ModalComponent({ config }: { config: ModalConfig }) {
  const { isOpen, close, payload, result } = useModal(config);
  const overlayId = config.id ?? "";

  return (
    <OverlayRuntimeProvider
      value={{ id: overlayId, kind: "modal", payload, result }}
    >
      <ModalSurface
        config={config}
        isOpen={isOpen}
        close={close}
        payload={payload}
        result={result}
      />
    </OverlayRuntimeProvider>
  );
}

function ModalSurface({
  config,
  isOpen,
  close,
  payload,
  result,
}: {
  config: ModalConfig;
  isOpen: boolean;
  close: () => void;
  payload: unknown;
  result: unknown;
}) {
  const execute = useActionExecutor();
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    title: config.title,
    footer: config.footer,
  });
  const title = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const previousOpenRef = useRef<boolean | undefined>(undefined);
  const footer = (resolvedConfig.footer ?? config.footer) as ModalConfig["footer"];

  useEffect(() => {
    const previousOpen = previousOpenRef.current;
    previousOpenRef.current = isOpen;

    const lifecycleContext = {
      overlay: {
        payload,
        result,
      },
    };

    if (isOpen && previousOpen !== true && config.onOpen) {
      if (typeof config.onOpen === "string") {
        void execute(
          { type: "run-workflow", workflow: config.onOpen },
          lifecycleContext,
        );
      } else {
        void execute(config.onOpen as never, lifecycleContext);
      }
    }

    if (!isOpen && previousOpen === true && config.onClose) {
      if (typeof config.onClose === "string") {
        void execute(
          { type: "run-workflow", workflow: config.onClose },
          lifecycleContext,
        );
      } else {
        void execute(config.onClose as never, lifecycleContext);
      }
    }
  }, [config.onClose, config.onOpen, execute, isOpen, payload, result]);

  const footerActions: ModalBaseFooterAction[] | undefined =
    footer?.actions && footer.actions.length > 0
      ? footer.actions.map((button) => ({
          label: typeof button.label === "string" ? button.label : "",
          variant: button.variant ?? "default",
          onClick: () => {
            if (button.action) {
              void execute(button.action as Parameters<typeof execute>[0]);
            }
            if (button.dismiss) {
              close();
            }
          },
        }))
      : undefined;

  return (
    <ModalBase
      id={config.id}
      title={title}
      size={config.size}
      open={isOpen}
      onClose={close}
      trapFocus={config.trapFocus}
      initialFocus={config.initialFocus}
      returnFocus={config.returnFocus}
      footer={footerActions}
      footerAlign={footer?.align}
      className={config.className}
      style={config.style}
      slots={config.slots}
    >
      {config.content.map((child, index) => (
        <ComponentRenderer
          key={(child as ComponentConfig).id ?? `modal-child-${index}`}
          config={child as ComponentConfig}
        />
      ))}
    </ModalBase>
  );
}
