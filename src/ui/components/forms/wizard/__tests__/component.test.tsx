// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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

async function waitForWizardTransition() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 300));
  });
}

describe("Wizard component", () => {
  afterEach(() => {
    cleanup();
  });

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
    await waitForWizardTransition();
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
    await waitForWizardTransition();
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
    await waitForWizardTransition();
    // Now on step 2 - click back
    fireEvent.click(screen.getByText("Back"));
    await waitForWizardTransition();
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

  it("resets to the first step from the completed state", async () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
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

    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => expect(screen.getByText("Reset")).toBeDefined());

    fireEvent.click(screen.getByText("Reset"));

    const heading = container.querySelector("[data-wizard-step-title]");
    expect(heading?.textContent).toBe("Only Step");
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
    expect(screen.getAllByText("Fill in your details").length).toBeGreaterThan(
      0,
    );
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

  it("applies canonical wizard group and field primitive slots", async () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Wizard
          config={baseConfig({
            id: "profile-wizard",
            steps: [
              {
                title: "Account Details",
                description: "Set up your account",
                slots: {
                  step: { className: "wizard-step-slot" },
                  stepBody: { className: "wizard-step-body-slot" },
                  header: { className: "wizard-header-slot" },
                  title: { className: "wizard-title-slot" },
                  description: { className: "wizard-description-slot" },
                },
                fields: [
                  {
                    name: "email",
                    type: "email",
                    label: "Email",
                    slots: {
                      field: { className: "wizard-field-slot" },
                      input: { className: "wizard-input-slot" },
                    },
                  },
                ],
              },
            ],
            submitLabel: "Finish",
            slots: {
              root: { className: "wizard-root-slot" },
              progress: { className: "wizard-progress-slot" },
              actionGroup: { className: "wizard-action-group-slot" },
              completionState: { className: "wizard-completion-slot" },
              completionTitle: { className: "wizard-completion-title-slot" },
              completionDescription: {
                className: "wizard-completion-description-slot",
              },
              submitButton: { className: "wizard-submit-slot" },
            },
          })}
        />
      </Wrapper>,
    );

    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-root"]')
        ?.className,
    ).toContain("wizard-root-slot");
    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-progress"]')
        ?.className,
    ).toContain("wizard-progress-slot");
    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-step-0"]')
        ?.className,
    ).toContain("wizard-step-slot");
    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-stepBody-0"]')
        ?.className,
    ).toContain("wizard-step-body-slot");
    expect(
      container.querySelector(
        '[data-snapshot-id="profile-wizard-field-0-email"]',
      )?.className,
    ).toContain("wizard-field-slot");
    expect(screen.getByLabelText("Email").className).toContain(
      "wizard-input-slot",
    );
    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-header"]')
        ?.className,
    ).toContain("wizard-header-slot");
    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-title"]')
        ?.className,
    ).toContain("wizard-title-slot");
    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-description"]')
        ?.className,
    ).toContain("wizard-description-slot");
    expect(
      container.querySelector('[data-snapshot-id="profile-wizard-actionGroup"]')
        ?.className,
    ).toContain("wizard-action-group-slot");
    expect(screen.getByText("Finish").className).toContain(
      "wizard-submit-slot",
    );

    fireEvent.click(screen.getByText("Finish"));
    await waitFor(() => expect(screen.getByText("Reset")).toBeDefined());

    expect(
      container.querySelector(
        '[data-snapshot-id="profile-wizard-completionState"]',
      )?.className,
    ).toContain("wizard-completion-slot");
    expect(
      container.querySelector(
        '[data-snapshot-id="profile-wizard-completionTitle"]',
      )?.className,
    ).toContain("wizard-completion-title-slot");
    expect(
      container.querySelector(
        '[data-snapshot-id="profile-wizard-completionDescription"]',
      )?.className,
    ).toContain("wizard-completion-description-slot");
    expect(screen.getByText("Reset").className).toContain("wizard-submit-slot");
  });
});
