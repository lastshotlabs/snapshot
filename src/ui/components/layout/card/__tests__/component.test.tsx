// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "../component";

vi.mock("../../../../context", () => ({
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../../hooks/use-breakpoint", () => ({
  useResponsiveValue: (value: unknown) => value,
}));

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { type: string; id?: string } }) => (
    <div data-testid="card-child">{config.id ?? config.type}</div>
  ),
}));

describe("Card", () => {
  it("renders resolved heading content and child components", () => {
    const { container } = render(
      <Card
        config={{
          type: "card",
          title: "Account",
          subtitle: "Settings",
          className: "component-root",
          background: { image: "/hero.png", overlay: "rgba(0, 0, 0, 0.25)" },
          slots: {
            root: { className: "slot-root" },
            item: { className: "item-slot" },
          },
          children: [{ type: "text", id: "details" }],
        }}
      />,
    );

    expect(container.querySelector('[data-snapshot-id="card"]')?.className).toContain("component-root");
    expect(container.querySelector('[data-snapshot-id="card"]')?.className).toContain("slot-root");
    expect(container.querySelector('[data-snapshot-id="card-item"]')?.className).toContain("item-slot");
    expect(screen.getByText("Account")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByTestId("card-child").textContent).toContain("details");
  });
});
