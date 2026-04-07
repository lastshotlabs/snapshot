/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { detailCardConfigSchema } from "../schema";

describe("detailCardConfigSchema", () => {
  const baseConfig = {
    type: "detail-card" as const,
    data: "GET /api/users/1",
  };

  it("accepts a minimal valid config", () => {
    const result = detailCardConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("accepts a config with all fields", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      id: "user-detail",
      title: "User Details",
      fields: [
        { field: "name", label: "Full Name" },
        { field: "email", format: "email", copyable: true },
        { field: "role", format: "badge" },
        { field: "createdAt", format: "date" },
      ],
      actions: [
        {
          label: "Edit",
          icon: "edit",
          action: { type: "open-modal", modal: "edit-user" },
        },
      ],
      emptyState: "No user selected",
      className: "my-card",
      visible: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts data as a FromRef", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      data: { from: "users-table.selected" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts title as a FromRef", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      title: { from: "users-table.selected.name" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts visible as a FromRef", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      visible: { from: "some-condition" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts fields: 'auto'", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      fields: "auto",
    });
    expect(result.success).toBe(true);
  });

  it("defaults fields to 'auto' when omitted", () => {
    const result = detailCardConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fields).toBe("auto");
    }
  });

  it("accepts an explicit field array", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      fields: [
        { field: "name" },
        { field: "email", format: "email", label: "E-mail", copyable: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts all format types", () => {
    const formats = [
      "text",
      "date",
      "datetime",
      "number",
      "currency",
      "badge",
      "boolean",
      "email",
      "url",
      "image",
      "link",
      "list",
    ] as const;
    for (const format of formats) {
      const result = detailCardConfigSchema.safeParse({
        ...baseConfig,
        fields: [{ field: "test", format }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts params with FromRef values", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      data: "GET /api/users/{id}",
      params: { id: { from: "users-table.selected.id" } },
    });
    expect(result.success).toBe(true);
  });

  it("accepts actions with action arrays", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      actions: [
        {
          label: "Delete",
          action: [
            { type: "confirm", message: "Are you sure?" },
            {
              type: "api",
              method: "DELETE",
              endpoint: "/api/users/1",
            },
            { type: "toast", message: "Deleted" },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      type: "not-detail-card",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing data", () => {
    const result = detailCardConfigSchema.safeParse({
      type: "detail-card",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid format type", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      fields: [{ field: "test", format: "invalid-format" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects field config without field key", () => {
    const result = detailCardConfigSchema.safeParse({
      ...baseConfig,
      fields: [{ label: "Missing Field Key" }],
    });
    expect(result.success).toBe(false);
  });
});
