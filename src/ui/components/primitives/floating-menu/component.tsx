"use client";

import type { CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { resolvePrimitiveValue } from "../resolve-value";
import { FloatingMenuBase, type FloatingMenuBaseEntry } from "./standalone";
import type { FloatingMenuConfig, FloatingMenuEntry } from "./types";

export {
  FloatingPanel,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  FloatingMenuStyles,
  type FloatingPanelProps,
  type MenuItemProps,
} from "./shared";

/**
 * Manifest-driven floating menu adapter.
 *
 * Resolves template strings and actions from manifest config, then delegates
 * all rendering to `FloatingMenuBase`.
 */
export function FloatingMenu({ config }: { config: FloatingMenuConfig }) {
  const execute = useActionExecutor();
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);

  const resolvedConfig = useResolveFrom({
    triggerLabel: config.triggerLabel,
    items: config.items ?? [],
  });

  const items = (resolvedConfig.items ?? []) as FloatingMenuEntry[];

  const templateOptions = {
    context: {
      app: manifest?.app ?? {},
      auth: manifest?.auth ?? {},
      route: {
        ...(routeRuntime?.currentRoute ?? {}),
        path: routeRuntime?.currentPath,
        params: routeRuntime?.params,
        query: routeRuntime?.query,
      },
    },
    locale: activeLocale,
    i18n: manifest?.raw.i18n,
  };

  const triggerLabel = resolvePrimitiveValue(
    resolvedConfig.triggerLabel ?? config.triggerLabel ?? "Open menu",
    templateOptions,
  );

  // Transform manifest entries to standalone entries with resolved labels and action callbacks
  const baseItems: FloatingMenuBaseEntry[] = items.map(
    (entry, index): FloatingMenuBaseEntry => {
      if (entry.type === "separator") {
        return {
          type: "separator",
          slots: entry.slots as Record<string, Record<string, unknown>>,
        };
      }

      if (entry.type === "label") {
        return {
          type: "label",
          text: resolvePrimitiveValue(entry.text, templateOptions),
          slots: entry.slots as Record<string, Record<string, unknown>>,
        };
      }

      // entry.type === "item"
      const capturedEntry = entry;
      return {
        type: "item",
        label: resolvePrimitiveValue(entry.label, templateOptions),
        icon: entry.icon,
        disabled: entry.disabled,
        destructive: entry.destructive,
        onAction: capturedEntry.action
          ? () => {
              void execute(
                capturedEntry.action as Parameters<typeof execute>[0],
              );
            }
          : undefined,
        slots: entry.slots as Record<string, Record<string, unknown>>,
      };
    },
  );

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <FloatingMenuBase
      id={config.id}
      triggerLabel={triggerLabel}
      triggerIcon={config.triggerIcon}
      items={baseItems}
      open={config.open}
      align={config.align}
      side={config.side}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
