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
 * Create the built-in GA4 analytics provider.
 */
export function createGa4Provider(): AnalyticsProvider {
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

      await injectScript(`https://www.googletagmanager.com/gtag/js?id=${apiKey}`);
      const dataLayer = ((window as unknown as { dataLayer?: unknown[] })
        .dataLayer ??= []);
      const gtag = (
        window as unknown as {
          gtag?: (...args: unknown[]) => void;
        }
      ).gtag;

      if (typeof gtag === "function") {
        gtag("js", new Date());
        gtag("config", apiKey, config.config ?? {});
      } else {
        dataLayer.push(["js", new Date()], ["config", apiKey, config.config ?? {}]);
      }

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
      const gtag = (
        window as unknown as {
          gtag?: (...args: unknown[]) => void;
        }
      )?.gtag;
      if (typeof gtag === "function") {
        gtag("event", event, props ?? {});
      }
    },
    page(name, props) {
      if (typeof window === "undefined") {
        return;
      }
      const gtag = (
        window as unknown as {
          gtag?: (...args: unknown[]) => void;
        }
      )?.gtag;
      if (typeof gtag === "function") {
        gtag("event", "page_view", {
          page_title: name,
          ...(props ?? {}),
        });
      }
    },
    reset() {
      // GA4 does not expose a client reset API.
    },
  };
}
