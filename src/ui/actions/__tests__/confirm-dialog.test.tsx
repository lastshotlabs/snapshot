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
import type { ConfirmDialogProps } from "../confirm";

function Harness({ dialogProps }: { dialogProps?: ConfirmDialogProps }) {
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
      <ConfirmDialog {...dialogProps} />
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

  it("accepts a non-Snapshot palette and keeps both actions above 44px", () => {
    render(
      <Provider>
        <Harness
          dialogProps={{
            slots: {
              overlay: {
                style: { background: "var(--app-overlay)" },
              },
              dialog: {
                style: {
                  background: "var(--app-panel)",
                  color: "var(--app-text)",
                  border: "1px solid var(--app-border)",
                },
              },
              description: {
                style: { color: "var(--app-muted)" },
              },
              cancelButton: {
                style: {
                  background: "var(--app-secondary)",
                  color: "var(--app-text)",
                },
              },
              confirmButton: {
                style: {
                  background: "var(--app-danger)",
                  color: "var(--app-danger-text)",
                },
              },
            },
          }}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByText("Open"));

    expect(
      document
        .querySelector('[data-snapshot-id="snapshot-confirm-overlay"]')
        ?.getAttribute("style"),
    ).toContain("var(--app-overlay)");
    expect(
      document
        .querySelector('[data-snapshot-id="snapshot-confirm-dialog"]')
        ?.getAttribute("style"),
    ).toContain("var(--app-panel)");

    const cancel = screen.getByText("Keep it");
    const confirm = screen.getByText("Yes, delete");
    expect(cancel.getAttribute("style")).toContain("var(--app-secondary)");
    expect(confirm.getAttribute("style")).toContain("var(--app-danger)");
    expect(cancel.getAttribute("style")).toContain("min-height: 2.875rem");
    expect(confirm.getAttribute("style")).toContain("min-height: 2.875rem");
  });
});
