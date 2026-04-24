'use client';

import { useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { TooltipConfig } from "./types";
import { TooltipBase } from "./standalone";

export function TooltipComponent({ config }: { config: TooltipConfig }) {
  const resolvedText = useSubscribe(config.text) as string;

  const surface = extractSurfaceConfig(config);

  return (
    <TooltipBase
      id={config.id}
      text={resolvedText}
      placement={config.placement}
      delay={config.delay}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    >
      {config.content.map((child, index) => (
        <ComponentRenderer
          key={(child as ComponentConfig).id ?? `tooltip-child-${index}`}
          config={child as ComponentConfig}
        />
      ))}
    </TooltipBase>
  );
}
