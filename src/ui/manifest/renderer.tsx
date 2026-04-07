import React from "react";
import { useSubscribe } from "../context/hooks";
import { getRegisteredComponent } from "./component-registry";

/**
 * Config for a single component, as it appears in a manifest page.
 * This is a loose type — actual validation is done by the component's Zod schema.
 */
export interface ComponentConfig {
  /** Component type discriminator. */
  type: string;
  /** Unique id for the from-ref system. */
  id?: string;
  /** Visibility control. */
  visible?: boolean | { from: string } | Record<string, unknown>;
  /** Additional CSS class. */
  className?: string;
  /** Grid span when inside a row. */
  span?: number | Record<string, unknown>;
  /** Catch-all for component-specific config. */
  [key: string]: unknown;
}

/**
 * Renders a single component from its config by looking up the registered
 * component for the config's `type` field.
 *
 * Handles visibility control via `visible` config (supports static booleans
 * and FromRef values). Applies grid span styling when inside a row.
 *
 * @param props.config - The component config from the manifest
 */
export function ComponentRenderer({ config }: { config: ComponentConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  const Component = getRegisteredComponent(config.type);
  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[snapshot] Unknown component type: "${config.type}"`);
    }
    return null;
  }

  const span = config.span;
  const style = span
    ? {
        gridColumn: `span ${typeof span === "number" ? span : "auto"}`,
      }
    : undefined;

  return (
    <div data-snapshot-component={config.type} style={style}>
      <Component config={config as Record<string, unknown>} />
    </div>
  );
}
