import { z } from "zod";
import type { FromRef } from "../context/types";
export declare const httpMethodSchema: z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>;
export declare const resourceParamSchema: z.ZodType<unknown | FromRef>;
export declare const resourceRefSchema: z.ZodObject<{
    resource: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, z.ZodTypeDef, unknown>>>;
}, "strict", z.ZodTypeAny, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}>;
/**
 * Invalidation target declaration for mutation-side cache refresh.
 *
 * A target can either reference another manifest resource by name or
 * an explicit query key tuple.
 */
export declare const resourceInvalidationTargetSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    key: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    key: string[];
}, {
    key: string[];
}>]>;
/**
 * A reference to the cache entry an optimistic mutation should mutate.
 */
export declare const optimisticTargetSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    resource: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}>]>;
/**
 * Optimistic update strategy for a mutation resource.
 */
export declare const optimisticConfigSchema: z.ZodEffects<z.ZodObject<{
    target: z.ZodUnion<[z.ZodString, z.ZodObject<{
        resource: z.ZodString;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        resource: string;
        params?: Record<string, unknown> | undefined;
    }, {
        resource: string;
        params?: Record<string, unknown> | undefined;
    }>]>;
    merge: z.ZodEnum<["append", "prepend", "replace", "patch", "remove"]>;
    idField: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    target: string | {
        resource: string;
        params?: Record<string, unknown> | undefined;
    };
    merge: "patch" | "replace" | "remove" | "append" | "prepend";
    idField?: string | undefined;
}, {
    target: string | {
        resource: string;
        params?: Record<string, unknown> | undefined;
    };
    merge: "patch" | "replace" | "remove" | "append" | "prepend";
    idField?: string | undefined;
}>, {
    target: string | {
        resource: string;
        params?: Record<string, unknown> | undefined;
    };
    merge: "patch" | "replace" | "remove" | "append" | "prepend";
    idField?: string | undefined;
}, {
    target: string | {
        resource: string;
        params?: Record<string, unknown> | undefined;
    };
    merge: "patch" | "replace" | "remove" | "append" | "prepend";
    idField?: string | undefined;
}>;
export declare const endpointTargetSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    resource: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, z.ZodTypeDef, unknown>>>;
}, "strict", z.ZodTypeAny, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}>]>;
export declare const dataSourceSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    from: z.ZodString;
    transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
    transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strict", z.ZodTypeAny, {
    from: string;
    transform?: "string" | "number" | "boolean" | "json" | "length" | "join" | "keys" | "values" | "default" | "split" | "trim" | "count" | "sum" | "first" | "lowercase" | "uppercase" | "last" | undefined;
    transformArg?: string | number | undefined;
}, {
    from: string;
    transform?: "string" | "number" | "boolean" | "json" | "length" | "join" | "keys" | "values" | "default" | "split" | "trim" | "count" | "sum" | "first" | "lowercase" | "uppercase" | "last" | undefined;
    transformArg?: string | number | undefined;
}>, z.ZodObject<{
    resource: z.ZodString;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodType<unknown, z.ZodTypeDef, unknown>>>;
}, "strict", z.ZodTypeAny, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}, {
    resource: string;
    params?: Record<string, unknown> | undefined;
}>]>;
/**
 * Schema for a manifest resource declaration.
 */
export declare const resourceConfigSchema: z.ZodObject<{
    method: z.ZodOptional<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
    endpoint: z.ZodString;
    client: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    cacheMs: z.ZodOptional<z.ZodNumber>;
    pollMs: z.ZodOptional<z.ZodNumber>;
    refetchOnMount: z.ZodOptional<z.ZodBoolean>;
    refetchOnWindowFocus: z.ZodOptional<z.ZodBoolean>;
    retry: z.ZodOptional<z.ZodNumber>;
    retryDelayMs: z.ZodOptional<z.ZodNumber>;
    dependsOn: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    invalidates: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        key: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        key: string[];
    }, {
        key: string[];
    }>]>, "many">>;
    optimistic: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        target: z.ZodUnion<[z.ZodString, z.ZodObject<{
            resource: z.ZodString;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strict", z.ZodTypeAny, {
            resource: string;
            params?: Record<string, unknown> | undefined;
        }, {
            resource: string;
            params?: Record<string, unknown> | undefined;
        }>]>;
        merge: z.ZodEnum<["append", "prepend", "replace", "patch", "remove"]>;
        idField: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        target: string | {
            resource: string;
            params?: Record<string, unknown> | undefined;
        };
        merge: "patch" | "replace" | "remove" | "append" | "prepend";
        idField?: string | undefined;
    }, {
        target: string | {
            resource: string;
            params?: Record<string, unknown> | undefined;
        };
        merge: "patch" | "replace" | "remove" | "append" | "prepend";
        idField?: string | undefined;
    }>, {
        target: string | {
            resource: string;
            params?: Record<string, unknown> | undefined;
        };
        merge: "patch" | "replace" | "remove" | "append" | "prepend";
        idField?: string | undefined;
    }, {
        target: string | {
            resource: string;
            params?: Record<string, unknown> | undefined;
        };
        merge: "patch" | "replace" | "remove" | "append" | "prepend";
        idField?: string | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | undefined;
    params?: Record<string, unknown> | undefined;
    dependsOn?: string[] | undefined;
    retry?: number | undefined;
    client?: string | undefined;
    cacheMs?: number | undefined;
    pollMs?: number | undefined;
    refetchOnMount?: boolean | undefined;
    refetchOnWindowFocus?: boolean | undefined;
    retryDelayMs?: number | undefined;
    invalidates?: (string | {
        key: string[];
    })[] | undefined;
    optimistic?: {
        target: string | {
            resource: string;
            params?: Record<string, unknown> | undefined;
        };
        merge: "patch" | "replace" | "remove" | "append" | "prepend";
        idField?: string | undefined;
    } | undefined;
}, {
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | undefined;
    params?: Record<string, unknown> | undefined;
    dependsOn?: string[] | undefined;
    retry?: number | undefined;
    client?: string | undefined;
    cacheMs?: number | undefined;
    pollMs?: number | undefined;
    refetchOnMount?: boolean | undefined;
    refetchOnWindowFocus?: boolean | undefined;
    retryDelayMs?: number | undefined;
    invalidates?: (string | {
        key: string[];
    })[] | undefined;
    optimistic?: {
        target: string | {
            resource: string;
            params?: Record<string, unknown> | undefined;
        };
        merge: "patch" | "replace" | "remove" | "append" | "prepend";
        idField?: string | undefined;
    } | undefined;
}>;
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
