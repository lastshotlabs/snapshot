// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { Stepper } from "../component";

function createWrapper() {
  const registry = new AtomRegistryImpl();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          {children}
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  }

  return Wrapper;
}

describe("Stepper", () => {
  it("applies canonical slots and disabled step state", () => {
    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <Stepper
          config={{
            type: "stepper",
            id: "checkout-stepper",
            className: "stepper-root-class",
            clickable: true,
            steps: [
              {
                title: "Account",
                slots: {
                  label: { className: "step-label" },
                },
              },
              {
                title: "Billing",
                disabled: true,
                slots: {
                  item: { className: "disabled-step" },
                },
              },
            ],
            slots: {
              root: { className: "stepper-root" },
              connector: { className: "step-connector" },
            },
          }}
        />
      </Wrapper>,
    );

    expect(
      container.querySelector('[data-snapshot-id="checkout-stepper-root"]')
        ?.className,
    ).toContain("stepper-root-class");
    expect(
      container.querySelector('[data-snapshot-id="checkout-stepper-root"]')
        ?.className,
    ).toContain("stepper-root");
    expect(screen.getByText("Account").className).toContain("step-label");
    expect(
      container.querySelector('[data-snapshot-id="checkout-stepper-connector-0"]')
        ?.className,
    ).toContain("step-connector");
    expect(
      container.querySelector('[data-snapshot-id="checkout-stepper-item-1"]')
        ?.className,
    ).toContain("disabled-step");
    expect(
      container.querySelector('[data-snapshot-id="checkout-stepper-item-1"]')
        ?.getAttribute("aria-disabled"),
    ).toBe("true");
  });
});
