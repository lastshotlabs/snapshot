/**
 * Page and component rendering.
 *
 * `<PageRenderer>` wraps page content in a PageContextProvider and renders
 * the component tree. `<ComponentRenderer>` resolves individual component
 * configs to registered React components.
 */

import type { ApiClient } from "../../api/client";
import {
  PageContextProvider,
  useResolveFrom,
  useSubscribe,
} from "../context/index";
import { ComponentWrapper } from "../components/_base/component-wrapper";
import { useResponsiveValue } from "../hooks/use-breakpoint";
import { evaluatePolicy } from "../policies/evaluate";
import { isPolicyRef, type PolicyExpr } from "../policies/types";
import { getRegisteredComponent } from "./component-registry";
import { useManifestRuntime } from "./runtime";
import type {
  ComponentConfig,
  PageConfig,
  ResourceConfigMap,
  StateConfig,
} from "./types";

const EMPTY_POLICY_MAP: Record<string, unknown> = {};

/** Props for the ComponentRenderer component. */
export interface ComponentRendererProps {
  /** The component config to render. */
  config: ComponentConfig;
}

/**
 * Renders a single component from its manifest config.
 */
export function ComponentRenderer({ config }: ComponentRendererProps) {
  const visible = useSubscribe(
    config.visible !== undefined ? config.visible : true,
  );
  const manifest = useManifestRuntime();
  const policyDefinitions = (manifest?.raw.policies ??
    EMPTY_POLICY_MAP) as Record<string, unknown>;
  const resolvedPolicies = useResolveFrom(policyDefinitions) as Record<
    string,
    unknown
  >;
  const isVisible = isPolicyRef(config.visible)
    ? evaluatePolicy(
        config.visible.policy,
        resolvedPolicies[config.visible.policy] as PolicyExpr | undefined,
        { policies: resolvedPolicies as Record<string, PolicyExpr> },
      )
    : visible !== false;
  if (!isVisible) return null;

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

/** Props for the PageRenderer component. */
export interface PageRendererProps {
  /** The page config to render. */
  page: PageConfig;
  /** Stable route identity used to reset route-scoped state. */
  routeId?: string;
  /** Named manifest state definitions available for route initialization. */
  state?: StateConfig;
  /** Named resources available to route state loaders. */
  resources?: ResourceConfigMap;
  /** API client used by route state loaders. */
  api?: ApiClient;
}

/**
 * Renders a page from its manifest config.
 */
export function PageRenderer({
  page,
  routeId,
  state,
  resources,
  api,
}: PageRendererProps) {
  return (
    <PageContextProvider
      key={routeId ?? page.title ?? "snapshot-route"}
      state={state}
      resources={resources}
      api={api}
    >
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
