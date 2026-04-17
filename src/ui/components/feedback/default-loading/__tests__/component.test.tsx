import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const subscribedValues: Record<string, unknown> = {
  "copy.loading.label": "Loading data",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
}));

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

  it("renders a ref-backed label", () => {
    const html = renderToStaticMarkup(
      <DefaultLoading
        config={{
          type: "spinner",
          label: { from: "copy.loading.label" },
        }}
      />,
    );

    expect(html).toContain("Loading data");
  });
});
