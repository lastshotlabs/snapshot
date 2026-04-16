import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DefaultError } from "../component";

describe("DefaultError", () => {
  it("renders a static error state", () => {
    const html = renderToStaticMarkup(
      <DefaultError
        config={{
          type: "error-page",
          title: "Oops",
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    expect(html).toContain("Oops");
    expect(html).toContain('role="alert"');
    expect(html).toContain("component-root");
    expect(html).toContain("slot-root");
  });
});
