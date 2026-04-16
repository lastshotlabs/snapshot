import type { PageConfig } from "../manifest/types";
export type PresetName = "crud" | "dashboard" | "settings" | "auth";
/** Validate a named preset config and expand it into the equivalent page config. */
export declare function expandPreset(preset: string, presetConfig: unknown): PageConfig;
