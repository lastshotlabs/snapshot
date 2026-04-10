import type {
  OverlayConfig,
  PageConfig,
  ResourceConfigMap,
  StateConfig,
} from "../manifest/types";
import {
  type PageDeclaration,
  type PageLoaderResult,
} from "./bunshot-types";
import { mapEntityDashboardPage } from "./dashboard-mapper";
import { mapEntityDetailPage } from "./detail-mapper";
import { mapEntityFormPage } from "./form-mapper";
import { mapEntityListPage } from "./list-mapper";

/**
 * Result of mapping a bunshot page declaration to Snapshot manifest structures.
 */
export interface EntityPageMapResult {
  /** Page content config. */
  readonly page: PageConfig;
  /** Resources needed by client-side interactions. */
  readonly resources: Readonly<ResourceConfigMap>;
  /** Route-scoped state pre-seeded with server-fetched data. */
  readonly state: Readonly<StateConfig>;
  /** Overlay definitions needed by the page. */
  readonly overlays: Readonly<Record<string, OverlayConfig>>;
}

/**
 * Maps a bunshot page loader result to Snapshot manifest structures.
 *
 * @param result - Entity page loader result from bunshot SSR.
 * @returns Snapshot-compatible page structures.
 */
export function mapPageDeclaration(
  result: PageLoaderResult,
): EntityPageMapResult {
  const declaration = result.declaration.declaration;

  switch (declaration.type) {
    case "entity-list":
      return mapEntityListPage(result);
    case "entity-detail":
      return mapEntityDetailPage(result);
    case "entity-form":
      return mapEntityFormPage(result);
    case "entity-dashboard":
      return mapEntityDashboardPage(result);
    case "custom":
      throw new Error(
        "Custom pages are handled by the renderer, not mapPageDeclaration().",
      );
  }
}

/**
 * Returns true when the page declaration is a custom handler-ref page.
 *
 * @param declaration - Bunshot page declaration.
 * @returns Whether the declaration is custom.
 */
export function isCustomPage(declaration: PageDeclaration): boolean {
  return declaration.type === "custom";
}
