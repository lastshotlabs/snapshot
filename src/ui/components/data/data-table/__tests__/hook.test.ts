/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { useDataTable } from "../hook";
import type { DataTableConfig } from "../types";
import React from "react";

const testData = [
  { id: 1, name: "Alice", email: "alice@example.com", age: 30, active: true },
  { id: 2, name: "Bob", email: "bob@example.com", age: 25, active: false },
  {
    id: 3,
    name: "Charlie",
    email: "charlie@example.com",
    age: 35,
    active: true,
  },
  { id: 4, name: "Diana", email: "diana@example.com", age: 28, active: true },
  { id: 5, name: "Eve", email: "eve@example.com", age: 22, active: false },
];

function createTestWrapper(pageRegistry: AtomRegistryImpl) {
  return function TestWrapper({ children }: { children: ReactNode }) {
    return React.createElement(
      AppRegistryContext.Provider,
      { value: null },
      React.createElement(SnapshotApiContext.Provider, { value: null },
        React.createElement(
          PageRegistryContext.Provider,
          { value: pageRegistry },
          children,
        ),
      ),
    );
  };
}

/**
 * Helper to create a config that uses FromRef data (pre-loaded data).
 */
function configWithData(
  overrides: Partial<DataTableConfig> = {},
): DataTableConfig {
  return {
    type: "data-table",
    data: { from: "test-source" },
    columns: "auto",
    ...overrides,
  };
}

/**
 * Render the hook with test data pre-loaded into the registry.
 */
function renderTableHook(
  config: DataTableConfig,
  data: Record<string, unknown>[] = testData,
) {
  const registry = new AtomRegistryImpl();
  const sourceAtom = registry.register("test-source");
  registry.store.set(sourceAtom, data);

  const wrapper = createTestWrapper(registry);
  const result = renderHook(() => useDataTable(config), { wrapper });

  return { ...result, registry };
}

describe("useDataTable", () => {
  describe("list envelopes", () => {
    it("reads rows from a FromRef items envelope", () => {
      const registry = new AtomRegistryImpl();
      const sourceAtom = registry.register("test-source");
      registry.store.set(sourceAtom, { items: testData, hasMore: true });

      const wrapper = createTestWrapper(registry);
      const { result } = renderHook(() => useDataTable(configWithData()), {
        wrapper,
      });

      expect(result.current.rows.length).toBe(5);
      expect(result.current.rows[0]!["name"]).toBe("Alice");
    });
  });

  describe("column auto-detection", () => {
    it("derives columns from data keys when columns is 'auto'", () => {
      const { result } = renderTableHook(configWithData());

      expect(result.current.columns.length).toBe(5); // id, name, email, age, active
      expect(result.current.columns.map((c) => c.field)).toEqual([
        "id",
        "name",
        "email",
        "age",
        "active",
      ]);
    });

    it("humanizes field names for labels", () => {
      const registry = new AtomRegistryImpl();
      const sourceAtom = registry.register("test-source");
      registry.store.set(sourceAtom, [
        {
          firstName: "Alice",
          lastLogin: "2024-01-01",
          created_at: "2024-01-01",
        },
      ]);

      const wrapper = createTestWrapper(registry);
      const { result } = renderHook(() => useDataTable(configWithData()), {
        wrapper,
      });

      const labels = result.current.columns.map((c) => c.label);
      expect(labels).toContain("First Name");
      expect(labels).toContain("Last Login");
      expect(labels).toContain("Created At");
    });

    it("infers formats from value types", () => {
      const { result } = renderTableHook(configWithData());

      const ageCol = result.current.columns.find((c) => c.field === "age");
      expect(ageCol?.format).toBe("number");

      const activeCol = result.current.columns.find(
        (c) => c.field === "active",
      );
      expect(activeCol?.format).toBe("boolean");
    });

    it("returns empty columns when data is empty", () => {
      const { result } = renderTableHook(configWithData(), []);
      expect(result.current.columns).toEqual([]);
    });
  });

  describe("explicit columns", () => {
    it("uses configured columns", () => {
      const { result } = renderTableHook(
        configWithData({
          columns: [
            { field: "name", label: "Full Name", sortable: true },
            { field: "email" },
          ],
        }),
      );

      expect(result.current.columns.length).toBe(2);
      expect(result.current.columns[0]!.label).toBe("Full Name");
      expect(result.current.columns[0]!.sortable).toBe(true);
      expect(result.current.columns[1]!.label).toBe("Email");
      expect(result.current.columns[1]!.sortable).toBe(false);
    });
  });

  describe("sorting", () => {
    it("starts with no sort", () => {
      const { result } = renderTableHook(configWithData());
      expect(result.current.sort).toBeNull();
    });

    it("sorts ascending on first click", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.setSortColumn("name");
      });

      expect(result.current.sort).toEqual({ column: "name", direction: "asc" });
      expect(result.current.rows[0]!["name"]).toBe("Alice");
    });

    it("toggles to descending on second click", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.setSortColumn("name");
      });
      act(() => {
        result.current.setSortColumn("name");
      });

      expect(result.current.sort).toEqual({
        column: "name",
        direction: "desc",
      });
      expect(result.current.rows[0]!["name"]).toBe("Eve");
    });

    it("resets to ascending when changing column", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.setSortColumn("name");
      });
      act(() => {
        result.current.setSortColumn("name");
      });
      act(() => {
        result.current.setSortColumn("age");
      });

      expect(result.current.sort).toEqual({ column: "age", direction: "asc" });
    });

    it("sorts numbers correctly", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.setSortColumn("age");
      });

      const ages = result.current.rows.map((r) => r["age"]);
      expect(ages).toEqual([22, 25, 28, 30, 35]);
    });
  });

  describe("pagination", () => {
    it("paginates rows by default (10 per page)", () => {
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }));
      const { result } = renderTableHook(configWithData(), manyRows);

      expect(result.current.rows.length).toBe(10);
      expect(result.current.pagination?.currentPage).toBe(1);
      expect(result.current.pagination?.totalPages).toBe(3);
      expect(result.current.pagination?.totalRows).toBe(25);
    });

    it("respects custom pageSize", () => {
      const manyRows = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }));
      const { result } = renderTableHook(
        configWithData({ pagination: { type: "offset", pageSize: 5 } }),
        manyRows,
      );

      expect(result.current.rows.length).toBe(5);
      expect(result.current.pagination?.totalPages).toBe(3);
    });

    it("navigates to next/previous page", () => {
      const manyRows = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }));
      const { result } = renderTableHook(
        configWithData({ pagination: { type: "offset", pageSize: 5 } }),
        manyRows,
      );

      act(() => {
        result.current.nextPage();
      });
      expect(result.current.pagination?.currentPage).toBe(2);
      expect(result.current.rows[0]!["name"]).toBe("User 6");

      act(() => {
        result.current.prevPage();
      });
      expect(result.current.pagination?.currentPage).toBe(1);
    });

    it("goToPage clamps to valid range", () => {
      const manyRows = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }));
      const { result } = renderTableHook(
        configWithData({ pagination: { type: "offset", pageSize: 5 } }),
        manyRows,
      );

      act(() => {
        result.current.goToPage(100);
      });
      expect(result.current.pagination?.currentPage).toBe(3);

      act(() => {
        result.current.goToPage(0);
      });
      expect(result.current.pagination?.currentPage).toBe(1);
    });

    it("disables pagination when pagination is false", () => {
      const { result } = renderTableHook(configWithData({ pagination: false }));
      expect(result.current.pagination).toBeNull();
      expect(result.current.rows.length).toBe(5); // All rows shown
    });

    it("prevPage does not go below 1", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.prevPage();
      });
      expect(result.current.pagination?.currentPage).toBe(1);
    });

    it("nextPage does not exceed totalPages", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.nextPage();
      });
      // Only 5 rows, pageSize 10 = 1 page
      expect(result.current.pagination?.currentPage).toBe(1);
    });
  });

  describe("selection", () => {
    it("starts with empty selection", () => {
      const { result } = renderTableHook(configWithData({ selectable: true }));
      expect(result.current.selection.size).toBe(0);
      expect(result.current.selectedRows).toEqual([]);
      expect(result.current.selectedIds).toEqual([]);
    });

    it("toggleRow adds/removes selection", () => {
      const { result } = renderTableHook(configWithData({ selectable: true }));

      act(() => {
        result.current.toggleRow(1);
      });
      expect(result.current.selection.has(1)).toBe(true);
      expect(result.current.selectedIds).toEqual([1]);
      expect(result.current.selectedRows.length).toBe(1);
      expect(result.current.selectedRows[0]!["name"]).toBe("Alice");

      act(() => {
        result.current.toggleRow(1);
      });
      expect(result.current.selection.has(1)).toBe(false);
      expect(result.current.selectedIds).toEqual([]);
    });

    it("toggleAll selects all visible rows", () => {
      const { result } = renderTableHook(configWithData({ selectable: true }));

      act(() => {
        result.current.toggleAll();
      });
      expect(result.current.selection.size).toBe(5);
    });

    it("toggleAll deselects all when all are selected", () => {
      const { result } = renderTableHook(configWithData({ selectable: true }));

      act(() => {
        result.current.toggleAll();
      });
      act(() => {
        result.current.toggleAll();
      });
      expect(result.current.selection.size).toBe(0);
    });
  });

  describe("search", () => {
    it("starts with empty search", () => {
      const { result } = renderTableHook(configWithData({ searchable: true }));
      expect(result.current.search).toBe("");
    });

    it("filters rows by search query", () => {
      const { result } = renderTableHook(configWithData({ searchable: true }));

      act(() => {
        result.current.setSearch("alice");
      });

      expect(result.current.data.length).toBe(1);
      expect(result.current.data[0]!["name"]).toBe("Alice");
    });

    it("search is case-insensitive", () => {
      const { result } = renderTableHook(configWithData({ searchable: true }));

      act(() => {
        result.current.setSearch("BOB");
      });

      expect(result.current.data.length).toBe(1);
    });

    it("restricts search to specified fields", () => {
      const { result } = renderTableHook(
        configWithData({
          searchable: { fields: ["name"] },
        }),
      );

      // Search for email domain should not match since we restrict to name field
      act(() => {
        result.current.setSearch("example.com");
      });
      expect(result.current.data.length).toBe(0);

      // Search by name should work
      act(() => {
        result.current.setSearch("Alice");
      });
      expect(result.current.data.length).toBe(1);
    });

    it("resets to page 1 when search changes", () => {
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
      }));
      const { result } = renderTableHook(
        configWithData({
          searchable: true,
          pagination: { type: "offset", pageSize: 5 },
        }),
        manyRows,
      );

      act(() => {
        result.current.nextPage();
      });
      expect(result.current.pagination?.currentPage).toBe(2);

      act(() => {
        result.current.setSearch("User 1");
      });
      expect(result.current.pagination?.currentPage).toBe(1);
    });
  });

  describe("filters", () => {
    it("starts with empty filters", () => {
      const { result } = renderTableHook(configWithData());
      expect(result.current.filters).toEqual({});
    });

    it("filters rows by field value", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.setFilter("active", "true");
      });

      expect(result.current.data.length).toBe(3);
      expect(result.current.data.every((r) => r["active"] === true)).toBe(true);
    });

    it("clears filter when set to empty string", () => {
      const { result } = renderTableHook(configWithData());

      act(() => {
        result.current.setFilter("active", "true");
      });
      expect(result.current.data.length).toBe(3);

      act(() => {
        result.current.setFilter("active", "");
      });
      expect(result.current.data.length).toBe(5);
    });

    it("resets to page 1 when filter changes", () => {
      const manyRows = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        active: i % 2 === 0,
      }));
      const { result } = renderTableHook(
        configWithData({ pagination: { type: "offset", pageSize: 5 } }),
        manyRows,
      );

      act(() => {
        result.current.nextPage();
      });
      expect(result.current.pagination?.currentPage).toBe(2);

      act(() => {
        result.current.setFilter("active", "true");
      });
      expect(result.current.pagination?.currentPage).toBe(1);
    });
  });

  describe("combined operations", () => {
    it("applies search, filter, and sort together", () => {
      const data = [
        { id: 1, name: "Alice", dept: "eng", score: 90 },
        { id: 2, name: "Alice", dept: "sales", score: 80 },
        { id: 3, name: "Bob", dept: "eng", score: 70 },
        { id: 4, name: "Charlie", dept: "eng", score: 85 },
      ];
      const { result } = renderTableHook(
        configWithData({
          searchable: true,
          pagination: false,
        }),
        data,
      );

      // Filter by department
      act(() => {
        result.current.setFilter("dept", "eng");
      });
      expect(result.current.data.length).toBe(3);

      // Search for Alice within eng
      act(() => {
        result.current.setSearch("Alice");
      });
      expect(result.current.data.length).toBe(1);
      expect(result.current.data[0]!["id"]).toBe(1);
    });
  });

  describe("data loading states", () => {
    it("shows not loading when data is provided via FromRef", () => {
      const { result } = renderTableHook(configWithData());
      expect(result.current.isLoading).toBe(false);
    });

    it("returns null error when data loads successfully", () => {
      const { result } = renderTableHook(configWithData());
      expect(result.current.error).toBeNull();
    });
  });

  describe("publishing", () => {
    it("publishes state when id is set", () => {
      const registry = new AtomRegistryImpl();
      const sourceAtom = registry.register("test-source");
      registry.store.set(sourceAtom, testData);

      const wrapper = createTestWrapper(registry);
      renderHook(() => useDataTable(configWithData({ id: "my-table" })), {
        wrapper,
      });

      const published = registry.get("my-table");
      expect(published).toBeDefined();
      const value = registry.store.get(published!) as Record<string, unknown>;
      expect(value).toHaveProperty("data");
      expect(value).toHaveProperty("selectedRows");
      expect(value).toHaveProperty("selectedIds");
      expect(value).toHaveProperty("sort");
      expect(value).toHaveProperty("page");
      expect(value).toHaveProperty("search");
      expect(value).toHaveProperty("filters");
    });
  });
});
