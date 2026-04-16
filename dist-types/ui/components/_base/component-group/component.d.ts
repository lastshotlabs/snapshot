import type { ComponentGroupConfig } from "./types";
/**
 * Renders a named component group from the manifest's componentGroups map.
 *
 * Looks up the group definition, applies per-instance overrides by component id,
 * and delegates to ComponentRenderer for each component in the group.
 */
export declare function ComponentGroup({ config }: {
    config: ComponentGroupConfig;
}): import("react/jsx-runtime").JSX.Element | null;
