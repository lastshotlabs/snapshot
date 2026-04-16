// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { AccordionComponent } from "../component";
import { Provider } from "jotai/react";
import { createStore } from "jotai/vanilla";

function createWrapper(store: ReturnType<typeof createStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("AccordionComponent", () => {
  afterEach(() => {
    cleanup();
  });

  it("applies canonical accordion slots", () => {
    const store = createStore();
    const { container } = render(
      <AccordionComponent
        config={{
          type: "accordion",
          id: "settings-accordion",
          className: "accordion-root-config",
          items: [
            {
              title: "Profile",
              content: [],
              slots: {
                item: { className: "item-slot" },
                triggerLabel: { className: "label-slot" },
              },
            },
          ],
          slots: {
            root: { className: "root-slot" },
            content: { className: "content-slot" },
          },
        }}
      />,
      { wrapper: createWrapper(store) },
    );

    expect(
      container.querySelector('[data-snapshot-id="settings-accordion-root"]')
        ?.className,
    ).toContain("root-slot");
    expect(
      container.querySelector('[data-snapshot-id="settings-accordion-root"]')
        ?.className,
    ).toContain("accordion-root-config");
    expect(
      container.querySelector('[data-snapshot-id="settings-accordion-item-0"]')
        ?.className,
    ).toContain("item-slot");
    expect(screen.getByText("Profile").className).toContain("label-slot");
  });

  it("toggles accordion content", () => {
    const store = createStore();
    const { container } = render(
      <AccordionComponent
        config={{
          type: "accordion",
          items: [
            {
              title: "Profile",
              content: [],
            },
          ],
        }}
      />,
      { wrapper: createWrapper(store) },
    );

    const header = screen.getByRole("button", { name: "Profile" });
    fireEvent.click(header);
    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(
      container.querySelector('[data-snapshot-id="accordion-content-0"]'),
    ).not.toBeNull();
  });
});
