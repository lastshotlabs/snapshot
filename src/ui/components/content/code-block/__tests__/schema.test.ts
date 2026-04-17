// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { codeBlockConfigSchema } from "../schema";

describe("codeBlockConfigSchema", () => {
  it("accepts a code block config", () => {
    const result = codeBlockConfigSchema.safeParse({
      type: "code-block",
      code: "const answer = 42;",
      language: "typescript",
      showLineNumbers: true,
      showCopy: true,
      title: "answer.ts",
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed titles", () => {
    const result = codeBlockConfigSchema.safeParse({
      type: "code-block",
      code: "const answer = 42;",
      title: { from: "codeBlock.title" },
    });

    expect(result.success).toBe(true);
  });
});
