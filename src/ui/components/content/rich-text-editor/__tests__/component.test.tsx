// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RichTextEditor } from "../component";

const refValues: Record<string, unknown> = {
  "editor.placeholder": "Resolved placeholder",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
  usePublish: () => null,
}));

vi.mock("../../../../icons/icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe("RichTextEditor", () => {
  afterEach(() => {
    cleanup();
  });

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

  it("accepts ref-backed placeholders in edit mode", () => {
    render(
      <RichTextEditor
        config={{
          type: "rich-text-editor",
          content: "",
          placeholder: { from: "editor.placeholder" } as never,
        }}
      />,
    );

    expect(screen.getByTestId("rich-text-editor")).toBeTruthy();
  });
});
