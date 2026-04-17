// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavSearch } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();
const subscribedValues: Record<string, unknown> = {
  "copy.navSearch.placeholder": "Search docs",
};

vi.mock("../../../../context/index", () => ({
  usePublish: () => publishSpy,
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

describe("NavSearch", () => {
  it("publishes the search value and submits the search action", () => {
    executeSpy.mockReset();
    publishSpy.mockReset();

    render(
      <NavSearch
        config={{
          type: "nav-search",
          className: "component-root",
          placeholder: { from: "copy.navSearch.placeholder" },
          publishTo: "nav.search",
          onSearch: { type: "search" } as never,
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const input = screen.getByPlaceholderText("Search docs");
    const form = input.closest("form");
    expect(form?.className).toContain("component-root");
    expect(form?.className).toContain("slot-root");
    fireEvent.change(input, { target: { value: "icons" } });
    fireEvent.submit(form!);

    expect(publishSpy).toHaveBeenCalledWith("icons");
    expect(executeSpy).toHaveBeenCalledWith({ type: "search" });
  });
});
