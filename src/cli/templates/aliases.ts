// Single source of truth for path aliases used in vite.config.ts and tsconfig.json
export const ALIASES = [
  "lib",
  "components",
  "pages",
  "hooks",
  "api",
  "store",
  "styles",
  "types",
] as const;
export type Alias = (typeof ALIASES)[number];
