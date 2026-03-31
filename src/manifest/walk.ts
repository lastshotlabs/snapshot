import type { ComponentConfig, FrontendManifest } from "./schema";

/**
 * Recursively walks a component config tree, calling `fn` for each component.
 * Handles children, sidebar, and content slots.
 */
export function walkComponents(
  components: ComponentConfig[],
  pagePath: string,
  fn: (component: ComponentConfig, path: string) => void,
): void {
  for (let i = 0; i < components.length; i++) {
    const comp = components[i]!;
    const compPath = `${pagePath}.components[${i}]`;
    fn(comp, compPath);

    if (comp.children && Array.isArray(comp.children)) {
      walkComponents(comp.children as ComponentConfig[], compPath, fn);
    }
    if (comp.sidebar && Array.isArray(comp.sidebar)) {
      walkComponents(comp.sidebar as ComponentConfig[], `${compPath}.sidebar`, fn);
    }
    if (comp.content && Array.isArray(comp.content)) {
      walkComponents(comp.content as ComponentConfig[], `${compPath}.content`, fn);
    }
  }
}

/**
 * Walks all components across all pages in a manifest.
 */
export function walkAllComponents(
  manifest: FrontendManifest,
  fn: (component: ComponentConfig, path: string) => void,
): void {
  for (const [pagePath, page] of Object.entries(manifest.pages)) {
    walkComponents(page.components, `pages.${pagePath}`, fn);
  }
}
