import { z } from "zod";
/**
 * Manifest config for the default loading spinner.
 */
export declare const spinnerConfigSchema: z.ZodObject<{
    className: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
} & {
    type: z.ZodLiteral<"spinner">;
    size: z.ZodOptional<z.ZodEnum<["sm", "md", "lg"]>>;
    label: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "spinner";
    label?: string | undefined;
    style?: Record<string, string | number> | undefined;
    size?: "sm" | "md" | "lg" | undefined;
    className?: string | undefined;
}, {
    type: "spinner";
    label?: string | undefined;
    style?: Record<string, string | number> | undefined;
    size?: "sm" | "md" | "lg" | undefined;
    className?: string | undefined;
}>;
/** Config for the default loading feedback component. */
export type SpinnerConfig = z.infer<typeof spinnerConfigSchema>;
