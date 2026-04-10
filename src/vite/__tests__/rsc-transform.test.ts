// snapshot/src/vite/__tests__/rsc-transform.test.ts
// Unit tests for the rscTransform() Vite plugin.
//
// These tests exercise the plugin's transform() hook by calling it directly,
// simulating both server and client build contexts.

import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { rscTransform } from '../rsc-transform';
import type { Plugin, ResolvedConfig } from 'vite';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a plugin instance pre-configured for a given build context.
 * Calls `configResolved` with a minimal resolved config shape.
 */
function createPlugin(options: { isSsrBuild: boolean; root?: string }): Plugin {
  const plugin = rscTransform();
  const root = options.root ?? '/project';
  const pluginContext = {
    error(message: string): never {
      throw new Error(message);
    },
    warn() {},
    info() {},
    debug() {},
    meta: {},
  };

  // Minimal ResolvedConfig subset — only the fields the plugin reads.
  const resolvedConfig = {
    root,
    build: {
      ssr: options.isSsrBuild ? 'src/ssr/entry-server.ts' : false,
      outDir: options.isSsrBuild ? 'dist/server' : 'dist/client',
    },
  } as unknown as ResolvedConfig;

  if (typeof plugin.configResolved === 'function') {
    plugin.configResolved.call(pluginContext as never, resolvedConfig);
  }

  return plugin;
}

/**
 * Call the plugin's transform hook with the given code and file ID.
 * Returns the result or null if the plugin didn't transform the file.
 */
function callTransform(
  plugin: Plugin,
  code: string,
  id: string,
): { code: string; map: null } | null {
  if (typeof plugin.transform !== 'function') return null;
  const pluginContext = {
    error(message: string): never {
      throw new Error(message);
    },
    warn() {},
    info() {},
    debug() {},
    meta: {},
  };
  // transform() can return string | TransformResult | null | undefined
  const result = plugin.transform.call(
    pluginContext as never,
    code,
    id,
  ) as { code: string; map: null } | null | undefined;
  return result ?? null;
}

// ─── Client build ─────────────────────────────────────────────────────────────

describe('rscTransform — client build', () => {
  const plugin = createPlugin({ isSsrBuild: false, root: '/project' });
  const id = '/project/src/components/Button.tsx';

  it('returns null for files without \'use client\'', () => {
    const code = "import React from 'react';\nexport default function Button() {}";
    expect(callTransform(plugin, code, id)).toBeNull();
  });

  it('returns null for \'use client\' files (ships original to browser)', () => {
    const code = "'use client'\nimport React from 'react';\nexport default function Button() {}";
    // Client build: leave unchanged → null means "no transform"
    expect(callTransform(plugin, code, id)).toBeNull();
  });

  it('skips node_modules', () => {
    const code = "'use client'\nexport default function Lib() {}";
    const nodeModuleId = '/project/node_modules/some-lib/index.tsx';
    expect(callTransform(plugin, code, nodeModuleId)).toBeNull();
  });

  it('skips virtual modules', () => {
    const code = "'use client'\nexport default function Virtual() {}";
    const virtualId = '\0virtual:my-module';
    expect(callTransform(plugin, code, virtualId)).toBeNull();
  });

  it('skips non-JS/TS files', () => {
    const code = "'use client'\n.button { color: red; }";
    const cssId = '/project/src/components/Button.css';
    expect(callTransform(plugin, code, cssId)).toBeNull();
  });
});

// ─── Server build ─────────────────────────────────────────────────────────────

describe('rscTransform — server build', () => {
  const plugin = createPlugin({ isSsrBuild: true, root: '/project' });
  const id = '/project/src/components/Button.tsx';

  it('returns null for files without \'use client\'', () => {
    const code = "export default function ServerComponent() {}";
    expect(callTransform(plugin, code, id)).toBeNull();
  });

  it('replaces \'use client\' file with a client reference stub', () => {
    const code = [
      "'use client'",
      "import React from 'react';",
      "export default function Button() { return <button>Click</button>; }",
      "export const IconButton = () => <button />;",
    ].join('\n');

    const result = callTransform(plugin, code, id);
    expect(result).not.toBeNull();
    expect(result!.code).toContain("createClientReference");
    expect(result!.code).toContain("react-server-dom-webpack/server");
    expect(result!.map).toBeNull();
  });

  it('includes the relative path in the client reference ID', () => {
    const code = "'use client'\nexport default function Foo() {}";
    const result = callTransform(plugin, code, id);
    expect(result).not.toBeNull();
    // The relative path should be src/components/Button.tsx
    expect(result!.code).toContain('src/components/Button.tsx');
  });

  it('emits a stub for the default export', () => {
    const code = "'use client'\nexport default function MyComp() {}";
    const result = callTransform(plugin, code, id);
    expect(result).not.toBeNull();
    expect(result!.code).toContain('#default');
  });

  it('emits stubs for named exports', () => {
    const code = [
      "'use client'",
      "export function PrimaryButton() {}",
      "export const SecondaryButton = () => null;",
    ].join('\n');

    const result = callTransform(plugin, code, id);
    expect(result).not.toBeNull();
    expect(result!.code).toContain('PrimaryButton');
    expect(result!.code).toContain('SecondaryButton');
    expect(result!.code).toContain('src/components/Button.tsx#PrimaryButton');
    expect(result!.code).toContain('src/components/Button.tsx#SecondaryButton');
  });

  it('returns a minimal stub when no exports are found', () => {
    // A 'use client' file with no exports is unusual but should be handled.
    const code = "'use client'\n// no exports here";
    const result = callTransform(plugin, code, id);
    expect(result).not.toBeNull();
    // Should not throw; should return some non-empty code
    expect(typeof result!.code).toBe('string');
  });

  it('skips double-quoted \'use client\' in non-matching files', () => {
    // A regular server component should not be transformed.
    const code = "// This is a server component\nexport function ServerComp() {}";
    expect(callTransform(plugin, code, id)).toBeNull();
  });
});

// ─── Component ID format ──────────────────────────────────────────────────────

describe('rscTransform — component ID format', () => {
  it('uses # as separator between path and export name', () => {
    const plugin = createPlugin({ isSsrBuild: true, root: '/project' });
    const code = "'use client'\nexport function Card() {}";
    const fileId = '/project/src/ui/components/data/stat-card/component.tsx';

    const result = callTransform(plugin, code, fileId);
    expect(result).not.toBeNull();
    expect(result!.code).toContain(
      'src/ui/components/data/stat-card/component.tsx#Card',
    );
  });
});
