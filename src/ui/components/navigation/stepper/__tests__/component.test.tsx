// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { Stepper } from "../component";

const refValues: Record<string, unknown> = {
  "stepperState.title": "Resolved account",
  "stepperState.description": "Resolved description",
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

afterEach(() => {
  cleanup();
});

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

  it("renders ref-backed step copy", () => {
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <Stepper
          config={{
            type: "stepper",
            steps: [
              {
                title: { from: "stepperState.title" } as never,
                description: { from: "stepperState.description" } as never,
              },
            ],
          }}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Resolved account")).toBeTruthy();
    expect(screen.getByText("Resolved description")).toBeTruthy();
  });
});
