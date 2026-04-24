'use client';

import { useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { PopoverBase } from "./standalone";
import type { PopoverConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, publishes state, renders manifest
 * children, delegates layout to PopoverBase.
 */
export function Popover({ config }: { config: PopoverConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    trigger: config.trigger,
    title: config.title,
    description: config.description,
  });
  const triggerText =
    resolveOptionalPrimitiveValue(resolvedConfig.trigger, primitiveOptions) ?? "";
  const resolvedTitle = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const resolvedDescription = resolveOptionalPrimitiveValue(
    resolvedConfig.description,
    primitiveOptions,
  );
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  if (visible === false) {
    return null;
  }

  const footerContent = config.footer?.length ? (
    <>
      {config.footer.map((child, index) => (
        <ComponentRenderer
          key={(child as ComponentConfig).id ?? `popover-footer-${index}`}
          config={child as ComponentConfig}
        />
      ))}
    </>
  ) : undefined;

  return (
    <PopoverBase
      id={config.id}
      triggerLabel={triggerText}
      triggerIcon={config.triggerIcon}
      triggerVariant={config.triggerVariant}
      title={resolvedTitle}
      description={resolvedDescription}
      placement={config.placement}
      width={config.width}
      onOpenChange={(isOpen) => publish?.({ isOpen })}
      footer={footerContent}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {config.content?.map((child, index) => (
        <ComponentRenderer
          key={(child as ComponentConfig).id ?? `popover-child-${index}`}
          config={child as ComponentConfig}
        />
      ))}
    </PopoverBase>
  );
}
