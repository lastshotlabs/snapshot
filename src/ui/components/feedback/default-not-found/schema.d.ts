import { z } from "zod";
/**
 * Manifest config for the default not-found state.
 */
export declare const notFoundConfigSchema: z.ZodObject<{
    className: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
} & {
    type: z.ZodLiteral<"not-found">;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    homeLabel: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "not-found";
    title?: string | undefined;
    description?: string | undefined;
    style?: Record<string, string | number> | undefined;
    className?: string | undefined;
    homeLabel?: string | undefined;
}, {
    type: "not-found";
    title?: string | undefined;
    description?: string | undefined;
    style?: Record<string, string | number> | undefined;
    className?: string | undefined;
    homeLabel?: string | undefined;
}>;
/** Config for the default not-found feedback component. */
export type NotFoundConfig = z.infer<typeof notFoundConfigSchema>;
