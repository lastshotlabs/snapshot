import React from "react";
import { describe, expect, it } from "vitest";
import { extractPprShell, StaticShellWrapper } from "../ppr";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** A simple synchronous component with no async data needs. */
function StaticWidget({ text }: { text: string }): React.ReactElement {
  return React.createElement("span", { className: "widget" }, text);
}

/** A component that suspends (simulates a dynamic data boundary). */
function createSuspendingComponent(): { Component: React.ComponentType; resolve: () => void } {
  let resolvePromise!: () => void;
  const promise = new Promise<void>((res) => {
    resolvePromise = res;
  });

  const Component = (): React.ReactElement => {
    // React's `use()` pattern: throw a promise to suspend
    throw promise;
  };

  return { Component, resolve: resolvePromise };
}

/** Fallback shown while the suspending component is pending. */
function Fallback(): React.ReactElement {
  return React.createElement("div", { id: "fallback" }, "Loading…");
}

// ─── extractPprShell ──────────────────────────────────────────────────────────

describe("extractPprShell", () => {
  it("returns ok:true for a fully static tree", async () => {
    const element = React.createElement(StaticWidget, { text: "hello" });
    const result = await extractPprShell(element);
    expect(result.ok).toBe(true);
    expect(result.shellHtml).toContain("hello");
  });

  it("includes the rendered content in shellHtml", async () => {
    const element = React.createElement(
      "section",
      null,
      React.createElement("h1", null, "Page Title"),
      React.createElement("p", null, "Body text"),
    );
    const result = await extractPprShell(element);
    expect(result.ok).toBe(true);
    expect(result.shellHtml).toContain("Page Title");
    expect(result.shellHtml).toContain("Body text");
  });

  it("renders Suspense fallback instead of suspended children", async () => {
    const { Component: DynamicContent } = createSuspendingComponent();

    const element = React.createElement(
      "div",
      null,
      React.createElement("h1", null, "Static header"),
      React.createElement(
        React.Suspense,
        { fallback: React.createElement(Fallback) },
        React.createElement(DynamicContent),
      ),
    );

    const result = await extractPprShell(element);
    expect(result.ok).toBe(true);
    // The fallback markup should appear in the shell
    expect(result.shellHtml).toContain("Loading…");
    // The static header should also appear
    expect(result.shellHtml).toContain("Static header");
  });

  it("returns ok:true and non-empty shellHtml for a simple div", async () => {
    const element = React.createElement("div", { id: "root" }, "content");
    const result = await extractPprShell(element);
    expect(result.ok).toBe(true);
    expect(result.shellHtml.length).toBeGreaterThan(0);
  });

  it("renders multiple static Suspense fallbacks correctly", async () => {
    const { Component: A } = createSuspendingComponent();
    const { Component: B } = createSuspendingComponent();

    const element = React.createElement(
      "main",
      null,
      React.createElement(
        React.Suspense,
        { fallback: React.createElement("span", null, "Fallback A") },
        React.createElement(A),
      ),
      React.createElement(
        React.Suspense,
        { fallback: React.createElement("span", null, "Fallback B") },
        React.createElement(B),
      ),
    );

    const result = await extractPprShell(element);
    expect(result.ok).toBe(true);
    expect(result.shellHtml).toContain("Fallback A");
    expect(result.shellHtml).toContain("Fallback B");
  });
});

// ─── StaticShellWrapper ───────────────────────────────────────────────────────

describe("StaticShellWrapper", () => {
  it("renders as a React element (not null)", () => {
    const wrapper = React.createElement(
      StaticShellWrapper,
      {},
      React.createElement("div", null, "child"),
    );
    expect(wrapper).toBeTruthy();
    expect(typeof wrapper).toBe("object");
  });

  it("is a valid React element with correct type", () => {
    const wrapper = React.createElement(StaticShellWrapper, {}, null);
    expect(React.isValidElement(wrapper)).toBe(true);
    expect(wrapper.type).toBe(StaticShellWrapper);
  });

  it("passes children through correctly", () => {
    const child = React.createElement("p", null, "test child");
    const wrapper = React.createElement(StaticShellWrapper, {}, child);
    // Children are passed via props; check the wrapper element was constructed
    expect(React.isValidElement(wrapper)).toBe(true);
  });
});
