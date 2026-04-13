// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "../component";

const mockExecute = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => mockExecute,
}));

describe("Alert", () => {
  it("renders content, runs action, and dismisses", () => {
    render(
      <Alert
        config={{
          type: "alert",
          title: "Success",
          description: "Saved successfully",
          action: { type: "event", name: "alert-action" } as never,
          actionLabel: "Retry",
          dismissible: true,
        }}
      />,
    );

    expect(screen.getByTestId("alert-title").textContent).toBe("Success");
    expect(screen.getByTestId("alert-description").textContent).toBe(
      "Saved successfully",
    );

    fireEvent.click(screen.getByTestId("alert-action"));
    expect(mockExecute).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("alert-dismiss"));
    expect(screen.queryByTestId("alert")).toBeNull();
  });
});
