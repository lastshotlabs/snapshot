import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DefaultOffline } from "../component";

describe("DefaultOffline", () => {
  it("renders a static offline state", () => {
    const html = renderToStaticMarkup(
      <DefaultOffline
        config={{
          type: "offline-banner",
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    expect(html).toContain("You&#x27;re offline");
    expect(html).toContain('role="status"');
    expect(html).toContain("component-root");
    expect(html).toContain("slot-root");
  });
});
