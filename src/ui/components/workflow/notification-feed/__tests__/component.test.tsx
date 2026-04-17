// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotificationFeed } from "../component";

const executeSpy = vi.fn();
const useComponentDataMock = vi.fn();
const refValues: Record<string, unknown> = {
  "state.notifications.empty": "All caught up",
};

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: (...args: unknown[]) => useComponentDataMock(...args),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value && typeof value === "object" && "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
}));

afterEach(() => {
  cleanup();
  executeSpy.mockReset();
  useComponentDataMock.mockReset();
});

describe("NotificationFeed", () => {
  it("renders unread count and marks all unread items", () => {
    executeSpy.mockReset();
    useComponentDataMock.mockReturnValue({
      data: [
        { id: "n1", title: "Build passed", message: "CI is green", read: false, type: "success", timestamp: "2026-04-13T00:00:00.000Z" },
        { id: "n2", title: "Deploy ready", message: "Ready for release", read: false, type: "info", timestamp: "2026-04-13T01:00:00.000Z" },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <NotificationFeed
        config={{
          type: "notification-feed",
          data: "/api/notifications",
          markReadAction: { type: "mark-read" } as never,
        }}
      />,
    );

    expect(screen.getByText("2")).toBeTruthy();

    fireEvent.click(screen.getByText("Mark all read"));

    expect(executeSpy).toHaveBeenCalledTimes(2);
    expect(executeSpy).toHaveBeenNthCalledWith(
      1,
      { type: "mark-read" },
      expect.objectContaining({ id: "n1" }),
    );
  });

  it("applies canonical slot styling to header and items", () => {
    useComponentDataMock.mockReturnValue({
      data: [
        { id: "n1", title: "Build passed", message: "CI is green", read: false, type: "success", timestamp: "2026-04-13T00:00:00.000Z" },
        { id: "n2", title: "Deploy ready", message: "Ready for release", read: false, type: "info", timestamp: "2026-04-13T01:00:00.000Z" },
      ],
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <NotificationFeed
        config={{
          type: "notification-feed",
          id: "alerts-feed",
          className: "feed-root-class",
          data: "/api/notifications",
          maxHeight: "260px",
          slots: {
            root: { className: "feed-root-slot" },
            header: { className: "feed-header-slot" },
            headerContent: { className: "feed-header-content-slot" },
            item: { className: "feed-item-slot" },
            itemBody: { className: "feed-item-body-slot" },
          },
        }}
      />,
    );

    expect(
      container
        .querySelector('[data-snapshot-id="alerts-feed-root"]')
        ?.classList.contains("feed-root-class"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-snapshot-id="alerts-feed-root"]')
        ?.classList.contains("feed-root-slot"),
    ).toBe(true);
    expect(
      (container.querySelector('[data-snapshot-id="alerts-feed-root"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("");
    expect(
      (container.querySelector('[data-snapshot-id="alerts-feed-list"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("260px");
    expect(
      container
        .querySelector("[data-notification-header]")
        ?.classList.contains("feed-header-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-snapshot-id="alerts-feed-header-content"]')
        ?.classList.contains("feed-header-content-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector("[data-notification-item]")
        ?.classList.contains("feed-item-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-snapshot-id="alerts-feed-item-n1-body"]')
        ?.classList.contains("feed-item-body-slot"),
    ).toBe(true);
  });

  it("renders a ref-backed empty message", () => {
    useComponentDataMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <NotificationFeed
        config={{
          type: "notification-feed",
          data: "/api/notifications",
          emptyMessage: { from: "state.notifications.empty" } as never,
        }}
      />,
    );

    expect(screen.getByText("All caught up")).toBeTruthy();
  });
});
