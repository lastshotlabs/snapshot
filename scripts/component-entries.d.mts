export interface ComponentEntry {
  name: string;
  domain: string;
  source: string;
  discoveredSource: string;
  exportKey: `./ui/${string}`;
  importPath: `./dist/ui/${string}.js`;
  requirePath: `./dist/ui/${string}.cjs`;
  typesPath: `./dist-types/${string}.d.ts`;
}

export function collectComponentEntries(repoRoot?: string): ComponentEntry[];
export function componentTsupEntries(repoRoot?: string): Record<string, string>;
export function repoRootFrom(importMetaUrl: string): string;
