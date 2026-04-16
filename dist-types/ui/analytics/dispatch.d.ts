import type { AnalyticsConfig } from "../manifest/types";
/**
 * Runtime analytics dispatcher for manifest-configured providers.
 */
export interface AnalyticsDispatcher {
    track(event: string, props?: Record<string, unknown>): Promise<void>;
    identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
    page(name: string, props?: Record<string, unknown>): Promise<void>;
    reset(): Promise<void>;
}
/**
 * Create a dispatcher that fans out analytics calls to all configured providers.
 *
 * @param analytics - Compiled manifest analytics config
 * @returns Analytics dispatcher
 */
export declare function createAnalyticsDispatcher(analytics: AnalyticsConfig | undefined): AnalyticsDispatcher;
