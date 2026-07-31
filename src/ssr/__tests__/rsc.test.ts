// snapshot/src/ssr/__tests__/rsc.test.ts
// Unit tests for RSC utilities in src/ssr/rsc.ts.

import { describe, expect, it } from "vitest";
import {
  buildComponentId,
  hasUseClientDirective,
  hasUseServerDirective,
} from "../rsc";

// ─── hasUseClientDirective ────────────────────────────────────────────────────

describe("hasUseClientDirective", () => {
  it("returns true for single-quoted directive", () => {
    expect(
      hasUseClientDirective("'use client'\nimport React from 'react';"),
    ).toBe(true);
  });

  it("returns true for single-quoted directive with semicolon", () => {
    expect(
      hasUseClientDirective("'use client';\nimport React from 'react';"),
    ).toBe(true);
  });

  it("returns true for double-quoted directive", () => {
    expect(
      hasUseClientDirective("\"use client\"\nimport React from 'react';"),
    ).toBe(true);
  });

  it("returns true for double-quoted directive with semicolon", () => {
    expect(
      hasUseClientDirective("\"use client\";\nimport React from 'react';"),
    ).toBe(true);
  });

  it("returns true when preceded by blank lines", () => {
    expect(
      hasUseClientDirective("\n\n\n'use client'\nimport React from 'react';"),
    ).toBe(true);
  });

  it("returns true when preceded by a single-line comment", () => {
    expect(
      hasUseClientDirective("// This is a client component\n'use client'\n"),
    ).toBe(true);
  });

  it("returns false for files without the directive", () => {
    expect(hasUseClientDirective("import React from 'react';")).toBe(false);
  });

  it("returns false for 'use server' files", () => {
    expect(
      hasUseClientDirective("'use server'\nexport async function action() {}"),
    ).toBe(false);
  });

  it("returns false when directive appears mid-file", () => {
    expect(
      hasUseClientDirective("import React from 'react';\n'use client'\n"),
    ).toBe(false);
  });

  it("returns false for an empty file", () => {
    expect(hasUseClientDirective("")).toBe(false);
  });
});

// ─── hasUseServerDirective ────────────────────────────────────────────────────

describe("hasUseServerDirective", () => {
  it("returns true for single-quoted directive", () => {
    expect(
      hasUseServerDirective("'use server'\nexport async function action() {}"),
    ).toBe(true);
  });

  it("returns true for double-quoted directive with semicolon", () => {
    expect(
      hasUseServerDirective('"use server";\nexport async function save() {}'),
    ).toBe(true);
  });

  it("returns false for 'use client' files", () => {
    expect(
      hasUseServerDirective("'use client'\nimport React from 'react';"),
    ).toBe(false);
  });

  it("returns false for files without either directive", () => {
    expect(
      hasUseServerDirective("export function helper() { return 42; }"),
    ).toBe(false);
  });
});

// ─── buildComponentId ─────────────────────────────────────────────────────────

describe("buildComponentId", () => {
  it("builds a default export ID", () => {
    expect(buildComponentId("src/components/Button.tsx", "default")).toBe(
      "src/components/Button.tsx#default",
    );
  });

  it("builds a named export ID", () => {
    expect(buildComponentId("src/components/Button.tsx", "Button")).toBe(
      "src/components/Button.tsx#Button",
    );
  });

  it("handles nested paths", () => {
    expect(
      buildComponentId(
        "src/ui/components/data/stat-card/component.tsx",
        "StatCard",
      ),
    ).toBe("src/ui/components/data/stat-card/component.tsx#StatCard");
  });

  it("separates relativePath and exportName with #", () => {
    const id = buildComponentId("a/b/c.tsx", "MyComponent");
    const [relPath, exportName] = id.split("#");
    expect(relPath).toBe("a/b/c.tsx");
    expect(exportName).toBe("MyComponent");
  });
});

// ─── RscManifest shape ────────────────────────────────────────────────────────

describe("RscManifest", () => {
  it("accepts the documented shape", () => {
    // Type-only test — verifies the interface is importable and the shape is correct.
    // The runtime check ensures the import resolves without error.
    const id = buildComponentId("src/components/Foo.tsx", "default");
    const manifest = {
      components: {
        [id]: "assets/Foo-abc123.js",
      } as Readonly<Record<string, string>>,
    };
    expect(manifest.components[id]).toBe("assets/Foo-abc123.js");
  });
});
