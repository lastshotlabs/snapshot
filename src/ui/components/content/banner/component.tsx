'use client';

import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { BannerBase } from "./standalone";
import type { BannerConfig } from "./types";

/**
 * Manifest adapter — renders manifest children via ComponentRenderer
 * and delegates layout to BannerBase.
 */
export function Banner({ config }: { config: BannerConfig }) {
  const height =
    typeof config.height === "string"
      ? config.height
      : config.height?.default ?? "50vh";

  return (
    <BannerBase
      id={config.id}
      height={height}
      align={config.align}
      background={config.background}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    >
      {config.children?.map((child, index) => (
        <ComponentRenderer
          key={(child as ComponentConfig).id ?? `banner-child-${index}`}
          config={child as ComponentConfig}
        />
      ))}
    </BannerBase>
  );
}
