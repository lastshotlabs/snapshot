// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MessageThread } from "../component";

const mockExecute = vi.fn();
const mockPublish = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => mockPublish,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
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
  }),
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

describe("MessageThread", () => {
  it("renders messages and dispatches messageAction on click", () => {
    render(
      <MessageThread
        config={{
          type: "message-thread",
          id: "thread",
          data: "GET /api/messages",
          messageAction: { type: "event", name: "open-message" } as never,
        }}
      />,
    );

    const message = screen.getByTestId("message-item");
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
});
