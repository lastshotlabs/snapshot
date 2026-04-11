import { z } from "zod";
/**
 * Manifest config for the default error state.
 */
export declare const errorPageConfigSchema: any;
/** Config for the default error feedback component. */
export type ErrorPageConfig = z.infer<typeof errorPageConfigSchema>;
