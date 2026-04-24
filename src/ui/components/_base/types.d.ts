import { z } from "zod";
import { fromRefSchema, type FromRef as SharedFromRef } from "@lastshotlabs/frontend-contract/refs";
import { dataSourceSchema, endpointTargetSchema, resourceRefSchema } from "../../manifest/resources";
import { componentAnimationSchema, componentBackgroundSchema, componentTransitionSchema, componentZIndexSchema, hoverConfigSchema, focusConfigSchema, activeConfigSchema, exitAnimationSchema } from "./schema";
/**
 * Schema for a FromRef value — a reference to another component's published data.
 * Supports optional transforms (uppercase, lowercase, trim, etc.) and transformArg.
 */
export { fromRefSchema };
/** Type for a FromRef value. */
export type FromRef = SharedFromRef;
/**
 * Type guard — returns true if value is a FromRef object.
 */
export declare function isFromRef(value: unknown): value is FromRef;
/**
 * Creates a Zod schema that accepts either a literal value of type T or a FromRef.
 *
 * @param schema - The Zod schema for the literal value
 * @returns A union schema accepting either the literal or a FromRef
 */
export declare function orFromRef<T extends z.ZodTypeAny>(schema: T): z.ZodUnion<[T, typeof fromRefSchema]>;
export { dataSourceSchema, endpointTargetSchema, resourceRefSchema };
export declare const pollConfigSchema: z.ZodObject<{
    interval: z.ZodNumber;
    pauseWhenHidden: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    interval: number;
    pauseWhenHidden: boolean;
}, {
    interval: number;
    pauseWhenHidden?: boolean | undefined;
}>;
export type ComponentZIndex = z.infer<typeof componentZIndexSchema>;
export type ComponentAnimationConfig = z.infer<typeof componentAnimationSchema>;
export type ComponentBackgroundConfig = z.infer<typeof componentBackgroundSchema>;
export type ComponentTransitionConfig = z.infer<typeof componentTransitionSchema>;
export type HoverConfig = z.infer<typeof hoverConfigSchema>;
export type FocusConfig = z.infer<typeof focusConfigSchema>;
export type ActiveConfig = z.infer<typeof activeConfigSchema>;
export type ExitAnimationConfig = z.infer<typeof exitAnimationSchema>;
/**
 * Base config fields shared by all config-driven components.
 * Every component schema should extend this via `.merge()` or `.extend()`.
 */
export declare const baseComponentConfigSchema: z.ZodObject<{
    /** Unique identifier for this component instance. Used for from-ref publishing. */
    id: z.ZodOptional<z.ZodString>;
    /** Optional token overrides applied to the wrapper. */
    tokens: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    /** String expression that controls visibility. */
    visibleWhen: z.ZodOptional<z.ZodString>;
    /** Whether the component is visible. Can be a FromRef for conditional rendering. */
    visible: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodObject<{
        from: z.ZodString;
        transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
        transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    }, "strict", z.ZodTypeAny, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }, {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    }>]>>;
    /** CSS class name(s) to apply to the component wrapper. */
    className: z.ZodOptional<z.ZodString>;
    /** Inline style overrides as a CSS property map. */
    style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
    /** Sticky positioning. */
    sticky: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodObject<{
        top: z.ZodOptional<z.ZodString>;
        zIndex: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["base", "dropdown", "sticky", "overlay", "modal", "popover", "toast"]>, z.ZodNumber]>>;
    }, "strict", z.ZodTypeAny, {
        top?: string | undefined;
        zIndex?: number | "base" | "sticky" | "dropdown" | "overlay" | "modal" | "popover" | "toast" | undefined;
    }, {
        top?: string | undefined;
        zIndex?: number | "base" | "sticky" | "dropdown" | "overlay" | "modal" | "popover" | "toast" | undefined;
    }>]>>;
    /** Explicit z-index override. */
    zIndex: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["base", "dropdown", "sticky", "overlay", "modal", "popover", "toast"]>, z.ZodNumber]>>;
    /** Enter animation config. */
    animation: z.ZodOptional<z.ZodObject<{
        enter: z.ZodEnum<["fade", "fade-up", "fade-down", "slide-left", "slide-right", "scale", "bounce"]>;
        duration: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["instant", "fast", "normal", "slow"]>, z.ZodNumber]>>;
        delay: z.ZodOptional<z.ZodNumber>;
        easing: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["default", "in", "out", "in-out", "spring"]>, z.ZodString]>>;
        stagger: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        enter: "scale" | "fade" | "fade-up" | "fade-down" | "slide-left" | "slide-right" | "bounce";
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        delay?: number | undefined;
        easing?: string | undefined;
        stagger?: number | undefined;
    }, {
        enter: "scale" | "fade" | "fade-up" | "fade-down" | "slide-left" | "slide-right" | "bounce";
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        delay?: number | undefined;
        easing?: string | undefined;
        stagger?: number | undefined;
    }>>;
    /** Glass effect shorthand. */
    glass: z.ZodOptional<z.ZodBoolean>;
    /** Background fill shorthand. */
    background: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
        image: z.ZodOptional<z.ZodString>;
        overlay: z.ZodOptional<z.ZodString>;
        gradient: z.ZodOptional<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["linear", "radial", "conic"]>>;
            direction: z.ZodOptional<z.ZodString>;
            stops: z.ZodArray<z.ZodObject<{
                color: z.ZodString;
                position: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                color: string;
                position?: string | undefined;
            }, {
                color: string;
                position?: string | undefined;
            }>, "many">;
        }, "strict", z.ZodTypeAny, {
            type: "linear" | "radial" | "conic";
            stops: {
                color: string;
                position?: string | undefined;
            }[];
            direction?: string | undefined;
        }, {
            stops: {
                color: string;
                position?: string | undefined;
            }[];
            type?: "linear" | "radial" | "conic" | undefined;
            direction?: string | undefined;
        }>>;
        position: z.ZodOptional<z.ZodString>;
        size: z.ZodOptional<z.ZodEnum<["cover", "contain", "auto"]>>;
        fixed: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        size?: "auto" | "cover" | "contain" | undefined;
        overlay?: string | undefined;
        position?: string | undefined;
        image?: string | undefined;
        gradient?: {
            type: "linear" | "radial" | "conic";
            stops: {
                color: string;
                position?: string | undefined;
            }[];
            direction?: string | undefined;
        } | undefined;
        fixed?: boolean | undefined;
    }, {
        size?: "auto" | "cover" | "contain" | undefined;
        overlay?: string | undefined;
        position?: string | undefined;
        image?: string | undefined;
        gradient?: {
            stops: {
                color: string;
                position?: string | undefined;
            }[];
            type?: "linear" | "radial" | "conic" | undefined;
            direction?: string | undefined;
        } | undefined;
        fixed?: boolean | undefined;
    }>]>>;
    /** Transition shorthand. */
    transition: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["all", "colors", "opacity", "shadow", "transform"]>, z.ZodObject<{
        property: z.ZodDefault<z.ZodString>;
        duration: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["instant", "fast", "normal", "slow"]>, z.ZodNumber]>>;
        easing: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["default", "in", "out", "in-out", "spring"]>, z.ZodString]>>;
    }, "strict", z.ZodTypeAny, {
        property: string;
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        easing?: string | undefined;
    }, {
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        easing?: string | undefined;
        property?: string | undefined;
    }>]>>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    style?: Record<string, string | number> | undefined;
    transition?: "transform" | "all" | "shadow" | "opacity" | "colors" | {
        property: string;
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        easing?: string | undefined;
    } | undefined;
    sticky?: boolean | {
        top?: string | undefined;
        zIndex?: number | "base" | "sticky" | "dropdown" | "overlay" | "modal" | "popover" | "toast" | undefined;
    } | undefined;
    background?: string | {
        size?: "auto" | "cover" | "contain" | undefined;
        overlay?: string | undefined;
        position?: string | undefined;
        image?: string | undefined;
        gradient?: {
            type: "linear" | "radial" | "conic";
            stops: {
                color: string;
                position?: string | undefined;
            }[];
            direction?: string | undefined;
        } | undefined;
        fixed?: boolean | undefined;
    } | undefined;
    visible?: boolean | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    } | undefined;
    className?: string | undefined;
    tokens?: Record<string, string> | undefined;
    visibleWhen?: string | undefined;
    zIndex?: number | "base" | "sticky" | "dropdown" | "overlay" | "modal" | "popover" | "toast" | undefined;
    animation?: {
        enter: "scale" | "fade" | "fade-up" | "fade-down" | "slide-left" | "slide-right" | "bounce";
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        delay?: number | undefined;
        easing?: string | undefined;
        stagger?: number | undefined;
    } | undefined;
    glass?: boolean | undefined;
}, {
    id?: string | undefined;
    style?: Record<string, string | number> | undefined;
    transition?: "transform" | "all" | "shadow" | "opacity" | "colors" | {
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        easing?: string | undefined;
        property?: string | undefined;
    } | undefined;
    sticky?: boolean | {
        top?: string | undefined;
        zIndex?: number | "base" | "sticky" | "dropdown" | "overlay" | "modal" | "popover" | "toast" | undefined;
    } | undefined;
    background?: string | {
        size?: "auto" | "cover" | "contain" | undefined;
        overlay?: string | undefined;
        position?: string | undefined;
        image?: string | undefined;
        gradient?: {
            stops: {
                color: string;
                position?: string | undefined;
            }[];
            type?: "linear" | "radial" | "conic" | undefined;
            direction?: string | undefined;
        } | undefined;
        fixed?: boolean | undefined;
    } | undefined;
    visible?: boolean | {
        from: string;
        transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
        transformArg?: string | number | undefined;
    } | undefined;
    className?: string | undefined;
    tokens?: Record<string, string> | undefined;
    visibleWhen?: string | undefined;
    zIndex?: number | "base" | "sticky" | "dropdown" | "overlay" | "modal" | "popover" | "toast" | undefined;
    animation?: {
        enter: "scale" | "fade" | "fade-up" | "fade-down" | "slide-left" | "slide-right" | "bounce";
        duration?: number | "instant" | "fast" | "normal" | "slow" | undefined;
        delay?: number | undefined;
        easing?: string | undefined;
        stagger?: number | undefined;
    } | undefined;
    glass?: boolean | undefined;
}>;
/** Base config type inferred from the schema. */
export type BaseComponentConfig = z.infer<typeof baseComponentConfigSchema>;
