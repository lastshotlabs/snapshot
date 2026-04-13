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

describe("EmojiPicker", () => {
  it("renders custom emojis and publishes selection", () => {
    render(
      <EmojiPicker
        config={{
          type: "emoji-picker",
          id: "emoji-picker",
          categories: [],
          customEmojis: [
            {
              id: "emoji-1",
              name: "Party Blob",
              shortcode: "party_blob",
              url: "https://example.com/party.png",
            },
          ],
          selectAction: { type: "event", name: "select-emoji" } as never,
        }}
      />,
    );

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
