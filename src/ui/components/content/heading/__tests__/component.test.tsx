// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Heading } from "../component";

vi.mock("../../../../context", () => ({
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../../expressions/template", () => ({
  resolveTemplate: (value: string) => value,
}));

vi.mock("../../../../i18n/resolve", () => ({
  resolveRuntimeLocale: () => "en",
}));

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => ({ raw: {}, app: {}, auth: {} }),
  useRouteRuntime: () => null,
}));

describe("Heading", () => {
  it("renders the configured level with direct class and style overrides", () => {
    const { container } = render(
      <Heading
        config={{
          type: "heading",
          id: "hero-heading",
          text: "Snapshot",
          level: 1,
          className: "hero-title",
          style: { opacity: 0.7 },
          slots: {
            root: { className: "heading-slot" },
          },
        }}
      />,
    );

    const heading = container.querySelector("h1");
    expect(heading?.textContent).toBe("Snapshot");
    expect(heading?.classList.contains("hero-title")).toBe(true);
    expect(heading?.classList.contains("heading-slot")).toBe(true);
    expect((heading as HTMLElement | null)?.style.opacity).toBe("0.7");
  });
});
