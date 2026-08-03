import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RichInputBase } from "../standalone";
import type { RichInputBaseHandle } from "../standalone";

/**
 * Consumer tokens render as CHIPS in the editor.
 *
 * `resolveEmoji` already covers `:shortcode:` becoming a line-sized image.
 * This is the other shape every real composer needs: content the author placed
 * in the body that is too big, too structured or too remote to draw inline —
 * a GIF, an upload, a quoted post, a link embed.
 *
 * Without it a consumer's storage token is what the AUTHOR sees while typing.
 * Reported from sgforum with a screenshot of the composer showing a literal
 * `%%media:GIF|https://…%%` mid-sentence, against a reference composer where
 * the same thing is a chip reading "🖼 Good Morning GIF".
 *
 * THE ROUND-TRIP IS THE CONTRACT, and it is what every assertion here is
 * really about: the document keeps the consumer's raw token, so the editor is
 * the only thing that renders differently. A chip that serialized to anything
 * else would silently rewrite everyone's stored bodies.
 */

const PATTERN = /%%media:[^|]*?\|https?:\/\/.+?%%/g;

const resolve = (raw: string) => {
  const match = /%%media:([^|]*?)\|(https?:\/\/.+?)%%/.exec(raw);
  if (!match) return null;
  return { label: match[1] || "Media", icon: "🖼", kind: "media" };
};

function TokenHarness({
  onSend,
}: {
  onSend?: (d: { text: string; markdown?: string }) => void;
}) {
  const ref = useRef<RichInputBaseHandle>(null);
  return (
    <>
      <RichInputBase
        ref={ref}
        emitMarkdown
        features={[]}
        tokenPattern={PATTERN}
        resolveToken={resolve}
        onSend={onSend}
      />
      <button
        type="button"
        onClick={() =>
          ref.current?.insertText(
            "%%media:Good Morning GIF|https://cdn.test/a.gif%%",
          )
        }
      >
        Insert token
      </button>
      <button type="button" onClick={() => ref.current?.submit()}>
        Send
      </button>
    </>
  );
}

afterEach(cleanup);

describe("RichInputBase custom tokens", () => {
  it("renders an imperatively inserted token as a chip", async () => {
    // The path a GIF picker actually uses.
    const user = userEvent.setup();
    render(<TokenHarness />);
    await user.click(screen.getByRole("button", { name: "Insert token" }));

    await waitFor(() => {
      const chip = document.querySelector('span[data-type="custom-token"]');
      expect(chip).not.toBeNull();
      expect(chip?.getAttribute("data-label")).toBe("Good Morning GIF");
      expect(chip?.getAttribute("data-kind")).toBe("media");
    });
    // THE RAW TOKEN MUST NOT BE VISIBLE. This is the whole complaint.
    expect(document.querySelector(".ProseMirror")?.textContent).not.toContain(
      "%%media:",
    );
  });

  it("serializes back to the ORIGINAL raw token in text and markdown", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<TokenHarness onSend={onSend} />);
    await user.click(screen.getByRole("button", { name: "Insert token" }));
    await waitFor(() => {
      expect(
        document.querySelector('span[data-type="custom-token"]'),
      ).not.toBeNull();
    });
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(onSend).toHaveBeenCalled());
    const payload = onSend.mock.calls[0]?.[0];
    // Byte for byte — a chip that serialized to its LABEL would quietly
    // destroy the url, and the post would render as the word "GIF".
    expect(payload.text).toContain(
      "%%media:Good Morning GIF|https://cdn.test/a.gif%%",
    );
    expect(payload.markdown).toContain(
      "%%media:Good Morning GIF|https://cdn.test/a.gif%%",
    );
  });

  it("converts tokens already present in the initial value", async () => {
    // A restored draft must show chips immediately, not raw tokens that only
    // become chips once the author types.
    render(
      <RichInputBase
        defaultValue="before %%media:One|https://cdn.test/1.gif%% after"
        features={[]}
        tokenPattern={PATTERN}
        resolveToken={resolve}
      />,
    );
    // The conversion happens in onCreate, so wait for it rather than reading
    // the DOM on the same tick as render.
    await waitFor(() =>
      expect(
        document
          .querySelector('span[data-type="custom-token"]')
          ?.getAttribute("data-label"),
      ).toBe("One"),
    );
    expect(document.querySelector(".ProseMirror")?.textContent).toContain(
      "before",
    );
    expect(document.querySelector(".ProseMirror")?.textContent).toContain(
      "after",
    );
  });

  it("converts EVERY token in a line, not just the first", async () => {
    // Guards the per-call regex: a shared global regex carries `lastIndex`
    // between documents and would skip matches on the next pass.
    render(
      <RichInputBase
        defaultValue="a %%media:One|https://cdn.test/1.gif%% b %%media:Two|https://cdn.test/2.gif%% c"
        features={[]}
        tokenPattern={PATTERN}
        resolveToken={resolve}
      />,
    );
    await waitFor(() =>
      expect(
        document.querySelectorAll('span[data-type="custom-token"]').length,
      ).toBe(2),
    );
    const chips = document.querySelectorAll('span[data-type="custom-token"]');
    expect(chips[0]?.getAttribute("data-label")).toBe("One");
    expect(chips[1]?.getAttribute("data-label")).toBe("Two");
  });

  it("leaves an unresolved token as plain text", () => {
    // Returning null must be inert. A consumer uses this to reject a malformed
    // or untrusted token, and turning it into a chip anyway would launder it.
    render(
      <RichInputBase
        defaultValue="%%media:x|https://cdn.test/x.gif%%"
        features={[]}
        tokenPattern={PATTERN}
        resolveToken={() => null}
      />,
    );
    expect(document.querySelector('span[data-type="custom-token"]')).toBeNull();
    expect(document.querySelector(".ProseMirror")?.textContent).toContain(
      "%%media:",
    );
  });

  it("leaves tokens inside code alone", () => {
    // Someone documenting the token format is showing source, not placing
    // media. Same rule the emoji extension follows.
    render(
      <RichInputBase
        defaultValue="<p><code>%%media:One|https://cdn.test/1.gif%%</code></p>"
        features={["code"]}
        tokenPattern={PATTERN}
        resolveToken={resolve}
      />,
    );
    expect(document.querySelector('span[data-type="custom-token"]')).toBeNull();
  });

  it("does nothing at all when the consumer supplies no resolver", () => {
    // The extension must stay entirely off by default — no chip, no CSS, no
    // behaviour change for every existing consumer.
    render(
      <RichInputBase
        defaultValue="%%media:One|https://cdn.test/1.gif%%"
        features={[]}
      />,
    );
    expect(document.querySelector('span[data-type="custom-token"]')).toBeNull();
  });
});
