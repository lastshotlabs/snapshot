import { z } from "zod";
import type { FromRef } from "../context/types";
export declare const httpMethodSchema: any;
export declare const resourceParamSchema: z.ZodType<unknown | FromRef>;
export declare const resourceRefSchema: any;
/**
 * Invalidation target declaration for mutation-side cache refresh.
 *
 * A target can either reference another manifest resource by name or
 * an explicit query key tuple.
 */
export declare const resourceInvalidationTargetSchema: any;
/**
 * A reference to the cache entry an optimistic mutation should mutate.
 */
export declare const optimisticTargetSchema: any;
/**
 * Optimistic update strategy for a mutation resource.
 */
export declare const optimisticConfigSchema: any;
export declare const endpointTargetSchema: any;
export declare const dataSourceSchema: any;
/**
 * Schema for a manifest resource declaration.
 */
export declare const resourceConfigSchema: any;
export type HttpMethod = z.infer<typeof httpMethodSchema>;
export type ResourceRef = z.infer<typeof resourceRefSchema>;
/** Invalidation target entry declared on a resource. */
export type ResourceInvalidationTarget = z.infer<typeof resourceInvalidationTargetSchema>;
/** Optimistic mutation target declaration. */
export type OptimisticTarget = z.infer<typeof optimisticTargetSchema>;
/** Optimistic mutation strategy declaration. */
export type OptimisticConfig = z.infer<typeof optimisticConfigSchema>;
export type ResourceConfig = z.infer<typeof resourceConfigSchema>;
export type ResourceMap = Record<string, ResourceConfig>;
export type EndpointTarget = z.infer<typeof endpointTargetSchema>;
export interface ResolvedRequest {
    method: HttpMethod;
    endpoint: string;
    params: Record<string, unknown>;
    /** Name of the manifest client used to execute this request. */
    client: string;
}
export declare function isResourceRef(value: unknown): value is ResourceRef;
/**
 * Returns true when an invalidation target is an explicit query key object.
 *
 * @param value - Candidate invalidation target
 */
export declare function isQueryKeyInvalidationTarget(value: ResourceInvalidationTarget): value is Extract<ResourceInvalidationTarget, {
    key: string[];
}>;
/**
 * Returns true when an optimistic target is a structured resource descriptor.
 *
 * @param value - Candidate optimistic target
 */
export declare function isOptimisticResourceTarget(value: OptimisticTarget): value is Extract<OptimisticTarget, {
    resource: string;
}>;
/**
 * Resolve an endpoint target into request details and a selected client name.
 *
 * @param target - String endpoint or resource reference
 * @param resources - Resource map used to resolve resource references
 * @param params - Runtime params merged into resolved request params
 * @param fallbackMethod - Method used when a string target omits an explicit method
 */
export declare function resolveEndpointTarget(target: EndpointTarget, resources?: ResourceMap, params?: Record<string, unknown>, fallbackMethod?: HttpMethod): ResolvedRequest;
export declare function buildRequestUrl(endpoint: string, params?: Record<string, unknown>, pathParams?: Record<string, unknown>): string;
export declare function extractResourceRefs(value: unknown, results?: ResourceRef[]): ResourceRef[];
export declare function collectDependentResources(resourceName: string, resources?: ResourceMap, visited?: Set<string>): string[];
/**
 * Returns string-based invalidation targets for a resource, including dependent
 * resources that should also be invalidated transitively.
 *
 * Query-key invalidation targets are intentionally omitted because they are
 * resolved at runtime against concrete cached entries.
 *
 * @param resourceName - Source resource name
 * @param resources - Optional manifest resource map
 */
export declare function getResourceInvalidationTargets(resourceName: string, resources?: ResourceMap): string[];
