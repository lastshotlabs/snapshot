// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { AccordionComponent } from "../component";
import { Provider } from "jotai/react";
import { createStore } from "jotai/vanilla";

const refValues: Record<string, unknown> = {
  "accordionState.title": "Resolved profile",
};

function resolveRefs<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(entry)) as T;
  }

  if (
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>) &&
    typeof (value as unknown as { from: unknown }).from === "string"
  ) {
    return refValues[(value as unknown as { from: string }).from] as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveRefs(entry),
      ]),
    ) as T;
  }

  return value;
}

vi.mock("../../../../context/hooks", async () => {
  const actual = await vi.importActual("../../../../context/hooks");

  return {
    ...actual,
    useResolveFrom: <T,>(value: T) => resolveRefs(value),
  };
});

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

  it("renders ref-backed item titles", () => {
    const store = createStore();

    render(
      <AccordionComponent
        config={{
          type: "accordion",
          items: [
            {
              title: { from: "accordionState.title" } as never,
              content: [],
            },
          ],
        }}
      />,
      { wrapper: createWrapper(store) },
    );

    expect(screen.getByText("Resolved profile")).toBeTruthy();
  });
});
