import { z } from "zod";
/**
 * Manifest config for the default offline state.
 */
export declare const offlineBannerConfigSchema: z.ZodObject<{
    className: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
} & {
    type: z.ZodLiteral<"offline-banner">;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "offline-banner";
    title?: string | undefined;
    description?: string | undefined;
    style?: Record<string, string | number> | undefined;
    className?: string | undefined;
}, {
    type: "offline-banner";
    title?: string | undefined;
    description?: string | undefined;
    style?: Record<string, string | number> | undefined;
    className?: string | undefined;
}>;
/** Config for the default offline feedback component. */
export type OfflineBannerConfig = z.infer<typeof offlineBannerConfigSchema>;
