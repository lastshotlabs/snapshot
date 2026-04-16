"use client";

import { useManifestRuntime } from "../../../manifest/runtime";
import { ComponentRenderer } from "../../../manifest/renderer";
import { SurfaceStyles } from "../surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../style-surfaces";
import type { ComponentGroupConfig } from "./types";
import type { ComponentConfig } from "../../../manifest/types";

/**
 * Renders a named component group from the manifest's componentGroups map.
 *
 * Looks up the group definition, applies per-instance overrides by component id,
 * and delegates to ComponentRenderer for each component in the group.
 */
export function ComponentGroup({ config }: { config: ComponentGroupConfig }) {
  const manifest = useManifestRuntime();
  const rootId = config.id ?? "component-group";

  const groupDefs = (manifest?.raw as Record<string, unknown> | undefined)?.[
    "componentGroups"
  ] as
    | Record<string, { components: Array<Record<string, unknown>> }>
    | undefined;

  const groupDef = groupDefs?.[config.group];

  if (!groupDef) {
    if (
      typeof process !== "undefined" &&
      process.env?.["NODE_ENV"] === "development"
    ) {
      console.warn(`[snapshot] Unknown component group: "${config.group}"`);
    }
    return null;
  }

  const overrides = config.overrides;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {},
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });

  return (
    <>
      <div
        data-snapshot-component="component-group"
        data-snapshot-id={rootId}
        className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
        style={rootSurface.style}
      >
        {groupDef.components.map((componentConfig, index) => {
          let resolved = componentConfig;

          // Apply overrides by component id
          if (overrides && typeof componentConfig["id"] === "string") {
            const idOverride = overrides[componentConfig["id"]];
            if (idOverride) {
              resolved = { ...componentConfig, ...idOverride };
            }
          }

          return (
            <ComponentRenderer
              key={(resolved["id"] as string) ?? index}
              config={resolved as ComponentConfig}
            />
          );
        })}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
