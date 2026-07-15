import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../client";
import { ApiError } from "../error";
import { defaultContract } from "../../auth/contract";
import type { TokenStorage } from "../../auth/storage";

function memoryStorage(): TokenStorage {
  let token: string | null = null;
  let refresh: string | null = null;
  return {
    get: () => token,
    set: (t) => {
      token = t;
    },
    clear: () => {
      token = null;
    },
    getRefreshToken: () => refresh,
    setRefreshToken: (t) => {
      refresh = t;
    },
    clearRefreshToken: () => {
      refresh = null;
    },
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("ApiClient 401 handling (token mode)", () => {
  const contract = defaultContract("http://api.test");
  let storage: TokenStorage;
  let onUnauthenticated: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn>;

  function makeClient(): ApiClient {
    const client = new ApiClient({
      apiUrl: "http://api.test",
      auth: "token",
      contract,
      onUnauthenticated,
    });
    client.setStorage(storage);
    return client;
  }

  beforeEach(() => {
    storage = memoryStorage();
    onUnauthenticated = vi.fn();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    // Silence the token-mode browser warning noise in test output.
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retries once with the current token when credentials changed mid-flight, instead of clearing them", async () => {
    // The guest-mint race: a request goes out with NO token, a guest session is
    // minted while it is in flight, and the stale 401 lands afterwards. The 401
    // is about the old (missing) credential — it must not wipe the fresh token,
    // must not fire onUnauthenticated, and the request should be retried with
    // the credential that now exists.
    const client = makeClient();

    fetchMock.mockImplementationOnce(async () => {
      // The mint lands while the first request is in flight.
      storage.set("fresh-guest-token");
      return jsonResponse(401, { error: "unauthenticated" });
    });
    fetchMock.mockImplementationOnce(async (_url, init: RequestInit) => {
      const headers = init.headers as Record<string, string>;
      expect(headers[contract.headers.userToken]).toBe("fresh-guest-token");
      return jsonResponse(200, { userId: "guest-1" });
    });

    const result = await client.get<{ userId: string }>("/auth/me");

    expect(result).toEqual({ userId: "guest-1" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(storage.get()).toBe("fresh-guest-token");
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("does not clear a token that was replaced after the failing request went out", async () => {
    // Same race, but the retry ALSO fails (the new token is genuinely bad).
    // The retry's failure is real, so cleanup applies to the retried token.
    const client = makeClient();
    storage.set("stale-token");

    fetchMock.mockImplementationOnce(async () => {
      storage.set("newer-token");
      return jsonResponse(401, { error: "unauthenticated" });
    });
    fetchMock.mockImplementationOnce(async () =>
      jsonResponse(401, { error: "unauthenticated" }),
    );

    await expect(client.get("/private")).rejects.toThrow(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(storage.get()).toBeNull();
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("clears the token and fires onUnauthenticated when the failing token is still current", async () => {
    const client = makeClient();
    storage.set("bad-token");

    fetchMock.mockImplementationOnce(async () =>
      jsonResponse(401, { error: "unauthenticated" }),
    );

    await expect(client.get("/private")).rejects.toThrow(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(storage.get()).toBeNull();
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("honors suppressUnauthenticated on a genuine 401", async () => {
    const client = makeClient();
    storage.set("bad-token");

    fetchMock.mockImplementationOnce(async () =>
      jsonResponse(401, { error: "unauthenticated" }),
    );

    await expect(
      client.get("/auth/me", { suppressUnauthenticated: true }),
    ).rejects.toThrow(ApiError);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("skips the mid-flight retry when the token has not changed", async () => {
    const client = makeClient();
    // No token at all, none arrives: a plain anonymous 401.
    fetchMock.mockImplementationOnce(async () =>
      jsonResponse(401, { error: "unauthenticated" }),
    );

    await expect(client.get("/private")).rejects.toThrow(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });
});
