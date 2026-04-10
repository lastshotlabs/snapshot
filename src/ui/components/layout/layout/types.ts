import type { ReactNode } from "react";
import type { LayoutConfig } from "./schema";

/** Named slot content map for slot-aware layouts. */
export type LayoutSlots = Record<string, ReactNode>;

/** Props for the Layout component. */
export interface LayoutProps {
  /** Layout configuration from the manifest. */
  config: LayoutConfig;
  /** The nav element to render in the layout (sidebar or top). */
  nav?: ReactNode;
  /** Optional named slot content for slot-aware layout variants. */
  slots?: LayoutSlots;
  /** The page content to render inside the layout. */
  children: ReactNode;
}

/** Layout variant type extracted from the schema. */
export type LayoutVariant = LayoutConfig["variant"];
