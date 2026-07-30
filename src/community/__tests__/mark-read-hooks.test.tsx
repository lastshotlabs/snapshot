/**
 * @vitest-environment jsdom
 */
// Regression tests for the notification mark-read request shape (ticket
// 146431a2; consumer report sgforum 1f83da1e).
//
// `useMarkNotificationRead` sent `readAt: Date.now()`. `readAt` is a TIMESTAMP
// column, and a millisecond NUMBER makes Postgres reject the write with 22008
// (datetime_field_overflow) — so every "mark this read" tap 500s, the row is
// never updated, and the unread badge never clears. Measured against a real api
// on 2026-07-29, same notification, three shapes:
//
//   readAt: Date.now()   -> 500 Internal Server Error
//   readAt: ISO string   -> 200, row returned with read: true
//   readAt omitted       -> 200
//
// It went unnoticed because the notification surface was effectively empty (a
// separate bug meant mentions produced no notifications at all). Once they
// arrived, marking them read was on the critical path and broken.
//
// THE ASSERTION IS ON THE WIRE FORMAT, not on the hook's return value, because
// the wire format IS the bug: everything about the call looked right except the
// type of one field, and TypeScript could not see it (the op body is typed
// loosely enough that a number passes).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createCommunityHooks } from "../hooks";
import type { ApiClient } from "../../api/client";

const calls: { method: string; path: string; body?: unknown }[] = [];

const api = {
  get: vi.fn(async (path: string) => {
    calls.push({ method: "GET", path });
    return { items: [], hasMore: false };
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
  queryClient.clear();
});

/** ISO-8601 with milliseconds and a Z suffix — what `toISOString()` produces. */
const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("useMarkNotificationRead — the readAt wire format", () => {
  it("sends readAt as an ISO string, never a millisecond number", async () => {
    const { result } = renderHook(() => hooks.useMarkNotificationRead(), {
      wrapper,
    });

    result.current.mutate({ notificationId: "n1" });
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));

    const call = calls.find((c) => c.path.includes("mark-read"));
    expect(call, "a mark-read call was made").toBeDefined();

    const body = call!.body as { id: string; read: boolean; readAt: unknown };
    expect(body.id).toBe("n1");
    expect(body.read).toBe(true);

    // THE REGRESSION. A number here is the 22008 that made the badge unclearable.
    expect(typeof body.readAt).toBe("string");
    expect(body.readAt as string).toMatch(ISO_8601);
    expect(Number.isFinite(Number(body.readAt))).toBe(false);
  });

  it("posts to the mark-read named operation", async () => {
    const { result } = renderHook(() => hooks.useMarkNotificationRead(), {
      wrapper,
    });

    result.current.mutate({ notificationId: "n2" });
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));

    // `mark-read` is a named op: POST with the id in the BODY, not the path.
    expect(calls[0]!.method).toBe("POST");
    expect(calls[0]!.path).toBe("/notifications/notifications/mark-read");
  });

  it("sends a timestamp the server can round-trip to the same instant", async () => {
    const before = Date.now();
    const { result } = renderHook(() => hooks.useMarkNotificationRead(), {
      wrapper,
    });

    result.current.mutate({ notificationId: "n3" });
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    const after = Date.now();

    const { readAt } = calls[0]!.body as { readAt: string };
    const parsed = Date.parse(readAt);
    // Not merely "a string" — a string that means the moment it was sent.
    expect(Number.isNaN(parsed)).toBe(false);
    expect(parsed).toBeGreaterThanOrEqual(before - 1000);
    expect(parsed).toBeLessThanOrEqual(after + 1000);
  });
});

describe("useMarkAllNotificationsRead — unaffected, and asserted so", () => {
  it("sends no readAt at all; the server stamps it", async () => {
    const { result } = renderHook(() => hooks.useMarkAllNotificationsRead(), {
      wrapper,
    });

    result.current.mutate();
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));

    const call = calls.find((c) => c.path.includes("mark-all-read"));
    expect(call, "a mark-all-read call was made").toBeDefined();
    // The batch op sets `readAt: 'now'` server-side. If a client value ever
    // starts being sent here, it inherits the exact bug fixed above.
    expect(call!.body ?? {}).not.toHaveProperty("readAt");
  });
});
