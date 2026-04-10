// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSnapshot } from "./create-snapshot";

const originalWebSocket = global.WebSocket;

afterEach(() => {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.clear();
  }
  global.WebSocket = originalWebSocket;
});

describe("createSnapshot", () => {
  it("uses the manifest app cache for QueryClient defaults", () => {
    const snapshot = createSnapshot({
      apiUrl: "https://api.example.com",
      manifest: {
        app: {
          cache: {
            staleTime: 60_000,
            gcTime: 120_000,
            retry: 3,
          },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
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

  it("uses manifest.app.apiUrl when provided", () => {
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
      manifest: {
        app: {
          apiUrl: "https://api.manifest.example.com",
        },
        realtime: {
          ws: {
            reconnectOnLogin: false,
          },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      },
    });

    expect(createdUrls).toEqual(["wss://api.manifest.example.com"]);
  });

  it("resolves manifest env refs from the provided env source", () => {
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
      env: {
        SNAPSHOT_API_URL: "https://api.from.env.example.com",
      },
      manifest: {
        app: {
          apiUrl: { env: "SNAPSHOT_API_URL" },
        },
        realtime: {
          ws: {
            reconnectOnLogin: false,
          },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      },
    });

    expect(createdUrls).toEqual(["wss://api.from.env.example.com"]);
  });

  it("uses the manifest auth session for token storage", () => {
    const snapshot = createSnapshot({
      apiUrl: "https://api.example.com",
      manifest: {
        auth: {
          screens: ["login"],
          session: {
            mode: "token",
            storage: "sessionStorage",
            key: "manifest.token",
          },
        },
        routes: [
          {
            id: "login",
            path: "/login",
            content: [{ type: "heading", text: "Login" }],
          },
        ],
      },
    });

    snapshot.tokenStorage.set("abc123");
    expect(snapshot.tokenStorage.get()).toBe("abc123");
  });

  it("keeps cookie mode as a no-op token storage by default", () => {
    const snapshot = createSnapshot({
      apiUrl: "https://api.example.com",
      manifest: {
        auth: {
          screens: ["login"],
        },
        routes: [
          {
            id: "login",
            path: "/login",
            content: [{ type: "heading", text: "Login" }],
          },
        ],
      },
    });

    snapshot.tokenStorage.set("abc123");
    expect(snapshot.tokenStorage.get()).toBeNull();
  });

  it("dispatches a manifest auth workflow event on 401", async () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
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
      manifest: {
        auth: {
          screens: ["login"],
          on: {
            unauthenticated: "auth-401",
          },
        },
        workflows: {
          "auth-401": {
            type: "toast",
            message: "Handled",
          },
        },
        routes: [
          {
            id: "login",
            path: "/login",
            content: [{ type: "heading", text: "Login" }],
          },
        ],
      },
    });

    await expect(snapshot.api.get("/protected")).rejects.toMatchObject({
      status: 401,
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const event = dispatchSpy.mock.calls[0]?.[0] as CustomEvent<{
      kind?: string;
    }>;
    expect(event.type).toBe("snapshot:manifest-auth-workflow");
    expect(event.detail.kind).toBe("unauthenticated");
  });

  it("derives the websocket url from apiUrl when manifest.realtime.ws.url is omitted", () => {
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
      manifest: {
        realtime: {
          ws: {
            reconnectOnLogin: false,
          },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      },
    });

    expect(createdUrls).toEqual(["wss://api.example.com"]);
  });
});
