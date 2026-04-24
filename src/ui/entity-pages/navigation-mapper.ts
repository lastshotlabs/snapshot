import type {
  AppConfig,
  NavItem,
  NavigationConfig as SnapshotNavigationConfig,
} from "../manifest/types";
import type { NavConfig } from "../components/layout/nav/schema";
import type {
  NavigationConfig as BunshotNavigationConfig,
  NavigationItem,
} from "./bunshot-types";

/**
 * Maps bunshot navigation config to Snapshot manifest navigation config.
 *
 * @param config - Bunshot navigation config.
 * @returns Snapshot navigation config, or `undefined` for `shell: 'none'`.
 */
export function mapNavigation(
  config: BunshotNavigationConfig,
): SnapshotNavigationConfig | undefined {
  if (config.shell === "none") {
    return undefined;
  }

  return {
    mode: config.shell,
    items: config.items.map((item) => mapManifestNavigationItem(item)),
  };
}

/**
 * Maps bunshot shell metadata into Snapshot app config.
 *
 * @param config - Bunshot navigation config.
 * @returns Snapshot app config.
 */
export function mapAppConfig(config: BunshotNavigationConfig): AppConfig {
  return {
    title: config.title,
    shell: config.shell === "none" ? "full-width" : config.shell,
  };
}

/**
 * Builds a Nav component config for the SSR shell wrapper.
 *
 * @param config - Bunshot navigation config.
 * @returns Nav component config, or `undefined` for `shell: 'none'`.
 */
export function mapNavComponentConfig(
  config: BunshotNavigationConfig,
): NavConfig | undefined {
  if (config.shell === "none") {
    return undefined;
  }

  return {
    type: "nav",
    items: config.items.map((item) => mapManifestNavigationItem(item)),
    collapsible: true,
    ...(config.title || typeof config.logo === "string"
      ? {
          logo: {
            ...(typeof config.logo === "string" ? { src: config.logo } : {}),
            ...(config.title ? { text: config.title } : {}),
            path: "/",
          },
        }
      : {}),
    ...(config.userMenu && config.userMenu.length > 0
      ? {
          userMenu: {
            items: config.userMenu.map((item) => ({
              label: item.label,
              ...(item.icon ? { icon: item.icon } : {}),
              action: {
                type: "navigate",
                to: item.path,
              },
            })),
          },
        }
      : {}),
  };
}

function mapManifestNavigationItem(item: NavigationItem): NavItem {
  const badge =
    typeof item.badge === "string"
      ? Number.isFinite(Number(item.badge))
        ? Number(item.badge)
        : undefined
      : item.badge
        ? {
            from: `state.badge-${sanitizeBadgeKey(item.path)}`,
          }
        : undefined;

  return {
    label: item.label,
    path: item.path,
    ...(item.icon ? { icon: item.icon } : {}),
    ...(item.children?.length
      ? {
          children: item.children.map((child) =>
            mapManifestNavigationItem(child),
          ),
        }
      : {}),
    ...(item.auth && item.auth !== "none" ? { authenticated: true } : {}),
    ...(item.permission ? { roles: [item.permission] } : {}),
    ...(badge !== undefined ? { badge } : {}),
  };
}

function sanitizeBadgeKey(path: string): string {
  return path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}
