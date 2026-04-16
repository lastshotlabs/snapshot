// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommentSection } from "../component";

const mockExecute = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: [
      {
        id: "comment-1",
        content: "<p>Hello world</p>",
        author: { name: "Ada" },
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

vi.mock("../../../content/rich-input/component", () => ({
  RichInput: () => <div data-testid="mock-comment-input">Comment Input</div>,
}));

vi.mock("../../message-thread/message-renderer", () => ({
  sanitizeMessageHtml: (value: string) => value,
}));

describe("CommentSection", () => {
  it("renders comments and dispatches delete action", () => {
    render(
      <CommentSection
        config={{
          type: "comment-section",
          id: "comments",
          className: "comment-root",
          data: "GET /api/comments",
          submitAction: { type: "event", name: "submit-comment" } as never,
          deleteAction: { type: "event", name: "delete-comment" } as never,
        }}
      />,
    );

    expect(screen.getByTestId("comment-section")).toBeTruthy();
    expect(screen.getByTestId("comment-section").classList.contains("comment-root")).toBe(
      true,
    );
    expect(screen.getByText("Comments")).toBeTruthy();
    expect(screen.getByText("(1)")).toBeTruthy();
    expect(screen.getByTestId("mock-comment-input").textContent).toBe(
      "Comment Input",
    );

    fireEvent.click(screen.getByTitle("Delete comment"));
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});
