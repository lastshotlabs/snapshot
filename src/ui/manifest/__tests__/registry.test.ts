/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerComponent,
  getRegisteredComponent,
} from "../component-registry";

describe("registerComponent", () => {
  it("registers and retrieves a component", () => {
    const MockComponent = ({ config }: { config: Record<string, unknown> }) =>
      null;
    registerComponent("test-widget", MockComponent);

    const result = getRegisteredComponent("test-widget");
    expect(result).toBe(MockComponent);
  });

  it("returns undefined for unregistered types", () => {
    const result = getRegisteredComponent("does-not-exist");
    expect(result).toBeUndefined();
  });

  it("returns CustomComponentWrapper for 'custom' type", () => {
    const result = getRegisteredComponent("custom");
    expect(result).toBeDefined();
    expect(result).not.toBeUndefined();
  });

  it("allows overriding a registered component", () => {
    const First = ({ config }: { config: Record<string, unknown> }) => null;
    const Second = ({ config }: { config: Record<string, unknown> }) => null;

    registerComponent("override-test", First);
    expect(getRegisteredComponent("override-test")).toBe(First);

    registerComponent("override-test", Second);
    expect(getRegisteredComponent("override-test")).toBe(Second);
  });

  it("warns in development when overriding", () => {
    const originalEnv = process.env["NODE_ENV"];
    process.env["NODE_ENV"] = "development";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const First = ({ config }: { config: Record<string, unknown> }) => null;
    const Second = ({ config }: { config: Record<string, unknown> }) => null;

    registerComponent("warn-test", First);
    registerComponent("warn-test", Second);

    expect(warnSpy).toHaveBeenCalledWith(
      '[snapshot] Overriding component "warn-test"',
    );

    warnSpy.mockRestore();
    process.env["NODE_ENV"] = originalEnv;
  });
});
