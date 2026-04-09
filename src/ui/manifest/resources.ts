import { z } from "zod";
import type { FromRef } from "../context/types";
import { parseDataString } from "../context/utils";

export const httpMethodSchema = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

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

export const resourceConfigSchema = z
  .object({
    method: httpMethodSchema.optional(),
    endpoint: z.string().min(1),
    params: z.record(z.unknown()).optional(),
    cacheMs: z.number().int().min(0).optional(),
    pollMs: z.number().int().positive().optional(),
    dependsOn: z.array(z.string().min(1)).optional(),
    invalidates: z.array(z.string().min(1)).optional(),
  })
  .strict();

export type HttpMethod = z.infer<typeof httpMethodSchema>;
export type ResourceRef = z.infer<typeof resourceRefSchema>;
export type ResourceConfig = z.infer<typeof resourceConfigSchema>;
export type ResourceMap = Record<string, ResourceConfig>;
export type EndpointTarget = z.infer<typeof endpointTargetSchema>;

export interface ResolvedRequest {
  method: HttpMethod;
  endpoint: string;
  params: Record<string, unknown>;
}

export function isResourceRef(value: unknown): value is ResourceRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "resource" in value &&
    typeof (value as Record<string, unknown>)["resource"] === "string"
  );
}

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
  };
}

export function buildRequestUrl(
  endpoint: string,
  params: Record<string, unknown> = {},
): string {
  const usedPathParams = new Set<string>();
  const interpolatedPath = endpoint.replace(/\{(\w+)\}/g, (_, key: string) => {
    usedPathParams.add(key);
    const value = params[key];
    return value == null ? `{${key}}` : encodeURIComponent(String(value));
  });

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (usedPathParams.has(key) || value == null) continue;
    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${interpolatedPath}?${queryString}` : interpolatedPath;
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
    targets.add(target);
    for (const dependent of collectDependentResources(target, resources)) {
      targets.add(dependent);
    }
  }

  return [...targets];
}
