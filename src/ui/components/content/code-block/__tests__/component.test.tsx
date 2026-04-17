// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "../component";

const refValues: Record<string, unknown> = {
  "codeBlock.title": "resolved.ts",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
  usePublish: () => vi.fn(),
}));

describe("CodeBlock", () => {
  const writeText = vi.fn();

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  it("renders title metadata and copies code", () => {
    const { container } = render(
      <CodeBlock
        config={{
          type: "code-block",
          id: "answer-code",
          className: "code-block-root",
          code: "const answer = 42;",
          language: "typescript",
          title: "answer.ts",
          showLineNumbers: true,
          maxHeight: "240px",
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="answer-code"]')?.className,
    ).toContain("code-block-root");
    expect(
      (container.querySelector('[data-snapshot-id="answer-code"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("");
    expect(
      (container.querySelector('[data-snapshot-id="answer-code-body"]') as HTMLElement | null)
        ?.style.maxHeight,
    ).toBe("240px");
    expect(screen.getByTestId("code-block-title").textContent).toBe("answer.ts");
    expect(screen.getByTestId("code-block-language").textContent).toBe("typescript");
    expect(screen.getByTestId("code-block-line-numbers").textContent).toContain("1");

    fireEvent.click(screen.getByTestId("code-block-copy"));

    expect(writeText).toHaveBeenCalledWith("const answer = 42;");
  });

  it("renders ref-backed titles", () => {
    render(
      <CodeBlock
        config={{
          type: "code-block",
          code: "const answer = 42;",
          title: { from: "codeBlock.title" } as never,
        }}
      />,
    );

    expect(screen.getByTestId("code-block-title").textContent).toBe(
      "resolved.ts",
    );
  });
});
