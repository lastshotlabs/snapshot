import type { AnalyticsProvider, AnalyticsProviderInitConfig } from "../types";

function injectScript(src: string, domain?: string): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const selector = domain
      ? `script[data-snapshot-analytics-domain="${domain}"]`
      : `script[data-snapshot-analytics="${src}"]`;
    const existing = document.querySelector<HTMLScriptElement>(selector);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.src = src;
    script.dataset.snapshotAnalytics = src;
    if (domain) {
      script.dataset.domain = domain;
      script.dataset.snapshotAnalyticsDomain = domain;
    }
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Create the built-in Plausible analytics provider.
 */
export function createPlausibleProvider(): AnalyticsProvider {
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
      if (typeof window === "undefined") {
        initialized = true;
        return;
      }

      const domain =
        typeof config.config?.["domain"] === "string"
          ? String(config.config["domain"])
          : undefined;
      const src =
        typeof config.config?.["src"] === "string"
          ? String(config.config["src"])
          : "https://plausible.io/js/script.js";
      await injectScript(src, domain);
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
      const plausible = (
        window as unknown as {
          plausible?: (name: string, options?: Record<string, unknown>) => void;
        }
      )?.plausible;
      plausible?.(event, props ? { props } : undefined);
    },
    page(name, props) {
      if (typeof window === "undefined") {
        return;
      }
      const plausible = (
        window as unknown as {
          plausible?: (name: string, options?: Record<string, unknown>) => void;
        }
      )?.plausible;
      plausible?.("pageview", {
        props: {
          page: name,
          ...(props ?? {}),
        },
      });
    },
    reset() {
      // Plausible has no client reset API.
    },
  };
}
