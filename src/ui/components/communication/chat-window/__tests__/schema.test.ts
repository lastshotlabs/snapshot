// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { chatWindowConfigSchema } from "../schema";

describe("chatWindowConfigSchema", () => {
  it("accepts a minimal chat window config", () => {
    const result = chatWindowConfigSchema.safeParse({
      type: "chat-window",
      data: "GET /api/messages",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a ref-backed input placeholder", () => {
    const result = chatWindowConfigSchema.safeParse({
      type: "chat-window",
      data: "GET /api/messages",
      inputPlaceholder: { from: "state.chat.placeholder" },
    });

    expect(result.success).toBe(true);
  });
});
