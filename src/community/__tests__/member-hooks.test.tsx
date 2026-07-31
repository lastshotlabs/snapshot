/**
 * @vitest-environment jsdom
 */
// Regression tests: the Members/Roles hooks must hit the REAL ContainerMember
// routes. They previously used invented nested paths
// (`/community/containers/:id/members`, `/moderators/:userId`, …) that the
// server never mounted — every membership mutation 404'd. The entity is flat:
//   POST   /community/container-members            (self-join)
//   GET    /community/container-members?containerId=&userId=&…
//   GET    /community/container-members/list-by-role/:containerId/:role
//   DELETE /community/container-members/:membershipId
//   POST   /community/container-members/assign-role
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createCommunityHooks } from "../hooks";
import type { ApiClient } from "../../api/client";

const calls: { method: string; path: string; body?: unknown }[] = [];

const memberRow = {
  id: "mem-1",
  containerId: "c1",
  userId: "u2",
  role: "member",
  joinedAt: "2026-07-21T00:00:00.000Z",
};

const api = {
  request: vi.fn(async (method: string, path: string, body?: unknown) => {
    calls.push({ method, path, body });
    return {};
  }),
  get: vi.fn(async (path: string) => {
    calls.push({ method: "GET", path });
    return { items: [memberRow], hasMore: false };
  }),
  post: vi.fn(async (path: string, body?: unknown) => {
    calls.push({ method: "POST", path, body });
    return memberRow;
  }),
  delete: vi.fn(async (path: string) => {
    calls.push({ method: "DELETE", path });
  }),
  patch: vi.fn(async (path: string, body?: unknown) => {
    calls.push({ method: "PATCH", path, body });
    return memberRow;
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

async function runMutation(action: () => Promise<unknown>): Promise<void> {
  await act(async () => {
    await action();
  });
}

beforeEach(() => {
  calls.length = 0;
  queryClient.clear();
});

describe("community member hooks — route correctness", () => {
  it("useContainerMembers lists via the flat container-members collection", async () => {
    const { result } = renderHook(() => hooks.useContainerMembers("c1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/container-members?containerId=c1&limit=20",
    );
    expect(result.current.data?.items[0]?.userId).toBe("u2");
  });

  it("useContainerModerators uses list-by-role", async () => {
    const { result } = renderHook(() => hooks.useContainerModerators("c1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/container-members/list-by-role/c1/moderator?limit=20",
    );
  });

  it("useAddMember posts the self-join create route with ids in the body", async () => {
    const { result } = renderHook(() => hooks.useAddMember(), { wrapper });
    await runMutation(() =>
      result.current.mutateAsync({ containerId: "c1", userId: "u2" }),
    );
    expect(calls[0]).toEqual({
      method: "POST",
      path: "/community/container-members",
      body: { containerId: "c1", userId: "u2" },
    });
  });

  it("useRemoveMember resolves the membership id, then deletes by id", async () => {
    const { result } = renderHook(() => hooks.useRemoveMember(), { wrapper });
    await runMutation(() =>
      result.current.mutateAsync({ containerId: "c1", userId: "u2" }),
    );
    expect(calls[0]?.path).toBe(
      "/community/container-members?containerId=c1&userId=u2&limit=1",
    );
    expect(calls[1]).toEqual({
      method: "DELETE",
      path: "/community/container-members/mem-1",
    });
  });

  it("useAssignModerator / useRemoveModerator upsert the role via assign-role", async () => {
    const assign = renderHook(() => hooks.useAssignModerator(), { wrapper });
    await runMutation(() =>
      assign.result.current.mutateAsync({
        containerId: "c1",
        userId: "u2",
      }),
    );
    expect(calls[0]).toEqual({
      method: "POST",
      path: "/community/container-members/assign-role",
      body: { containerId: "c1", userId: "u2", role: "moderator" },
    });

    calls.length = 0;
    const remove = renderHook(() => hooks.useRemoveModerator(), { wrapper });
    await runMutation(() =>
      remove.result.current.mutateAsync({
        containerId: "c1",
        userId: "u2",
      }),
    );
    expect(calls[0]?.body).toEqual({
      containerId: "c1",
      userId: "u2",
      role: "member",
    });
  });

  it("useAssignOwner upserts role owner", async () => {
    const { result } = renderHook(() => hooks.useAssignOwner(), { wrapper });
    await runMutation(() =>
      result.current.mutateAsync({ containerId: "c1", userId: "u2" }),
    );
    expect(calls[0]?.body).toEqual({
      containerId: "c1",
      userId: "u2",
      role: "owner",
    });
  });
});

describe("community thread/reply/reaction hooks — route correctness", () => {
  it("useContainerThreads lists via list-by-container", async () => {
    const { result } = renderHook(
      () => hooks.useContainerThreads({ containerId: "c1" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/threads/list-by-container/c1?limit=20",
    );
  });

  it("useCreateThread posts the flat threads collection with containerId in the body", async () => {
    const { result } = renderHook(() => hooks.useCreateThread(), { wrapper });
    await runMutation(() =>
      result.current
        .mutateAsync({ containerId: "c1", title: "t", body: "b" })
        .catch(() => undefined),
    );
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.path).toBe("/community/threads");
    expect(calls[0]?.body).toEqual({
      containerId: "c1",
      title: "t",
      body: "b",
    });
  });

  it("useCreateReply posts the flat replies collection with threadId in the body", async () => {
    const { result } = renderHook(() => hooks.useCreateReply(), { wrapper });
    await runMutation(() =>
      result.current
        .mutateAsync({ threadId: "t1", containerId: "c1", body: "hello" })
        .catch(() => undefined),
    );
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.path).toBe("/community/replies");
    expect(calls[0]?.body).toEqual({
      threadId: "t1",
      containerId: "c1",
      body: "hello",
    });
  });

  it("useThreadReplies lists via list-by-thread", async () => {
    const { result } = renderHook(
      () => hooks.useThreadReplies({ threadId: "t1" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/replies/list-by-thread/t1?limit=20",
    );
  });

  it("useAddThreadReaction posts the reactions collection with the entity payload", async () => {
    const { result } = renderHook(() => hooks.useAddThreadReaction(), {
      wrapper,
    });
    await runMutation(() =>
      result.current
        .mutateAsync({ threadId: "t1", containerId: "c1", emoji: "👍" })
        .catch(() => undefined),
    );
    expect(calls[0]?.path).toBe("/community/reactions");
    expect(calls[0]?.body).toEqual({
      targetId: "t1",
      targetType: "thread",
      containerId: "c1",
      type: "emoji",
      value: "👍",
    });
  });

  it("useRemoveThreadReaction deletes by reaction row id", async () => {
    const { result } = renderHook(() => hooks.useRemoveThreadReaction(), {
      wrapper,
    });
    await runMutation(() =>
      result.current
        .mutateAsync({
          reactionId: "r-9",
          threadId: "t1",
          containerId: "c1",
        })
        .catch(() => undefined),
    );
    expect(calls[0]).toEqual({
      method: "DELETE",
      path: "/community/reactions/r-9",
    });
  });

  it("useThreadReactions reads list-by-target and unwraps items", async () => {
    const { result } = renderHook(() => hooks.useThreadReactions("t1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(calls[0]?.path).toBe(
      "/community/reactions/list-by-target/t1/thread",
    );
  });

  // slingshot-community's config-driven runtime mounts every named moderation
  // operation as POST. The source-route generator's PATCH mapping is a
  // separate path and does not describe these live routes. Full method coverage
  // lives in pagination-search-ban-hooks.test.tsx.
  it("thread moderation ops hit the flat named-op routes", async () => {
    const pin = renderHook(() => hooks.usePinThread(), { wrapper });
    await runMutation(() =>
      pin.result.current
        .mutateAsync({ threadId: "t1", containerId: "c1" })
        .catch(() => undefined),
    );
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.path).toBe("/community/threads/pin");
    expect(calls[0]?.body).toEqual({ id: "t1", pinned: true });

    calls.length = 0;
    const unlock = renderHook(() => hooks.useUnlockThread(), { wrapper });
    await runMutation(() =>
      unlock.result.current
        .mutateAsync({ threadId: "t1", containerId: "c1" })
        .catch(() => undefined),
    );
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.path).toBe("/community/threads/unlock");
    expect(calls[0]?.body).toEqual({ id: "t1", locked: false });

    calls.length = 0;
    const publish = renderHook(() => hooks.usePublishThread(), { wrapper });
    await runMutation(() =>
      publish.result.current
        .mutateAsync({ threadId: "t1", containerId: "c1" })
        .catch(() => undefined),
    );
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.path).toBe("/community/threads/publish");
    expect(calls[0]?.body).toEqual({ id: "t1" });
  });
});

describe("notification hooks — route correctness", () => {
  it("useNotifications lists the slingshot-notifications entity", async () => {
    const { result } = renderHook(() => hooks.useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(calls[0]?.path).toBe(
      "/notifications/notifications?limit=20&sortDir=desc",
    );
  });

  it("useNotificationsUnreadCount posts the aggregate op", async () => {
    const { result } = renderHook(() => hooks.useNotificationsUnreadCount(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isFetched).toBe(true));
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/notifications/notifications/unseen-count",
    });
  });

  it("useMarkAllNotificationsSeen clears the badge tier", async () => {
    const { result } = renderHook(() => hooks.useMarkAllNotificationsSeen(), {
      wrapper,
    });
    await runMutation(() =>
      result.current.mutateAsync().catch(() => undefined),
    );
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/notifications/notifications/mark-all-seen",
    });
  });

  it("useMarkNotificationRead posts mark-read with id + read fields", async () => {
    const { result } = renderHook(() => hooks.useMarkNotificationRead(), {
      wrapper,
    });
    await runMutation(() =>
      result.current
        .mutateAsync({ notificationId: "n-1" })
        .catch(() => undefined),
    );
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.path).toBe("/notifications/notifications/mark-read");
    expect(calls[0]?.body).toMatchObject({ id: "n-1", read: true });
  });

  it("useMarkAllNotificationsRead posts the batch op", async () => {
    const { result } = renderHook(() => hooks.useMarkAllNotificationsRead(), {
      wrapper,
    });
    await runMutation(() =>
      result.current.mutateAsync().catch(() => undefined),
    );
    expect(calls[0]).toMatchObject({
      method: "POST",
      path: "/notifications/notifications/mark-all-read",
    });
  });

  it("useDismissNotification deletes the user-owned row", async () => {
    const { result } = renderHook(() => hooks.useDismissNotification(), {
      wrapper,
    });
    await runMutation(() =>
      result.current
        .mutateAsync({ notificationId: "n-1" })
        .catch(() => undefined),
    );
    expect(calls[0]).toMatchObject({
      method: "DELETE",
      path: "/notifications/notifications/n-1",
    });
  });
});
