/**
 * Analytics provider initialization payload.
 */
export interface AnalyticsProviderInitConfig {
  apiKey?: string;
  config?: Record<string, unknown>;
}

/**
 * Analytics provider runtime contract.
 */
export interface AnalyticsProvider {
  init(config: AnalyticsProviderInitConfig): void | Promise<void>;
  track(event: string, props?: Record<string, unknown>): void;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  page?(name: string, props?: Record<string, unknown>): void;
  reset?(): void;
}

/**
 * Factory used to create analytics providers per snapshot instance.
 */
export type AnalyticsProviderFactory = () => AnalyticsProvider;
