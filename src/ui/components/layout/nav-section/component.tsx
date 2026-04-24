"use client";

import { useResolveFrom } from "../../../context/hooks";
import { ComponentRenderer } from "../../../manifest/renderer";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { NavSectionBase } from "./standalone";
import type { NavSectionConfig } from "./types";

export function NavSection({ config }: { config: NavSectionConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label });
  const label = resolveOptionalPrimitiveValue(resolvedConfig.label, primitiveOptions);

  return (
    <NavSectionBase
      id={config.id}
      label={label}
      collapsible={config.collapsible}
      defaultCollapsed={config.defaultCollapsed}
      className={config.className}
      style={config.style}
      slots={config.slots}
    >
      {config.items.map((item, index) => (
        <ComponentRenderer key={(item as { id?: string }).id ?? index} config={item} />
      ))}
    </NavSectionBase>
  );
}
