import { z } from "zod";
/**
 * Manifest config for the default error state.
 */
export declare const errorPageConfigSchema: z.ZodObject<{
    className: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
} & {
    type: z.ZodLiteral<"error-page">;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    showRetry: z.ZodOptional<z.ZodBoolean>;
    retryLabel: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "error-page";
    title?: string | undefined;
    description?: string | undefined;
    style?: Record<string, string | number> | undefined;
    className?: string | undefined;
    showRetry?: boolean | undefined;
    retryLabel?: string | undefined;
}, {
    type: "error-page";
    title?: string | undefined;
    description?: string | undefined;
    style?: Record<string, string | number> | undefined;
    className?: string | undefined;
    showRetry?: boolean | undefined;
    retryLabel?: string | undefined;
}>;
/** Config for the default error feedback component. */
export type ErrorPageConfig = z.infer<typeof errorPageConfigSchema>;
