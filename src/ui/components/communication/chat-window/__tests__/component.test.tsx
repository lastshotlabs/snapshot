// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatWindow } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../message-thread/component", () => ({
  MessageThread: () => <div data-testid="mock-message-thread">Thread</div>,
}));

vi.mock("../../../content/rich-input/component", () => ({
  RichInput: () => <div data-testid="mock-rich-input">Input</div>,
}));

vi.mock("../../typing-indicator/component", () => ({
  TypingIndicator: () => <div data-testid="mock-typing-indicator">Typing</div>,
}));

describe("ChatWindow", () => {
  it("renders header and composed child surfaces", () => {
    render(
      <ChatWindow
        config={{
          type: "chat-window",
          id: "team-chat",
          className: "chat-root",
          data: "GET /api/messages",
          title: "#general",
          subtitle: "Team chat",
          sendAction: {
            type: "event",
            name: "send-message",
          } as never,
        }}
      />,
    );

    expect(screen.getByTestId("chat-window")).toBeTruthy();
    expect(
      document
        .querySelector('[data-snapshot-id="team-chat"]')
        ?.classList.contains("chat-root"),
    ).toBe(true);
    expect(screen.getByTestId("chat-header").textContent).toContain("#general");
    expect(screen.getByTestId("chat-header").textContent).toContain("Team chat");
    expect(screen.getByTestId("mock-message-thread").textContent).toBe("Thread");
    expect(screen.getByTestId("mock-rich-input").textContent).toBe("Input");
    expect(screen.getByTestId("mock-typing-indicator").textContent).toBe(
      "Typing",
    );
  });
});
