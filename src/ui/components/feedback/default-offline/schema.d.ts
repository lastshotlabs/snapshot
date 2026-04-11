import { z } from "zod";
/**
 * Manifest config for the default offline state.
 */
export declare const offlineBannerConfigSchema: any;
/** Config for the default offline feedback component. */
export type OfflineBannerConfig = z.infer<typeof offlineBannerConfigSchema>;
