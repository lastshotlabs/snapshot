'use client';

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { useResolveFrom } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { AccordionBase } from "./standalone";
import type { AccordionBaseItem } from "./standalone";
import type { AccordionConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and renders manifest children,
 * delegates layout to AccordionBase.
 */
export function AccordionComponent({ config }: { config: AccordionConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ items: config.items });

  const items = useMemo<AccordionBaseItem[]>(
    () =>
      (((resolvedConfig.items as AccordionConfig["items"] | undefined) ??
        config.items) as AccordionConfig["items"]).map((item) => ({
        title:
          resolveOptionalPrimitiveValue(item.title, primitiveOptions) ?? "",
        icon: item.icon,
        disabled: item.disabled,
        content: (
          <>
            {item.content.map((child, childIndex) => (
              <ComponentRenderer
                key={
                  (child as ComponentConfig).id ??
                  `accordion-child-${childIndex}`
                }
                config={child as ComponentConfig}
              />
            ))}
          </>
        ),
        slots: item.slots as Record<string, Record<string, unknown>>,
      })),
    [config.items, primitiveOptions, resolvedConfig.items],
  );

  return (
    <AccordionBase
      id={config.id}
      items={items}
      mode={config.mode}
      variant={config.variant}
      iconPosition={config.iconPosition}
      defaultOpen={config.defaultOpen}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
