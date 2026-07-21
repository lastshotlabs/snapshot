/**
 * @vitest-environment jsdom
 */
// Regression tests for SurfaceStyles hydration consistency.
//
// The old module-registry implementation emitted a <style> per instance on
// the server but rendered null on the client (the registry was seeded from
// the SSR markup), so EVERY SSR'd page using a styled component hydrated
// with a mismatch and React threw the whole server tree away. SurfaceStyles
// now renders a React 19 hoistable (<style href precedence>): React owns
// dedup and matches by href during hydration, keeping both sides identical.
import { describe, it, expect, vi, afterEach } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import { act } from "react";
import { renderToString } from "react-dom/server";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { SurfaceStyles } from "../surface-styles";

const CSS_A = ".sn-btn { color: red; }";
const CSS_B = ".sn-card { color: blue; }";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(async () => {
  if (root) {
    const r = root;
    await act(async () => r.unmount());
    root = null;
  }
  container?.remove();
  container = null;
  document.head.querySelectorAll('style[data-precedence="sn-component"]').forEach((el) => el.remove());
});

describe("SurfaceStyles", () => {
  it("renders nothing without css", () => {
    expect(renderToString(<SurfaceStyles />)).toBe("");
    expect(renderToString(<SurfaceStyles css="" />)).toBe("");
  });

  it("server render emits the stylesheet", () => {
    const html = renderToString(
      <div>
        <SurfaceStyles css={CSS_A} />
      </div>,
    );
    expect(html).toContain(CSS_A);
    expect(html).toContain('data-href="sn-');
  });

  it("dedupes identical css across sibling instances via href", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root!.render(
        <div>
          <SurfaceStyles css={CSS_A} />
          <SurfaceStyles css={CSS_A} />
          <SurfaceStyles css={CSS_B} />
        </div>,
      );
    });
    const tags = document.querySelectorAll('style[data-precedence="sn-component"]');
    expect(tags.length).toBe(2);
    const contents = [...tags].map((t) => t.textContent);
    expect(contents).toContain(CSS_A);
    expect(contents).toContain(CSS_B);
  });

  it("hydrates server markup without a hydration mismatch", async () => {
    const tree = (
      <div>
        <span>before</span>
        <SurfaceStyles css={CSS_A} />
        <SurfaceStyles css={CSS_A} />
        <span>after</span>
      </div>
    );

    container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.appendChild(container);

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onRecoverableError = vi.fn();
    await act(async () => {
      root = hydrateRoot(container!, tree, { onRecoverableError });
    });

    // A mismatch surfaces as an onRecoverableError ("Hydration failed...")
    // and/or a console.error from React. Neither may fire.
    expect(onRecoverableError).not.toHaveBeenCalled();
    const hydrationComplaints = consoleError.mock.calls.filter((args) =>
      String(args[0]).toLowerCase().includes("hydrat"),
    );
    expect(hydrationComplaints).toEqual([]);
    consoleError.mockRestore();

    // The stylesheet survives hydration, hoisted and deduped.
    expect(document.querySelectorAll('style[data-precedence="sn-component"]').length).toBe(1);
    expect(container!.textContent).toContain("before");
    expect(container!.textContent).toContain("after");
  });
});
