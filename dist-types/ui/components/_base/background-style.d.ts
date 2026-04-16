import type { CSSProperties } from "react";
export interface BackgroundGradientStop {
    color: string;
    position?: string;
}
export interface BackgroundGradientConfig {
    type?: "linear" | "radial" | "conic";
    direction?: string;
    stops: BackgroundGradientStop[];
}
export interface BackgroundObjectConfig {
    image?: string;
    overlay?: string;
    gradient?: BackgroundGradientConfig;
    position?: string;
    size?: "cover" | "contain" | "auto";
    fixed?: boolean;
}
export type ComponentBackgroundValue = string | BackgroundObjectConfig;
export declare function resolveComponentBackgroundStyle(background: ComponentBackgroundValue | undefined): CSSProperties | undefined;
