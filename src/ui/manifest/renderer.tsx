/**
 * Page and component rendering.
 *
 * `<PageRenderer>` wraps page content in a PageContextProvider and renders
 * the component tree. `<ComponentRenderer>` resolves individual component
 * configs to registered React components.
 */

import type { CSSProperties } from "react";
import { PageContextProvider, useSubscribe } from "../context/index";
import { getRegisteredComponent } from "./component-registry";
import { ComponentWrapper } from "../components/_base/component-wrapper";
import { useResponsiveValue } from "../hooks/use-breakpoint";
import type { PageConfig, ComponentConfig } from "./types";

// ── ComponentRenderer ───────────────────────────────────────────────────────

/** Props for the ComponentRenderer component. */
export interface ComponentRendererProps {
  /** The component config to render. */
  config: ComponentConfig;
}

/**
 * Renders a single component from its manifest config.
 *
 * Resolves the component type from the registry, handles visibility
 * (static, responsive, or FromRef), applies grid span styling, and
 * wraps with a `data-snapshot-component` attribute for token scoping
 * and debugging.
 *
 * Returns null for unknown types (with a dev warning) or when visibility is false.
 *
 * @param props - Contains the component config to render
 */
export function ComponentRenderer({ config }: ComponentRendererProps) {
  const visible = useSubscribe(
    config.visible !== undefined ? config.visible : true,
  );
  if (visible === false) return null;

  const Component = getRegisteredComponent(config.type);
  if (!Component) {
    if (
      typeof process !== "undefined" &&
      process.env?.["NODE_ENV"] === "development"
    ) {
      console.warn(`[snapshot] Unknown component type: "${config.type}"`);
    }
    return null;
  }

  const span = useResponsiveValue(config.span ?? undefined);
  const configStyle = (config as Record<string, unknown>).style as
    | Record<string, string | number>
    | undefined;
  const mergedStyle: Record<string, string | number> = {
    ...(span ? { gridColumn: `span ${span}` } : undefined),
    ...configStyle,
  };

  return (
    <ComponentWrapper
      type={config.type}
      className={config.className}
      style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
    >
      <Component config={config as Record<string, unknown>} />
    </ComponentWrapper>
  );
}

// ── PageRenderer ────────────────────────────────────────────────────────────

/** Props for the PageRenderer component. */
export interface PageRendererProps {
  /** The page config to render. */
  page: PageConfig;
}

/**
 * Renders a page from its manifest config.
 *
 * Wraps content in a `PageContextProvider` so all components on the page
 * share a fresh atom registry for inter-component data binding. Each
 * component in the content array is rendered via `ComponentRenderer`.
 *
 * @param props - Contains the page config to render
 */
export function PageRenderer({ page }: PageRendererProps) {
  return (
    <PageContextProvider>
      <div data-snapshot-page={page.title ?? ""}>
        {page.content.map((config, i) => (
          <ComponentRenderer
            key={config.id ?? `component-${i}`}
            config={config}
          />
        ))}
      </div>
    </PageContextProvider>
  );
}
