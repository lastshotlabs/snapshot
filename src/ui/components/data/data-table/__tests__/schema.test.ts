/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { dataTableConfigSchema } from "../schema";

describe("dataTableConfigSchema", () => {
  const baseConfig = {
    type: "data-table" as const,
    data: "GET /api/users",
    columns: "auto" as const,
  };

  it("accepts a minimal valid config", () => {
    const result = dataTableConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("accepts a full config with all options", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      id: "users-table",
      columns: [
        {
          field: "name",
          label: "Full Name",
          sortable: true,
          width: "200px",
          align: "left",
        },
        {
          field: "status",
          format: "badge",
          badgeColors: { active: "success", inactive: "muted" },
          filter: { type: "select", options: "auto" },
        },
        { field: "amount", format: "currency", align: "right" },
        { field: "active", format: "boolean", align: "center" },
        { field: "createdAt", format: "date" },
        { field: "count", format: "number" },
      ],
      pagination: { type: "offset", pageSize: 20 },
      selectable: true,
      searchable: { placeholder: "Find users...", fields: ["name", "email"] },
      actions: [
        {
          label: "Edit",
          icon: "pencil",
          action: { type: "navigate", to: "/users/{id}" },
        },
        {
          label: "Delete",
          action: [
            { type: "confirm", message: "Delete {name}?" },
            {
              type: "api",
              method: "DELETE",
              endpoint: "/api/users/{id}",
            },
          ],
          visible: false,
        },
      ],
      bulkActions: [
        {
          label: "Delete {count} items",
          action: {
            type: "api",
            method: "POST",
            endpoint: "/api/users/bulk-delete",
          },
        },
      ],
      emptyMessage: "No users found",
      density: "compact",
      visible: true,
      className: "my-table",
      span: 12,
    });
    expect(result.success).toBe(true);
  });

  it("accepts data as a FromRef", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      data: { from: "my-source" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts params with FromRef values", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      params: {
        userId: { from: "user-select.value" },
        status: "active",
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts visible as a FromRef", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      visible: { from: "global.showTable" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts pagination: false to disable pagination", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      pagination: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts searchable: true as a boolean", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      searchable: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts searchable as an object config", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      searchable: { placeholder: "Search...", fields: ["name"] },
    });
    expect(result.success).toBe(true);
  });

  it("accepts filter with explicit options", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      columns: [
        {
          field: "status",
          filter: {
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts all density values", () => {
    for (const density of ["compact", "default", "comfortable"]) {
      const result = dataTableConfigSchema.safeParse({
        ...baseConfig,
        density,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all format values", () => {
    for (const format of ["date", "number", "currency", "badge", "boolean"]) {
      const result = dataTableConfigSchema.safeParse({
        ...baseConfig,
        columns: [{ field: "test", format }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all align values", () => {
    for (const align of ["left", "center", "right"]) {
      const result = dataTableConfigSchema.safeParse({
        ...baseConfig,
        columns: [{ field: "test", align }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts row action with visible as FromRef", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      actions: [
        {
          label: "Admin Only",
          action: { type: "navigate", to: "/admin" },
          visible: { from: "global.isAdmin" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts canonical table slots", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      slots: {
        root: { className: "table-root" },
        headerCell: { className: "header-cell" },
        pagination: { className: "pagination-slot" },
      },
      actions: [
        {
          label: "Edit",
          action: { type: "navigate", to: "/users/{id}" },
          slots: {
            item: { className: "row-action-slot" },
          },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed labels and placeholder copy", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      columns: [{ field: "name", label: { from: "state.table.header" } }],
      searchable: { placeholder: { from: "state.table.search" } },
      actions: [
        {
          label: { from: "state.table.action" },
          action: { type: "navigate", to: "/users/{id}" },
        },
      ],
      bulkActions: [
        {
          label: { from: "state.table.bulk" },
          action: { type: "api", method: "POST", endpoint: "/api/users/bulk" },
        },
      ],
      toolbar: [
        {
          label: { from: "state.table.toolbar" },
          action: { type: "navigate", to: "/users" },
        },
      ],
      emptyMessage: { from: "state.table.empty" },
    });

    expect(result.success).toBe(true);
  });

  // ── Invalid config tests ──────────────────────────────────────────────────

  it("rejects missing type", () => {
    const result = dataTableConfigSchema.safeParse({
      data: "GET /api/users",
      columns: "auto",
    });
    expect(result.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const result = dataTableConfigSchema.safeParse({
      type: "stat-card",
      data: "GET /api/users",
      columns: "auto",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing data", () => {
    const result = dataTableConfigSchema.safeParse({
      type: "data-table",
      columns: "auto",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing columns", () => {
    const result = dataTableConfigSchema.safeParse({
      type: "data-table",
      data: "GET /api/users",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid column format", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      columns: [{ field: "test", format: "html" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid density", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      density: "spacious",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pagination type", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      pagination: { type: "keyset" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid filter type", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      columns: [{ field: "test", filter: { type: "range" } }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid span value", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      span: 15,
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown properties via strict", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      unknownProp: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects column with unknown properties via strict", () => {
    const result = dataTableConfigSchema.safeParse({
      ...baseConfig,
      columns: [{ field: "test", unknownProp: true }],
    });
    expect(result.success).toBe(false);
  });
});
