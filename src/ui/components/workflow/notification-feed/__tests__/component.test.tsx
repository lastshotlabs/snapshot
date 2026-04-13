// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationFeed } from "../component";

const executeSpy = vi.fn();

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: [
      { id: "n1", title: "Build passed", message: "CI is green", read: false, type: "success", timestamp: "2026-04-13T00:00:00.000Z" },
      { id: "n2", title: "Deploy ready", message: "Ready for release", read: false, type: "info", timestamp: "2026-04-13T01:00:00.000Z" },
    ],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("NotificationFeed", () => {
  it("renders unread count and marks all unread items", () => {
    executeSpy.mockReset();

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
});
