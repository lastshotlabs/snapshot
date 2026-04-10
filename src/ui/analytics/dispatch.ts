import { createGa4Provider } from "./built-ins/ga4";
import { createPlausibleProvider } from "./built-ins/plausible";
import { createPosthogProvider } from "./built-ins/posthog";
import { getRegisteredAnalyticsProvider } from "./registry";
import type { AnalyticsProvider, AnalyticsProviderFactory } from "./types";
import type { AnalyticsConfig } from "../manifest/types";

interface AnalyticsProviderRuntime {
  provider: AnalyticsProvider;
  initConfig: {
    apiKey?: string;
    config?: Record<string, unknown>;
  };
  initPromise: Promise<void> | null;
}

/**
 * Runtime analytics dispatcher for manifest-configured providers.
 */
export interface AnalyticsDispatcher {
  track(event: string, props?: Record<string, unknown>): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
  page(name: string, props?: Record<string, unknown>): Promise<void>;
  reset(): Promise<void>;
}

function resolveBuiltInProviderFactory(
  type: Exclude<
    NonNullable<AnalyticsConfig>["providers"][string]["type"],
    "custom"
  >,
): AnalyticsProviderFactory {
  switch (type) {
    case "ga4":
      return createGa4Provider;
    case "posthog":
      return createPosthogProvider;
    case "plausible":
      return createPlausibleProvider;
  }
}

async function ensureProviderInitialized(
  runtime: AnalyticsProviderRuntime,
): Promise<void> {
  if (runtime.initPromise) {
    await runtime.initPromise;
    return;
  }

  runtime.initPromise = Promise.resolve(runtime.provider.init(runtime.initConfig))
    .then(() => undefined)
    .catch(() => undefined);

  await runtime.initPromise;
}

function buildProviderRuntime(
  analytics: AnalyticsConfig | undefined,
): AnalyticsProviderRuntime[] {
  if (!analytics) {
    return [];
  }

  const runtimes: AnalyticsProviderRuntime[] = [];
  for (const providerConfig of Object.values(analytics.providers)) {
    const factory =
      providerConfig.type === "custom"
        ? providerConfig.name
          ? getRegisteredAnalyticsProvider(providerConfig.name)
          : undefined
        : resolveBuiltInProviderFactory(providerConfig.type);
    if (!factory) {
      continue;
    }

    runtimes.push({
      provider: factory(),
      initConfig: {
        apiKey: providerConfig.apiKey,
        config: providerConfig.config,
      },
      initPromise: null,
    });
  }

  return runtimes;
}

/**
 * Create a dispatcher that fans out analytics calls to all configured providers.
 *
 * @param analytics - Compiled manifest analytics config
 * @returns Analytics dispatcher
 */
export function createAnalyticsDispatcher(
  analytics: AnalyticsConfig | undefined,
): AnalyticsDispatcher {
  const providers = buildProviderRuntime(analytics);

  return {
    async track(event, props) {
      for (const runtime of providers) {
        await ensureProviderInitialized(runtime);
        runtime.provider.track(event, props);
      }
    },
    async identify(userId, traits) {
      for (const runtime of providers) {
        await ensureProviderInitialized(runtime);
        runtime.provider.identify?.(userId, traits);
      }
    },
    async page(name, props) {
      for (const runtime of providers) {
        await ensureProviderInitialized(runtime);
        runtime.provider.page?.(name, props);
      }
    },
    async reset() {
      for (const runtime of providers) {
        await ensureProviderInitialized(runtime);
        runtime.provider.reset?.();
      }
    },
  };
}
