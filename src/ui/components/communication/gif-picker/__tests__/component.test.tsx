// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GifPicker } from "../component";

const publishSpy = vi.hoisted(() => vi.fn());

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => vi.fn(),
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({ data: [], isLoading: false }),
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe("GifPicker", () => {
  it("renders static GIFs and publishes the selected item", () => {
    const { container } = render(
      <GifPicker
        config={{
          type: "gif-picker",
          id: "gif",
          className: "gif-root-class",
          maxHeight: "220px",
          gifs: [
            {
              id: "party-parrot",
              url: "https://example.com/parrot.gif",
              preview: "https://example.com/parrot-preview.gif",
              title: "Party parrot",
            },
          ],
          slots: {
            root: { className: "gif-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="gif"]')?.className,
    ).toContain("gif-root-class");
    expect(
      container.querySelector('[data-snapshot-id="gif"]')?.className,
    ).toContain("gif-root-slot");
    expect(
      (container.querySelector('[data-snapshot-id="gif"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("");
    expect(
      (container.querySelector('[data-snapshot-id="gif-content"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("220px");

    fireEvent.click(screen.getByRole("button", { name: "Party parrot" }));
    expect(publishSpy).toHaveBeenCalledWith({
      id: "party-parrot",
      title: "Party parrot",
      url: "https://example.com/parrot.gif",
    });
  });
});
