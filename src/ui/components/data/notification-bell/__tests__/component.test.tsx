// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationBell } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="bell-icon">{name}</span>,
}));

describe("NotificationBell", () => {
  it("renders a capped unread badge and dispatches click actions", () => {
    executeSpy.mockReset();

    render(
      <NotificationBell
        config={{
          type: "notification-bell",
          className: "component-root",
          count: 120,
          max: 99,
          ariaLive: "polite",
          clickAction: { type: "open-notifications" } as never,
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="notification-bell"]');
    expect(root?.className).toContain("component-root");
    expect(root?.className).toContain("slot-root");
    expect(screen.getByTestId("notification-badge").textContent).toBe("99+");
    fireEvent.click(screen.getByTestId("notification-bell"));
    expect(executeSpy).toHaveBeenCalledWith({ type: "open-notifications" });
  });
});
