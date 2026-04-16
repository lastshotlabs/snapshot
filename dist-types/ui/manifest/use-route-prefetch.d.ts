import type { EndpointTarget } from "./resources";
/** Prefetch route-scoped resources when a compiled route advertises eager endpoints. */
export declare function useRoutePrefetch(endpoints: EndpointTarget[] | undefined): void;
