// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommentSection } from "../component";

const mockExecute = vi.fn();
const useComponentDataMock = vi.fn();
const refValues: Record<string, unknown> = {
  "state.comments.placeholder": "Join the discussion",
  "state.comments.empty": "No replies yet",
};
const richInputCapture = vi.hoisted(
  () => ({ config: null as Record<string, unknown> | null }),
);

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value && typeof value === "object" && "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: (...args: unknown[]) => useComponentDataMock(...args),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => mockExecute,
}));

vi.mock("../../../content/rich-input/component", () => ({
  RichInput: ({ config }: { config: Record<string, unknown> }) => {
    richInputCapture.config = config;
    return <div data-testid="mock-comment-input">Comment Input</div>;
  },
}));

vi.mock("../../message-thread/message-renderer", () => ({
  sanitizeMessageHtml: (value: string) => value,
}));

afterEach(() => {
  cleanup();
  mockExecute.mockReset();
  useComponentDataMock.mockReset();
  richInputCapture.config = null;
});

describe("CommentSection", () => {
  it("renders comments and dispatches delete action", () => {
    useComponentDataMock.mockReturnValue({
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
    });

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

  it("renders a ref-backed empty message and forwards the input placeholder", () => {
    useComponentDataMock.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <CommentSection
        config={{
          type: "comment-section",
          data: "GET /api/comments",
          submitAction: { type: "event", name: "submit-comment" } as never,
          inputPlaceholder: { from: "state.comments.placeholder" } as never,
          emptyMessage: { from: "state.comments.empty" } as never,
        }}
      />,
    );

    expect(screen.getByText("No replies yet")).toBeTruthy();
    expect(richInputCapture.config?.placeholder).toEqual({
      from: "state.comments.placeholder",
    });
  });
});
