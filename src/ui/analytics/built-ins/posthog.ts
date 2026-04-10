import type { AnalyticsProvider, AnalyticsProviderInitConfig } from "../types";

function injectScript(src: string): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-snapshot-analytics="${src}"]`,
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.dataset.snapshotAnalytics = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Create the built-in PostHog analytics provider.
 */
export function createPosthogProvider(): AnalyticsProvider {
  let initialized = false;
  let initPromise: Promise<void> | null = null;

  const ensureInitialized = (config: AnalyticsProviderInitConfig) => {
    if (initialized) {
      return Promise.resolve();
    }

    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      const apiKey = config.apiKey;
      if (!apiKey || typeof window === "undefined") {
        initialized = true;
        return;
      }

      const host =
        typeof config.config?.["api_host"] === "string"
          ? String(config.config["api_host"])
          : "https://us.i.posthog.com";
      await injectScript(`${host}/static/array.js`);

      const posthog = (
        window as unknown as {
          posthog?: {
            init?: (key: string, config?: Record<string, unknown>) => void;
            capture?: (event: string, props?: Record<string, unknown>) => void;
            identify?: (
              userId: string,
              traits?: Record<string, unknown>,
            ) => void;
            reset?: () => void;
          };
        }
      ).posthog;

      posthog?.init?.(apiKey, config.config);
      initialized = true;
    })().catch(() => {
      initialized = true;
    });

    return initPromise;
  };

  return {
    init(config) {
      return ensureInitialized(config);
    },
    track(event, props) {
      if (typeof window === "undefined") {
        return;
      }
      const posthog = (
        window as unknown as {
          posthog?: {
            capture?: (event: string, props?: Record<string, unknown>) => void;
          };
        }
      )?.posthog;
      posthog?.capture?.(event, props);
    },
    identify(userId, traits) {
      if (typeof window === "undefined") {
        return;
      }
      const posthog = (
        window as unknown as {
          posthog?: {
            identify?: (
              id: string,
              props?: Record<string, unknown>,
            ) => void;
          };
        }
      )?.posthog;
      posthog?.identify?.(userId, traits);
    },
    page(name, props) {
      if (typeof window === "undefined") {
        return;
      }
      const posthog = (
        window as unknown as {
          posthog?: {
            capture?: (event: string, props?: Record<string, unknown>) => void;
          };
        }
      )?.posthog;
      posthog?.capture?.("$pageview", { page: name, ...(props ?? {}) });
    },
    reset() {
      if (typeof window === "undefined") {
        return;
      }
      const posthog = (
        window as unknown as {
          posthog?: {
            reset?: () => void;
          };
        }
      )?.posthog;
      posthog?.reset?.();
    },
  };
}
