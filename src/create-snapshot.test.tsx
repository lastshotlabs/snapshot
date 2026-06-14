// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSnapshot } from "./create-snapshot";

const originalWebSocket = global.WebSocket;
const originalFetch = global.fetch;

afterEach(() => {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.clear();
  }
  global.WebSocket = originalWebSocket;
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("createSnapshot", () => {
  it("uses code-first cache defaults for QueryClient", () => {
    const snapshot = createSnapshot({
      apiUrl: "https://api.example.com",
      cache: {
        staleTime: 60_000,
        gcTime: 120_000,
        retry: 3,
      },
    });

    expect(snapshot.queryClient.getDefaultOptions().queries?.staleTime).toBe(
      60_000,
    );
    expect(snapshot.queryClient.getDefaultOptions().queries?.gcTime).toBe(
      120_000,
    );
    expect(snapshot.queryClient.getDefaultOptions().queries?.retry).toBe(3);
  });

  it("derives the websocket url from apiUrl", () => {
    const createdUrls: string[] = [];
    class MockWebSocket {
      static OPEN = 1;
      readyState = 0;
      url: string;
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;

      constructor(url: string) {
        this.url = url;
        createdUrls.push(url);
      }

      send(): void {}

      close(): void {}
    }

    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

    createSnapshot({
      apiUrl: "https://api.bootstrap.example.com",
      ws: {
        reconnectOnLogin: false,
      },
    });

    expect(createdUrls).toEqual(["wss://api.bootstrap.example.com"]);
  });

  it("uses an explicit websocket url when provided", () => {
    const createdUrls: string[] = [];
    class MockWebSocket {
      static OPEN = 1;
      readyState = 0;
      url: string;
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;

      constructor(url: string) {
        this.url = url;
        createdUrls.push(url);
      }

      send(): void {}

      close(): void {}
    }

    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

    createSnapshot({
      apiUrl: "https://api.bootstrap.example.com",
      ws: {
        url: "wss://ws.example.com/socket",
        reconnectOnLogin: false,
      },
    });

    expect(createdUrls).toEqual(["wss://ws.example.com/socket"]);
  });

  it("uses the code-first auth session for token storage", () => {
    const snapshot = createSnapshot({
      apiUrl: "https://api.example.com",
      auth: {
        session: {
          mode: "token",
          storage: "sessionStorage",
          key: "snapshot.token",
        },
      },
    });

    snapshot.tokenStorage.set("abc123");
    expect(snapshot.tokenStorage.get()).toBe("abc123");
  });

  it("keeps cookie mode as a no-op token storage by default", () => {
    const snapshot = createSnapshot({
      apiUrl: "https://api.example.com",
    });

    snapshot.tokenStorage.set("abc123");
    expect(snapshot.tokenStorage.get()).toBeNull();
  });

  it("calls the code-first unauthenticated callback on 401", async () => {
    const onUnauthenticated = vi.fn();
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/protected")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ id: "1", email: "ada@example.com" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }) as typeof fetch;

    const snapshot = createSnapshot({
      apiUrl: "https://api.example.com",
      auth: {
        on: {
          unauthenticated: onUnauthenticated,
        },
      },
    });

    await expect(snapshot.api.get("/protected")).rejects.toMatchObject({
      status: 401,
    });

    expect(onUnauthenticated).toHaveBeenCalledOnce();
  });

  it("creates a websocket when ws config is provided", () => {
    const createdUrls: string[] = [];
    class MockWebSocket {
      static OPEN = 1;
      readyState = 0;
      url: string;
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((event: MessageEvent) => void) | null = null;

      constructor(url: string) {
        this.url = url;
        createdUrls.push(url);
      }

      send(): void {}

      close(): void {}
    }

    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

    createSnapshot({
      apiUrl: "https://api.example.com",
      ws: {
        reconnectOnLogin: false,
      },
    });

    expect(createdUrls).toEqual(["wss://api.example.com"]);
  });
});
