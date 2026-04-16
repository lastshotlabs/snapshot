// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Carousel } from "../component";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { label?: string } }) => (
    <div>{config.label ?? "Slide"}</div>
  ),
}));

describe("Carousel", () => {
  it("applies root and current-slide slot styling", () => {
    render(
      <Carousel
        config={{
          type: "carousel",
          id: "carousel-demo",
          className: "component-root",
          children: [
            { type: "button", label: "Slide 1" } as never,
            { type: "button", label: "Slide 2" } as never,
          ],
          slots: {
            root: {
              className: "carousel-root-slot",
            },
            slide: {
              states: {
                current: {
                  className: "carousel-current-slide",
                },
              },
            },
            indicatorItem: {
              states: {
                current: {
                  className: "carousel-current-indicator",
                },
              },
            },
          },
        }}
      />,
    );

    expect(
      document
        .querySelector('[data-snapshot-id="carousel-demo-root"]')
        ?.className.includes("carousel-root-slot"),
    ).toBe(true);
    expect(
      document
        .querySelector('[data-snapshot-id="carousel-demo-root"]')
        ?.className.includes("component-root"),
    ).toBe(true);
    expect(
      document
        .querySelector('[data-snapshot-id="carousel-demo-slide-0"]')
        ?.className.includes("carousel-current-slide"),
    ).toBe(true);
    expect(
      document.querySelector(
        '[data-snapshot-id="carousel-demo-indicator-item-0"]',
      )?.className.includes("carousel-current-indicator"),
    ).toBe(true);

    fireEvent.click(screen.getByLabelText("Next slide"));

    expect(
      document
        .querySelector('[data-snapshot-id="carousel-demo-slide-1"]')
        ?.className.includes("carousel-current-slide"),
    ).toBe(true);
    expect(
      document.querySelector(
        '[data-snapshot-id="carousel-demo-indicator-item-1"]',
      )?.className.includes("carousel-current-indicator"),
    ).toBe(true);
  });
});
