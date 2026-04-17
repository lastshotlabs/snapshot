import type { CSSProperties } from "react";
import {
  resolveInteractiveCSS,
  resolveResponsiveCSS,
  resolveStyleProps,
} from "./style-props";

export type RuntimeSurfaceState =
  | "hover"
  | "focus"
  | "open"
  | "selected"
  | "current"
  | "active"
  | "completed"
  | "invalid"
  | "disabled";

const CANONICAL_STATE_ORDER: RuntimeSurfaceState[] = [
  "hover",
  "focus",
  "open",
  "selected",
  "current",
  "active",
  "completed",
  "invalid",
  "disabled",
];

type SurfaceConfig = Record<string, unknown> & {
  className?: string;
  style?: Record<string, string | number>;
  states?: Partial<Record<RuntimeSurfaceState, SurfaceConfig>>;
  hover?: Record<string, unknown>;
  focus?: Record<string, unknown>;
  active?: Record<string, unknown>;
};

function toSurfaceConfig(
  value: Record<string, unknown> | undefined,
): SurfaceConfig | undefined {
  return value as SurfaceConfig | undefined;
}

function mergeSurfaceFields(
  base: SurfaceConfig | undefined,
  override: SurfaceConfig | undefined,
): SurfaceConfig | undefined {
  if (!base && !override) {
    return undefined;
  }

  if (!base) {
    return override ? { ...override } : undefined;
  }

  if (!override) {
    return { ...base };
  }

  const merged: SurfaceConfig = {
    ...base,
    ...override,
  };

  merged.className = mergeClassNames(base.className, override.className);
  merged.style = mergeStyles(base.style, override.style);

  if (base.states || override.states) {
    const states: Partial<Record<RuntimeSurfaceState, SurfaceConfig>> = {};
    const names = new Set<RuntimeSurfaceState>([
      ...Object.keys(base.states ?? {}) as RuntimeSurfaceState[],
      ...Object.keys(override.states ?? {}) as RuntimeSurfaceState[],
    ]);

    for (const name of names) {
      states[name] = mergeSurfaceFields(base.states?.[name], override.states?.[name]);
    }

    merged.states = states;
  }

  return merged;
}

function stripStateMap(config: SurfaceConfig | undefined): SurfaceConfig | undefined {
  if (!config) {
    return undefined;
  }

  const { states: _states, ...rest } = config;
  return rest;
}

const SURFACE_CONFIG_KEYS = new Set([
  "className",
  "style",
  "states",
  "hover",
  "focus",
  "active",
  "background",
  "backgroundColor",
  "padding",
  "paddingX",
  "paddingY",
  "margin",
  "marginX",
  "marginY",
  "gap",
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "bg",
  "color",
  "borderRadius",
  "border",
  "shadow",
  "opacity",
  "overflow",
  "cursor",
  "position",
  "inset",
  "display",
  "flexDirection",
  "alignItems",
  "justifyContent",
  "flexWrap",
  "flex",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridColumn",
  "gridRow",
  "textAlign",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "transform",
  "transition",
  "whiteSpace",
]);

export function extractSurfaceConfig(
  value: Record<string, unknown> | undefined,
  options?: { omit?: string[] },
): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }

  const omitted = new Set(options?.omit ?? []);

  const extracted = Object.fromEntries(
    Object.entries(value).filter(
      ([key]) => SURFACE_CONFIG_KEYS.has(key) && !omitted.has(key),
    ),
  );

  return Object.keys(extracted).length > 0 ? extracted : undefined;
}

export function mergeClassNames(
  ...classes: Array<string | undefined | null | false>
): string | undefined {
  const merged = classes
    .flatMap((value) => (typeof value === "string" ? value.split(/\s+/) : []))
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");

  return merged || undefined;
}

export function mergeStyles(
  ...styles: Array<Record<string, string | number> | CSSProperties | undefined | null>
): Record<string, string | number> | undefined {
  const merged = Object.assign({}, ...styles.filter(Boolean));
  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function resolveSurfaceStateOrder(
  states: RuntimeSurfaceState[],
): RuntimeSurfaceState[] {
  const seen = new Set<RuntimeSurfaceState>();
  return CANONICAL_STATE_ORDER.filter((state) => {
    if (!states.includes(state) || seen.has(state)) {
      return false;
    }

    seen.add(state);
    return true;
  });
}

export function resolveSurfaceConfig(params: {
  implementationBase?: Record<string, unknown>;
  componentSurface?: Record<string, unknown>;
  itemSurface?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
}): {
  className?: string;
  style?: Record<string, string | number>;
  resolvedConfigForWrapper?: Record<string, unknown>;
} {
  const implementationBase = toSurfaceConfig(params.implementationBase);
  const componentSurface = toSurfaceConfig(params.componentSurface);
  const itemSurface = toSurfaceConfig(params.itemSurface);
  const activeStates = resolveSurfaceStateOrder(params.activeStates ?? []);

  let merged = mergeSurfaceFields(
    stripStateMap(implementationBase),
    stripStateMap(componentSurface),
  );
  merged = mergeSurfaceFields(merged, stripStateMap(itemSurface));

  for (const state of activeStates) {
    merged = mergeSurfaceFields(merged, implementationBase?.states?.[state]);
    merged = mergeSurfaceFields(merged, componentSurface?.states?.[state]);
    merged = mergeSurfaceFields(merged, itemSurface?.states?.[state]);
  }

  return {
    className: merged?.className,
    style: merged?.style,
    resolvedConfigForWrapper: merged,
  };
}

export function resolveSurfacePresentation(params: {
  surfaceId?: string;
  implementationBase?: Record<string, unknown>;
  componentSurface?: Record<string, unknown>;
  itemSurface?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
}): {
  className?: string;
  style?: CSSProperties;
  scopedCss?: string;
  resolvedConfigForWrapper?: Record<string, unknown>;
} {
  const resolved = resolveSurfaceConfig(params);
  const wrapperConfig = resolved.resolvedConfigForWrapper;
  const styleProps = wrapperConfig ? resolveStyleProps(wrapperConfig) : undefined;
  const scopedCss =
    params.surfaceId && wrapperConfig
      ? [
          resolveInteractiveCSS(
            params.surfaceId,
            wrapperConfig.hover as Parameters<typeof resolveInteractiveCSS>[1],
            wrapperConfig.focus as Parameters<typeof resolveInteractiveCSS>[2],
            wrapperConfig.active as Parameters<typeof resolveInteractiveCSS>[3],
          ),
          resolveResponsiveCSS(params.surfaceId, wrapperConfig),
        ]
          .filter(Boolean)
          .join("\n") || undefined
      : undefined;

  return {
    className: resolved.className,
    style: mergeStyles(styleProps, resolved.style) as CSSProperties | undefined,
    scopedCss,
    resolvedConfigForWrapper: wrapperConfig,
  };
}
