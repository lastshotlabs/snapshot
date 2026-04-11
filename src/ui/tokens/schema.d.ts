import { z } from "zod";
/** Zod schema for semantic color tokens. Each generates a CSS custom property. */
export declare const themeColorsSchema: z.ZodObject<{
    /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
    primary: z.ZodOptional<z.ZodString>;
    /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
    secondary: z.ZodOptional<z.ZodString>;
    /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
    muted: z.ZodOptional<z.ZodString>;
    /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
    accent: z.ZodOptional<z.ZodString>;
    /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
    destructive: z.ZodOptional<z.ZodString>;
    /** Success color. Generates `--success` and `--success-foreground`. */
    success: z.ZodOptional<z.ZodString>;
    /** Warning color. Generates `--warning` and `--warning-foreground`. */
    warning: z.ZodOptional<z.ZodString>;
    /** Info color. Generates `--info` and `--info-foreground`. */
    info: z.ZodOptional<z.ZodString>;
    /** Page background. Generates `--background` and `--foreground`. */
    background: z.ZodOptional<z.ZodString>;
    /** Card background. Generates `--card` and `--card-foreground`. */
    card: z.ZodOptional<z.ZodString>;
    /** Popover background. Generates `--popover` and `--popover-foreground`. */
    popover: z.ZodOptional<z.ZodString>;
    /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
    sidebar: z.ZodOptional<z.ZodString>;
    /** Border color. Generates `--border`. */
    border: z.ZodOptional<z.ZodString>;
    /** Input border color. Generates `--input`. */
    input: z.ZodOptional<z.ZodString>;
    /** Focus ring color. Generates `--ring`. */
    ring: z.ZodOptional<z.ZodString>;
    /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
    chart: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodString, z.ZodString], null>>;
}, "strict", z.ZodTypeAny, {
    info?: string | undefined;
    input?: string | undefined;
    warning?: string | undefined;
    success?: string | undefined;
    chart?: [string, string, string, string, string] | undefined;
    sidebar?: string | undefined;
    primary?: string | undefined;
    secondary?: string | undefined;
    muted?: string | undefined;
    accent?: string | undefined;
    destructive?: string | undefined;
    background?: string | undefined;
    card?: string | undefined;
    popover?: string | undefined;
    border?: string | undefined;
    ring?: string | undefined;
}, {
    info?: string | undefined;
    input?: string | undefined;
    warning?: string | undefined;
    success?: string | undefined;
    chart?: [string, string, string, string, string] | undefined;
    sidebar?: string | undefined;
    primary?: string | undefined;
    secondary?: string | undefined;
    muted?: string | undefined;
    accent?: string | undefined;
    destructive?: string | undefined;
    background?: string | undefined;
    card?: string | undefined;
    popover?: string | undefined;
    border?: string | undefined;
    ring?: string | undefined;
}>;
/** Zod schema for border radius scale. */
export declare const radiusSchema: z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>;
/** Zod schema for spacing density. */
export declare const spacingSchema: z.ZodEnum<["compact", "default", "comfortable", "spacious"]>;
/** Zod schema for font configuration. */
export declare const fontSchema: z.ZodObject<{
    /** Primary font family (body text, headings). */
    sans: z.ZodOptional<z.ZodString>;
    /** Monospace font family (code, pre). */
    mono: z.ZodOptional<z.ZodString>;
    /** Display font (large headings, hero text). */
    display: z.ZodOptional<z.ZodString>;
    /** Base font size in px. Default: 16. */
    baseSize: z.ZodOptional<z.ZodNumber>;
    /** Type scale ratio. Default: 1.25 (major third). */
    scale: z.ZodOptional<z.ZodNumber>;
    /** Custom font URL (e.g. Google Fonts @import URL). */
    url: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    url?: string | undefined;
    sans?: string | undefined;
    mono?: string | undefined;
    display?: string | undefined;
    baseSize?: number | undefined;
    scale?: number | undefined;
}, {
    url?: string | undefined;
    sans?: string | undefined;
    mono?: string | undefined;
    display?: string | undefined;
    baseSize?: number | undefined;
    scale?: number | undefined;
}>;
/** Zod schema for component-level token overrides. */
export declare const componentTokensSchema: z.ZodObject<{
    card: z.ZodOptional<z.ZodObject<{
        shadow: z.ZodOptional<z.ZodEnum<["none", "sm", "md", "lg", "xl"]>>;
        padding: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable", "spacious"]>>;
        border: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        border?: boolean | undefined;
        shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
        padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
    }, {
        border?: boolean | undefined;
        shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
        padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
    }>>;
    table: z.ZodOptional<z.ZodObject<{
        striped: z.ZodOptional<z.ZodBoolean>;
        density: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable"]>>;
        headerBackground: z.ZodOptional<z.ZodBoolean>;
        hoverRow: z.ZodOptional<z.ZodBoolean>;
        borderStyle: z.ZodOptional<z.ZodEnum<["none", "horizontal", "grid"]>>;
    }, "strict", z.ZodTypeAny, {
        striped?: boolean | undefined;
        density?: "default" | "compact" | "comfortable" | undefined;
        headerBackground?: boolean | undefined;
        hoverRow?: boolean | undefined;
        borderStyle?: "none" | "grid" | "horizontal" | undefined;
    }, {
        striped?: boolean | undefined;
        density?: "default" | "compact" | "comfortable" | undefined;
        headerBackground?: boolean | undefined;
        hoverRow?: boolean | undefined;
        borderStyle?: "none" | "grid" | "horizontal" | undefined;
    }>>;
    button: z.ZodOptional<z.ZodObject<{
        weight: z.ZodOptional<z.ZodEnum<["light", "medium", "bold"]>>;
        uppercase: z.ZodOptional<z.ZodBoolean>;
        iconSize: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
    }, "strict", z.ZodTypeAny, {
        uppercase?: boolean | undefined;
        weight?: "bold" | "medium" | "light" | undefined;
        iconSize?: "sm" | "md" | "lg" | undefined;
    }, {
        uppercase?: boolean | undefined;
        weight?: "bold" | "medium" | "light" | undefined;
        iconSize?: "sm" | "md" | "lg" | undefined;
    }>>;
    input: z.ZodOptional<z.ZodObject<{
        size: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
        variant: z.ZodOptional<z.ZodEnum<["outline", "filled", "underline"]>>;
    }, "strict", z.ZodTypeAny, {
        size?: "sm" | "md" | "lg" | undefined;
        variant?: "outline" | "filled" | "underline" | undefined;
    }, {
        size?: "sm" | "md" | "lg" | undefined;
        variant?: "outline" | "filled" | "underline" | undefined;
    }>>;
    modal: z.ZodOptional<z.ZodObject<{
        overlay: z.ZodOptional<z.ZodEnum<["light", "dark", "blur"]>>;
        animation: z.ZodOptional<z.ZodEnum<["fade", "scale", "slide-up", "none"]>>;
    }, "strict", z.ZodTypeAny, {
        overlay?: "blur" | "dark" | "light" | undefined;
        animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
    }, {
        overlay?: "blur" | "dark" | "light" | undefined;
        animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
    }>>;
    nav: z.ZodOptional<z.ZodObject<{
        variant: z.ZodOptional<z.ZodEnum<["minimal", "bordered", "filled"]>>;
        activeIndicator: z.ZodOptional<z.ZodEnum<["background", "border-left", "border-bottom", "dot"]>>;
    }, "strict", z.ZodTypeAny, {
        variant?: "minimal" | "filled" | "bordered" | undefined;
        activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
    }, {
        variant?: "minimal" | "filled" | "bordered" | undefined;
        activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
    }>>;
    badge: z.ZodOptional<z.ZodObject<{
        variant: z.ZodOptional<z.ZodEnum<["solid", "outline", "soft"]>>;
        rounded: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        variant?: "outline" | "solid" | "soft" | undefined;
        rounded?: boolean | undefined;
    }, {
        variant?: "outline" | "solid" | "soft" | undefined;
        rounded?: boolean | undefined;
    }>>;
    toast: z.ZodOptional<z.ZodObject<{
        position: z.ZodOptional<z.ZodEnum<["top-right", "top-center", "bottom-right", "bottom-center"]>>;
        animation: z.ZodOptional<z.ZodEnum<["slide", "fade", "pop"]>>;
    }, "strict", z.ZodTypeAny, {
        animation?: "pop" | "fade" | "slide" | undefined;
        position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
    }, {
        animation?: "pop" | "fade" | "slide" | undefined;
        position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    input?: {
        size?: "sm" | "md" | "lg" | undefined;
        variant?: "outline" | "filled" | "underline" | undefined;
    } | undefined;
    badge?: {
        variant?: "outline" | "solid" | "soft" | undefined;
        rounded?: boolean | undefined;
    } | undefined;
    table?: {
        striped?: boolean | undefined;
        density?: "default" | "compact" | "comfortable" | undefined;
        headerBackground?: boolean | undefined;
        hoverRow?: boolean | undefined;
        borderStyle?: "none" | "grid" | "horizontal" | undefined;
    } | undefined;
    card?: {
        border?: boolean | undefined;
        shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
        padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
    } | undefined;
    button?: {
        uppercase?: boolean | undefined;
        weight?: "bold" | "medium" | "light" | undefined;
        iconSize?: "sm" | "md" | "lg" | undefined;
    } | undefined;
    modal?: {
        overlay?: "blur" | "dark" | "light" | undefined;
        animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
    } | undefined;
    nav?: {
        variant?: "minimal" | "filled" | "bordered" | undefined;
        activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
    } | undefined;
    toast?: {
        animation?: "pop" | "fade" | "slide" | undefined;
        position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
    } | undefined;
}, {
    input?: {
        size?: "sm" | "md" | "lg" | undefined;
        variant?: "outline" | "filled" | "underline" | undefined;
    } | undefined;
    badge?: {
        variant?: "outline" | "solid" | "soft" | undefined;
        rounded?: boolean | undefined;
    } | undefined;
    table?: {
        striped?: boolean | undefined;
        density?: "default" | "compact" | "comfortable" | undefined;
        headerBackground?: boolean | undefined;
        hoverRow?: boolean | undefined;
        borderStyle?: "none" | "grid" | "horizontal" | undefined;
    } | undefined;
    card?: {
        border?: boolean | undefined;
        shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
        padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
    } | undefined;
    button?: {
        uppercase?: boolean | undefined;
        weight?: "bold" | "medium" | "light" | undefined;
        iconSize?: "sm" | "md" | "lg" | undefined;
    } | undefined;
    modal?: {
        overlay?: "blur" | "dark" | "light" | undefined;
        animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
    } | undefined;
    nav?: {
        variant?: "minimal" | "filled" | "bordered" | undefined;
        activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
    } | undefined;
    toast?: {
        animation?: "pop" | "fade" | "slide" | undefined;
        position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
    } | undefined;
}>;
/** Zod schema for shadow scale. */
export declare const shadowSchema: z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>;
/** Zod schema for global token overrides beyond colors/radius/spacing/font. */
export declare const globalTokensSchema: z.ZodObject<{
    /** Shadow scale override. Default: uses flavor's shadow scale. */
    shadow: z.ZodOptional<z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>>;
    /** Animation/transition duration scale. */
    durations: z.ZodOptional<z.ZodObject<{
        instant: z.ZodOptional<z.ZodNumber>;
        fast: z.ZodOptional<z.ZodNumber>;
        normal: z.ZodOptional<z.ZodNumber>;
        slow: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        instant?: number | undefined;
        fast?: number | undefined;
        normal?: number | undefined;
        slow?: number | undefined;
    }, {
        instant?: number | undefined;
        fast?: number | undefined;
        normal?: number | undefined;
        slow?: number | undefined;
    }>>;
    /** Easing functions. */
    easings: z.ZodOptional<z.ZodObject<{
        default: z.ZodOptional<z.ZodString>;
        in: z.ZodOptional<z.ZodString>;
        out: z.ZodOptional<z.ZodString>;
        inOut: z.ZodOptional<z.ZodString>;
        spring: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        default?: string | undefined;
        out?: string | undefined;
        in?: string | undefined;
        inOut?: string | undefined;
        spring?: string | undefined;
    }, {
        default?: string | undefined;
        out?: string | undefined;
        in?: string | undefined;
        inOut?: string | undefined;
        spring?: string | undefined;
    }>>;
    /** Opacity scale overrides. */
    opacity: z.ZodOptional<z.ZodObject<{
        disabled: z.ZodOptional<z.ZodNumber>;
        hover: z.ZodOptional<z.ZodNumber>;
        muted: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        disabled?: number | undefined;
        muted?: number | undefined;
        hover?: number | undefined;
    }, {
        disabled?: number | undefined;
        muted?: number | undefined;
        hover?: number | undefined;
    }>>;
    /** Line-height scale overrides. */
    lineHeight: z.ZodOptional<z.ZodObject<{
        none: z.ZodOptional<z.ZodNumber>;
        tight: z.ZodOptional<z.ZodNumber>;
        normal: z.ZodOptional<z.ZodNumber>;
        relaxed: z.ZodOptional<z.ZodNumber>;
        loose: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        none?: number | undefined;
        relaxed?: number | undefined;
        normal?: number | undefined;
        tight?: number | undefined;
        loose?: number | undefined;
    }, {
        none?: number | undefined;
        relaxed?: number | undefined;
        normal?: number | undefined;
        tight?: number | undefined;
        loose?: number | undefined;
    }>>;
    /** Letter-spacing scale overrides. */
    tracking: z.ZodOptional<z.ZodObject<{
        tight: z.ZodOptional<z.ZodString>;
        normal: z.ZodOptional<z.ZodString>;
        wide: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        normal?: string | undefined;
        tight?: string | undefined;
        wide?: string | undefined;
    }, {
        normal?: string | undefined;
        tight?: string | undefined;
        wide?: string | undefined;
    }>>;
    /** Border-width scale overrides. */
    borderWidth: z.ZodOptional<z.ZodObject<{
        none: z.ZodOptional<z.ZodString>;
        thin: z.ZodOptional<z.ZodString>;
        default: z.ZodOptional<z.ZodString>;
        thick: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        none?: string | undefined;
        default?: string | undefined;
        thin?: string | undefined;
        thick?: string | undefined;
    }, {
        none?: string | undefined;
        default?: string | undefined;
        thin?: string | undefined;
        thick?: string | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
    durations?: {
        instant?: number | undefined;
        fast?: number | undefined;
        normal?: number | undefined;
        slow?: number | undefined;
    } | undefined;
    easings?: {
        default?: string | undefined;
        out?: string | undefined;
        in?: string | undefined;
        inOut?: string | undefined;
        spring?: string | undefined;
    } | undefined;
    opacity?: {
        disabled?: number | undefined;
        muted?: number | undefined;
        hover?: number | undefined;
    } | undefined;
    lineHeight?: {
        none?: number | undefined;
        relaxed?: number | undefined;
        normal?: number | undefined;
        tight?: number | undefined;
        loose?: number | undefined;
    } | undefined;
    tracking?: {
        normal?: string | undefined;
        tight?: string | undefined;
        wide?: string | undefined;
    } | undefined;
    borderWidth?: {
        none?: string | undefined;
        default?: string | undefined;
        thin?: string | undefined;
        thick?: string | undefined;
    } | undefined;
}, {
    shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
    durations?: {
        instant?: number | undefined;
        fast?: number | undefined;
        normal?: number | undefined;
        slow?: number | undefined;
    } | undefined;
    easings?: {
        default?: string | undefined;
        out?: string | undefined;
        in?: string | undefined;
        inOut?: string | undefined;
        spring?: string | undefined;
    } | undefined;
    opacity?: {
        disabled?: number | undefined;
        muted?: number | undefined;
        hover?: number | undefined;
    } | undefined;
    lineHeight?: {
        none?: number | undefined;
        relaxed?: number | undefined;
        normal?: number | undefined;
        tight?: number | undefined;
        loose?: number | undefined;
    } | undefined;
    tracking?: {
        normal?: string | undefined;
        tight?: string | undefined;
        wide?: string | undefined;
    } | undefined;
    borderWidth?: {
        none?: string | undefined;
        default?: string | undefined;
        thin?: string | undefined;
        thick?: string | undefined;
    } | undefined;
}>;
/**
 * Zod schema for manifest-declared flavor extensions.
 *
 * All flavor fields are optional except `extends`, which points to the parent
 * flavor that this declaration inherits from.
 */
export declare const flavorOverrideSchema: z.ZodObject<{
    extends: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    colors: z.ZodOptional<z.ZodObject<{
        /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
        primary: z.ZodOptional<z.ZodString>;
        /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
        secondary: z.ZodOptional<z.ZodString>;
        /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
        muted: z.ZodOptional<z.ZodString>;
        /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
        accent: z.ZodOptional<z.ZodString>;
        /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
        destructive: z.ZodOptional<z.ZodString>;
        /** Success color. Generates `--success` and `--success-foreground`. */
        success: z.ZodOptional<z.ZodString>;
        /** Warning color. Generates `--warning` and `--warning-foreground`. */
        warning: z.ZodOptional<z.ZodString>;
        /** Info color. Generates `--info` and `--info-foreground`. */
        info: z.ZodOptional<z.ZodString>;
        /** Page background. Generates `--background` and `--foreground`. */
        background: z.ZodOptional<z.ZodString>;
        /** Card background. Generates `--card` and `--card-foreground`. */
        card: z.ZodOptional<z.ZodString>;
        /** Popover background. Generates `--popover` and `--popover-foreground`. */
        popover: z.ZodOptional<z.ZodString>;
        /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
        sidebar: z.ZodOptional<z.ZodString>;
        /** Border color. Generates `--border`. */
        border: z.ZodOptional<z.ZodString>;
        /** Input border color. Generates `--input`. */
        input: z.ZodOptional<z.ZodString>;
        /** Focus ring color. Generates `--ring`. */
        ring: z.ZodOptional<z.ZodString>;
        /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
        chart: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodString, z.ZodString], null>>;
    }, "strict", z.ZodTypeAny, {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    }, {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    }>>;
    darkColors: z.ZodOptional<z.ZodObject<{
        /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
        primary: z.ZodOptional<z.ZodString>;
        /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
        secondary: z.ZodOptional<z.ZodString>;
        /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
        muted: z.ZodOptional<z.ZodString>;
        /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
        accent: z.ZodOptional<z.ZodString>;
        /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
        destructive: z.ZodOptional<z.ZodString>;
        /** Success color. Generates `--success` and `--success-foreground`. */
        success: z.ZodOptional<z.ZodString>;
        /** Warning color. Generates `--warning` and `--warning-foreground`. */
        warning: z.ZodOptional<z.ZodString>;
        /** Info color. Generates `--info` and `--info-foreground`. */
        info: z.ZodOptional<z.ZodString>;
        /** Page background. Generates `--background` and `--foreground`. */
        background: z.ZodOptional<z.ZodString>;
        /** Card background. Generates `--card` and `--card-foreground`. */
        card: z.ZodOptional<z.ZodString>;
        /** Popover background. Generates `--popover` and `--popover-foreground`. */
        popover: z.ZodOptional<z.ZodString>;
        /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
        sidebar: z.ZodOptional<z.ZodString>;
        /** Border color. Generates `--border`. */
        border: z.ZodOptional<z.ZodString>;
        /** Input border color. Generates `--input`. */
        input: z.ZodOptional<z.ZodString>;
        /** Focus ring color. Generates `--ring`. */
        ring: z.ZodOptional<z.ZodString>;
        /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
        chart: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodString, z.ZodString], null>>;
    }, "strict", z.ZodTypeAny, {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    }, {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    }>>;
    radius: z.ZodOptional<z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>>;
    spacing: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable", "spacious"]>>;
    font: z.ZodOptional<z.ZodObject<{
        /** Primary font family (body text, headings). */
        sans: z.ZodOptional<z.ZodString>;
        /** Monospace font family (code, pre). */
        mono: z.ZodOptional<z.ZodString>;
        /** Display font (large headings, hero text). */
        display: z.ZodOptional<z.ZodString>;
        /** Base font size in px. Default: 16. */
        baseSize: z.ZodOptional<z.ZodNumber>;
        /** Type scale ratio. Default: 1.25 (major third). */
        scale: z.ZodOptional<z.ZodNumber>;
        /** Custom font URL (e.g. Google Fonts @import URL). */
        url: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        url?: string | undefined;
        sans?: string | undefined;
        mono?: string | undefined;
        display?: string | undefined;
        baseSize?: number | undefined;
        scale?: number | undefined;
    }, {
        url?: string | undefined;
        sans?: string | undefined;
        mono?: string | undefined;
        display?: string | undefined;
        baseSize?: number | undefined;
        scale?: number | undefined;
    }>>;
    components: z.ZodOptional<z.ZodObject<{
        card: z.ZodOptional<z.ZodObject<{
            shadow: z.ZodOptional<z.ZodEnum<["none", "sm", "md", "lg", "xl"]>>;
            padding: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable", "spacious"]>>;
            border: z.ZodOptional<z.ZodBoolean>;
        }, "strict", z.ZodTypeAny, {
            border?: boolean | undefined;
            shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
            padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        }, {
            border?: boolean | undefined;
            shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
            padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        }>>;
        table: z.ZodOptional<z.ZodObject<{
            striped: z.ZodOptional<z.ZodBoolean>;
            density: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable"]>>;
            headerBackground: z.ZodOptional<z.ZodBoolean>;
            hoverRow: z.ZodOptional<z.ZodBoolean>;
            borderStyle: z.ZodOptional<z.ZodEnum<["none", "horizontal", "grid"]>>;
        }, "strict", z.ZodTypeAny, {
            striped?: boolean | undefined;
            density?: "default" | "compact" | "comfortable" | undefined;
            headerBackground?: boolean | undefined;
            hoverRow?: boolean | undefined;
            borderStyle?: "none" | "grid" | "horizontal" | undefined;
        }, {
            striped?: boolean | undefined;
            density?: "default" | "compact" | "comfortable" | undefined;
            headerBackground?: boolean | undefined;
            hoverRow?: boolean | undefined;
            borderStyle?: "none" | "grid" | "horizontal" | undefined;
        }>>;
        button: z.ZodOptional<z.ZodObject<{
            weight: z.ZodOptional<z.ZodEnum<["light", "medium", "bold"]>>;
            uppercase: z.ZodOptional<z.ZodBoolean>;
            iconSize: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
        }, "strict", z.ZodTypeAny, {
            uppercase?: boolean | undefined;
            weight?: "bold" | "medium" | "light" | undefined;
            iconSize?: "sm" | "md" | "lg" | undefined;
        }, {
            uppercase?: boolean | undefined;
            weight?: "bold" | "medium" | "light" | undefined;
            iconSize?: "sm" | "md" | "lg" | undefined;
        }>>;
        input: z.ZodOptional<z.ZodObject<{
            size: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
            variant: z.ZodOptional<z.ZodEnum<["outline", "filled", "underline"]>>;
        }, "strict", z.ZodTypeAny, {
            size?: "sm" | "md" | "lg" | undefined;
            variant?: "outline" | "filled" | "underline" | undefined;
        }, {
            size?: "sm" | "md" | "lg" | undefined;
            variant?: "outline" | "filled" | "underline" | undefined;
        }>>;
        modal: z.ZodOptional<z.ZodObject<{
            overlay: z.ZodOptional<z.ZodEnum<["light", "dark", "blur"]>>;
            animation: z.ZodOptional<z.ZodEnum<["fade", "scale", "slide-up", "none"]>>;
        }, "strict", z.ZodTypeAny, {
            overlay?: "blur" | "dark" | "light" | undefined;
            animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
        }, {
            overlay?: "blur" | "dark" | "light" | undefined;
            animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
        }>>;
        nav: z.ZodOptional<z.ZodObject<{
            variant: z.ZodOptional<z.ZodEnum<["minimal", "bordered", "filled"]>>;
            activeIndicator: z.ZodOptional<z.ZodEnum<["background", "border-left", "border-bottom", "dot"]>>;
        }, "strict", z.ZodTypeAny, {
            variant?: "minimal" | "filled" | "bordered" | undefined;
            activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
        }, {
            variant?: "minimal" | "filled" | "bordered" | undefined;
            activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
        }>>;
        badge: z.ZodOptional<z.ZodObject<{
            variant: z.ZodOptional<z.ZodEnum<["solid", "outline", "soft"]>>;
            rounded: z.ZodOptional<z.ZodBoolean>;
        }, "strict", z.ZodTypeAny, {
            variant?: "outline" | "solid" | "soft" | undefined;
            rounded?: boolean | undefined;
        }, {
            variant?: "outline" | "solid" | "soft" | undefined;
            rounded?: boolean | undefined;
        }>>;
        toast: z.ZodOptional<z.ZodObject<{
            position: z.ZodOptional<z.ZodEnum<["top-right", "top-center", "bottom-right", "bottom-center"]>>;
            animation: z.ZodOptional<z.ZodEnum<["slide", "fade", "pop"]>>;
        }, "strict", z.ZodTypeAny, {
            animation?: "pop" | "fade" | "slide" | undefined;
            position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
        }, {
            animation?: "pop" | "fade" | "slide" | undefined;
            position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
        }>>;
    }, "strict", z.ZodTypeAny, {
        input?: {
            size?: "sm" | "md" | "lg" | undefined;
            variant?: "outline" | "filled" | "underline" | undefined;
        } | undefined;
        badge?: {
            variant?: "outline" | "solid" | "soft" | undefined;
            rounded?: boolean | undefined;
        } | undefined;
        table?: {
            striped?: boolean | undefined;
            density?: "default" | "compact" | "comfortable" | undefined;
            headerBackground?: boolean | undefined;
            hoverRow?: boolean | undefined;
            borderStyle?: "none" | "grid" | "horizontal" | undefined;
        } | undefined;
        card?: {
            border?: boolean | undefined;
            shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
            padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        } | undefined;
        button?: {
            uppercase?: boolean | undefined;
            weight?: "bold" | "medium" | "light" | undefined;
            iconSize?: "sm" | "md" | "lg" | undefined;
        } | undefined;
        modal?: {
            overlay?: "blur" | "dark" | "light" | undefined;
            animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
        } | undefined;
        nav?: {
            variant?: "minimal" | "filled" | "bordered" | undefined;
            activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
        } | undefined;
        toast?: {
            animation?: "pop" | "fade" | "slide" | undefined;
            position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
        } | undefined;
    }, {
        input?: {
            size?: "sm" | "md" | "lg" | undefined;
            variant?: "outline" | "filled" | "underline" | undefined;
        } | undefined;
        badge?: {
            variant?: "outline" | "solid" | "soft" | undefined;
            rounded?: boolean | undefined;
        } | undefined;
        table?: {
            striped?: boolean | undefined;
            density?: "default" | "compact" | "comfortable" | undefined;
            headerBackground?: boolean | undefined;
            hoverRow?: boolean | undefined;
            borderStyle?: "none" | "grid" | "horizontal" | undefined;
        } | undefined;
        card?: {
            border?: boolean | undefined;
            shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
            padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        } | undefined;
        button?: {
            uppercase?: boolean | undefined;
            weight?: "bold" | "medium" | "light" | undefined;
            iconSize?: "sm" | "md" | "lg" | undefined;
        } | undefined;
        modal?: {
            overlay?: "blur" | "dark" | "light" | undefined;
            animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
        } | undefined;
        nav?: {
            variant?: "minimal" | "filled" | "bordered" | undefined;
            activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
        } | undefined;
        toast?: {
            animation?: "pop" | "fade" | "slide" | undefined;
            position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
        } | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    extends: string;
    displayName?: string | undefined;
    components?: {
        input?: {
            size?: "sm" | "md" | "lg" | undefined;
            variant?: "outline" | "filled" | "underline" | undefined;
        } | undefined;
        badge?: {
            variant?: "outline" | "solid" | "soft" | undefined;
            rounded?: boolean | undefined;
        } | undefined;
        table?: {
            striped?: boolean | undefined;
            density?: "default" | "compact" | "comfortable" | undefined;
            headerBackground?: boolean | undefined;
            hoverRow?: boolean | undefined;
            borderStyle?: "none" | "grid" | "horizontal" | undefined;
        } | undefined;
        card?: {
            border?: boolean | undefined;
            shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
            padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        } | undefined;
        button?: {
            uppercase?: boolean | undefined;
            weight?: "bold" | "medium" | "light" | undefined;
            iconSize?: "sm" | "md" | "lg" | undefined;
        } | undefined;
        modal?: {
            overlay?: "blur" | "dark" | "light" | undefined;
            animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
        } | undefined;
        nav?: {
            variant?: "minimal" | "filled" | "bordered" | undefined;
            activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
        } | undefined;
        toast?: {
            animation?: "pop" | "fade" | "slide" | undefined;
            position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
        } | undefined;
    } | undefined;
    colors?: {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    } | undefined;
    darkColors?: {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    } | undefined;
    radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
    spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
    font?: {
        url?: string | undefined;
        sans?: string | undefined;
        mono?: string | undefined;
        display?: string | undefined;
        baseSize?: number | undefined;
        scale?: number | undefined;
    } | undefined;
}, {
    extends: string;
    displayName?: string | undefined;
    components?: {
        input?: {
            size?: "sm" | "md" | "lg" | undefined;
            variant?: "outline" | "filled" | "underline" | undefined;
        } | undefined;
        badge?: {
            variant?: "outline" | "solid" | "soft" | undefined;
            rounded?: boolean | undefined;
        } | undefined;
        table?: {
            striped?: boolean | undefined;
            density?: "default" | "compact" | "comfortable" | undefined;
            headerBackground?: boolean | undefined;
            hoverRow?: boolean | undefined;
            borderStyle?: "none" | "grid" | "horizontal" | undefined;
        } | undefined;
        card?: {
            border?: boolean | undefined;
            shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
            padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        } | undefined;
        button?: {
            uppercase?: boolean | undefined;
            weight?: "bold" | "medium" | "light" | undefined;
            iconSize?: "sm" | "md" | "lg" | undefined;
        } | undefined;
        modal?: {
            overlay?: "blur" | "dark" | "light" | undefined;
            animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
        } | undefined;
        nav?: {
            variant?: "minimal" | "filled" | "bordered" | undefined;
            activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
        } | undefined;
        toast?: {
            animation?: "pop" | "fade" | "slide" | undefined;
            position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
        } | undefined;
    } | undefined;
    colors?: {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    } | undefined;
    darkColors?: {
        info?: string | undefined;
        input?: string | undefined;
        warning?: string | undefined;
        success?: string | undefined;
        chart?: [string, string, string, string, string] | undefined;
        sidebar?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        muted?: string | undefined;
        accent?: string | undefined;
        destructive?: string | undefined;
        background?: string | undefined;
        card?: string | undefined;
        popover?: string | undefined;
        border?: string | undefined;
        ring?: string | undefined;
    } | undefined;
    radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
    spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
    font?: {
        url?: string | undefined;
        sans?: string | undefined;
        mono?: string | undefined;
        display?: string | undefined;
        baseSize?: number | undefined;
        scale?: number | undefined;
    } | undefined;
}>;
/** Zod schema for the full theme configuration in the manifest. */
export declare const themeConfigSchema: z.ZodObject<{
    /** Named flavor preset. Provides all base tokens. */
    flavor: z.ZodOptional<z.ZodString>;
    /** Manifest-declared flavors keyed by flavor name. */
    flavors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        extends: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        colors: z.ZodOptional<z.ZodObject<{
            /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
            primary: z.ZodOptional<z.ZodString>;
            /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
            secondary: z.ZodOptional<z.ZodString>;
            /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
            muted: z.ZodOptional<z.ZodString>;
            /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
            accent: z.ZodOptional<z.ZodString>;
            /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
            destructive: z.ZodOptional<z.ZodString>;
            /** Success color. Generates `--success` and `--success-foreground`. */
            success: z.ZodOptional<z.ZodString>;
            /** Warning color. Generates `--warning` and `--warning-foreground`. */
            warning: z.ZodOptional<z.ZodString>;
            /** Info color. Generates `--info` and `--info-foreground`. */
            info: z.ZodOptional<z.ZodString>;
            /** Page background. Generates `--background` and `--foreground`. */
            background: z.ZodOptional<z.ZodString>;
            /** Card background. Generates `--card` and `--card-foreground`. */
            card: z.ZodOptional<z.ZodString>;
            /** Popover background. Generates `--popover` and `--popover-foreground`. */
            popover: z.ZodOptional<z.ZodString>;
            /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
            sidebar: z.ZodOptional<z.ZodString>;
            /** Border color. Generates `--border`. */
            border: z.ZodOptional<z.ZodString>;
            /** Input border color. Generates `--input`. */
            input: z.ZodOptional<z.ZodString>;
            /** Focus ring color. Generates `--ring`. */
            ring: z.ZodOptional<z.ZodString>;
            /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
            chart: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodString, z.ZodString], null>>;
        }, "strict", z.ZodTypeAny, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }>>;
        darkColors: z.ZodOptional<z.ZodObject<{
            /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
            primary: z.ZodOptional<z.ZodString>;
            /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
            secondary: z.ZodOptional<z.ZodString>;
            /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
            muted: z.ZodOptional<z.ZodString>;
            /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
            accent: z.ZodOptional<z.ZodString>;
            /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
            destructive: z.ZodOptional<z.ZodString>;
            /** Success color. Generates `--success` and `--success-foreground`. */
            success: z.ZodOptional<z.ZodString>;
            /** Warning color. Generates `--warning` and `--warning-foreground`. */
            warning: z.ZodOptional<z.ZodString>;
            /** Info color. Generates `--info` and `--info-foreground`. */
            info: z.ZodOptional<z.ZodString>;
            /** Page background. Generates `--background` and `--foreground`. */
            background: z.ZodOptional<z.ZodString>;
            /** Card background. Generates `--card` and `--card-foreground`. */
            card: z.ZodOptional<z.ZodString>;
            /** Popover background. Generates `--popover` and `--popover-foreground`. */
            popover: z.ZodOptional<z.ZodString>;
            /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
            sidebar: z.ZodOptional<z.ZodString>;
            /** Border color. Generates `--border`. */
            border: z.ZodOptional<z.ZodString>;
            /** Input border color. Generates `--input`. */
            input: z.ZodOptional<z.ZodString>;
            /** Focus ring color. Generates `--ring`. */
            ring: z.ZodOptional<z.ZodString>;
            /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
            chart: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodString, z.ZodString], null>>;
        }, "strict", z.ZodTypeAny, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }>>;
        radius: z.ZodOptional<z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>>;
        spacing: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable", "spacious"]>>;
        font: z.ZodOptional<z.ZodObject<{
            /** Primary font family (body text, headings). */
            sans: z.ZodOptional<z.ZodString>;
            /** Monospace font family (code, pre). */
            mono: z.ZodOptional<z.ZodString>;
            /** Display font (large headings, hero text). */
            display: z.ZodOptional<z.ZodString>;
            /** Base font size in px. Default: 16. */
            baseSize: z.ZodOptional<z.ZodNumber>;
            /** Type scale ratio. Default: 1.25 (major third). */
            scale: z.ZodOptional<z.ZodNumber>;
            /** Custom font URL (e.g. Google Fonts @import URL). */
            url: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        }, {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        }>>;
        components: z.ZodOptional<z.ZodObject<{
            card: z.ZodOptional<z.ZodObject<{
                shadow: z.ZodOptional<z.ZodEnum<["none", "sm", "md", "lg", "xl"]>>;
                padding: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable", "spacious"]>>;
                border: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            }, {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            }>>;
            table: z.ZodOptional<z.ZodObject<{
                striped: z.ZodOptional<z.ZodBoolean>;
                density: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable"]>>;
                headerBackground: z.ZodOptional<z.ZodBoolean>;
                hoverRow: z.ZodOptional<z.ZodBoolean>;
                borderStyle: z.ZodOptional<z.ZodEnum<["none", "horizontal", "grid"]>>;
            }, "strict", z.ZodTypeAny, {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            }, {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            }>>;
            button: z.ZodOptional<z.ZodObject<{
                weight: z.ZodOptional<z.ZodEnum<["light", "medium", "bold"]>>;
                uppercase: z.ZodOptional<z.ZodBoolean>;
                iconSize: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
            }, "strict", z.ZodTypeAny, {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            }, {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            }>>;
            input: z.ZodOptional<z.ZodObject<{
                size: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
                variant: z.ZodOptional<z.ZodEnum<["outline", "filled", "underline"]>>;
            }, "strict", z.ZodTypeAny, {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            }, {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            }>>;
            modal: z.ZodOptional<z.ZodObject<{
                overlay: z.ZodOptional<z.ZodEnum<["light", "dark", "blur"]>>;
                animation: z.ZodOptional<z.ZodEnum<["fade", "scale", "slide-up", "none"]>>;
            }, "strict", z.ZodTypeAny, {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            }, {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            }>>;
            nav: z.ZodOptional<z.ZodObject<{
                variant: z.ZodOptional<z.ZodEnum<["minimal", "bordered", "filled"]>>;
                activeIndicator: z.ZodOptional<z.ZodEnum<["background", "border-left", "border-bottom", "dot"]>>;
            }, "strict", z.ZodTypeAny, {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            }, {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            }>>;
            badge: z.ZodOptional<z.ZodObject<{
                variant: z.ZodOptional<z.ZodEnum<["solid", "outline", "soft"]>>;
                rounded: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            }, {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            }>>;
            toast: z.ZodOptional<z.ZodObject<{
                position: z.ZodOptional<z.ZodEnum<["top-right", "top-center", "bottom-right", "bottom-center"]>>;
                animation: z.ZodOptional<z.ZodEnum<["slide", "fade", "pop"]>>;
            }, "strict", z.ZodTypeAny, {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            }, {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            }>>;
        }, "strict", z.ZodTypeAny, {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        }, {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        }>>;
    }, "strict", z.ZodTypeAny, {
        extends: string;
        displayName?: string | undefined;
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
    }, {
        extends: string;
        displayName?: string | undefined;
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
    }>>>;
    /** Token overrides applied on top of the flavor. */
    overrides: z.ZodOptional<z.ZodObject<{
        colors: z.ZodOptional<z.ZodObject<{
            /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
            primary: z.ZodOptional<z.ZodString>;
            /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
            secondary: z.ZodOptional<z.ZodString>;
            /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
            muted: z.ZodOptional<z.ZodString>;
            /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
            accent: z.ZodOptional<z.ZodString>;
            /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
            destructive: z.ZodOptional<z.ZodString>;
            /** Success color. Generates `--success` and `--success-foreground`. */
            success: z.ZodOptional<z.ZodString>;
            /** Warning color. Generates `--warning` and `--warning-foreground`. */
            warning: z.ZodOptional<z.ZodString>;
            /** Info color. Generates `--info` and `--info-foreground`. */
            info: z.ZodOptional<z.ZodString>;
            /** Page background. Generates `--background` and `--foreground`. */
            background: z.ZodOptional<z.ZodString>;
            /** Card background. Generates `--card` and `--card-foreground`. */
            card: z.ZodOptional<z.ZodString>;
            /** Popover background. Generates `--popover` and `--popover-foreground`. */
            popover: z.ZodOptional<z.ZodString>;
            /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
            sidebar: z.ZodOptional<z.ZodString>;
            /** Border color. Generates `--border`. */
            border: z.ZodOptional<z.ZodString>;
            /** Input border color. Generates `--input`. */
            input: z.ZodOptional<z.ZodString>;
            /** Focus ring color. Generates `--ring`. */
            ring: z.ZodOptional<z.ZodString>;
            /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
            chart: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodString, z.ZodString], null>>;
        }, "strict", z.ZodTypeAny, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }>>;
        darkColors: z.ZodOptional<z.ZodObject<{
            /** Primary brand color. Generates `--primary` and `--primary-foreground`. */
            primary: z.ZodOptional<z.ZodString>;
            /** Secondary color. Generates `--secondary` and `--secondary-foreground`. */
            secondary: z.ZodOptional<z.ZodString>;
            /** Muted/subtle backgrounds. Generates `--muted` and `--muted-foreground`. */
            muted: z.ZodOptional<z.ZodString>;
            /** Accent color for highlights. Generates `--accent` and `--accent-foreground`. */
            accent: z.ZodOptional<z.ZodString>;
            /** Destructive/danger color. Generates `--destructive` and `--destructive-foreground`. */
            destructive: z.ZodOptional<z.ZodString>;
            /** Success color. Generates `--success` and `--success-foreground`. */
            success: z.ZodOptional<z.ZodString>;
            /** Warning color. Generates `--warning` and `--warning-foreground`. */
            warning: z.ZodOptional<z.ZodString>;
            /** Info color. Generates `--info` and `--info-foreground`. */
            info: z.ZodOptional<z.ZodString>;
            /** Page background. Generates `--background` and `--foreground`. */
            background: z.ZodOptional<z.ZodString>;
            /** Card background. Generates `--card` and `--card-foreground`. */
            card: z.ZodOptional<z.ZodString>;
            /** Popover background. Generates `--popover` and `--popover-foreground`. */
            popover: z.ZodOptional<z.ZodString>;
            /** Sidebar background. Generates `--sidebar` and `--sidebar-foreground`. */
            sidebar: z.ZodOptional<z.ZodString>;
            /** Border color. Generates `--border`. */
            border: z.ZodOptional<z.ZodString>;
            /** Input border color. Generates `--input`. */
            input: z.ZodOptional<z.ZodString>;
            /** Focus ring color. Generates `--ring`. */
            ring: z.ZodOptional<z.ZodString>;
            /** Chart palette (5 colors). Generates `--chart-1` through `--chart-5`. */
            chart: z.ZodOptional<z.ZodTuple<[z.ZodString, z.ZodString, z.ZodString, z.ZodString, z.ZodString], null>>;
        }, "strict", z.ZodTypeAny, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }, {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        }>>;
        radius: z.ZodOptional<z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>>;
        spacing: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable", "spacious"]>>;
        font: z.ZodOptional<z.ZodObject<{
            /** Primary font family (body text, headings). */
            sans: z.ZodOptional<z.ZodString>;
            /** Monospace font family (code, pre). */
            mono: z.ZodOptional<z.ZodString>;
            /** Display font (large headings, hero text). */
            display: z.ZodOptional<z.ZodString>;
            /** Base font size in px. Default: 16. */
            baseSize: z.ZodOptional<z.ZodNumber>;
            /** Type scale ratio. Default: 1.25 (major third). */
            scale: z.ZodOptional<z.ZodNumber>;
            /** Custom font URL (e.g. Google Fonts @import URL). */
            url: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        }, {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        }>>;
        components: z.ZodOptional<z.ZodObject<{
            card: z.ZodOptional<z.ZodObject<{
                shadow: z.ZodOptional<z.ZodEnum<["none", "sm", "md", "lg", "xl"]>>;
                padding: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable", "spacious"]>>;
                border: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            }, {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            }>>;
            table: z.ZodOptional<z.ZodObject<{
                striped: z.ZodOptional<z.ZodBoolean>;
                density: z.ZodOptional<z.ZodEnum<["compact", "default", "comfortable"]>>;
                headerBackground: z.ZodOptional<z.ZodBoolean>;
                hoverRow: z.ZodOptional<z.ZodBoolean>;
                borderStyle: z.ZodOptional<z.ZodEnum<["none", "horizontal", "grid"]>>;
            }, "strict", z.ZodTypeAny, {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            }, {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            }>>;
            button: z.ZodOptional<z.ZodObject<{
                weight: z.ZodOptional<z.ZodEnum<["light", "medium", "bold"]>>;
                uppercase: z.ZodOptional<z.ZodBoolean>;
                iconSize: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
            }, "strict", z.ZodTypeAny, {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            }, {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            }>>;
            input: z.ZodOptional<z.ZodObject<{
                size: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
                variant: z.ZodOptional<z.ZodEnum<["outline", "filled", "underline"]>>;
            }, "strict", z.ZodTypeAny, {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            }, {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            }>>;
            modal: z.ZodOptional<z.ZodObject<{
                overlay: z.ZodOptional<z.ZodEnum<["light", "dark", "blur"]>>;
                animation: z.ZodOptional<z.ZodEnum<["fade", "scale", "slide-up", "none"]>>;
            }, "strict", z.ZodTypeAny, {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            }, {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            }>>;
            nav: z.ZodOptional<z.ZodObject<{
                variant: z.ZodOptional<z.ZodEnum<["minimal", "bordered", "filled"]>>;
                activeIndicator: z.ZodOptional<z.ZodEnum<["background", "border-left", "border-bottom", "dot"]>>;
            }, "strict", z.ZodTypeAny, {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            }, {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            }>>;
            badge: z.ZodOptional<z.ZodObject<{
                variant: z.ZodOptional<z.ZodEnum<["solid", "outline", "soft"]>>;
                rounded: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            }, {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            }>>;
            toast: z.ZodOptional<z.ZodObject<{
                position: z.ZodOptional<z.ZodEnum<["top-right", "top-center", "bottom-right", "bottom-center"]>>;
                animation: z.ZodOptional<z.ZodEnum<["slide", "fade", "pop"]>>;
            }, "strict", z.ZodTypeAny, {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            }, {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            }>>;
        }, "strict", z.ZodTypeAny, {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        }, {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        }>>;
        tokens: z.ZodOptional<z.ZodObject<{
            /** Shadow scale override. Default: uses flavor's shadow scale. */
            shadow: z.ZodOptional<z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>>;
            /** Animation/transition duration scale. */
            durations: z.ZodOptional<z.ZodObject<{
                instant: z.ZodOptional<z.ZodNumber>;
                fast: z.ZodOptional<z.ZodNumber>;
                normal: z.ZodOptional<z.ZodNumber>;
                slow: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            }, {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            }>>;
            /** Easing functions. */
            easings: z.ZodOptional<z.ZodObject<{
                default: z.ZodOptional<z.ZodString>;
                in: z.ZodOptional<z.ZodString>;
                out: z.ZodOptional<z.ZodString>;
                inOut: z.ZodOptional<z.ZodString>;
                spring: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            }, {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            }>>;
            /** Opacity scale overrides. */
            opacity: z.ZodOptional<z.ZodObject<{
                disabled: z.ZodOptional<z.ZodNumber>;
                hover: z.ZodOptional<z.ZodNumber>;
                muted: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            }, {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            }>>;
            /** Line-height scale overrides. */
            lineHeight: z.ZodOptional<z.ZodObject<{
                none: z.ZodOptional<z.ZodNumber>;
                tight: z.ZodOptional<z.ZodNumber>;
                normal: z.ZodOptional<z.ZodNumber>;
                relaxed: z.ZodOptional<z.ZodNumber>;
                loose: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            }, {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            }>>;
            /** Letter-spacing scale overrides. */
            tracking: z.ZodOptional<z.ZodObject<{
                tight: z.ZodOptional<z.ZodString>;
                normal: z.ZodOptional<z.ZodString>;
                wide: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            }, {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            }>>;
            /** Border-width scale overrides. */
            borderWidth: z.ZodOptional<z.ZodObject<{
                none: z.ZodOptional<z.ZodString>;
                thin: z.ZodOptional<z.ZodString>;
                default: z.ZodOptional<z.ZodString>;
                thick: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            }, {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            }>>;
        }, "strict", z.ZodTypeAny, {
            shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
            durations?: {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            } | undefined;
            easings?: {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            } | undefined;
            opacity?: {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            } | undefined;
            lineHeight?: {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            } | undefined;
            tracking?: {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            } | undefined;
            borderWidth?: {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            } | undefined;
        }, {
            shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
            durations?: {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            } | undefined;
            easings?: {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            } | undefined;
            opacity?: {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            } | undefined;
            lineHeight?: {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            } | undefined;
            tracking?: {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            } | undefined;
            borderWidth?: {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            } | undefined;
        }>>;
    }, "strict", z.ZodTypeAny, {
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
        tokens?: {
            shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
            durations?: {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            } | undefined;
            easings?: {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            } | undefined;
            opacity?: {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            } | undefined;
            lineHeight?: {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            } | undefined;
            tracking?: {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            } | undefined;
            borderWidth?: {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            } | undefined;
        } | undefined;
    }, {
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
        tokens?: {
            shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
            durations?: {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            } | undefined;
            easings?: {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            } | undefined;
            opacity?: {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            } | undefined;
            lineHeight?: {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            } | undefined;
            tracking?: {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            } | undefined;
            borderWidth?: {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            } | undefined;
        } | undefined;
    }>>;
    /** Initial color mode. 'system' follows prefers-color-scheme. */
    mode: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
    /** Token editor runtime persistence target. */
    editor: z.ZodOptional<z.ZodObject<{
        persist: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"none">, z.ZodLiteral<"localStorage">, z.ZodLiteral<"sessionStorage">, z.ZodObject<{
            resource: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            resource: string;
        }, {
            resource: string;
        }>]>>;
    }, "strict", z.ZodTypeAny, {
        persist: "none" | "localStorage" | "sessionStorage" | {
            resource: string;
        };
    }, {
        persist?: "none" | "localStorage" | "sessionStorage" | {
            resource: string;
        } | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    editor?: {
        persist: "none" | "localStorage" | "sessionStorage" | {
            resource: string;
        };
    } | undefined;
    flavor?: string | undefined;
    flavors?: Record<string, {
        extends: string;
        displayName?: string | undefined;
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
    }> | undefined;
    overrides?: {
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
        tokens?: {
            shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
            durations?: {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            } | undefined;
            easings?: {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            } | undefined;
            opacity?: {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            } | undefined;
            lineHeight?: {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            } | undefined;
            tracking?: {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            } | undefined;
            borderWidth?: {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    mode?: "system" | "dark" | "light" | undefined;
}, {
    editor?: {
        persist?: "none" | "localStorage" | "sessionStorage" | {
            resource: string;
        } | undefined;
    } | undefined;
    flavor?: string | undefined;
    flavors?: Record<string, {
        extends: string;
        displayName?: string | undefined;
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
    }> | undefined;
    overrides?: {
        components?: {
            input?: {
                size?: "sm" | "md" | "lg" | undefined;
                variant?: "outline" | "filled" | "underline" | undefined;
            } | undefined;
            badge?: {
                variant?: "outline" | "solid" | "soft" | undefined;
                rounded?: boolean | undefined;
            } | undefined;
            table?: {
                striped?: boolean | undefined;
                density?: "default" | "compact" | "comfortable" | undefined;
                headerBackground?: boolean | undefined;
                hoverRow?: boolean | undefined;
                borderStyle?: "none" | "grid" | "horizontal" | undefined;
            } | undefined;
            card?: {
                border?: boolean | undefined;
                shadow?: "none" | "sm" | "md" | "lg" | "xl" | undefined;
                padding?: "default" | "compact" | "comfortable" | "spacious" | undefined;
            } | undefined;
            button?: {
                uppercase?: boolean | undefined;
                weight?: "bold" | "medium" | "light" | undefined;
                iconSize?: "sm" | "md" | "lg" | undefined;
            } | undefined;
            modal?: {
                overlay?: "blur" | "dark" | "light" | undefined;
                animation?: "none" | "scale" | "fade" | "slide-up" | undefined;
            } | undefined;
            nav?: {
                variant?: "minimal" | "filled" | "bordered" | undefined;
                activeIndicator?: "background" | "border-left" | "border-bottom" | "dot" | undefined;
            } | undefined;
            toast?: {
                animation?: "pop" | "fade" | "slide" | undefined;
                position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | undefined;
            } | undefined;
        } | undefined;
        colors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        darkColors?: {
            info?: string | undefined;
            input?: string | undefined;
            warning?: string | undefined;
            success?: string | undefined;
            chart?: [string, string, string, string, string] | undefined;
            sidebar?: string | undefined;
            primary?: string | undefined;
            secondary?: string | undefined;
            muted?: string | undefined;
            accent?: string | undefined;
            destructive?: string | undefined;
            background?: string | undefined;
            card?: string | undefined;
            popover?: string | undefined;
            border?: string | undefined;
            ring?: string | undefined;
        } | undefined;
        radius?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | undefined;
        spacing?: "default" | "compact" | "comfortable" | "spacious" | undefined;
        font?: {
            url?: string | undefined;
            sans?: string | undefined;
            mono?: string | undefined;
            display?: string | undefined;
            baseSize?: number | undefined;
            scale?: number | undefined;
        } | undefined;
        tokens?: {
            shadow?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | undefined;
            durations?: {
                instant?: number | undefined;
                fast?: number | undefined;
                normal?: number | undefined;
                slow?: number | undefined;
            } | undefined;
            easings?: {
                default?: string | undefined;
                out?: string | undefined;
                in?: string | undefined;
                inOut?: string | undefined;
                spring?: string | undefined;
            } | undefined;
            opacity?: {
                disabled?: number | undefined;
                muted?: number | undefined;
                hover?: number | undefined;
            } | undefined;
            lineHeight?: {
                none?: number | undefined;
                relaxed?: number | undefined;
                normal?: number | undefined;
                tight?: number | undefined;
                loose?: number | undefined;
            } | undefined;
            tracking?: {
                normal?: string | undefined;
                tight?: string | undefined;
                wide?: string | undefined;
            } | undefined;
            borderWidth?: {
                none?: string | undefined;
                default?: string | undefined;
                thin?: string | undefined;
                thick?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    mode?: "system" | "dark" | "light" | undefined;
}>;
