import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DefaultLoading } from "../component";

describe("DefaultLoading", () => {
  it("renders a static loading spinner", () => {
    const html = renderToStaticMarkup(
      <DefaultLoading
        config={{
          type: "spinner",
          label: "Loading",
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    expect(html).toContain("Loading");
    expect(html).toContain('role="status"');
    expect(html).toContain("component-root");
    expect(html).toContain("slot-root");
  });
});
