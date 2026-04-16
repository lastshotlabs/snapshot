import type { ReactNode } from "react";
import type { ComponentAnimationConfig, ComponentBackgroundConfig, ComponentTransitionConfig, ComponentZIndex, HoverConfig, FocusConfig, ActiveConfig, ExitAnimationConfig } from "./types";
/**
 * Props for ComponentWrapper.
 */
interface ComponentWrapperProps {
    /** The component type string (e.g. 'detail-card'). Applied as data-snapshot-component. */
    type: string;
    /** Optional component id for scoped token overrides. */
    id?: string;
    /** Optional token overrides scoped to this component instance. */
    tokens?: Record<string, string>;
    /** Optional CSS class name. */
    className?: string;
    /** Optional inline style overrides from component config. */
    style?: Record<string, string | number>;
    /** Optional sticky positioning. */
    sticky?: boolean | {
        top?: string;
        zIndex?: ComponentZIndex;
    };
    /** Optional z-index override. */
    zIndex?: ComponentZIndex;
    /** Optional animation config. */
    animation?: ComponentAnimationConfig;
    /** Optional glass treatment. */
    glass?: boolean;
    /** Optional background config. */
    background?: ComponentBackgroundConfig;
    /** Optional transition config. */
    transition?: ComponentTransitionConfig;
    /** Accessible label override. */
    ariaLabel?: string;
    /** Accessible description target id. */
    ariaDescribedBy?: string;
    /** Optional landmark or semantic role. */
    role?: string;
    /** Optional live region politeness setting. */
    ariaLive?: "off" | "polite" | "assertive";
    /** Hover state styles. */
    hover?: HoverConfig;
    /** Focus state styles. */
    focus?: FocusConfig;
    /** Active state styles. */
    active?: ActiveConfig;
    /** Exit animation config. */
    exitAnimation?: ExitAnimationConfig;
    /** Raw manifest config used for dev-only inspection and style prop resolution. */
    config?: Record<string, unknown>;
    /** Children to render. */
    children: ReactNode;
}
export declare function ComponentWrapper({ type, id: explicitId, tokens, className, style, sticky, zIndex, animation, glass, background, transition, ariaLabel, ariaDescribedBy, role, ariaLive, hover, focus, active, exitAnimation, config, children, }: ComponentWrapperProps): import("react/jsx-runtime").JSX.Element;
export {};
