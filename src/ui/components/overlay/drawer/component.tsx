'use client';

import React, { useCallback, useEffect, useRef } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import { OverlayRuntimeProvider } from "../../../manifest/runtime";
import type { ComponentConfig } from "../../../manifest/types";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { useDrawer } from "./hook";
import type { DrawerConfig } from "./schema";
import { DrawerBase } from "./standalone";
import type { DrawerBaseFooterAction } from "./standalone";

export function DrawerComponent({ config }: { config: DrawerConfig }) {
  const { isOpen, close, payload, result } = useDrawer(config);
  const overlayId = config.id ?? "";

  return (
    <OverlayRuntimeProvider
      value={{ id: overlayId, kind: "drawer", payload, result }}
    >
      <DrawerSurface config={config} isOpen={isOpen} close={close} />
    </OverlayRuntimeProvider>
  );
}

function DrawerSurface({
  config,
  isOpen,
  close,
}: {
  config: DrawerConfig;
  isOpen: boolean;
  close: () => void;
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
  const payload = useSubscribe({ from: "overlay.payload" });
  const result = useSubscribe({ from: "overlay.result" });
  const previousOpenRef = useRef<boolean | undefined>(undefined);
  const footer = (resolvedConfig.footer ?? config.footer) as DrawerConfig["footer"];

  // Lifecycle action callbacks
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

  // Convert footer button actions to onClick callbacks
  const footerActions: DrawerBaseFooterAction[] | undefined =
    footer?.actions && footer.actions.length > 0
      ? footer.actions.map((button) => ({
          label: typeof button.label === "string" ? button.label : "",
          variant: button.variant,
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

  // onOpen lifecycle is handled via the useEffect above; pass a no-op
  // to avoid double-firing since DrawerBase also has an onOpen effect.
  const handleOpen = useCallback(() => {
    // Lifecycle already handled by the useEffect above
  }, []);

  // Pre-render manifest content children
  const children = config.content.map((child, index) => (
    <ComponentRenderer
      key={(child as ComponentConfig).id ?? `drawer-child-${index}`}
      config={child as ComponentConfig}
    />
  ));

  return (
    <DrawerBase
      id={config.id}
      title={title}
      side={config.side ?? "right"}
      size={config.size ?? "md"}
      open={isOpen}
      onClose={close}
      trapFocus={config.trapFocus !== false}
      initialFocus={config.initialFocus}
      returnFocus={config.returnFocus}
      footer={footerActions}
      footerAlign={footer?.align}
      onOpen={handleOpen}
      className={config.className}
      style={config.style as React.CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {children}
    </DrawerBase>
  );
}
