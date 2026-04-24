'use client';

import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SplitPaneBase } from "./standalone";
import type { SplitPaneConfig } from "./types";

export function SplitPane({ config }: { config: SplitPaneConfig }) {
  const children = Array.isArray(config.children) ? config.children.slice(0, 2) : [];

  return (
    <ComponentWrapper type="split-pane" id={config.id} config={config}>
      <SplitPaneBase
        id={config.id}
        direction={config.direction}
        defaultSplit={config.defaultSplit}
        minSize={config.minSize}
        className={config.className}
        style={config.style as CSSProperties}
        slots={config.slots as Record<string, Record<string, unknown>>}
        first={children[0] != null ? <ComponentRenderer config={children[0]} /> : null}
        second={children[1] != null ? <ComponentRenderer config={children[1]} /> : null}
      />
    </ComponentWrapper>
  );
}
