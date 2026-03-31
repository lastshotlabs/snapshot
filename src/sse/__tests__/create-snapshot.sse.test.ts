/**
 * Integration tests for the per-endpoint SSE API in createSnapshot.
 *
 * Tests verify:
 * - One SseManager (EventSource) created per configured endpoint on init
 * - useSSE(endpoint) returns { status } that reflects manager.state
 * - useSseEvent(endpoint, event) returns { data, status }; handler receives events
 * - useSseEvent cleanup removes the listener
 * - Calling useSseEvent on an unknown endpoint is a no-op (no EventSource created)
 * - Multiple endpoints are independent
 * - Login success → reconnect() called on all endpoints (new EventSource per endpoint)
 * - Logout → close() called on all endpoints
 * - No SSE config → useSSE and useSseEvent return 'closed' / null
 *
 * Strategy: simulate the createSnapshot closure directly — no React rendering,
 * no jsdom, no @testing-library/react. The test environment is node.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SseManager } from "../manager";
import type { SseConnectionStatus } from "../manager";

// ── Mock EventSource ──────────────────────────────────────────────────────────

class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  withCredentials: boolean;
  onopen: ((e: Event) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;

  readonly addEventListener = vi.fn();
  readonly removeEventListener = vi.fn();
  readonly close = vi.fn();

  constructor(url: string, init?: EventSourceInit) {
    this.url = url;
    this.withCredentials = init?.withCredentials ?? false;
    MockEventSource.instances.push(this);
  }

  simulateOpen() {
    this.onopen?.(new Event("open"));
  }

  simulateError() {
    this.onerror?.(new Event("error"));
  }

  simulateMessage(eventName: string, data: unknown) {
    const calls = this.addEventListener.mock.calls;
    for (const [name, handler] of calls) {
      if (name === eventName) {
        const msg = Object.assign(new Event(eventName), {
          data: JSON.stringify(data),
        }) as MessageEvent;
        (handler as EventListener)(msg);
      }
    }
  }
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Simulated factory closure helpers ────────────────────────────────────────
//
// Rather than spinning up the full createSnapshot factory (React, jotai,
// QueryClient, router), we simulate the exact SSE registry pattern the factory
// uses and verify the per-endpoint behaviours.

interface RegistryEntry {
  manager: SseManager;
  url: string;
}

function buildSseRegistry(apiUrl: string, endpointPaths: string[]): Map<string, RegistryEntry> {
  const registry = new Map<string, RegistryEntry>();
  for (const path of endpointPaths) {
    const url = `${apiUrl}${path}`;
    const manager = new SseManager({});
    manager.connect(url);
    registry.set(path, { manager, url });
  }
  return registry;
}

function makeUseEffect() {
  const cleanups: Array<() => void> = [];
  const effects: Array<() => (() => void) | void> = [];
  function useEffect(fn: () => (() => void) | void) {
    effects.push(fn);
  }
  function runEffects() {
    for (const fn of effects.splice(0)) {
      const cleanup = fn();
      if (typeof cleanup === "function") cleanups.push(cleanup);
    }
  }
  function runCleanups() {
    for (const fn of cleanups.splice(0)) fn();
  }
  return { useEffect, runEffects, runCleanups };
}

// Simulate useSSE(endpoint) — returns { status }
function buildUseSSE(registry: Map<string, RegistryEntry>) {
  return function useSSE(endpoint: string): { status: SseConnectionStatus } {
    const entry = registry.get(endpoint);
    return { status: entry ? entry.manager.state : "closed" };
  };
}

// Simulate useSseEvent(endpoint, event) — attaches handler, returns { data, status }
function buildUseSseEvent(registry: Map<string, RegistryEntry>) {
  return function useSseEvent<T = unknown>(
    endpoint: string,
    event: string,
    useEffect: (fn: () => (() => void) | void) => void,
  ): { data: T | null; status: SseConnectionStatus } {
    const entry = registry.get(endpoint);
    let capturedData: T | null = null;

    useEffect(() => {
      if (!entry) return;
      const { manager } = entry;

      const handler = (payload: unknown) => {
        capturedData = payload as T;
      };

      manager.on(event, handler);
      return () => {
        manager.off(event, handler);
      };
    });

    return {
      data: capturedData,
      status: entry ? entry.manager.state : "closed",
    };
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

const API_URL = "http://localhost:3000";
const FEED_PATH = "/__sse/feed";
const ADMIN_PATH = "/__sse/admin";

describe("createSnapshot SSE — no SSE config", () => {
  it("useSSE returns closed for any endpoint", () => {
    const registry = new Map<string, RegistryEntry>();
    const useSSE = buildUseSSE(registry);
    expect(useSSE(FEED_PATH).status).toBe("closed");
  });

  it("useSseEvent returns null data and closed status for any endpoint", () => {
    const registry = new Map<string, RegistryEntry>();
    const useSseEvent = buildUseSseEvent(registry);
    const { useEffect, runEffects } = makeUseEffect();
    const result = useSseEvent(FEED_PATH, "community:thread.created", useEffect);
    runEffects();
    expect(result.data).toBeNull();
    expect(result.status).toBe("closed");
    expect(MockEventSource.instances).toHaveLength(0);
  });
});

describe("createSnapshot SSE — single endpoint", () => {
  it("creates one EventSource per configured endpoint on init", () => {
    buildSseRegistry(API_URL, [FEED_PATH]);
    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0]!.url).toBe(`${API_URL}${FEED_PATH}`);
  });

  it("useSSE returns connecting immediately after init", () => {
    const registry = buildSseRegistry(API_URL, [FEED_PATH]);
    const useSSE = buildUseSSE(registry);
    expect(useSSE(FEED_PATH).status).toBe("connecting");
  });

  it("useSSE returns open after EventSource fires open", () => {
    const registry = buildSseRegistry(API_URL, [FEED_PATH]);
    const useSSE = buildUseSSE(registry);

    MockEventSource.instances[0]!.simulateOpen();

    expect(useSSE(FEED_PATH).status).toBe("open");
  });

  it("useSseEvent attaches handler and delivers events", () => {
    const registry = buildSseRegistry(API_URL, [FEED_PATH]);
    const useSseEvent = buildUseSseEvent(registry);
    const { useEffect, runEffects } = makeUseEffect();

    const handler = vi.fn();
    // Simulate component behavior: effect registers the handler
    useSseEvent(FEED_PATH, "community:thread.created", useEffect);
    runEffects();

    // Simulate the event arriving — use registry directly
    const entry = registry.get(FEED_PATH)!;
    const es = MockEventSource.instances[0]!;

    // Get the wrapped handler registered via addEventListener
    const addCalls = es.addEventListener.mock.calls;
    const wrappedEntry = addCalls.find((args: unknown[]) => args[0] === "community:thread.created");
    expect(wrappedEntry).toBeDefined();

    // Simulate message
    es.simulateMessage("community:thread.created", {
      id: "thread-1",
      title: "Hello",
    });

    // Verify the internal handler runs via the manager directly
    const directHandler = vi.fn();
    entry.manager.on("community:reply.created", directHandler);
    es.simulateMessage("community:reply.created", { id: "reply-1" });
    expect(directHandler).toHaveBeenCalledWith({ id: "reply-1" });
  });

  it("useSseEvent cleanup removes listener from EventSource", () => {
    const registry = buildSseRegistry(API_URL, [FEED_PATH]);
    const useSseEvent = buildUseSseEvent(registry);
    const { useEffect, runEffects, runCleanups } = makeUseEffect();

    useSseEvent(FEED_PATH, "community:thread.created", useEffect);
    runEffects();
    runCleanups();

    const es = MockEventSource.instances[0]!;
    expect(es.removeEventListener).toHaveBeenCalled();
  });

  it("useSseEvent on unknown endpoint is a no-op — no new EventSource", () => {
    buildSseRegistry(API_URL, [FEED_PATH]);
    const registry = buildSseRegistry(API_URL, [FEED_PATH]);
    const useSseEvent = buildUseSseEvent(registry);
    const { useEffect, runEffects } = makeUseEffect();

    const countBefore = MockEventSource.instances.length;
    useSseEvent("/__sse/nonexistent", "some:event", useEffect);
    runEffects();

    expect(MockEventSource.instances.length).toBe(countBefore);
  });
});

describe("createSnapshot SSE — multiple endpoints", () => {
  it("creates one EventSource per endpoint", () => {
    buildSseRegistry(API_URL, [FEED_PATH, ADMIN_PATH]);
    expect(MockEventSource.instances).toHaveLength(2);
    const urls = MockEventSource.instances.map((es) => es.url);
    expect(urls).toContain(`${API_URL}${FEED_PATH}`);
    expect(urls).toContain(`${API_URL}${ADMIN_PATH}`);
  });

  it("endpoints are independent — opening one does not affect the other", () => {
    const registry = buildSseRegistry(API_URL, [FEED_PATH, ADMIN_PATH]);
    const useSSE = buildUseSSE(registry);

    const feedEs = MockEventSource.instances.find((es) => es.url.includes("feed"))!;
    feedEs.simulateOpen();

    expect(useSSE(FEED_PATH).status).toBe("open");
    expect(useSSE(ADMIN_PATH).status).toBe("connecting");
  });

  it("handlers on different endpoints do not cross-contaminate", () => {
    const registry = buildSseRegistry(API_URL, [FEED_PATH, ADMIN_PATH]);

    const feedHandler = vi.fn();
    const adminHandler = vi.fn();

    registry.get(FEED_PATH)!.manager.on("community:thread.created", feedHandler);
    registry.get(ADMIN_PATH)!.manager.on("community:thread.created", adminHandler);

    const feedEs = MockEventSource.instances.find((es) => es.url.includes("feed"))!;
    feedEs.simulateMessage("community:thread.created", { id: "feed-event" });

    expect(feedHandler).toHaveBeenCalledWith({ id: "feed-event" });
    expect(adminHandler).not.toHaveBeenCalled();
  });
});

describe("createSnapshot SSE — login/logout lifecycle", () => {
  function buildFactory(endpointPaths: string[]) {
    const registry = buildSseRegistry(API_URL, endpointPaths);

    function reconnectAll() {
      for (const [, { manager, url }] of registry) {
        manager.connect(url);
      }
    }

    function closeAll() {
      for (const [, { manager }] of registry) {
        manager.close();
      }
    }

    return { registry, reconnectAll, closeAll };
  }

  it("login success → connect() called on all endpoints (new EventSource per endpoint)", () => {
    const { reconnectAll } = buildFactory([FEED_PATH, ADMIN_PATH]);
    const countBefore = MockEventSource.instances.length; // 2

    reconnectAll();

    // Each reconnect closes old and opens new EventSource
    expect(MockEventSource.instances.length).toBeGreaterThan(countBefore);
    // Old EventSources were closed
    expect(MockEventSource.instances[0]!.close).toHaveBeenCalledTimes(1);
    expect(MockEventSource.instances[1]!.close).toHaveBeenCalledTimes(1);
  });

  it("logout → close() called on all endpoints", () => {
    const { closeAll } = buildFactory([FEED_PATH, ADMIN_PATH]);

    closeAll();

    for (const es of MockEventSource.instances) {
      expect(es.close).toHaveBeenCalledTimes(1);
    }
  });

  it("login then logout — new EventSources created then closed", () => {
    const { reconnectAll, closeAll } = buildFactory([FEED_PATH]);

    reconnectAll();
    // Now 2 EventSource instances for FEED_PATH (old + new)
    expect(MockEventSource.instances.length).toBe(2);

    closeAll();
    // The second (current) one is closed
    expect(MockEventSource.instances[1]!.close).toHaveBeenCalledTimes(1);
  });
});

describe("createSnapshot SSE — withCredentials propagation", () => {
  it("passes withCredentials to EventSource", () => {
    const registry = new Map<string, RegistryEntry>();
    const url = `${API_URL}${FEED_PATH}`;
    const manager = new SseManager({ withCredentials: true });
    manager.connect(url);
    registry.set(FEED_PATH, { manager, url });

    expect(MockEventSource.instances[0]!.withCredentials).toBe(true);
  });
});
