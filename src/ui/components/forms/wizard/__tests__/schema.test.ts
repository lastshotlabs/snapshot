import { describe, it, expect } from "vitest";
import { wizardSchema } from "../schema";

describe("wizardSchema", () => {
  const baseStep = {
    title: "Step 1",
    fields: [{ name: "email", type: "email" as const }],
  };

  const baseConfig = {
    type: "wizard" as const,
    steps: [baseStep],
  };

  it("accepts a minimal valid config", () => {
    const result = wizardSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("applies default submitLabel = 'Submit'", () => {
    const result = wizardSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.submitLabel).toBe("Submit");
    }
  });

  it("applies default allowSkip = false", () => {
    const result = wizardSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allowSkip).toBe(false);
    }
  });

  it("accepts a full config", () => {
    const result = wizardSchema.safeParse({
      type: "wizard",
      id: "onboarding",
      steps: [
        {
          title: "Account",
          description: "Create your account",
          fields: [
            { name: "email", type: "email", required: true, label: "Email" },
            { name: "password", type: "password", required: true },
          ],
          submitLabel: "Continue",
        },
        {
          title: "Profile",
          fields: [{ name: "name", type: "text", label: "Full Name" }],
        },
      ],
      submitEndpoint: "POST /api/onboard",
      submitLabel: "Finish Setup",
      onComplete: { type: "toast", message: "Done!", variant: "success" },
      allowSkip: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a step with all field types", () => {
    const result = wizardSchema.safeParse({
      type: "wizard",
      steps: [
        {
          title: "Fields",
          fields: [
            { name: "text", type: "text" },
            { name: "email", type: "email" },
            { name: "password", type: "password" },
            { name: "number", type: "number" },
            { name: "textarea", type: "textarea" },
            {
              name: "select",
              type: "select",
              options: [{ label: "A", value: "a" }],
            },
            { name: "checkbox", type: "checkbox" },
            { name: "date", type: "date" },
            { name: "file", type: "file" },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing steps", () => {
    const result = wizardSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty steps array", () => {
    const result = wizardSchema.safeParse({ type: "wizard", steps: [] });
    expect(result.success).toBe(false);
  });

  it("rejects step missing title", () => {
    const result = wizardSchema.safeParse({
      type: "wizard",
      steps: [{ fields: [] }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts the extended auto-form field types", () => {
    const result = wizardSchema.safeParse({
      type: "wizard",
      steps: [
        {
          title: "Step",
          fields: [{ name: "x", type: "color" }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts onComplete as action schema", () => {
    const result = wizardSchema.safeParse({
      ...baseConfig,
      onComplete: { type: "navigate", to: "/dashboard" },
    });
    expect(result.success).toBe(true);
  });
});
