// @vitest-environment happy-dom
import React, { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Provider } from "jotai/react";
import { ConfirmDialog, useConfirmManager } from "../confirm";

function Harness() {
  const confirm = useConfirmManager();
  const [result, setResult] = useState<string>("pending");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void confirm
            .show({
              title: "Delete record",
              description: "This cannot be undone.",
              confirmLabel: "Yes, delete",
              cancelLabel: "Keep it",
              variant: "destructive",
              requireInput: "DELETE",
            })
            .then((value) => setResult(value ? "confirmed" : "cancelled"));
        }}
      >
        Open
      </button>
      <div data-testid="result">{result}</div>
      <ConfirmDialog />
    </>
  );
}

describe("ConfirmDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders destructive confirms and blocks confirmation until the input matches", async () => {
    render(
      <Provider>
        <Harness />
      </Provider>,
    );

    fireEvent.click(screen.getByText("Open"));
    const confirmButton = screen.getByText("Yes, delete");

    expect(screen.getByText("Keep it")).toBeTruthy();
    expect(confirmButton.getAttribute("style")).toContain(
      "var(--sn-opacity-disabled, 0.5)",
    );
    expect(confirmButton.hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), {
      target: { value: "DELETE" },
    });
    expect(confirmButton.hasAttribute("disabled")).toBe(false);

    fireEvent.click(confirmButton);
    await waitFor(() =>
      expect(screen.getByTestId("result").textContent).toBe("confirmed"),
    );
  });
});
