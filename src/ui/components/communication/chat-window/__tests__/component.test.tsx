// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { afterEach } from "vitest";
import { ChatWindow } from "../component";

const refValues: Record<string, unknown> = {
  "state.chat.title": "#general",
  "state.chat.subtitle": "Team chat",
  "state.chat.placeholder": "Reply to thread",
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

vi.mock("../../message-thread/component", () => ({
  MessageThread: () => <div data-testid="mock-message-thread">Thread</div>,
}));

vi.mock("../../../content/rich-input/component", () => ({
  RichInput: ({ config }: { config: Record<string, unknown> }) => {
    richInputCapture.config = config;
    return <div data-testid="mock-rich-input">Input</div>;
  },
}));

vi.mock("../../typing-indicator/component", () => ({
  TypingIndicator: () => <div data-testid="mock-typing-indicator">Typing</div>,
}));

afterEach(() => {
  cleanup();
  richInputCapture.config = null;
});

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

  it("passes ref-backed header copy and input placeholder through the composed config", () => {
    render(
      <ChatWindow
        config={{
          type: "chat-window",
          data: "GET /api/messages",
          title: { from: "state.chat.title" } as never,
          subtitle: { from: "state.chat.subtitle" } as never,
          inputPlaceholder: { from: "state.chat.placeholder" } as never,
        }}
      />,
    );

    expect(screen.getByTestId("chat-header").textContent).toContain("#general");
    expect(screen.getByTestId("chat-header").textContent).toContain("Team chat");
    expect(richInputCapture.config?.placeholder).toEqual({
      from: "state.chat.placeholder",
    });
  });
});
