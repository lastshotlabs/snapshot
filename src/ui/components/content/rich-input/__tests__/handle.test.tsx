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

function EmojiHarness({
  onSend,
}: {
  onSend: (data: { html: string; text: string; markdown?: string }) => void;
}) {
  const ref = useRef<RichInputBaseHandle>(null);
  return (
    <>
      <RichInputBase
        ref={ref}
        emitMarkdown
        features={[]}
        resolveEmoji={(shortcode) =>
          shortcode === "gg"
            ? {
                src: "data:image/svg+xml,%3Csvg%2F%3E",
                name: "Good game",
              }
            : null
        }
        onSend={onSend}
      />
      <button type="button" onClick={() => ref.current?.insertText(":gg:")}>
        Insert custom emoji
      </button>
      <button type="button" onClick={() => ref.current?.submit()}>
        Send custom emoji
      </button>
    </>
  );
}

function InitialEmojiHarness() {
  return (
    <RichInputBase
      defaultValue="Known :gg: unknown :nope:"
      features={[]}
      resolveEmoji={(shortcode) =>
        shortcode === "gg"
          ? {
              src: "data:image/svg+xml,%3Csvg%2F%3E",
              name: "Good game",
            }
          : null
      }
    />
  );
}

function CodeEmojiHarness() {
  return (
    <RichInputBase
      defaultValue="<p><code>:gg:</code></p><pre><code>:gg:</code></pre>"
      features={["code", "code-block"]}
      resolveEmoji={(shortcode) =>
        shortcode === "gg"
          ? {
              src: "data:image/svg+xml,%3Csvg%2F%3E",
              name: "Good game",
            }
          : null
      }
    />
  );
}

function DynamicEmojiHarness({ enabled }: { enabled: boolean }) {
  const ref = useRef<RichInputBaseHandle>(null);
  return (
    <>
      <RichInputBase
        ref={ref}
        features={[]}
        resolveEmoji={(shortcode) =>
          enabled && shortcode === "gg"
            ? {
                src: "data:image/svg+xml,%3Csvg%2F%3E",
                name: "Good game",
              }
            : null
        }
      />
      <button type="button" onClick={() => ref.current?.insertText(":gg:")}>
        Insert dynamically loaded emoji
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

  it("renders inserted shortcodes as atoms and sends the shortcode projections", async () => {
    const onSend = vi.fn();
    render(<EmojiHarness onSend={onSend} />);

    fireEvent.click(screen.getByText("Insert custom emoji"));

    const image = await screen.findByAltText(":gg:");
    expect(image.getAttribute("src")).toBe("data:image/svg+xml,%3Csvg%2F%3E");

    fireEvent.click(screen.getByText("Send custom emoji"));
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));

    expect(onSend.mock.calls[0]![0]).toMatchObject({
      text: ":gg:",
      markdown: ":gg:",
    });
    expect(onSend.mock.calls[0]![0].html).toContain('data-type="custom-emoji"');
  });

  it("resolves initial content and leaves unknown shortcodes literal", async () => {
    render(<InitialEmojiHarness />);

    await screen.findByAltText(":gg:");
    expect(screen.getByTestId("rich-input-editor").textContent).toContain(
      "unknown :nope:",
    );
  });

  it("leaves shortcodes literal inside inline and block code", async () => {
    render(<CodeEmojiHarness />);

    await waitFor(() =>
      expect(screen.getByTestId("rich-input-editor").textContent).toContain(
        ":gg:",
      ),
    );
    expect(screen.queryByAltText(":gg:")).toBeNull();
  });

  it("uses the latest resolver without recreating the editor", async () => {
    const view = render(<DynamicEmojiHarness enabled={false} />);
    view.rerender(<DynamicEmojiHarness enabled />);

    fireEvent.click(screen.getByText("Insert dynamically loaded emoji"));

    await screen.findByAltText(":gg:");
  });

  it("no-ops on an empty editor, matching the built-in send button", async () => {
    const onSend = vi.fn();
    render(<Harness onSend={onSend} />);

    fireEvent.click(screen.getByText("External send"));

    await waitFor(() => expect(onSend).not.toHaveBeenCalled());
  });
});
