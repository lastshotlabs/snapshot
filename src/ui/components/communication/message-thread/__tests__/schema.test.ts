// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { messageThreadConfigSchema } from "../schema";

describe("messageThreadConfigSchema", () => {
  it("accepts a minimal message-thread config", () => {
    const result = messageThreadConfigSchema.safeParse({
      type: "message-thread",
      data: "GET /api/messages",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed empty message", () => {
    const result = messageThreadConfigSchema.safeParse({
      type: "message-thread",
      data: "GET /api/messages",
      emptyMessage: { from: "state.thread.empty" },
    });

    expect(result.success).toBe(true);
  });
});
