import { beforeEach, describe, expect, it, vi } from "vitest";
import { SseManager } from "../manager";

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

  // Test helpers — simulate browser events
  simulateOpen() {
    this.onopen?.(new Event("open"));
  }

  simulateError() {
    this.onerror?.(new Event("error"));
  }

  simulateMessage(eventName: string, data: unknown) {
    // Get the wrapped handler that was registered via addEventListener
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

// Replace global EventSource with mock
beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SseManager", () => {
  describe("on() before connect()", () => {
    it("attaches listener to EventSource after connect()", () => {
      const manager = new SseManager({});
      const handler = vi.fn();
      manager.on("test:event", handler);

      manager.connect("http://localhost/__sse/feed");

      const es = MockEventSource.instances[0];
      expect(es.addEventListener).toHaveBeenCalledWith("test:event", expect.any(Function));
    });
  });

  describe("on() after connect()", () => {
    it("immediately attaches listener to the live EventSource", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");

      const es = MockEventSource.instances[0];
      const handler = vi.fn();
      manager.on("test:event", handler);

      expect(es.addEventListener).toHaveBeenCalledWith("test:event", expect.any(Function));
    });

    it("handler receives parsed payload from MessageEvent", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");

      const handler = vi.fn();
      manager.on("thread.created", handler);

      const es = MockEventSource.instances[0];
      es.simulateMessage("thread.created", { id: "abc" });

      expect(handler).toHaveBeenCalledWith({ id: "abc" });
    });
  });

  describe("off()", () => {
    it("removes from internal map and calls removeEventListener on live EventSource", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");

      const handler = vi.fn();
      manager.on("test:event", handler);
      manager.off("test:event", handler);

      const es = MockEventSource.instances[0];
      expect(es.removeEventListener).toHaveBeenCalledWith("test:event", expect.any(Function));
    });

    it("is a no-op for an unregistered handler", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");

      const handler = vi.fn();
      // Never called on()
      expect(() => manager.off("test:event", handler)).not.toThrow();
    });
  });

  describe("connect() twice", () => {
    it("closes the first EventSource before creating the second", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");
      const first = MockEventSource.instances[0];

      manager.connect("http://localhost/__sse/feed");

      expect(first.close).toHaveBeenCalledTimes(1);
      expect(MockEventSource.instances).toHaveLength(2);
    });

    it("does NOT call onClosed when replacing via connect()", () => {
      const onClosed = vi.fn();
      const manager = new SseManager({ onClosed });
      manager.connect("http://localhost/__sse/feed");
      manager.connect("http://localhost/__sse/feed");

      expect(onClosed).not.toHaveBeenCalled();
    });
  });

  describe("close()", () => {
    it("closes the EventSource and sets state to closed", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");

      manager.close();

      const es = MockEventSource.instances[0];
      expect(es.close).toHaveBeenCalledTimes(1);
      expect(manager.state).toBe("closed");
    });

    it("preserves listeners after close — re-connect re-attaches them", () => {
      const manager = new SseManager({});
      const handler = vi.fn();
      manager.on("test:event", handler);
      manager.connect("http://localhost/__sse/feed");
      manager.close();

      // Re-connect: should re-attach the listener
      manager.connect("http://localhost/__sse/feed");

      const second = MockEventSource.instances[1];
      expect(second.addEventListener).toHaveBeenCalledWith("test:event", expect.any(Function));
    });

    it("fires onClosed callback", () => {
      const onClosed = vi.fn();
      const manager = new SseManager({ onClosed });
      manager.connect("http://localhost/__sse/feed");

      manager.close();

      expect(onClosed).toHaveBeenCalledTimes(1);
    });
  });

  describe("onerror does NOT fire onClosed", () => {
    it("onClosed is NOT called when onerror fires", () => {
      const onClosed = vi.fn();
      const manager = new SseManager({ onClosed });
      manager.connect("http://localhost/__sse/feed");

      const es = MockEventSource.instances[0];
      es.simulateError();

      expect(onClosed).not.toHaveBeenCalled();
    });

    it("state stays connecting (not closed) after onerror", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");

      const es = MockEventSource.instances[0];
      es.simulateError();

      expect(manager.state).toBe("connecting");
    });
  });

  describe("state transitions", () => {
    it("starts at closed", () => {
      const manager = new SseManager({});
      expect(manager.state).toBe("closed");
    });

    it("transitions to connecting after connect()", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");
      expect(manager.state).toBe("connecting");
    });

    it("transitions to open after onopen fires", () => {
      const manager = new SseManager({});
      manager.connect("http://localhost/__sse/feed");

      const es = MockEventSource.instances[0];
      es.simulateOpen();

      expect(manager.state).toBe("open");
    });

    it("calls onConnected when open", () => {
      const onConnected = vi.fn();
      const manager = new SseManager({ onConnected });
      manager.connect("http://localhost/__sse/feed");

      const es = MockEventSource.instances[0];
      es.simulateOpen();

      expect(onConnected).toHaveBeenCalledTimes(1);
    });
  });

  describe("onError callback", () => {
    it("calls onError when EventSource fires error event", () => {
      const onError = vi.fn();
      const manager = new SseManager({ onError });
      manager.connect("http://localhost/__sse/feed");

      const es = MockEventSource.instances[0];
      es.simulateError();

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("calls onError if JSON parse fails", () => {
      const onError = vi.fn();
      const manager = new SseManager({ onError });
      manager.connect("http://localhost/__sse/feed");

      const handler = vi.fn();
      manager.on("test:event", handler);

      // Manually call the wrapped handler with malformed JSON
      const es = MockEventSource.instances[0];
      const addCalls = es.addEventListener.mock.calls;
      const [, wrappedHandler] = addCalls.find(([name]) => name === "test:event")!;
      const badEvent = Object.assign(new Event("test:event"), {
        data: "{not-json}",
      }) as MessageEvent;
      (wrappedHandler as EventListener)(badEvent);

      expect(handler).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});
