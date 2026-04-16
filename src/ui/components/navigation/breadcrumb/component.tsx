'use client';

import React, { useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { interpolate } from "../../../actions/interpolate";
import { useAutoBreadcrumbs } from "../../../hooks/use-auto-breadcrumbs";
import { renderIcon } from "../../../icons/render";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { BreadcrumbConfig, BreadcrumbItemConfig } from "./types";

const SEPARATORS: Record<string, string> = {
  slash: "/",
  chevron: "\u203A",
  dot: "\u00B7",
  arrow: "\u2192",
};

function collapseItems(
  items: BreadcrumbItemConfig[],
  maxItems: number,
): Array<BreadcrumbItemConfig | { label: "..."; collapsed: true }> {
  if (items.length <= maxItems) return items;
  const tail = items.slice(-(maxItems - 1));
  return [items[0]!, { label: "...", collapsed: true } as never, ...tail];
}

export function BreadcrumbComponent({ config }: { config: BreadcrumbConfig }) {
  const execute = useActionExecutor();
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const separator = SEPARATORS[config.separator ?? "chevron"] ?? "\u203A";
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
  const context = useMemo(
    () => ({
      params: routeRuntime?.params ?? {},
      route: {
        id: routeRuntime?.currentRoute?.id,
        path: routeRuntime?.currentPath,
        pattern: routeRuntime?.currentRoute?.path,
      },
    }),
    [routeRuntime],
  );

  const resolvedItems = useMemo(() => {
    const baseItems = config.items?.length ? config.items : autoItems;
    return baseItems.map((item: BreadcrumbItemConfig) => ({
      ...item,
      label: interpolate(item.label, context),
      path: item.path ? interpolate(item.path, context) : undefined,
    }));
  }, [autoItems, config.items, context]);

  const visibleItems =
    config.maxItems != null
      ? collapseItems(resolvedItems, config.maxItems)
      : resolvedItems;
  const rootId = config.id ?? "breadcrumb";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      fontSize: "sm",
      flexWrap: "wrap",
      style: {
        listStyle: "none",
        margin: 0,
        padding: 0,
      },
    },
    componentSurface: config.slots?.list,
  });

  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: BreadcrumbItemConfig,
  ) => {
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
    <nav
      aria-label="Breadcrumb"
      data-snapshot-component="breadcrumb"
      data-testid="breadcrumb"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <ol
        data-snapshot-id={`${rootId}-list`}
        className={listSurface.className}
        style={listSurface.style}
      >
        {visibleItems.map(
          (
            item: BreadcrumbItemConfig | { label: "..."; collapsed: true },
            index: number,
          ) => {
            const isLast = index === visibleItems.length - 1;
            const isCollapsed = "collapsed" in item;
            const itemSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${index}`,
              implementationBase: {
                display: "flex",
                alignItems: "center",
                gap: "xs",
              },
              componentSurface: config.slots?.item,
              itemSurface: !isCollapsed ? item.slots?.item : undefined,
            });
            const separatorSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-separator-${index}`,
              implementationBase: {
                color: "var(--sn-color-muted-foreground, #6b7280)",
              },
              componentSurface: config.slots?.separator,
            });
            const iconSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-icon-${index}`,
              implementationBase: {
                display: "inline-flex",
                alignItems: "center",
                style: { flexShrink: 0 },
              },
              componentSurface: config.slots?.icon,
              itemSurface: !isCollapsed ? item.slots?.icon : undefined,
            });
            const linkSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-link-${index}`,
              implementationBase: {
                color: "var(--sn-color-muted-foreground, #6b7280)",
                display: "inline-flex",
                alignItems: "center",
                gap: "xs",
                hover: {
                  color: "var(--sn-color-foreground, #111827)",
                },
                focus: {
                  ring: true,
                  color: "var(--sn-color-foreground, #111827)",
                },
                style: {
                  textDecoration: "none",
                },
              },
              componentSurface: config.slots?.link,
              itemSurface: !isCollapsed ? item.slots?.link : undefined,
              activeStates: isLast ? ["current"] : [],
            });
            const currentSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-current-${index}`,
              implementationBase: {
                color: "var(--sn-color-foreground, #111827)",
                display: "inline-flex",
                alignItems: "center",
                gap: "xs",
              },
              componentSurface: config.slots?.current,
              itemSurface: !isCollapsed ? item.slots?.current : undefined,
              activeStates: isLast ? ["current"] : [],
            });

            return (
              <li
                key={index}
                data-snapshot-id={`${rootId}-item-${index}`}
                className={itemSurface.className}
                style={itemSurface.style}
              >
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    data-snapshot-id={`${rootId}-separator-${index}`}
                    className={separatorSurface.className}
                    style={separatorSurface.style}
                  >
                    {separator}
                  </span>
                ) : null}

                {isCollapsed ? (
                  <span className={linkSurface.className} style={linkSurface.style}>
                    ...
                  </span>
                ) : isLast ? (
                  <span
                    aria-current="page"
                    data-snapshot-id={`${rootId}-current-${index}`}
                    className={currentSurface.className}
                    style={currentSurface.style}
                  >
                    {item.icon ? (
                      <span
                        aria-hidden="true"
                        data-snapshot-id={`${rootId}-icon-${index}`}
                        className={iconSurface.className}
                        style={iconSurface.style}
                      >
                        {renderIcon(item.icon, 14)}
                      </span>
                    ) : null}
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={(item as BreadcrumbItemConfig).path ?? "#"}
                    onClick={(event) =>
                      handleNavigate(event, item as BreadcrumbItemConfig)
                    }
                    data-snapshot-id={`${rootId}-link-${index}`}
                    className={linkSurface.className}
                    style={linkSurface.style}
                  >
                    {(item as BreadcrumbItemConfig).icon ? (
                      <span
                        aria-hidden="true"
                        data-snapshot-id={`${rootId}-icon-${index}`}
                        className={iconSurface.className}
                        style={iconSurface.style}
                      >
                        {renderIcon((item as BreadcrumbItemConfig).icon, 14)}
                      </span>
                    ) : null}
                    {item.label}
                  </a>
                )}
                <SurfaceStyles css={itemSurface.scopedCss} />
                <SurfaceStyles css={separatorSurface.scopedCss} />
                <SurfaceStyles css={iconSurface.scopedCss} />
                <SurfaceStyles css={linkSurface.scopedCss} />
                <SurfaceStyles css={currentSurface.scopedCss} />
              </li>
            );
          },
        )}
      </ol>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
    </nav>
  );
}
