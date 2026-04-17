// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { autoFormConfigSchema, fieldConfigSchema } from "../schema";

describe("fieldConfigSchema", () => {
  it("accepts a minimal field config", () => {
    const result = fieldConfigSchema.safeParse({
      name: "email",
      type: "email",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full field config", () => {
    const result = fieldConfigSchema.safeParse({
      name: "username",
      type: "text",
      label: "Username",
      placeholder: "Enter username",
      required: true,
      validation: {
        minLength: 3,
        maxLength: 20,
        pattern: "^[a-z]+$",
        message: "Lowercase only",
      },
      default: "guest",
    });
    expect(result.success).toBe(true);
  });

  it("accepts select field with options", () => {
    const result = fieldConfigSchema.safeParse({
      name: "role",
      type: "select",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts multi-select field with divisor metadata", () => {
    const result = fieldConfigSchema.safeParse({
      name: "categoryIds",
      type: "multi-select",
      options: [
        { label: "Food", value: "food" },
        { label: "Bills", value: "bills" },
      ],
      divisor: 100,
    });
    expect(result.success).toBe(true);
  });

  it("accepts select field with string options (endpoint)", () => {
    const result = fieldConfigSchema.safeParse({
      name: "role",
      type: "select",
      options: "/api/roles",
      labelField: "displayName",
      valueField: "code",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown field type", () => {
    const result = fieldConfigSchema.safeParse({
      name: "x",
      type: "bogus",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = fieldConfigSchema.safeParse({ type: "text" });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties", () => {
    const result = fieldConfigSchema.safeParse({
      name: "x",
      type: "text",
      bogus: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid field types", () => {
    const types = [
      "text",
      "email",
      "password",
      "number",
      "textarea",
      "select",
      "multi-select",
      "checkbox",
      "date",
      "file",
      "time",
      "datetime",
      "radio-group",
      "switch",
      "slider",
      "color",
      "combobox",
      "tag-input",
    ] as const;
    for (const type of types) {
      const result = fieldConfigSchema.safeParse({ name: "f", type });
      expect(result.success).toBe(true);
    }
  });
});

describe("autoFormConfigSchema", () => {
  const baseConfig = {
    type: "form" as const,
    submit: "/api/users",
    fields: [{ name: "email", type: "email" as const }],
  };

  it("accepts a minimal config", () => {
    const result = autoFormConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("applies no defaults — optional fields are undefined when omitted", () => {
    const result = autoFormConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.method).toBeUndefined();
      expect(result.data.submitLabel).toBeUndefined();
      expect(result.data.resetOnSubmit).toBeUndefined();
    }
  });

  it("accepts fields: 'auto'", () => {
    const result = autoFormConfigSchema.safeParse({
      type: "form",
      submit: "/api/users",
      fields: "auto",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all method values", () => {
    for (const method of ["POST", "PUT", "PATCH"] as const) {
      const result = autoFormConfigSchema.safeParse({
        ...baseConfig,
        method,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid method", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      method: "DELETE",
    });
    expect(result.success).toBe(false);
  });

  it("accepts data as string", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      data: "GET /api/users/1",
    });
    expect(result.success).toBe(true);
  });

  it("accepts data as FromRef", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      data: { from: "user-detail" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts onSuccess as single action", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      onSuccess: { type: "toast", message: "Done!", variant: "success" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts onSuccess as array of actions", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      onSuccess: [
        { type: "toast", message: "Created!", variant: "success" },
        { type: "navigate", to: "/users" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts onError actions", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      onError: { type: "toast", message: "Failed!", variant: "error" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong type discriminator", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      type: "table",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing submit", () => {
    const result = autoFormConfigSchema.safeParse({
      type: "form",
      fields: [{ name: "x", type: "text" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects submit path placeholders without matching fields", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      submit: "/api/users/{id}",
      fields: [{ name: "email", type: "email" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      bogus: true,
    });
    expect(result.success).toBe(false);
  });

  it("accepts full config with all optional fields", () => {
    const result = autoFormConfigSchema.safeParse({
      type: "form",
      id: "create-user-form",
      data: "GET /api/users/1",
      submit: "/api/users",
      method: "PUT",
      fields: [
        {
          name: "email",
          type: "email",
          label: "Email Address",
          required: true,
          validation: { pattern: "^.+@.+$", message: "Invalid email" },
        },
        {
          name: "role",
          type: "select",
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        },
      ],
      submitLabel: "Update User",
      resetOnSubmit: false,
      onSuccess: { type: "toast", message: "Updated!", variant: "success" },
      onError: { type: "toast", message: "Error!", variant: "error" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts canonical form and field slots", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      fields: [],
      sections: [
        {
          title: "Profile",
          description: "Manage your account",
          slots: {
            section: { className: "section-slot" },
            sectionHeader: { className: "section-header-slot" },
            sectionToggle: { className: "section-toggle-slot" },
            sectionTitle: { className: "section-title-slot" },
            sectionDescription: { className: "section-description-slot" },
          },
          fields: [
            {
              name: "password",
              type: "password",
              slots: {
                field: { className: "field-slot" },
                inputWrapper: { className: "input-wrapper-slot" },
                input: { className: "input-slot" },
                options: { className: "options-slot" },
                option: { className: "option-slot" },
                optionLabel: { className: "option-label-slot" },
                inlineAction: { className: "inline-action-slot" },
                passwordToggle: { className: "password-toggle-slot" },
              },
            },
          ],
        },
      ],
      slots: {
        root: { className: "form-root" },
        sectionHeader: { className: "section-header" },
        inlineAction: { className: "inline-action" },
        passwordToggle: { className: "password-toggle" },
        submitButton: { className: "submit-slot" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed field, section, and submit copy", () => {
    const result = autoFormConfigSchema.safeParse({
      ...baseConfig,
      fields: [],
      submitLabel: { from: "copy.form.submitLabel" },
      submitLoadingLabel: { from: "copy.form.submitLoadingLabel" },
      sections: [
        {
          title: { from: "copy.form.sectionTitle" },
          description: { from: "copy.form.sectionDescription" },
          fields: [
            {
              name: "email",
              type: "email",
              label: { from: "copy.form.fieldLabel" },
              placeholder: { from: "copy.form.placeholder" },
              helperText: { from: "copy.form.helperText" },
              description: { from: "copy.form.description" },
              options: [
                {
                  label: { from: "copy.form.optionLabel" },
                  value: "work",
                },
              ],
              inlineAction: {
                label: { from: "copy.form.inlineActionLabel" },
                to: "/support",
              },
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
