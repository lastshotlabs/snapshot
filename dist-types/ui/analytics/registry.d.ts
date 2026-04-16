import type { AnalyticsProviderFactory } from "./types";
/**
 * Register a custom analytics provider factory by name.
 *
 * @param name - Provider identifier used in `manifest.analytics.providers.*.name`
 * @param factory - Per-instance provider factory
 */
export declare function registerAnalyticsProvider(name: string, factory: AnalyticsProviderFactory): void;
/**
 * Retrieve a registered custom analytics provider factory.
 *
 * @param name - Provider identifier
 * @returns The provider factory when registered
 */
export declare function getRegisteredAnalyticsProvider(name: string): AnalyticsProviderFactory | undefined;
