import { z } from "zod";
/**
 * Manifest config for the default not-found state.
 */
export declare const notFoundConfigSchema: any;
/** Config for the default not-found feedback component. */
export type NotFoundConfig = z.infer<typeof notFoundConfigSchema>;
