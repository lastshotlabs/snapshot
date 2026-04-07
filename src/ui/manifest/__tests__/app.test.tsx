/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ManifestApp, injectStyleSheet } from "../app";
import type { ManifestConfig } from "../types";

// Ensure structural components are registered
import "../structural";

const minimalManifest: ManifestConfig = {
  pages: {
    "/": {
      title: "Home",
      content: [
        {
          type: "heading",
          text: "Welcome Home",
          level: 1,
        },
      ],
    },
  },
};

describe("injectStyleSheet", () => {
  afterEach(() => {
    const el = document.getElementById("test-style");
    if (el) el.remove();
  });

  it("creates a style element in the head", () => {
    injectStyleSheet("test-style", "body { margin: 0; }");
    const el = document.getElementById("test-style");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("body { margin: 0; }");
  });

  it("updates existing style element", () => {
    injectStyleSheet("test-style", "body { margin: 0; }");
    injectStyleSheet("test-style", "body { padding: 0; }");
    const el = document.getElementById("test-style");
    expect(el?.textContent).toBe("body { padding: 0; }");
    // Only one element with this id
    expect(document.querySelectorAll("#test-style").length).toBe(1);
  });
});

describe("ManifestApp", () => {
  afterEach(() => {
    const el = document.getElementById("snapshot-tokens");
    if (el) el.remove();
  });

  it("renders page content from manifest", () => {
    render(
      <ManifestApp manifest={minimalManifest} apiUrl="http://localhost" />,
    );
    expect(screen.getByText("Welcome Home")).toBeDefined();
  });

  it("applies theme tokens as injected CSS", () => {
    const manifest: ManifestConfig = {
      theme: {
        flavor: "neutral",
      },
      pages: {
        "/": {
          content: [{ type: "heading", text: "Themed" }],
        },
      },
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    const style = document.getElementById("snapshot-tokens");
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain(":root");
  });

  it("renders without theme config", () => {
    render(
      <ManifestApp manifest={minimalManifest} apiUrl="http://localhost" />,
    );
    expect(screen.getByText("Welcome Home")).toBeDefined();
  });

  it("renders manifest with multiple pages (shows current path)", () => {
    const manifest: ManifestConfig = {
      pages: {
        "/": {
          content: [{ type: "heading", text: "Home Page" }],
        },
        "/about": {
          content: [{ type: "heading", text: "About Page" }],
        },
      },
    };

    // In happy-dom, window.location.pathname defaults to "/"
    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    expect(screen.getByText("Home Page")).toBeDefined();
  });
});
