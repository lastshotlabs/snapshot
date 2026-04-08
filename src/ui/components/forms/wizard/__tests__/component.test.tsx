// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { Wizard } from "../component";
import type { WizardConfig } from "../types";

function createWrapper() {
  const registry = new AtomRegistryImpl();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  }

  return { Wrapper, registry };
}

function baseConfig(overrides: Partial<WizardConfig> = {}): WizardConfig {
  return {
    type: "wizard",
    steps: [
      {
        title: "Account Details",
        fields: [
          { name: "email", type: "email", label: "Email", required: true },
        ],
      },
      {
        title: "Profile",
        fields: [{ name: "name", type: "text", label: "Full Name" }],
      },
    ],
    submitLabel: "Submit",
    allowSkip: false,
    ...overrides,
  };
}

describe("Wizard component", () => {
  it("renders with data-snapshot-component attribute", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    expect(
      container.querySelector('[data-snapshot-component="wizard"]'),
    ).not.toBeNull();
  });

  it("renders the first step title", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    const heading = container.querySelector("[data-wizard-step-title]");
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toBe("Account Details");
  });

  it("renders step fields", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
  });

  it("renders Back button (disabled on first step)", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    const backBtn = screen.getByText("Back");
    expect(backBtn).toBeDefined();
    expect((backBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders Next button on first step", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    expect(screen.getByText("Next")).toBeDefined();
  });

  it("shows validation error when required field is empty on next", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    // Click Next without filling email
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText(/required/i)).toBeDefined();
  });

  it("advances to next step when validation passes", async () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    // Fill email
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Next"));
    // Wait for animation transition
    await new Promise((r) => setTimeout(r, 300));
    // Should now see step 2 title in heading
    const heading = container.querySelector("[data-wizard-step-title]");
    expect(heading?.textContent).toBe("Profile");
  });

  it("shows Back button enabled on second step", async () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Next"));
    await new Promise((r) => setTimeout(r, 300));
    const backBtn = screen.getByText("Back");
    expect((backBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it("goes back to previous step on Back click", async () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Next"));
    await new Promise((r) => setTimeout(r, 300));
    // Now on step 2 - click back
    fireEvent.click(screen.getByText("Back"));
    await new Promise((r) => setTimeout(r, 300));
    // Back on step 1
    const heading = container.querySelector("[data-wizard-step-title]");
    expect(heading?.textContent).toBe("Account Details");
  });

  it("renders Submit label on final step", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard
          config={baseConfig({
            steps: [
              {
                title: "Only Step",
                fields: [],
              },
            ],
            submitLabel: "Finish",
          })}
        />
      </Wrapper>,
    );
    expect(screen.getByText("Finish")).toBeDefined();
  });

  it("renders step description when provided", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard
          config={baseConfig({
            steps: [
              {
                title: "Step with desc",
                description: "Fill in your details",
                fields: [],
              },
            ],
          })}
        />
      </Wrapper>,
    );
    expect(screen.getByText("Fill in your details")).toBeDefined();
  });

  it("shows Skip button when allowSkip is true and step has no required fields", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Wizard
          config={baseConfig({
            allowSkip: true,
            steps: [
              {
                title: "Optional Step",
                fields: [{ name: "bio", type: "textarea" }],
              },
              { title: "Final", fields: [] },
            ],
          })}
        />
      </Wrapper>,
    );
    expect(screen.getByText("Skip")).toBeDefined();
  });

  it("publishes to context when id is set and step is completed", () => {
    const { Wrapper, registry } = createWrapper();
    const publishAtom = registry.register("my-wizard");
    render(
      <Wrapper>
        <Wizard
          config={baseConfig({
            id: "my-wizard",
            steps: [
              {
                title: "Step 1",
                fields: [{ name: "email", type: "email", required: true }],
              },
            ],
            submitLabel: "Submit",
          })}
        />
      </Wrapper>,
    );
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByText("Submit"));
    // After submit on last step, published data should contain email
    const published = registry.store.get(publishAtom) as Record<
      string,
      unknown
    >;
    expect(published).toBeDefined();
    expect(published["email"]).toBe("user@example.com");
  });

  it("renders progress indicators for each step", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Wizard config={baseConfig()} />
      </Wrapper>,
    );
    const indicators = container.querySelectorAll(
      "[data-wizard-step-indicator]",
    );
    expect(indicators.length).toBe(2);
  });
});
