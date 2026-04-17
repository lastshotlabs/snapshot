// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { AuditLog } from "../component";

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: [
      {
        user: "Ada Lovelace",
        action: "updated settings",
        timestamp: "2026-04-13T00:00:00.000Z",
        details: { old: "light", new: "dark" },
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe("AuditLog", () => {
  it("renders entries and expands details", () => {
    const { container } = render(
      <AuditLog
        config={{
          type: "audit-log",
          id: "settings-audit",
          className: "audit-root-class",
          data: "/api/audit-log",
          detailsField: "details",
          slots: {
            root: { className: "audit-root-slot" },
          },
        }}
      />,
    );

    expect(
      container
        .querySelector('[data-snapshot-id="settings-audit"]')
        ?.classList.contains("audit-root-class"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-snapshot-id="settings-audit"]')
        ?.classList.contains("audit-root-slot"),
    ).toBe(true);
    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("updated settings")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /details/i }));

    expect(screen.getByText(/"dark"/)).toBeTruthy();
  });

  it("renders ref-backed filter labels and options", () => {
    const registry = new AtomRegistryImpl();
    const auditAtom = registry.register("audit");
    registry.store.set(auditAtom, {
      filterLabel: "Action type",
      filterOption: "updated settings",
    });

    render(
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            <AuditLog
              config={{
                type: "audit-log",
                data: "/api/audit-log",
                filters: [
                  {
                    field: "action",
                    label: { from: "audit.filterLabel" },
                    options: [{ from: "audit.filterOption" }],
                  },
                ],
              }}
            />
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>,
    );

    expect(screen.getByLabelText("Action type")).toBeTruthy();
    expect(screen.getByRole("option", { name: "updated settings" })).toBeTruthy();
  });
});
