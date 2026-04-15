import { evaluateExpression } from "../expressions/parser";
import { isExprRef } from "@lastshotlabs/frontend-contract/refs";
import type { ExprRef, FromRef } from "./types";
import { applyTransform, getNestedValue } from "./utils";

export interface ResolveFromRefContext {
  context?: Record<string, unknown>;
  pageRegistry?: {
    get(id: string): unknown;
    store: { get(atom: unknown): unknown };
  } | null;
  appRegistry?: {
    get(id: string): unknown;
    store: { get(atom: unknown): unknown };
  } | null;
  route?: {
    id?: string;
    path?: string;
    pattern?: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
  } | null;
  overlay?: {
    id?: string;
    kind?: string;
    payload?: unknown;
    result?: unknown;
  } | null;
  manifest?: {
    app?: Record<string, unknown>;
    auth?: Record<string, unknown>;
  } | null;
}

export function buildExpressionContext(
  context: ResolveFromRefContext,
): Record<string, unknown> {
  return {
    ...(context.context ?? {}),
    app: context.manifest?.app ?? {},
    auth: context.manifest?.auth ?? {},
    route: {
      id: context.route?.id,
      path: context.route?.path,
      pattern: context.route?.pattern,
      params: context.route?.params,
      query: context.route?.query,
    },
    overlay: {
      id: context.overlay?.id,
      kind: context.overlay?.kind,
      payload: context.overlay?.payload,
      result: context.overlay?.result,
    },
  };
}

export function resolveDynamicValue(
  value: unknown,
  context: ResolveFromRefContext,
): unknown {
  if (isExprRef(value)) {
    return evaluateExpression(value.expr, buildExpressionContext(context));
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveDynamicValue(item, context));
  }

  if (value && typeof value === "object") {
    if ("from" in value) {
      return resolveFromRef(value as FromRef, context);
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        resolveDynamicValue(nested, context),
      ]),
    );
  }

  return value;
}

function readRegistryValue(
  registry:
    | {
        get(id: string): unknown;
        store: { get(atom: unknown): unknown };
      }
    | null
    | undefined,
  id: string,
): unknown {
  const stateAtom = registry?.get(id);
  if (!stateAtom || !registry) {
    return undefined;
  }

  return registry.store.get(stateAtom);
}

function resolveRegistryTarget(
  refPath: string,
  pageRegistry: ResolveFromRefContext["pageRegistry"],
  appRegistry: ResolveFromRefContext["appRegistry"],
): {
  registry: ResolveFromRefContext["pageRegistry"];
  cleanPath: string;
} {
  if (refPath.startsWith("global.")) {
    return {
      registry: appRegistry,
      cleanPath: refPath.slice(7),
    };
  }

  if (refPath.startsWith("state.")) {
    const cleanPath = refPath.slice(6);
    const dotIndex = cleanPath.indexOf(".");
    const stateId = dotIndex === -1 ? cleanPath : cleanPath.slice(0, dotIndex);

    return {
      registry:
        pageRegistry?.get(stateId) != null
          ? pageRegistry
          : appRegistry?.get(stateId) != null
            ? appRegistry
            : (pageRegistry ?? appRegistry),
      cleanPath,
    };
  }

  return {
    registry: pageRegistry,
    cleanPath: refPath,
  };
}

export function resolveFromRef(
  ref: FromRef,
  {
    context,
    pageRegistry,
    appRegistry,
    route,
    overlay,
    manifest,
  }: ResolveFromRefContext,
): unknown {
  const refPath = ref.from;

  if (refPath.startsWith("params.")) {
    return applyTransform(
      getNestedValue(route?.params, refPath.slice(7)),
      ref.transform,
      ref.transformArg,
    );
  }

  if (refPath.startsWith("route.")) {
    return applyTransform(
      getNestedValue(
        {
          id: route?.id,
          path: route?.path,
          pattern: route?.pattern,
          params: route?.params,
          query: route?.query,
        },
        refPath.slice(6),
      ),
      ref.transform,
      ref.transformArg,
    );
  }

  if (refPath.startsWith("overlay.")) {
    return applyTransform(
      getNestedValue(
        {
          id: overlay?.id,
          kind: overlay?.kind,
          payload: overlay?.payload,
          result: overlay?.result,
        },
        refPath.slice(8),
      ),
      ref.transform,
      ref.transformArg,
    );
  }

  if (refPath.startsWith("auth.")) {
    return applyTransform(
      getNestedValue(manifest?.auth, refPath.slice(5)),
      ref.transform,
      ref.transformArg,
    );
  }

  if (refPath.startsWith("app.")) {
    return applyTransform(
      getNestedValue(manifest?.app, refPath.slice(4)),
      ref.transform,
      ref.transformArg,
    );
  }

  const sourcePath = refPath.startsWith("state.") ? refPath.slice(6) : refPath;
  const dotIndex = sourcePath.indexOf(".");
  const targetId = dotIndex === -1 ? sourcePath : sourcePath.slice(0, dotIndex);
  const subPath = dotIndex === -1 ? "" : sourcePath.slice(dotIndex + 1);

  if (context && targetId in context) {
    const contextValue = context[targetId];
    const resolved = subPath
      ? getNestedValue(contextValue, subPath)
      : contextValue;
    return applyTransform(resolved, ref.transform, ref.transformArg);
  }

  const { registry, cleanPath } = resolveRegistryTarget(
    refPath,
    pageRegistry,
    appRegistry,
  );
  const cleanDotIndex = cleanPath.indexOf(".");
  const registryId =
    cleanDotIndex === -1 ? cleanPath : cleanPath.slice(0, cleanDotIndex);
  const registrySubPath =
    cleanDotIndex === -1 ? "" : cleanPath.slice(cleanDotIndex + 1);
  const value = readRegistryValue(registry, registryId);
  const resolved = registrySubPath
    ? getNestedValue(value, registrySubPath)
    : value;

  return applyTransform(resolved, ref.transform, ref.transformArg);
}
