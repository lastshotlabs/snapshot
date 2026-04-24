'use client';

import type { CSSProperties } from "react";
import { useResolveFrom } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { CardBase } from "./standalone";
import type { CardBaseProps } from "./standalone";
import type { CardConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, renders manifest children,
 * delegates layout to CardBase.
 */
export function Card({ config }: { config: CardConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    title: config.title,
    subtitle: config.subtitle,
  });
  const title = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const subtitle = resolveOptionalPrimitiveValue(
    resolvedConfig.subtitle,
    primitiveOptions,
  );

  const rootId = config.id ?? "card";
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item`,
    implementationBase: {},
    componentSurface: (config.slots as Record<string, unknown> | undefined)?.item as Record<string, unknown> | undefined,
  });

  return (
    <ComponentWrapper type="card" id={config.id} config={config}>
      <CardBase
        id={config.id}
        title={title}
        subtitle={subtitle}
        gap={config.gap}
        background={config.background as CardBaseProps["background"]}
        className={config.className}
        style={config.style as CSSProperties}
        slots={config.slots as Record<string, Record<string, unknown>>}
      >
        {(config.children ?? []).map((child, index) => (
          <div
            key={child.id ?? `card-child-${index}`}
            data-snapshot-id={`${rootId}-item`}
            className={itemSurface.className}
            style={
              typeof config.animation?.stagger === "number"
                ? ({
                    ...(itemSurface.style ?? {}),
                    ["--sn-stagger-index" as "--sn-stagger-index"]: index,
                  } as CSSProperties)
                : itemSurface.style
            }
          >
            <ComponentRenderer config={child} />
          </div>
        ))}
      </CardBase>
      <SurfaceStyles css={itemSurface.scopedCss} />
    </ComponentWrapper>
  );
}
