// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageThread } from "../component";

const mockExecute = vi.fn();
const mockPublish = vi.fn();
const useComponentDataMock = vi.fn();
const refValues: Record<string, unknown> = {
  "state.thread.empty": "No activity yet",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value && typeof value === "object" && "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
  usePublish: () => mockPublish,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: (...args: unknown[]) => useComponentDataMock(...args),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => mockExecute,
}));

vi.mock("../message-renderer", () => ({
  sanitizeMessageHtml: (value: string) => value,
}));

vi.mock("../../../content/link-embed/component", () => ({
  LinkEmbed: () => <div data-testid="mock-link-embed">Embed</div>,
}));

afterEach(() => {
  cleanup();
  mockExecute.mockReset();
  mockPublish.mockReset();
  useComponentDataMock.mockReset();
});

describe("MessageThread", () => {
  it("renders messages and dispatches messageAction on click", () => {
    useComponentDataMock.mockReturnValue({
      data: [
        {
          id: "msg-1",
          content: "<p>Hello thread</p>",
          author: { name: "Lin" },
          timestamp: "2026-04-13T12:00:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
    });

    render(
      <MessageThread
        config={{
          type: "message-thread",
          id: "thread",
          className: "thread-root",
          data: "GET /api/messages",
          maxHeight: "480px",
          messageAction: { type: "event", name: "open-message" } as never,
        }}
      />,
    );

    const message = screen.getByTestId("message-item");
    expect(
      document
        .querySelector('[data-snapshot-id="thread"]')
        ?.classList.contains("thread-root"),
    ).toBe(true);
    expect(
      (document.querySelector('[data-snapshot-id="thread"]') as HTMLElement | null)
        ?.style.maxHeight ?? "",
    ).toBe("");
    expect(
      (
        document.querySelector('[data-snapshot-id="thread-scrollArea"]') as
          | HTMLElement
          | null
      )?.style.maxHeight,
    ).toBe("480px");
    expect(message.textContent).toContain("Lin");
    expect(message.textContent).toContain("Hello thread");

    fireEvent.click(message);

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedMessage: expect.objectContaining({ id: "msg-1" }),
      }),
    );
  });

  it("renders a ref-backed empty message", () => {
    useComponentDataMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <MessageThread
        config={{
          type: "message-thread",
          data: "GET /api/messages",
          emptyMessage: { from: "state.thread.empty" } as never,
        }}
      />,
    );

    expect(screen.getByText("No activity yet")).toBeTruthy();
  });
});
