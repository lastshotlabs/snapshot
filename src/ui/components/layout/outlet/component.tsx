'use client';

import { useMemo } from "react";
import { atom } from "jotai";
import { Provider as JotaiProvider, useAtomValue } from "jotai/react";
import { createStore } from "jotai/vanilla";
import { ComponentRenderer, PageRenderer } from "../../../manifest/renderer";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { OutletConfig } from "./types";

const outletDepthAtom = atom(0);

/**
 * Layout outlet primitive used to render nested child routes from the compiled
 * manifest route tree.
 */
export function Outlet({ config }: { config: OutletConfig }) {
  const routeRuntime = useRouteRuntime();
  const manifest = useManifestRuntime();
  const outletDepth = useAtomValue(outletDepthAtom);
  const activeRoutes = routeRuntime?.match.activeRoutes ?? [];
  const childRoute = activeRoutes[outletDepth + 1] ?? null;
  const rootId = config.id ?? "outlet";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "contents",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const childStore = useMemo(() => {
    const store = createStore();
    store.set(outletDepthAtom, outletDepth + 1);
    return store;
  }, [outletDepth]);

  if (!childRoute) {
    if (!config.fallback?.length) {
      return null;
    }

    return (
      <div
        data-snapshot-component="outlet"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {config.fallback?.map((child, index) => (
          <ComponentRenderer
            key={child.id ?? `outlet-fallback-${index}`}
            config={child}
          />
        )) ?? null}
        <SurfaceStyles css={rootSurface.scopedCss} />
      </div>
    );
  }

  return (
    <div
      data-snapshot-component="outlet"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <JotaiProvider store={childStore}>
        <PageRenderer
          page={childRoute.page}
          routeId={childRoute.id}
          state={manifest?.state}
          resources={manifest?.resources}
        />
      </JotaiProvider>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
