'use client';

import React, { useMemo } from "react";
import type { CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom } from "../../../context/hooks";
import { useAutoBreadcrumbs } from "../../../hooks/use-auto-breadcrumbs";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { BreadcrumbBase } from "./standalone";
import type { BreadcrumbBaseItem } from "./standalone";
import type { BreadcrumbConfig, BreadcrumbItemConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, auto-breadcrumbs, and route navigation,
 * delegates rendering to BreadcrumbBase.
 */
export function BreadcrumbComponent({ config }: { config: BreadcrumbConfig }) {
  const execute = useActionExecutor();
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ items: config.items });
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();

  const autoItems = useAutoBreadcrumbs(
    manifest?.app.breadcrumbs?.auto || (config.source ?? "manual") === "route"
      ? {
          auto: true,
          home:
            config.includeHome === false
              ? undefined
              : manifest?.app.breadcrumbs?.home ??
                (manifest?.app.home
                  ? {
                      label: "Home",
                      href: manifest.app.home,
                    }
                  : undefined),
          separator: manifest?.app.breadcrumbs?.separator ?? "/",
          labels: manifest?.app.breadcrumbs?.labels,
        }
      : undefined,
  );

  const resolvedItems = useMemo<BreadcrumbBaseItem[]>(() => {
    const baseItems = (config.items?.length
      ? ((resolvedConfig.items as BreadcrumbConfig["items"] | undefined) ??
        config.items)
      : autoItems) as BreadcrumbItemConfig[];

    return baseItems.map((item: BreadcrumbItemConfig) => ({
      label: resolveOptionalPrimitiveValue(item.label, primitiveOptions) ?? "",
      path: resolveOptionalPrimitiveValue(item.path, primitiveOptions),
      icon: item.icon,
      slots: item.slots as Record<string, Record<string, unknown>>,
    }));
  }, [autoItems, config.items, primitiveOptions, resolvedConfig.items]);

  const handleNavigate = (item: BreadcrumbBaseItem, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (config.action) {
      event.preventDefault();
      void execute(config.action);
      return;
    }

    if (item.path && routeRuntime?.navigate) {
      event.preventDefault();
      routeRuntime.navigate(item.path);
    }
  };

  return (
    <BreadcrumbBase
      id={config.id}
      items={resolvedItems}
      separator={config.separator}
      maxItems={config.maxItems}
      onNavigate={handleNavigate}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
