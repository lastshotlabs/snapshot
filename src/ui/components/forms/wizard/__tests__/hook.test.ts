import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { useWizard } from "../hook";
import type { WizardConfig } from "../types";

function createWrapper() {
  const registry = new AtomRegistryImpl();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      AppRegistryContext.Provider,
      { value: null },
      React.createElement(
        PageRegistryContext.Provider,
        { value: registry },
        React.createElement(
          SnapshotApiContext.Provider,
          { value: null },
          children,
        ),
      ),
    );
  }

  return { Wrapper, registry };
}

function baseConfig(overrides: Partial<WizardConfig> = {}): WizardConfig {
  return {
    type: "wizard",
    steps: [
      {
        title: "Step 1",
        fields: [{ name: "email", type: "email", required: true }],
      },
      {
        title: "Step 2",
        fields: [{ name: "name", type: "text" }],
      },
    ],
    submitLabel: "Submit",
    allowSkip: false,
    ...overrides,
  };
}

describe("useWizard", () => {
  it("starts on step 0", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    expect(result.current.currentStep).toBe(0);
  });

  it("reports correct totalSteps", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    expect(result.current.totalSteps).toBe(2);
  });

  it("isFirstStep is true on step 0", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    expect(result.current.isFirstStep).toBe(true);
  });

  it("isLastStep is false on step 0 of 2", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    expect(result.current.isLastStep).toBe(false);
  });

  it("setStepValue updates stepValues", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.setStepValue("email", "test@example.com");
    });
    expect(result.current.stepValues["email"]).toBe("test@example.com");
  });

  it("nextStep returns false and sets errors when required field is empty", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    let success: boolean;
    act(() => {
      success = result.current.nextStep();
    });
    expect(success!).toBe(false);
    expect(result.current.stepErrors["email"]).toBeDefined();
  });

  it("nextStep returns true and advances step when validation passes", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.setStepValue("email", "valid@example.com");
    });
    let success: boolean;
    act(() => {
      success = result.current.nextStep();
    });
    expect(success!).toBe(true);
    // After animation duration, step should advance
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(result.current.currentStep).toBe(1);
  });

  it("prevStep does nothing on first step", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.prevStep();
    });
    expect(result.current.currentStep).toBe(0);
  });

  it("touchField marks field as touched", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.touchField("email");
    });
    expect(result.current.stepTouched["email"]).toBe(true);
  });

  it("skipStep advances when allowSkip is true", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useWizard(
          baseConfig({
            allowSkip: true,
            steps: [
              {
                title: "Optional",
                fields: [{ name: "bio", type: "textarea" }],
              },
              { title: "Final", fields: [] },
            ],
          }),
        ),
      { wrapper: Wrapper },
    );
    act(() => {
      result.current.skipStep();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(result.current.currentStep).toBe(1);
  });

  it("isComplete becomes true after final step submission", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useWizard(
          baseConfig({
            steps: [{ title: "Only Step", fields: [] }],
          }),
        ),
      { wrapper: Wrapper },
    );
    expect(result.current.isLastStep).toBe(true);
    act(() => {
      result.current.nextStep();
    });
    // Wait for async submission to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(result.current.isComplete).toBe(true);
  });

  it("accumulatedData merges values across steps", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWizard(baseConfig()), {
      wrapper: Wrapper,
    });
    act(() => {
      result.current.setStepValue("email", "user@example.com");
    });
    act(() => {
      result.current.nextStep();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(result.current.accumulatedData["email"]).toBe("user@example.com");
  });
});
