import { describe, it, expect } from "vitest";
// Register the component schemas needed by the preset under test.
import { registerComponentSchema } from "../../manifest/schema";
import { dataTableConfigSchema } from "../../components/data/data-table/schema";
import { autoFormConfigSchema } from "../../components/forms/auto-form/schema";
import { modalConfigSchema } from "../../components/overlay/modal/schema";
import { drawerConfigSchema } from "../../components/overlay/drawer/schema";
registerComponentSchema("data-table", dataTableConfigSchema);
registerComponentSchema("form", autoFormConfigSchema);
registerComponentSchema("modal", modalConfigSchema);
registerComponentSchema("drawer", drawerConfigSchema);
import { pageConfigSchema } from "../../manifest/schema";
import { crudPage } from "../crud-page";
import type { CrudPageOptions } from "../types";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const minimalOptions: CrudPageOptions = {
  title: "Users",
  listEndpoint: "GET /api/users",
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
  ],
};

const fullOptions: CrudPageOptions = {
  title: "Users",
  listEndpoint: "GET /api/users",
  createEndpoint: "POST /api/users",
  updateEndpoint: "PUT /api/users/{id}",
  deleteEndpoint: "DELETE /api/users/{id}",
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", badge: true },
    { key: "createdAt", label: "Created", format: "date" },
  ],
  createForm: {
    fields: [
      { key: "name", type: "text", label: "Name", required: true },
      { key: "email", type: "email", label: "Email", required: true },
      {
        key: "role",
        type: "select",
        label: "Role",
        options: [
          { label: "Admin", value: "admin" },
          { label: "User", value: "user" },
        ],
      },
    ],
  },
  updateForm: {
    fields: [
      { key: "name", type: "text", label: "Name", required: true },
      { key: "role", type: "select", label: "Role" },
    ],
  },
  filters: [
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [{ label: "Admin", value: "admin" }],
    },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("crudPage", () => {
  it("returns a valid PageConfig for minimal options", () => {
    const result = crudPage(minimalOptions);
    expect(() => pageConfigSchema.parse(result)).not.toThrow();
  });

  it("returns a valid PageConfig for full options", () => {
    const result = crudPage(fullOptions);
    expect(() => pageConfigSchema.parse(result)).not.toThrow();
  });

  it("sets the page title from options", () => {
    const result = crudPage(minimalOptions);
    expect(result.title).toBe("Users");
  });

  it("produces content with at least a heading and a data-table", () => {
    const result = crudPage(minimalOptions);
    const types = result.content.map(
      (c) => (c as Record<string, unknown>).type,
    );
    expect(types).toContain("data-table");
    expect(types).toContain("row"); // header row with heading
  });

  it("includes a data-table with the listEndpoint", () => {
    const result = crudPage(minimalOptions);
    const table = result.content.find(
      (c) => (c as Record<string, unknown>).type === "data-table",
    ) as Record<string, unknown> | undefined;
    expect(table).toBeDefined();
    expect(table?.data).toBe("GET /api/users");
  });

  it("maps columns correctly including badge format", () => {
    const result = crudPage(fullOptions);
    const table = result.content.find(
      (c) => (c as Record<string, unknown>).type === "data-table",
    ) as Record<string, unknown> | undefined;
    const columns = table?.columns as Record<string, unknown>[];
    const roleCol = columns.find((c) => c.field === "role");
    expect(roleCol?.format).toBe("badge");
  });

  it("maps date format columns correctly", () => {
    const result = crudPage(fullOptions);
    const table = result.content.find(
      (c) => (c as Record<string, unknown>).type === "data-table",
    ) as Record<string, unknown> | undefined;
    const columns = table?.columns as Record<string, unknown>[];
    const dateCol = columns.find((c) => c.field === "createdAt");
    expect(dateCol?.format).toBe("date");
  });

  it("includes a modal when createEndpoint and createForm are provided", () => {
    const result = crudPage(fullOptions);
    const modal = result.content.find(
      (c) => (c as Record<string, unknown>).type === "modal",
    );
    expect(modal).toBeDefined();
  });

  it("does not include a modal when createEndpoint is omitted", () => {
    const result = crudPage(minimalOptions);
    const modal = result.content.find(
      (c) => (c as Record<string, unknown>).type === "modal",
    );
    expect(modal).toBeUndefined();
  });

  it("includes a drawer when updateEndpoint and updateForm are provided", () => {
    const result = crudPage(fullOptions);
    const drawer = result.content.find(
      (c) => (c as Record<string, unknown>).type === "drawer",
    );
    expect(drawer).toBeDefined();
  });

  it("includes delete row action when deleteEndpoint is provided", () => {
    const result = crudPage(fullOptions);
    const table = result.content.find(
      (c) => (c as Record<string, unknown>).type === "data-table",
    ) as Record<string, unknown> | undefined;
    const actions = table?.actions as Record<string, unknown>[] | undefined;
    expect(actions?.some((a) => a.label === "Delete")).toBe(true);
  });

  it("uses custom id prefix when provided", () => {
    const result = crudPage({ ...minimalOptions, id: "my-users" });
    const table = result.content.find(
      (c) => (c as Record<string, unknown>).type === "data-table",
    ) as Record<string, unknown> | undefined;
    expect(table?.id).toBe("my-users-table");
  });

  it("defaults id to slugified title", () => {
    const result = crudPage({ ...minimalOptions, title: "Active Users" });
    const table = result.content.find(
      (c) => (c as Record<string, unknown>).type === "data-table",
    ) as Record<string, unknown> | undefined;
    expect(table?.id).toBe("active-users-table");
  });

  it("includes a New button in the header row when createEndpoint is set", () => {
    const result = crudPage(fullOptions);
    const headerRow = result.content[0] as Record<string, unknown>;
    const children = headerRow.children as Record<string, unknown>[];
    const button = children.find((c) => c.type === "button");
    expect(button).toBeDefined();
  });

  it("maps toggle type to checkbox for AutoForm compatibility", () => {
    const result = crudPage({
      ...fullOptions,
      createForm: {
        fields: [{ key: "active", type: "toggle", label: "Active" }],
      },
    });
    const modal = result.content.find(
      (c) => (c as Record<string, unknown>).type === "modal",
    ) as Record<string, unknown> | undefined;
    const formContent = (modal?.content as Record<string, unknown>[])?.[0];
    const fields = formContent?.fields as Record<string, unknown>[];
    expect(fields?.[0]?.type).toBe("checkbox");
  });
});
