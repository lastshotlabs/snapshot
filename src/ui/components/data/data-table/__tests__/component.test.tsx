/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { afterEach } from "vitest";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { ManifestRuntimeContext } from "../../../../manifest/runtime";
import { DataTable } from "../component";
import type { DataTableConfig } from "../types";
import type { ApiClient } from "../../../../../api/client";

afterEach(() => {
  cleanup();
});

const testData = [
  { id: 1, name: "Alice", email: "alice@example.com", status: "active" },
  { id: 2, name: "Bob", email: "bob@example.com", status: "inactive" },
  { id: 3, name: "Charlie", email: "charlie@example.com", status: "active" },
];

function createWrapper(data: unknown[] = testData) {
  const registry = new AtomRegistryImpl();
  const sourceAtom = registry.register("test-source");
  registry.store.set(sourceAtom, data);

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

function createApiWrapper(api: Pick<ApiClient, "get" | "post" | "put" | "patch" | "delete">) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ManifestRuntimeContext.Provider
        value={
          {
            raw: {},
            resources: {
              accounts: { endpoint: "/api/accounts" },
            },
          } as never
        }
      >
        <AppRegistryContext.Provider value={null}>
          <PageRegistryContext.Provider value={new AtomRegistryImpl()}>
            <SnapshotApiContext.Provider value={api as unknown as ApiClient}>
              {children}
            </SnapshotApiContext.Provider>
          </PageRegistryContext.Provider>
        </AppRegistryContext.Provider>
      </ManifestRuntimeContext.Provider>
    );
  }

  return { Wrapper };
}

function baseConfig(overrides: Partial<DataTableConfig> = {}): DataTableConfig {
  return {
    type: "data-table",
    data: { from: "test-source" },
    columns: "auto",
    ...overrides,
  };
}

describe("DataTable component", () => {
  it("renders with data-snapshot-component attribute", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <DataTable config={baseConfig()} />
      </Wrapper>,
    );

    const el = container.querySelector(
      '[data-snapshot-component="data-table"]',
    );
    expect(el).not.toBeNull();
  });

  it("renders table headers from auto-detected columns", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable config={baseConfig()} />
      </Wrapper>,
    );

    expect(screen.getByText("Id")).toBeDefined();
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();
  });

  it("renders table headers from explicit columns", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            columns: [
              { field: "name", label: "Full Name" },
              { field: "email" },
            ],
          })}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Full Name")).toBeDefined();
    expect(screen.getByText("Email")).toBeDefined();
  });

  it("renders data rows", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable config={baseConfig()} />
      </Wrapper>,
    );

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("Charlie")).toBeDefined();
  });

  it("renders rows from an endpoint items envelope", async () => {
    const api = {
      get: vi.fn().mockResolvedValue({ items: testData, hasMore: true }),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    const { Wrapper } = createApiWrapper(api as Pick<ApiClient, "get" | "post" | "put" | "patch" | "delete">);

    render(
      <Wrapper>
        <DataTable
          config={{
            ...baseConfig(),
            data: "GET /api/users",
          }}
        />
      </Wrapper>,
    );

    expect(await screen.findByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders lookup labels instead of raw foreign keys", async () => {
    const registry = new AtomRegistryImpl();
    const sourceAtom = registry.register("test-source");
    registry.store.set(sourceAtom, [{ id: 1, accountId: "acc-1" }]);
    const api = {
      get: vi.fn().mockImplementation(async (url: string) => {
        if (url === "/api/accounts") {
          return { items: [{ id: "acc-1", name: "Checking" }] };
        }
        return [];
      }),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <ManifestRuntimeContext.Provider
          value={
            {
              raw: {},
              resources: {
                accounts: { endpoint: "/api/accounts" },
              },
            } as never
          }
        >
          <AppRegistryContext.Provider value={null}>
            <PageRegistryContext.Provider value={registry}>
              <SnapshotApiContext.Provider value={api as unknown as ApiClient}>
                {children}
              </SnapshotApiContext.Provider>
            </PageRegistryContext.Provider>
          </AppRegistryContext.Provider>
        </ManifestRuntimeContext.Provider>
      );
    }

    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            columns: [
              {
                field: "accountId",
                label: "Account",
                lookup: { resource: "accounts", labelField: "name" },
              },
            ],
          })}
        />
      </Wrapper>,
    );

    expect(await screen.findByText("Checking")).toBeDefined();
    expect(screen.queryByText("acc-1")).toBeNull();
  });

  it("renders lookup labels for object-backed foreign keys", async () => {
    const registry = new AtomRegistryImpl();
    const sourceAtom = registry.register("test-source");
    registry.store.set(sourceAtom, [{ id: 1, category: { _id: "cat-1" } }]);
    const api = {
      get: vi.fn().mockImplementation(async (url: string) => {
        if (url === "/api/categories") {
          return { items: [{ id: "cat-1", name: "Utilities" }] };
        }
        return [];
      }),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <ManifestRuntimeContext.Provider
          value={
            {
              raw: {},
              resources: {
                categories: { endpoint: "/api/categories" },
              },
            } as never
          }
        >
          <AppRegistryContext.Provider value={null}>
            <PageRegistryContext.Provider value={registry}>
              <SnapshotApiContext.Provider value={api as unknown as ApiClient}>
                {children}
              </SnapshotApiContext.Provider>
            </PageRegistryContext.Provider>
          </AppRegistryContext.Provider>
        </ManifestRuntimeContext.Provider>
      );
    }

    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            columns: [
              {
                field: "category",
                label: "Category",
                lookup: { resource: "categories", labelField: "name" },
              },
            ],
          })}
        />
      </Wrapper>,
    );

    expect(await screen.findByText("Utilities")).toBeDefined();
    expect(screen.queryByText("cat-1")).toBeNull();
  });

  it("renders empty message when no data", () => {
    const { Wrapper } = createWrapper([]);
    render(
      <Wrapper>
        <DataTable config={baseConfig({ emptyMessage: "Nothing here" })} />
      </Wrapper>,
    );

    expect(screen.getByText("Nothing here")).toBeDefined();
  });

  it("renders default empty message when no data and no custom message", () => {
    const { Wrapper } = createWrapper([]);
    render(
      <Wrapper>
        <DataTable config={baseConfig()} />
      </Wrapper>,
    );

    expect(screen.getByText("No data available")).toBeDefined();
  });

  it("renders search input when searchable", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable config={baseConfig({ searchable: true })} />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeDefined();
  });

  it("renders custom search placeholder", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            searchable: { placeholder: "Find users..." },
          })}
        />
      </Wrapper>,
    );

    expect(screen.getByPlaceholderText("Find users...")).toBeDefined();
  });

  it("filters rows when searching", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable config={baseConfig({ searchable: true })} />
      </Wrapper>,
    );

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "alice" } });

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.queryByText("Bob")).toBeNull();
  });

  it("renders selection checkboxes when selectable", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable config={baseConfig({ selectable: true })} />
      </Wrapper>,
    );

    // Select all checkbox + 3 row checkboxes = 4
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(4);
  });

  it("toggles row selection on checkbox click", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable config={baseConfig({ selectable: true })} />
      </Wrapper>,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    // Click the first row checkbox (index 1, index 0 is select-all)
    fireEvent.click(checkboxes[1]!);

    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
  });

  it("sorts by column on header click", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            columns: [{ field: "name", sortable: true }, { field: "email" }],
          })}
        />
      </Wrapper>,
    );

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    // Should show ascending indicator
    const sortIndicator =
      nameHeader.parentElement?.querySelector("[aria-label]");
    expect(sortIndicator?.getAttribute("aria-label")).toBe("sorted ascending");
  });

  it("renders row action buttons", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            actions: [
              {
                label: "Edit",
                action: { type: "navigate", to: "/users/{id}" },
              },
            ],
          })}
        />
      </Wrapper>,
    );

    const editButtons = screen.getAllByText("Edit");
    // One per row + the header "Actions"
    expect(editButtons.length).toBe(3);
  });

  it("hides row actions with visible: false", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            actions: [
              {
                label: "Hidden Action",
                action: { type: "navigate", to: "/test" },
                visible: false,
              },
            ],
          })}
        />
      </Wrapper>,
    );

    expect(screen.queryByText("Hidden Action")).toBeNull();
  });

  it("shows bulk actions toolbar when rows are selected", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            selectable: true,
            bulkActions: [
              {
                label: "Delete {count} items",
                action: {
                  type: "api",
                  method: "DELETE",
                  endpoint: "/api/users/bulk",
                },
              },
            ],
          })}
        />
      </Wrapper>,
    );

    // No bulk toolbar initially
    expect(screen.queryByRole("toolbar")).toBeNull();

    // Select a row
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]!);

    // Bulk toolbar should appear with interpolated label
    expect(screen.getByRole("toolbar")).toBeDefined();
    expect(screen.getByText("Delete 1 items")).toBeDefined();
  });

  it("renders pagination controls for many rows", () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
    }));
    const { Wrapper } = createWrapper(manyRows);
    render(
      <Wrapper>
        <DataTable config={baseConfig()} />
      </Wrapper>,
    );

    expect(screen.getByText("Page 1 of 3")).toBeDefined();
    expect(screen.getByText("Previous")).toBeDefined();
    expect(screen.getByText("Next")).toBeDefined();
  });

  it("navigates pages via pagination buttons", () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
    }));
    const { Wrapper } = createWrapper(manyRows);
    render(
      <Wrapper>
        <DataTable config={baseConfig()} />
      </Wrapper>,
    );

    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Page 2 of 3")).toBeDefined();

    fireEvent.click(screen.getByText("Previous"));
    expect(screen.getByText("Page 1 of 3")).toBeDefined();
  });

  it("applies className from config", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <DataTable config={baseConfig({ className: "custom-class" })} />
      </Wrapper>,
    );

    const el = container.querySelector(".custom-class");
    expect(el).not.toBeNull();
  });

  it("does not render pagination when pagination is false", () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
    }));
    const { Wrapper } = createWrapper(manyRows);
    render(
      <Wrapper>
        <DataTable config={baseConfig({ pagination: false })} />
      </Wrapper>,
    );

    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.queryByText("Next")).toBeNull();
  });

  it("does not render pagination when data fits on one page", () => {
    const { Wrapper } = createWrapper(); // Only 3 rows, default pageSize 10
    render(
      <Wrapper>
        <DataTable config={baseConfig()} />
      </Wrapper>,
    );

    expect(screen.queryByText("Previous")).toBeNull();
  });

  it("applies canonical header and pagination slots", () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
    }));
    const { Wrapper } = createWrapper(manyRows);
    const { container } = render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            id: "users-table",
            className: "table-root-class",
            selectable: true,
            actions: [
              {
                label: "Edit",
                action: { type: "navigate", to: "/users/{id}" },
              },
            ],
            slots: {
              root: { className: "table-root-slot" },
              headerCell: {
                className: "table-header-cell-slot",
                style: { letterSpacing: "0.1em" },
              },
              pagination: { className: "table-pagination-slot" },
            },
          })}
        />
      </Wrapper>,
    );

    expect(
      container.querySelector('[data-snapshot-id="users-table-root"]')?.className,
    ).toContain("table-root-class");
    expect(
      container.querySelector('[data-snapshot-id="users-table-root"]')?.className,
    ).toContain("table-root-slot");
    expect(
      container.querySelector('[data-snapshot-id="users-table-header-cell-name"]')?.className,
    ).toContain("table-header-cell-slot");
    expect(
      (
        container.querySelector(
          '[data-snapshot-id="users-table-header-cell-name"]',
        ) as HTMLElement | null
      )?.style.letterSpacing,
    ).toBe("0.1em");
    expect(
      (
        container.querySelector(
          '[data-snapshot-id="users-table-header-cell-select"]',
        ) as HTMLElement | null
      )?.style.width,
    ).toBe("40px");
    expect(
      (
        container.querySelector(
          '[data-snapshot-id="users-table-header-cell-actions"]',
        ) as HTMLElement | null
      )?.style.textAlign,
    ).toBe("right");
    expect(
      container.querySelector('[data-snapshot-id="users-table-pagination"]')?.className,
    ).toContain("table-pagination-slot");
  });

  it("resolves ref-backed search, labels, and toolbar copy", () => {
    const { Wrapper, registry } = createWrapper();
    const copyAtom = registry.register("table-copy");
    registry.store.set(copyAtom, {
      header: "Display Name",
      search: "Find teammates...",
      action: "Inspect",
      toolbar: "Reload",
    });

    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            columns: [{ field: "name", label: { from: "state.table-copy.header" } as never }],
            searchable: {
              placeholder: { from: "state.table-copy.search" } as never,
            },
            actions: [
              {
                label: { from: "state.table-copy.action" } as never,
                action: { type: "navigate", to: "/users/{id}" },
              },
            ],
            toolbar: [
              {
                label: { from: "state.table-copy.toolbar" } as never,
                action: { type: "refresh" } as never,
              },
            ],
          })}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Display Name")).toBeDefined();
    expect(screen.getByPlaceholderText("Find teammates...")).toBeDefined();
    expect(screen.getAllByText("Inspect").length).toBe(3);
    expect(screen.getByText("Reload")).toBeDefined();
  });

  it("renders a ref-backed empty message", () => {
    const { Wrapper, registry } = createWrapper([]);
    const copyAtom = registry.register("table-copy");
    registry.store.set(copyAtom, {
      empty: "Nothing to review",
    });

    render(
      <Wrapper>
        <DataTable
          config={baseConfig({
            emptyMessage: { from: "state.table-copy.empty" } as never,
          })}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Nothing to review")).toBeDefined();
  });
});
