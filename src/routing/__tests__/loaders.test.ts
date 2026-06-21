import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { isRedirect } from "@tanstack/react-router";
import { createLoaders, AUTH_QUERY_KEY } from "../loaders";
import type { ApiClient } from "../../api/client";
import type { AuthContract } from "../../auth/contract";

const contract = {
  endpoints: { me: "/auth/me" },
} as unknown as AuthContract;

function makeApi(get: (path: string) => Promise<unknown>): ApiClient {
  return { get } as unknown as ApiClient;
}

function routerCtx(queryClient: QueryClient) {
  return { context: { queryClient } } as never;
}

describe("createLoaders", () => {
  describe("protectedBeforeLoad", () => {
    it("allows the route through when the user is authenticated", async () => {
      const api = makeApi(async () => ({ id: "u1", email: "a@b.c" }));
      const { protectedBeforeLoad } = createLoaders(
        { loginPath: "/login" },
        api,
        contract,
      );

      await expect(
        protectedBeforeLoad(routerCtx(new QueryClient())),
      ).resolves.toBeUndefined();
    });

    it("redirects to loginPath and fires onUnauthenticated when unauthenticated", async () => {
      const api = makeApi(async () => {
        throw new Error("401");
      });
      const onUnauthenticated = vi.fn();
      const { protectedBeforeLoad } = createLoaders(
        { loginPath: "/login", onUnauthenticated },
        api,
        contract,
      );

      let thrown: unknown;
      try {
        await protectedBeforeLoad(routerCtx(new QueryClient()));
      } catch (e) {
        thrown = e;
      }

      expect(isRedirect(thrown)).toBe(true);
      expect((thrown as { options: { to: string } }).options.to).toBe("/login");
      expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    });

    it("does not throw when no loginPath is configured", async () => {
      const api = makeApi(async () => {
        throw new Error("401");
      });
      const { protectedBeforeLoad } = createLoaders({}, api, contract);

      await expect(
        protectedBeforeLoad(routerCtx(new QueryClient())),
      ).resolves.toBeUndefined();
    });
  });

  describe("guestBeforeLoad", () => {
    it("redirects an authenticated user to homePath", async () => {
      const api = makeApi(async () => ({ id: "u1" }));
      const { guestBeforeLoad } = createLoaders(
        { homePath: "/app" },
        api,
        contract,
      );

      let thrown: unknown;
      try {
        await guestBeforeLoad(routerCtx(new QueryClient()));
      } catch (e) {
        thrown = e;
      }

      expect(isRedirect(thrown)).toBe(true);
      expect((thrown as { options: { to: string } }).options.to).toBe("/app");
    });

    it("lets a guest (no user) through", async () => {
      const api = makeApi(async () => {
        throw new Error("401");
      });
      const { guestBeforeLoad } = createLoaders(
        { homePath: "/app" },
        api,
        contract,
      );

      await expect(
        guestBeforeLoad(routerCtx(new QueryClient())),
      ).resolves.toBeUndefined();
    });
  });

  describe("protect / guest fragments", () => {
    it("return spreadable fragments carrying a beforeLoad guard", () => {
      const api = makeApi(async () => null);
      const loaders = createLoaders({ loginPath: "/login" }, api, contract);

      expect(
        typeof (loaders.protect() as { beforeLoad: unknown }).beforeLoad,
      ).toBe("function");
      expect(
        typeof (loaders.guest() as { beforeLoad: unknown }).beforeLoad,
      ).toBe("function");
    });
  });

  it("caches the user under AUTH_QUERY_KEY and reuses it on the fast path", async () => {
    const get = vi.fn(async () => ({ id: "u1", email: "a@b.c" }));
    const api = makeApi(get);
    const qc = new QueryClient();
    const { protectedBeforeLoad } = createLoaders(
      { loginPath: "/login" },
      api,
      contract,
    );

    await protectedBeforeLoad(routerCtx(qc));
    expect(qc.getQueryData(AUTH_QUERY_KEY)).toEqual({
      id: "u1",
      email: "a@b.c",
    });

    // Second navigation hits the fresh-cache fast path — no extra /auth/me call.
    await protectedBeforeLoad(routerCtx(qc));
    expect(get).toHaveBeenCalledTimes(1);
  });
});
