import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const subscribedValues: Record<string, unknown> = {
  "copy.offline.title": "Offline mode",
  "copy.offline.description": "Reconnect to sync your changes.",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
}));

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

  it("renders ref-backed copy", () => {
    const html = renderToStaticMarkup(
      <DefaultOffline
        config={{
          type: "offline-banner",
          title: { from: "copy.offline.title" },
          description: { from: "copy.offline.description" },
        }}
      />,
    );

    expect(html).toContain("Offline mode");
    expect(html).toContain("Reconnect to sync your changes.");
  });
});
