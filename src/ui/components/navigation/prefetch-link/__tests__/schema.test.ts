// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { prefetchLinkSchema } from "../schema";

describe("prefetchLinkSchema", () => {
  it("accepts a minimal valid config", () => {
    const result = prefetchLinkSchema.safeParse({ to: "/posts" });
    expect(result.success).toBe(true);
  });

  it("applies default prefetch value of 'hover'", () => {
    const result = prefetchLinkSchema.parse({ to: "/posts" });
    expect(result.prefetch).toBe("hover");
  });

  it("accepts prefetch: 'hover'", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      prefetch: "hover",
    });
    expect(result.success).toBe(true);
  });

  it("accepts prefetch: 'viewport'", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      prefetch: "viewport",
    });
    expect(result.success).toBe(true);
  });

  it("accepts prefetch: 'none'", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      prefetch: "none",
    });
    expect(result.success).toBe(true);
  });

  it("accepts prefetch: 'eager'", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      prefetch: "eager",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty 'to' string", () => {
    const result = prefetchLinkSchema.safeParse({ to: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing 'to' field", () => {
    const result = prefetchLinkSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts optional className", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      className: "my-link",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.className).toBe("my-link");
  });

  it("accepts optional target", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      target: "_blank",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.target).toBe("_blank");
  });

  it("accepts optional rel", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      rel: "noopener noreferrer",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rel).toBe("noopener noreferrer");
  });

  it("accepts all optional fields together", () => {
    const result = prefetchLinkSchema.safeParse({
      to: "/posts",
      prefetch: "viewport",
      id: "prefetch-link",
      className: "nav-link",
      style: {
        color: "red",
      },
      slots: {
        root: {
          className: "prefetch-slot",
        },
      },
      target: "_blank",
      rel: "noopener",
    });
    expect(result.success).toBe(true);
  });
});
