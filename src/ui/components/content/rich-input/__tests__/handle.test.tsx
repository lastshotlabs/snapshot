// @vitest-environment happy-dom
import React, { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { RichInputBase, type RichInputBaseHandle } from "../standalone";

afterEach(cleanup);

/**
 * Renders the editor with an EXTERNAL send button wired to the imperative
 * handle — the reason `submit()` exists. A host with its own button treatment
 * shouldn't have to fall back to the built-in one, so this proves the external
 * path fires the same `onSend` the internal button would.
 */
function Harness({ onSend }: { onSend: (data: { text: string }) => void }) {
  const ref = useRef<RichInputBaseHandle>(null);
  return (
    <>
      <RichInputBase ref={ref} onSend={onSend} placeholder="Write something" />
      <button type="button" onClick={() => ref.current?.submit()}>
        External send
      </button>
      <button type="button" onClick={() => ref.current?.insertText("hello")}>
        Insert
      </button>
    </>
  );
}

describe("RichInputBaseHandle.submit", () => {
  it("fires onSend with the editor's content and then clears it", async () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    fireEvent.click(screen.getByText("Insert"));
    fireEvent.click(screen.getByText("External send"));

    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));
    expect(onSend.mock.calls[0]![0].text).toContain("hello");

    // A second press must not re-send: the editor cleared, so there is
    // nothing to send. Without this the external button would double-post
    // whatever was last typed.
    fireEvent.click(screen.getByText("External send"));
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));
  });

  it("no-ops on an empty editor, matching the built-in send button", async () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    fireEvent.click(screen.getByText("External send"));

    await waitFor(() => expect(onSend).not.toHaveBeenCalled());
  });
});
