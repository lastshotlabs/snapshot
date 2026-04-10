import type { AnalyticsProviderFactory } from "./types";

const analyticsProviderRegistry = new Map<string, AnalyticsProviderFactory>();

/**
 * Register a custom analytics provider factory by name.
 *
 * @param name - Provider identifier used in `manifest.analytics.providers.*.name`
 * @param factory - Per-instance provider factory
 */
export function registerAnalyticsProvider(
  name: string,
  factory: AnalyticsProviderFactory,
): void {
  analyticsProviderRegistry.set(name, factory);
}

/**
 * Retrieve a registered custom analytics provider factory.
 *
 * @param name - Provider identifier
 * @returns The provider factory when registered
 */
export function getRegisteredAnalyticsProvider(
  name: string,
): AnalyticsProviderFactory | undefined {
  return analyticsProviderRegistry.get(name);
}
