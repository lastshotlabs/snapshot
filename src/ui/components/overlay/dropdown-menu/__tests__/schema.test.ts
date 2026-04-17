import { describe, it, expect } from "vitest";
import { dropdownMenuConfigSchema } from "../schema";

const baseConfig = {
  type: "dropdown-menu" as const,
  trigger: { label: "Actions" },
  items: [
    {
      type: "item" as const,
      label: "Edit",
      action: { type: "navigate" as const, to: "/edit" },
    },
  ],
};

describe("dropdownMenuConfigSchema", () => {
  it("accepts a minimal valid config", () => {
    const result = dropdownMenuConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("accepts a fully-specified config", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      id: "actions-menu",
      className: "custom-class",
      trigger: { label: "Options", icon: "⚙", variant: "outline" },
      items: [
        { type: "label", text: "Group A" },
        {
          type: "item",
          label: "Edit",
          icon: "✏",
          action: { type: "navigate", to: "/edit" },
          disabled: false,
          destructive: false,
        },
        { type: "separator" },
        {
          type: "item",
          label: "Delete",
          destructive: true,
          action: {
            type: "api",
            method: "DELETE",
            endpoint: "/items/1",
          },
        },
      ],
      align: "end",
      side: "top",
    });
    expect(result.success).toBe(true);
  });

  it("accepts trigger with icon only (no label)", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      trigger: { icon: "⋮" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts all trigger variants", () => {
    for (const variant of ["default", "secondary", "outline", "ghost"]) {
      const result = dropdownMenuConfigSchema.safeParse({
        ...baseConfig,
        trigger: { label: "Test", variant },
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts separator items", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      items: [
        {
          type: "item",
          label: "A",
          action: { type: "navigate", to: "/a" },
        },
        { type: "separator" },
        {
          type: "item",
          label: "B",
          action: { type: "navigate", to: "/b" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts label items", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      items: [
        { type: "label", text: "Section" },
        {
          type: "item",
          label: "Option",
          action: { type: "navigate", to: "/" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts ref-backed trigger and item copy", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      type: "dropdown-menu",
      trigger: { label: { from: "menuState.trigger" } },
      items: [
        { type: "label", text: { from: "menuState.section" } },
        {
          type: "item",
          label: { from: "menuState.option" },
          action: { type: "navigate", to: "/" },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing type", () => {
    const { type: _, ...noType } = baseConfig;
    const result = dropdownMenuConfigSchema.safeParse(noType);
    expect(result.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      type: "modal",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing trigger", () => {
    const { trigger: _, ...noTrigger } = baseConfig;
    const result = dropdownMenuConfigSchema.safeParse(noTrigger);
    expect(result.success).toBe(false);
  });

  it("rejects missing items", () => {
    const { items: _, ...noItems } = baseConfig;
    const result = dropdownMenuConfigSchema.safeParse(noItems);
    expect(result.success).toBe(false);
  });

  it("rejects invalid trigger variant", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      trigger: { label: "Test", variant: "danger" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid align value", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      align: "left",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid side value", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      side: "left",
    });
    expect(result.success).toBe(false);
  });

  it("rejects item without action", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      items: [{ type: "item", label: "No action" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties (strict mode)", () => {
    const result = dropdownMenuConfigSchema.safeParse({
      ...baseConfig,
      unknownProp: "foo",
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults — optional fields are undefined", () => {
    const result = dropdownMenuConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.align).toBeUndefined();
      expect(result.data.side).toBeUndefined();
      expect(result.data.id).toBeUndefined();
      expect(result.data.className).toBeUndefined();
    }
  });
});
