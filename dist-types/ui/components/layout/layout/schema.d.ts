import { z } from "zod";
/**
 * Slot declaration supported by layout variants that expose named slot areas.
 */
export declare const layoutSlotSchema: z.ZodObject<{
    /** Slot name. */
    name: z.ZodString;
    /** Whether this slot must be populated by the route. */
    required: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    name: string;
    required: boolean;
}, {
    name: string;
    required?: boolean | undefined;
}>;
/**
 * Zod schema for layout component configuration.
 * Defines the layout shell that wraps page content.
 */
export declare const layoutConfigSchema: z.ZodObject<{
    /** Component type discriminator. */
    type: z.ZodLiteral<"layout">;
    /** Optional component id for context publishing. */
    id: z.ZodOptional<z.ZodString>;
    /** Layout variant determines the overall page structure. */
    variant: z.ZodDefault<z.ZodString>;
    /** Custom sidebar width (CSS value). Default: 16rem. */
    sidebarWidth: z.ZodOptional<z.ZodString>;
    /** Optional slot declarations supported by this layout. */
    slots: z.ZodOptional<z.ZodArray<z.ZodObject<{
        /** Slot name. */
        name: z.ZodString;
        /** Whether this slot must be populated by the route. */
        required: z.ZodDefault<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        name: string;
        required: boolean;
    }, {
        name: string;
        required?: boolean | undefined;
    }>, "many">>;
    /** Optional CSS class name. */
    className: z.ZodOptional<z.ZodString>;
    /** Optional inline styles applied to the root layout element. */
    style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
}, "strict", z.ZodTypeAny, {
    type: "layout";
    variant: string;
    className?: string | undefined;
    style?: Record<string, string | number> | undefined;
    id?: string | undefined;
    slots?: {
        name: string;
        required: boolean;
    }[] | undefined;
    sidebarWidth?: string | undefined;
}, {
    type: "layout";
    className?: string | undefined;
    style?: Record<string, string | number> | undefined;
    id?: string | undefined;
    slots?: {
        name: string;
        required?: boolean | undefined;
    }[] | undefined;
    variant?: string | undefined;
    sidebarWidth?: string | undefined;
}>;
/** Inferred layout config type from the Zod schema. */
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
