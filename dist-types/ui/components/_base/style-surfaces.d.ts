import type { CSSProperties } from "react";
export type RuntimeSurfaceState = "hover" | "focus" | "open" | "selected" | "current" | "active" | "completed" | "invalid" | "disabled";
export declare function mergeClassNames(...classes: Array<string | undefined | null | false>): string | undefined;
export declare function mergeStyles(...styles: Array<Record<string, string | number> | CSSProperties | undefined | null>): Record<string, string | number> | undefined;
export declare function resolveSurfaceStateOrder(states: RuntimeSurfaceState[]): RuntimeSurfaceState[];
export declare function resolveSurfaceConfig(params: {
    implementationBase?: Record<string, unknown>;
    componentSurface?: Record<string, unknown>;
    itemSurface?: Record<string, unknown>;
    activeStates?: RuntimeSurfaceState[];
}): {
    className?: string;
    style?: Record<string, string | number>;
    resolvedConfigForWrapper?: Record<string, unknown>;
};
export declare function resolveSurfacePresentation(params: {
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
};
