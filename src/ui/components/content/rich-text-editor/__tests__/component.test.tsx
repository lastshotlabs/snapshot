// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => null,
}));

vi.mock("../../../../icons/icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe("RichTextEditor", () => {
  it("renders preview mode without creating an editor instance", () => {
    render(
      <RichTextEditor
        config={{
          type: "rich-text-editor",
          id: "article-editor",
          className: "rich-text-root",
          content: "# Hello\n\nPreview mode",
          mode: "preview",
          toolbar: false,
          minHeight: "220px",
          maxHeight: "360px",
        }}
      />,
    );

    expect(screen.getByTestId("rich-text-editor").classList.contains("rich-text-root")).toBe(
      true,
    );
    expect((screen.getByTestId("rich-text-editor") as HTMLElement).style.minHeight).toBe("");
    expect((screen.getByTestId("rich-text-editor") as HTMLElement).style.maxHeight).toBe("");
    expect(
      (
        document.querySelector('[data-snapshot-id="article-editor-content"]') as
          | HTMLElement
          | null
      )?.style.minHeight,
    ).toBe("220px");
    expect(
      (
        document.querySelector('[data-snapshot-id="article-editor-content"]') as
          | HTMLElement
          | null
      )?.style.maxHeight,
    ).toBe("360px");
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Preview mode")).toBeDefined();
  });
});
