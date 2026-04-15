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
          content: "# Hello\n\nPreview mode",
          mode: "preview",
          toolbar: false,
        }}
      />,
    );

    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Preview mode")).toBeDefined();
  });
});
