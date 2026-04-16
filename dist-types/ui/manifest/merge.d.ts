import type { ManifestConfig } from "./types";
export type ManifestFragment = Partial<ManifestConfig>;
export declare function mergeFragment(base: ManifestConfig, fragment: ManifestFragment): ManifestConfig;
