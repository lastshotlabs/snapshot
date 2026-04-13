// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
}));

describe("AuditLog", () => {
  it("renders entries and expands details", () => {
    render(
      <AuditLog
        config={{
          type: "audit-log",
          data: "/api/audit-log",
          detailsField: "details",
        }}
      />,
    );

    expect(screen.getByText("Ada Lovelace")).toBeTruthy();
    expect(screen.getByText("updated settings")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /details/i }));

    expect(screen.getByText(/"dark"/)).toBeTruthy();
  });
});
