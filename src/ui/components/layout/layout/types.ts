import type { ReactNode } from "react";

export interface LayoutConfig extends Record<string, unknown> {
  variant?: LayoutVariant;
}

/** Named slot content map for slot-aware layouts. */
export type LayoutSlots = Record<string, ReactNode>;

/** Props for the Layout component. */
export interface LayoutProps {
  /** Layout configuration. */
  config: LayoutConfig;
  /** The nav element to render in the layout (sidebar or top). */
  nav?: ReactNode;
  /** Optional named slot content for slot-aware layout variants. */
  slots?: LayoutSlots;
  /** The page content to render inside the layout. */
  children: ReactNode;
}

/** Layout variant type extracted from the schema. */
export type LayoutVariant =
  | "centered"
  | "sidebar"
  | "top-nav"
  | "dashboard"
  | "split"
  | "auth";
