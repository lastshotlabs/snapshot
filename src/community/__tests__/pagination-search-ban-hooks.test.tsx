/**
 * @vitest-environment jsdom
 */
// Regression tests for the second wave of community route/shape mismatches
// (the first wave was members/roles — see member-hooks.test.tsx).
//
// Three separate lies were fixed here, all verified against
// slingshot-community + slingshot-entity source:
//
// 1. PAGINATION. Every entity `list` route accepts `limit`/`cursor`/`sortDir`
//    and returns `{ items, cursor?, nextCursor?, hasMore? }`
//    (slingshot-entity/src/lib/entityZodSchemas.ts). Snapshot sent
//    `?page=&pageSize=` and typed the response as `{items,total,page,pageSize}`
//    — so `.total` was `number` at compile time and `undefined` at runtime.
//
// 2. SEARCH. There is no `/community/search/*` namespace. `op.search` generates
//    `GET /{basePath}/search` (slingshot-entity/src/generators/routes.ts). The
//    Reply entity filters on `threadId`, not `containerId`.
//
// 3. BAN CHECK. The Ban entity disables `isUserBanned`/`getUserBan` via
//    `routes.disable` and mounts no `/bans/check`, so the check is derived from
//    the filtered ban list instead.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createCommunityHooks } from "../hooks";
import type { ApiClient } from "../../api/client";

const calls: { method: string; path: string; body?: unknown }[] = [];

/** Rows returned by the stub. Reassign per-test to drive a specific shape. */
let getPayload: unknown = { items: [], hasMore: false };

const api = {
  get: vi.fn(async (path: string) => {
    calls.push({ method: "GET", path });
    return getPayload;
  }),
  post: vi.fn(async (path: string, body?: unknown) => {
    calls.push({ method: "POST", path, body });
    return {};
  }),
  delete: vi.fn(async (path: string) => {
    calls.push({ method: "DELETE", path });
  }),
  patch: vi.fn(async (path: string, body?: unknown) => {
    calls.push({ method: "PATCH", path, body });
    return {};
  }),
} as unknown as ApiClient;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const hooks = createCommunityHooks({ api, queryClient });

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  calls.length = 0;
  getPayload = { items: [], hasMore: false };
  queryClient.clear();
});

describe("community list hooks — cursor pagination", () => {
  it("omits the query string entirely when no params are given", async () => {
    const { result } = renderHook(() => hooks.useContainers(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe("/community/containers");
  });

  it("sends limit/cursor/sortDir, never page/pageSize", async () => {
    const { result } = renderHook(
      () => hooks.useContainers({ limit: 10, cursor: "c-abc", sortDir: "asc" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const path = calls[0]?.path ?? "";
    expect(path).toBe(
      "/community/containers?limit=10&cursor=c-abc&sortDir=asc",
    );
    expect(path).not.toContain("page");
    expect(path).not.toContain("pageSize");
  });

  it("surfaces the cursor envelope the server actually returns", async () => {
    getPayload = {
      items: [{ id: "ct-1" }],
      nextCursor: "c-next",
      hasMore: true,
    };
    const { result } = renderHook(() => hooks.useContainers(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.nextCursor).toBe("c-next");
    expect(result.current.data?.hasMore).toBe(true);
  });

  it("passes a caller limit through on the nested thread listing", async () => {
    const { result } = renderHook(
      () => hooks.useContainerThreads({ containerId: "c1", limit: 5 }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/threads/list-by-container/c1?limit=5",
    );
  });

  it("defaults the nested thread listing to limit=20", async () => {
    const { result } = renderHook(
      () => hooks.useContainerThreads({ containerId: "c1" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/threads/list-by-container/c1?limit=20",
    );
  });

  it("pages reports and bans by cursor", async () => {
    const reports = renderHook(() => hooks.useReports({ cursor: "r-1" }), {
      wrapper,
    });
    await waitFor(() => expect(reports.result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe("/community/reports?cursor=r-1");

    calls.length = 0;
    queryClient.clear();

    const bans = renderHook(() => hooks.useBans({ limit: 3 }), { wrapper });
    await waitFor(() => expect(bans.result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe("/community/bans?limit=3");
  });
});

describe("community search hooks — route correctness", () => {
  it("searches threads on the entity route, not a /community/search namespace", async () => {
    const { result } = renderHook(
      () => hooks.useSearchThreads({ q: "hello", containerId: "c1" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const path = calls[0]?.path ?? "";
    expect(path).toBe("/community/threads/search?q=hello&containerId=c1");
    expect(path).not.toContain("/community/search/");
  });

  it("searches replies by threadId — the Reply entity has no containerId filter", async () => {
    const { result } = renderHook(
      () => hooks.useSearchReplies({ q: "hello", threadId: "t1" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const path = calls[0]?.path ?? "";
    expect(path).toBe("/community/replies/search?q=hello&threadId=t1");
    expect(path).not.toContain("containerId");
  });

  it("forwards search pagination as limit/cursor", async () => {
    const { result } = renderHook(
      () => hooks.useSearchThreads({ q: "x", limit: 2, cursor: "s-1" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/threads/search?q=x&limit=2&cursor=s-1",
    );
  });

  it("stays idle without a query string", () => {
    renderHook(() => hooks.useSearchThreads({ q: "" }), { wrapper });
    expect(calls).toHaveLength(0);
  });
});

describe("thread moderation — HTTP method correctness", () => {
  // `publish` is op.transition (POST), but lock/unlock/pin/unpin are
  // op.fieldUpdate, which generates PATCH /{basePath}/{op} with the match
  // params and set fields in the BODY (slingshot-entity/src/generators/
  // routes.ts:557-567 vs :517). Snapshot POSTed all five, so the four
  // fieldUpdate routes never matched.
  it("publishes with POST — publish is a transition", async () => {
    const { result } = renderHook(() => hooks.usePublishThread(), { wrapper });
    result.current.mutate({ threadId: "t1", containerId: "c1" });
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/community/threads/publish",
      body: { id: "t1" },
    });
  });

  it.each([
    ["useLockThread", "lock", { locked: true }],
    ["useUnlockThread", "unlock", { locked: false }],
    ["usePinThread", "pin", { pinned: true }],
    ["useUnpinThread", "unpin", { pinned: false }],
  ])(
    "%s uses PATCH — fieldUpdate ops are not POST",
    async (hook, op, patchBody) => {
      const useHook = hooks[hook as keyof typeof hooks] as () => {
        mutate: (v: { threadId: string; containerId: string }) => void;
      };
      const { result } = renderHook(() => useHook(), { wrapper });
      result.current.mutate({ threadId: "t1", containerId: "c1" });
      await waitFor(() => expect(calls).toHaveLength(1));
      expect(calls[0]).toMatchObject({
        method: "PATCH",
        path: `/community/threads/${op}`,
        body: { id: "t1", ...patchBody },
      });
    },
  );
});

describe("useCheckBan — derived from the ban list", () => {
  it("queries the real bans collection, never /bans/check", async () => {
    const { result } = renderHook(() => hooks.useCheckBan("u1", "c1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const path = calls[0]?.path ?? "";
    expect(path).toBe("/community/bans?userId=u1&limit=50&containerId=c1");
    expect(path).not.toContain("/bans/check");
  });

  it("reports an active ban", async () => {
    getPayload = {
      items: [
        { id: "b1", userId: "u1", createdAt: "2026-07-01T00:00:00.000Z" },
      ],
      hasMore: false,
    };
    const { result } = renderHook(() => hooks.useCheckBan("u1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.banned).toBe(true);
    expect(result.current.data?.ban?.id).toBe("b1");
  });

  it("ignores a ban that was lifted", async () => {
    getPayload = {
      items: [
        {
          id: "b1",
          userId: "u1",
          createdAt: "2026-07-01T00:00:00.000Z",
          unbannedAt: "2026-07-02T00:00:00.000Z",
        },
      ],
      hasMore: false,
    };
    const { result } = renderHook(() => hooks.useCheckBan("u1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.banned).toBe(false);
    expect(result.current.data?.ban).toBeUndefined();
  });

  it("ignores a ban that has expired but honours one that has not", async () => {
    getPayload = {
      items: [
        {
          id: "expired",
          userId: "u1",
          createdAt: "2020-01-01T00:00:00.000Z",
          expiresAt: "2020-02-01T00:00:00.000Z",
        },
        {
          id: "active",
          userId: "u1",
          createdAt: "2020-01-01T00:00:00.000Z",
          expiresAt: "2999-01-01T00:00:00.000Z",
        },
      ],
      hasMore: false,
    };
    const { result } = renderHook(() => hooks.useCheckBan("u1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.banned).toBe(true);
    expect(result.current.data?.ban?.id).toBe("active");
  });

  it("reports not-banned on an empty list", async () => {
    const { result } = renderHook(() => hooks.useCheckBan("u1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.banned).toBe(false);
  });

  it("stays idle without a userId", () => {
    renderHook(() => hooks.useCheckBan(""), { wrapper });
    expect(calls).toHaveLength(0);
  });
});
