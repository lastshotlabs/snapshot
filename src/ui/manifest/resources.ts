import { z } from "zod";
import type { FromRef } from "../context/types";
import { parseDataString } from "../context/utils";

export const httpMethodSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

export const resourceParamSchema: z.ZodType<unknown | FromRef> = z.lazy(() =>
  z.union([
    z.unknown(),
    z
      .object({
        from: z.string(),
        transform: z
          .enum([
            "uppercase",
            "lowercase",
            "trim",
            "length",
            "number",
            "boolean",
            "string",
            "json",
            "keys",
            "values",
            "first",
            "last",
            "count",
            "sum",
            "join",
            "split",
            "default",
          ])
          .optional(),
        transformArg: z.union([z.string(), z.number()]).optional(),
      })
      .strict(),
  ]),
);

export const resourceRefSchema = z
  .object({
    resource: z.string().min(1),
    params: z.record(resourceParamSchema).optional(),
  })
  .strict();

/**
 * Invalidation target declaration for mutation-side cache refresh.
 *
 * A target can either reference another manifest resource by name or
 * an explicit query key tuple.
 */
export const resourceInvalidationTargetSchema = z.union([
  z.string().min(1),
  z
    .object({
      key: z.array(z.string().min(1)).min(1),
    })
    .strict(),
]);

/**
 * A reference to the cache entry an optimistic mutation should mutate.
 */
export const optimisticTargetSchema = z.union([
  z.string().min(1),
  z
    .object({
      resource: z.string().min(1),
      params: z.record(z.unknown()).optional(),
    })
    .strict(),
]);

/**
 * Optimistic update strategy for a mutation resource.
 */
export const optimisticConfigSchema = z
  .object({
    target: optimisticTargetSchema,
    merge: z.enum(["append", "prepend", "replace", "patch", "remove"]),
    idField: z.string().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      (value.merge === "replace" ||
        value.merge === "patch" ||
        value.merge === "remove") &&
      !value.idField
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["idField"],
        message: `optimistic.idField is required when merge is "${value.merge}"`,
      });
    }
  });

export const endpointTargetSchema = z.union([z.string(), resourceRefSchema]);
export const dataSourceSchema = z.union([
  z.string(),
  z
    .object({
      from: z.string(),
      transform: z
        .enum([
          "uppercase",
          "lowercase",
          "trim",
          "length",
          "number",
          "boolean",
          "string",
          "json",
          "keys",
          "values",
          "first",
          "last",
          "count",
          "sum",
          "join",
          "split",
          "default",
        ])
        .optional(),
      transformArg: z.union([z.string(), z.number()]).optional(),
    })
    .strict(),
  resourceRefSchema,
]);

/**
 * Schema for a manifest resource declaration.
 */
export const resourceConfigSchema = z
  .object({
    method: httpMethodSchema.optional(),
    endpoint: z.string().min(1),
    client: z.string().min(1).optional(),
    params: z.record(z.unknown()).optional(),
    cacheMs: z.number().int().min(0).optional(),
    pollMs: z.number().int().positive().optional(),
    refetchOnMount: z.boolean().optional(),
    refetchOnWindowFocus: z.boolean().optional(),
    retry: z.number().int().min(0).optional(),
    retryDelayMs: z.number().int().min(0).optional(),
    dependsOn: z.array(z.string().min(1)).optional(),
    invalidates: z.array(resourceInvalidationTargetSchema).optional(),
    optimistic: optimisticConfigSchema.optional(),
  })
  .strict();

export type HttpMethod = z.infer<typeof httpMethodSchema>;
export type ResourceRef = z.infer<typeof resourceRefSchema>;
/** Invalidation target entry declared on a resource. */
export type ResourceInvalidationTarget = z.infer<
  typeof resourceInvalidationTargetSchema
>;
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

export function isResourceRef(value: unknown): value is ResourceRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "resource" in value &&
    typeof (value as Record<string, unknown>)["resource"] === "string"
  );
}

/**
 * Returns true when an invalidation target is an explicit query key object.
 *
 * @param value - Candidate invalidation target
 */
export function isQueryKeyInvalidationTarget(
  value: ResourceInvalidationTarget,
): value is Extract<ResourceInvalidationTarget, { key: string[] }> {
  return typeof value !== "string";
}

/**
 * Returns true when an optimistic target is a structured resource descriptor.
 *
 * @param value - Candidate optimistic target
 */
export function isOptimisticResourceTarget(
  value: OptimisticTarget,
): value is Extract<OptimisticTarget, { resource: string }> {
  return typeof value !== "string";
}

/**
 * Resolve an endpoint target into request details and a selected client name.
 *
 * @param target - String endpoint or resource reference
 * @param resources - Resource map used to resolve resource references
 * @param params - Runtime params merged into resolved request params
 * @param fallbackMethod - Method used when a string target omits an explicit method
 */
export function resolveEndpointTarget(
  target: EndpointTarget,
  resources?: ResourceMap,
  params?: Record<string, unknown>,
  fallbackMethod: HttpMethod = "GET",
): ResolvedRequest {
  if (typeof target === "string") {
    const hasExplicitMethod = target.includes(" ");
    const [method, endpoint] = parseDataString(target);
    return {
      method: hasExplicitMethod
        ? (method.toUpperCase() as HttpMethod)
        : fallbackMethod,
      endpoint,
      params: params ?? {},
      client: "main",
    };
  }

  const resource = resources?.[target.resource];
  if (!resource) {
    throw new Error(`Unknown manifest resource "${target.resource}"`);
  }

  return {
    method: resource.method ?? fallbackMethod,
    endpoint: resource.endpoint,
    params: {
      ...(resource.params ?? {}),
      ...(target.params ?? {}),
      ...(params ?? {}),
    },
    client: resource.client ?? "main",
  };
}

export function buildRequestUrl(
  endpoint: string,
  params: Record<string, unknown> = {},
  pathParams: Record<string, unknown> = params,
): string {
  const usedPathParams = new Set<string>();
  const interpolatedPath = endpoint.replace(/\{([^}]+)\}/g, (_, token: string) => {
    const [rawName, ...templateParts] = token.split(':');
    const name = rawName ?? "";
    const template = templateParts.join(':');

    if ((name === 'date' || name === 'today') && template) {
      return formatDateTemplate(new Date(), template);
    }

    if (name === 'date' || name === 'today') {
      return formatDateTemplate(new Date(), 'YYYY-MM-DD');
    }

    usedPathParams.add(name);
    const value = pathParams[name];
    return value == null ? `{${token}}` : encodeURIComponent(String(value));
  });

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (usedPathParams.has(key) || value == null) continue;
    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${interpolatedPath}?${queryString}` : interpolatedPath;
}

function formatDateTemplate(date: Date, template: string): string {
  const parts: Record<string, string> = {
    YYYY: String(date.getUTCFullYear()),
    YY: String(date.getUTCFullYear()).slice(-2),
    MM: String(date.getUTCMonth() + 1).padStart(2, '0'),
    M: String(date.getUTCMonth() + 1),
    DD: String(date.getUTCDate()).padStart(2, '0'),
    D: String(date.getUTCDate()),
    HH: String(date.getUTCHours()).padStart(2, '0'),
    H: String(date.getUTCHours()),
    mm: String(date.getUTCMinutes()).padStart(2, '0'),
    m: String(date.getUTCMinutes()),
    ss: String(date.getUTCSeconds()).padStart(2, '0'),
    s: String(date.getUTCSeconds()),
  };

  return template.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, token => parts[token] ?? token);
}

export function extractResourceRefs(
  value: unknown,
  results: ResourceRef[] = [],
): ResourceRef[] {
  if (isResourceRef(value)) {
    results.push(value);
    if (value.params) {
      extractResourceRefs(value.params, results);
    }
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      extractResourceRefs(item, results);
    }
    return results;
  }

  if (value && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      extractResourceRefs(nested, results);
    }
  }

  return results;
}

export function collectDependentResources(
  resourceName: string,
  resources?: ResourceMap,
  visited: Set<string> = new Set(),
): string[] {
  if (!resources) {
    return [];
  }

  const dependents: string[] = [];
  for (const [candidateName, resource] of Object.entries(resources)) {
    if (
      candidateName !== resourceName &&
      resource.dependsOn?.includes(resourceName) &&
      !visited.has(candidateName)
    ) {
      visited.add(candidateName);
      dependents.push(candidateName);
      dependents.push(
        ...collectDependentResources(candidateName, resources, visited),
      );
    }
  }

  return dependents;
}

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
export function getResourceInvalidationTargets(
  resourceName: string,
  resources?: ResourceMap,
): string[] {
  const resource = resources?.[resourceName];
  if (!resource) {
    return [];
  }

  const targets = new Set<string>();
  for (const target of resource.invalidates ?? []) {
    if (typeof target !== "string") {
      continue;
    }

    targets.add(target);
    for (const dependent of collectDependentResources(target, resources)) {
      targets.add(dependent);
    }
  }

  return [...targets];
}
