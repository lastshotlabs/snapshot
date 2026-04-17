import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const subscribedValues: Record<string, unknown> = {
  "copy.notFound.title": "Missing page",
  "copy.notFound.description": "That route does not exist anymore.",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
}));

import { DefaultNotFound } from "../component";

describe("DefaultNotFound", () => {
  it("renders a static not-found state", () => {
    const html = renderToStaticMarkup(
      <DefaultNotFound
        config={{
          type: "not-found",
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    expect(html).toContain("Page not found");
    expect(html).toContain("404");
    expect(html).toContain("component-root");
    expect(html).toContain("slot-root");
  });

  it("renders ref-backed copy", () => {
    const html = renderToStaticMarkup(
      <DefaultNotFound
        config={{
          type: "not-found",
          title: { from: "copy.notFound.title" },
          description: { from: "copy.notFound.description" },
        }}
      />,
    );

    expect(html).toContain("Missing page");
    expect(html).toContain("That route does not exist anymore.");
  });
});
