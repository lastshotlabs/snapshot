import type { z } from "zod";
import type {
  manifestConfigSchema,
  authScreenConfigSchema,
  pageConfigSchema,
  baseComponentConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  customComponentConfigSchema,
} from "./schema";
import type { FromRef } from "../context/types";
import type { Responsive } from "../tokens/types";

// ── Inferred types from Zod schemas ─────────────────────────────────────────

/** The complete manifest schema for a snapshot application. */
export type ManifestConfig = z.infer<typeof manifestConfigSchema>;

/** Auth screen configuration for login, register, etc. */
export type AuthScreenConfig = z.infer<typeof authScreenConfigSchema>;

/** A page definition with layout, title, content tree, and access control. */
export type PageConfig = z.infer<typeof pageConfigSchema>;

/** Base config shared by all components. */
export type BaseComponentConfig = z.infer<typeof baseComponentConfigSchema>;

/** Heading component config. */
export type HeadingConfig = z.infer<typeof headingConfigSchema>;

/** Button component config. */
export type ButtonConfig = z.infer<typeof buttonConfigSchema>;

/** Select dropdown component config. */
export type SelectConfig = z.infer<typeof selectConfigSchema>;

/** Custom component escape hatch config. */
export type CustomComponentConfig = z.infer<typeof customComponentConfigSchema>;

// ── Hand-written types for recursive/lazy schemas ───────────────────────────

/** Navigation item in the sidebar or top nav. */
export interface NavItem {
  /** Display label. */
  label: string;
  /** Route path. */
  path: string;
  /** Lucide icon name. */
  icon?: string;
  /** Required roles. */
  roles?: string[];
  /** Badge value — static count or from ref. */
  badge?: number | FromRef;
  /** Nested children (renders as expandable group). */
  children?: NavItem[];
}

/** Row layout container config. Uses children recursively. */
export interface RowConfig extends BaseComponentConfig {
  type: "row";
  gap?: Responsive<"xs" | "sm" | "md" | "lg" | "xl">;
  justify?: "start" | "center" | "end" | "between" | "around";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
  children: ComponentConfig[];
}

/** Union of all component configs. */
export type ComponentConfig =
  | RowConfig
  | HeadingConfig
  | ButtonConfig
  | SelectConfig
  | CustomComponentConfig;

// ── Non-schema types ────────────────────────────────────────────────────────

/** Props for the ManifestApp component. */
export interface ManifestAppProps {
  /** The parsed manifest configuration. */
  manifest: ManifestConfig;
  /** Base URL for the API client. */
  apiUrl: string;
  /** Additional createSnapshot config overrides. */
  snapshotConfig?: Record<string, unknown>;
}

/** A React component that renders from a config object. */
export type ConfigDrivenComponent = React.ComponentType<{
  config: Record<string, unknown>;
}>;
