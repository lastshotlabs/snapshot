/**
 * Page and component rendering.
 *
 * `<PageRenderer>` wraps page content in a PageContextProvider and renders
 * the component tree. `<ComponentRenderer>` resolves individual component
 * configs to registered React components.
 */
import type { ApiClient } from "../../api/client";
import type { ComponentConfig, PageConfig, ResourceConfigMap, StateConfig } from "./types";
/** Props for the ComponentRenderer component. */
export interface ComponentRendererProps {
    /** The component config to render. */
    config: ComponentConfig;
}
/**
 * Renders a single component from its manifest config.
 */
export declare function ComponentRenderer({ config }: ComponentRendererProps): import("react/jsx-runtime").JSX.Element | null;
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
export declare function PageRenderer({ page, routeId, state, resources, api, }: PageRendererProps): import("react/jsx-runtime").JSX.Element;
