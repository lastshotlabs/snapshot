'use client';

import { useSubscribe } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { ScrollAreaConfig } from "./types";
import { ScrollAreaBase } from "./standalone";

export function ScrollArea({ config }: { config: ScrollAreaConfig }) {
  const visible = useSubscribe(config.visible ?? true);

  if (visible === false) return null;

  const content = config.content ?? [];
  const surface = extractSurfaceConfig(config, { omit: ["maxHeight", "maxWidth"] });

  return (
    <ScrollAreaBase
      id={config.id}
      orientation={config.orientation}
      maxHeight={config.maxHeight}
      maxWidth={config.maxWidth}
      showScrollbar={config.showScrollbar}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    >
      {content.map((child, i) => (
        <ComponentRenderer
          key={(child as ComponentConfig).id ?? `scroll-child-${i}`}
          config={child as ComponentConfig}
        />
      ))}
    </ScrollAreaBase>
  );
}
