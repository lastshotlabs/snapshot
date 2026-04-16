// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmojiPicker } from "../component";

const mockExecute = vi.fn();
const mockPublish = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => mockPublish,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => mockExecute,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({ data: [], isLoading: false, error: null, refetch: vi.fn() }),
}));

describe("EmojiPicker", () => {
  it("renders custom emojis and publishes selection", () => {
    const { container } = render(
      <EmojiPicker
        config={{
          type: "emoji-picker",
          id: "emoji-picker",
          className: "emoji-root-class",
          categories: [],
          maxHeight: "240px",
          customEmojis: [
            {
              id: "emoji-1",
              name: "Party Blob",
              shortcode: "party_blob",
              url: "https://example.com/party.png",
            },
          ],
          selectAction: { type: "event", name: "select-emoji" } as never,
          slots: {
            root: { className: "emoji-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="emoji-picker"]')?.className,
    ).toContain("emoji-root-class");
    expect(
      container.querySelector('[data-snapshot-id="emoji-picker"]')?.className,
    ).toContain("emoji-root-slot");
    expect(
      (container.querySelector('[data-snapshot-id="emoji-picker"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("");
    expect(
      (container.querySelector('[data-snapshot-id="emoji-picker-gridScroll"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("240px");

    fireEvent.click(screen.getByTitle(":party_blob:"));

    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        shortcode: "party_blob",
        isCustom: true,
      }),
    );
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});
