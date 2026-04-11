import { z } from "zod";
/**
 * Manifest config for the default loading spinner.
 */
export declare const spinnerConfigSchema: any;
/** Config for the default loading feedback component. */
export type SpinnerConfig = z.infer<typeof spinnerConfigSchema>;
