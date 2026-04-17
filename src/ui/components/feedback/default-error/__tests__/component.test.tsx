import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const subscribedValues: Record<string, unknown> = {
  "copy.error.title": "Request failed",
  "copy.error.description": "Please try again in a moment.",
  "copy.error.retry": "Retry now",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
}));

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

  it("renders ref-backed copy", () => {
    const html = renderToStaticMarkup(
      <DefaultError
        config={{
          type: "error-page",
          title: { from: "copy.error.title" },
          description: { from: "copy.error.description" },
          retryLabel: { from: "copy.error.retry" },
          showRetry: true,
        }}
      />,
    );

    expect(html).toContain("Request failed");
    expect(html).toContain("Please try again in a moment.");
    expect(html).toContain("Retry now");
  });
});
