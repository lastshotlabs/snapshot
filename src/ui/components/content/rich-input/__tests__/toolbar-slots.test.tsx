import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RichInputBase } from "../standalone";

/**
 * Host controls belong IN the toolbar row, not under it.
 *
 * Every real composer carries affordances this editor does not own — attach,
 * emoji, GIFs, stickers. With no seam for them the host's only option is a
 * second row beneath the toolbar, and that is exactly what happened in
 * sgforum: a reply box two rows tall inside a small card, formatting on one
 * line and `+` plus the expressive picker on another. jdd, 2026-08-04, on a
 * screenshot of it: "shouldn't we make this one line too??".
 *
 * The load-bearing detail is WHERE these render. The formatting buttons live
 * in a horizontally scrolling group with an edge mask, so on a narrow screen
 * they slide out of view by design. An attach button that scrolled away with
 * them would be a worse defect than the extra row it replaced — so the slots
 * sit outside that group and stay pinned.
 */

afterEach(cleanup);

const formattingGroup = () =>
  document.querySelector('[data-snapshot-id$="-formattingGroup"]');
const toolbar = () => screen.queryByTestId("rich-input-toolbar");

describe("RichInputBase toolbar slots", () => {
  it("renders leading controls inside the toolbar row", () => {
    render(
      <RichInputBase toolbarLeading={<button type="button">Attach</button>} />,
    );
    const attach = screen.getByRole("button", { name: "Attach" });
    expect(toolbar()?.contains(attach)).toBe(true);
  });

  it("keeps leading controls OUT of the scrolling formatting group", () => {
    // The whole point of the slot. Inside that group, `+` scrolls off screen
    // on a phone the moment the formatting strip overflows.
    render(
      <RichInputBase toolbarLeading={<button type="button">Attach</button>} />,
    );
    const attach = screen.getByRole("button", { name: "Attach" });
    expect(formattingGroup()).not.toBeNull();
    expect(formattingGroup()?.contains(attach)).toBe(false);
  });

  it("orders leading controls BEFORE the formatting buttons", () => {
    render(
      <RichInputBase toolbarLeading={<button type="button">Attach</button>} />,
    );
    const attach = screen.getByRole("button", { name: "Attach" });
    const group = formattingGroup();
    expect(
      attach.compareDocumentPosition(group as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders trailing controls beside the send button, after formatting", () => {
    render(
      <RichInputBase
        showSendButton
        toolbarTrailing={<button type="button">Schedule</button>}
      />,
    );
    const schedule = screen.getByRole("button", { name: "Schedule" });
    const group = formattingGroup();
    expect(toolbar()?.contains(schedule)).toBe(true);
    expect(group?.contains(schedule)).toBe(false);
    expect(
      schedule.compareDocumentPosition(group as Node) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
  });

  it("renders the toolbar for host controls ALONE, with no formatting features", () => {
    // A chat-style composer wants `+` and emoji but no bold/italic. Before
    // this, `features={[]}` meant no toolbar at all, so the host had nowhere
    // to put them and was pushed back to a second row.
    render(
      <RichInputBase
        features={[]}
        toolbarLeading={<button type="button">Attach</button>}
      />,
    );
    expect(toolbar()).not.toBeNull();
    expect(screen.getByRole("button", { name: "Attach" })).toBeTruthy();
  });

  it("still renders no toolbar when there is nothing to put in it", () => {
    // The slots must not resurrect an empty toolbar for consumers that
    // deliberately turned every feature off.
    render(<RichInputBase features={[]} />);
    expect(toolbar()).toBeNull();
  });

  it("leaves host controls interactive — they are not swallowed by the toolbar", () => {
    // `role="toolbar"` and the editor's own key handling both sit above these
    // nodes; a click that never reached the handler would look like a dead
    // button with no error anywhere.
    const onClick = vi.fn();
    render(
      <RichInputBase
        toolbarLeading={
          <button type="button" onClick={onClick}>
            Attach
          </button>
        }
      />,
    );
    return userEvent
      .click(screen.getByRole("button", { name: "Attach" }))
      .then(() => expect(onClick).toHaveBeenCalledTimes(1));
  });
});
