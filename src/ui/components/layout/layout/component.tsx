'use client';

import type { CSSProperties, ReactNode } from "react";
import type { LayoutProps, LayoutSlots } from "./types";
import { resolveLayout } from "../../../layouts/registry";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

/**
 * Remap generic token vars inside the sidebar so children (nav links, buttons)
 * inherit sidebar-appropriate colors instead of the page-level palette.
 * Also ensure the nav component wrapper fills the sidebar height so
 * marginTop:auto can push the user menu to the bottom.
 */
const SIDEBAR_CONTEXT_CSS = `
  [data-layout-sidebar] {
    --sn-color-foreground: var(--sn-color-sidebar-foreground, var(--sn-color-card-foreground));
    --sn-color-muted-foreground: color-mix(in oklch, var(--sn-color-sidebar-foreground, var(--sn-color-card-foreground)) 60%, var(--sn-color-sidebar, var(--sn-color-card)));
    --sn-color-accent: color-mix(in oklch, var(--sn-color-sidebar-foreground, var(--sn-color-card-foreground)) 12%, var(--sn-color-sidebar, var(--sn-color-card)));
    --sn-color-accent-foreground: var(--sn-color-sidebar-foreground, var(--sn-color-card-foreground));
    --sn-color-border: color-mix(in oklch, var(--sn-color-sidebar-foreground, var(--sn-color-card-foreground)) 15%, var(--sn-color-sidebar, var(--sn-color-card)));
    transition: width var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);
  }
  [data-layout-sidebar] > [data-snapshot-component="nav"] {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  /* Collapsed sidebar: shrink width, hide labels, center icons.
     Uses custom property overrides so consumers can still override via slots. */
  [data-layout-sidebar]:has(nav[data-collapsed="true"]) {
    --sn-sidebar-width: 3.5rem;
    --sn-sidebar-overflow: hidden;
  }
  nav[data-collapsed="true"] {
    --sn-nav-header-justify: center;
    --sn-nav-link-justify: center;
    --sn-nav-link-gap: 0;
    --sn-nav-link-padding: 0.25rem 0;
    --sn-nav-user-justify: center;
  }
  nav[data-collapsed="true"] [data-snapshot-component="link"] [data-snapshot-id$="-label"],
  nav[data-collapsed="true"] [data-snapshot-component="link"] [data-snapshot-id$="-badge"],
  nav[data-collapsed="true"] [data-snapshot-component="nav-logo"] [data-snapshot-id$="-label"],
  nav[data-collapsed="true"] [data-sn-nav-user-name] {
    display: none;
  }
`;

const SIDEBAR_LAYOUT_MOBILE_CSS = `
  @media (max-width: 768px) {
    [data-layout-variant="sidebar"] [data-layout-sidebar] {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: var(--sn-z-index-overlay, 30);
      transform: translateX(-100%);
      transition: transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);
    }
    [data-layout-variant="sidebar"] [data-layout-sidebar][data-sidebar-open="true"] {
      transform: translateX(0);
    }
  }
`;

function readSlot(
  slots: LayoutSlots | undefined,
  name: string,
  fallback?: ReactNode,
): ReactNode {
  return slots?.[name] ?? fallback ?? null;
}

function resolveLayoutRootSurface(params: {
  surfaceId: string;
  surfaceConfig?: Record<string, unknown>;
  implementationBase: Record<string, unknown>;
}) {
  return resolveSurfacePresentation({
    surfaceId: params.surfaceId,
    implementationBase: params.implementationBase,
    componentSurface: extractSurfaceConfig(params.surfaceConfig),
  });
}

/**
 * Sidebar layout: fixed sidebar (collapsible on mobile) + main content area.
 * The sidebar is positioned on the left with slot support for
 * `header`, `sidebar`, `main`, and `footer`.
 * On mobile (below md breakpoint), the sidebar collapses.
 */
function SidebarLayout({
  slots,
  nav,
  children,
  surfaceConfig,
}: {
  slots?: LayoutSlots;
  nav?: ReactNode;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const header = readSlot(slots, "header");
  const sidebar = readSlot(slots, "sidebar", nav);
  const main = readSlot(slots, "main", children);
  const footer = readSlot(slots, "footer");
  const rootSurface = resolveLayoutRootSurface({
    surfaceId: "layout-sidebar",
    surfaceConfig,
    implementationBase: {
      display: "flex",
      height: "100vh",
      style: {
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
      },
    },
  });

  return (
    <>
      <div
        data-snapshot-component="layout"
        data-layout-variant="sidebar"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {header ? (
          <header
            data-layout-header=""
            style={{
              borderBottom:
                "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
              padding: "var(--sn-spacing-md, 1rem)",
            }}
          >
            {header}
          </header>
        ) : null}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {sidebar ? (
            <aside
              aria-label="Sidebar navigation"
              data-layout-sidebar=""
              style={{
                width: "var(--sn-sidebar-width, 16rem)",
                flexShrink: 0,
                background: "var(--sn-color-sidebar, var(--sn-color-card))",
                color:
                  "var(--sn-color-sidebar-foreground, var(--sn-color-card-foreground))",
                borderRight:
                  "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
                display: "flex",
                flexDirection: "column",
                overflow: "var(--sn-sidebar-overflow, auto)",
              }}
            >
              {sidebar}
            </aside>
          ) : null}
          <main
            id="main-content"
            aria-label="Main content"
            data-layout-content=""
            tabIndex={-1}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "var(--sn-spacing-lg, 1.5rem)",
              overflow: "auto",
            }}
          >
            {main}
          </main>
        </div>
        {footer ? (
          <footer
            data-layout-footer=""
            style={{
              borderTop:
                "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
              padding: "var(--sn-spacing-md, 1rem)",
            }}
          >
            {footer}
          </footer>
        ) : null}
      </div>
      <SurfaceStyles css={SIDEBAR_CONTEXT_CSS} />
      <SurfaceStyles css={SIDEBAR_LAYOUT_MOBILE_CSS} />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}

/**
 * Top-nav layout with slot support for `header`, `sidebar`, `main`, and `footer`.
 */
function TopNavLayout({
  slots,
  nav,
  children,
  surfaceConfig,
}: {
  slots?: LayoutSlots;
  nav?: ReactNode;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const header = readSlot(slots, "header", nav);
  const sidebar = readSlot(slots, "sidebar");
  const main = readSlot(slots, "main", children);
  const footer = readSlot(slots, "footer");
  const rootSurface = resolveLayoutRootSurface({
    surfaceId: "layout-top-nav",
    surfaceConfig,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      style: {
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
      },
    },
  });

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="top-nav"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {header ? (
        <header
          data-layout-header=""
          style={{
            position: "relative",
            zIndex: "var(--sn-z-index-popover, 50)",
            overflow: "visible",
            background: "var(--sn-color-sidebar, var(--sn-color-card))",
            color:
              "var(--sn-color-sidebar-foreground, var(--sn-color-card-foreground))",
            borderBottom:
              "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
          }}
        >
          {header}
        </header>
      ) : null}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {sidebar ? (
          <aside
            data-layout-sidebar=""
            style={{
              width: "var(--sn-sidebar-width, 16rem)",
              flexShrink: 0,
              borderRight:
                "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
              overflow: "auto",
            }}
          >
            {sidebar}
          </aside>
        ) : null}
        <main
          id="main-content"
          aria-label="Main content"
          data-layout-content=""
          tabIndex={-1}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "var(--sn-spacing-lg, 1.5rem)",
            overflow: "auto",
          }}
        >
          {main}
        </main>
      </div>
      {footer ? (
        <footer
          data-layout-footer=""
          style={{
            borderTop:
              "var(--sn-border-thin, 1px) solid var(--sn-color-border)",
            padding: "var(--sn-spacing-md, 1rem)",
          }}
        >
          {footer}
        </footer>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}

/**
 * Stacked layout with vertical regions for `header`, `sidebar`, `main`, and `footer`.
 */
function StackedLayout({
  slots,
  children,
  surfaceConfig,
}: {
  slots?: LayoutSlots;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const header = readSlot(slots, "header");
  const sidebar = readSlot(slots, "sidebar");
  const main = readSlot(slots, "main", children);
  const footer = readSlot(slots, "footer");
  const rootSurface = resolveLayoutRootSurface({
    surfaceId: "layout-stacked",
    surfaceConfig,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      style: {
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
      },
    },
  });

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="stacked"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {header ? (
        <header
          data-layout-header=""
          style={{ padding: "var(--sn-spacing-md, 1rem)" }}
        >
          {header}
        </header>
      ) : null}
      {sidebar ? (
        <aside
          data-layout-sidebar=""
          style={{ padding: "var(--sn-spacing-md, 1rem)" }}
        >
          {sidebar}
        </aside>
      ) : null}
      <main
        id="main-content"
        aria-label="Main content"
        data-layout-content=""
        tabIndex={-1}
        style={{
          flex: 1,
          padding: "var(--sn-spacing-lg, 1.5rem)",
          overflow: "auto",
        }}
      >
        {main}
      </main>
      {footer ? (
        <footer
          data-layout-footer=""
          style={{ padding: "var(--sn-spacing-md, 1rem)" }}
        >
          {footer}
        </footer>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}

/**
 * Minimal layout: centered content, no persistent nav.
 */
function MinimalLayout({
  slots,
  children,
  surfaceConfig,
}: {
  slots?: LayoutSlots;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const main = readSlot(slots, "main", children);
  const rootSurface = resolveLayoutRootSurface({
    surfaceId: "layout-minimal",
    surfaceConfig,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      style: {
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        padding: "var(--sn-spacing-md, 1rem)",
      },
    },
  });

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="minimal"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <main
        id="main-content"
        aria-label="Main content"
        data-layout-content=""
        tabIndex={-1}
        style={{
          width: "100%",
          maxWidth: "var(--sn-container-md, 32rem)",
        }}
        >
          {main}
        </main>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}

/**
 * Full-width layout: edge-to-edge, no padding, no nav.
 * Suitable for landing pages, custom layouts, and content that needs
 * the full viewport width.
 */
function FullWidthLayout({
  children,
  surfaceConfig,
}: {
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const rootSurface = resolveLayoutRootSurface({
    surfaceId: "layout-full-width",
    surfaceConfig,
    implementationBase: {
      minHeight: "100vh",
      style: {
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
      },
    },
  });

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="full-width"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <main
        id="main-content"
        aria-label="Main content"
        data-layout-content=""
        tabIndex={-1}
      >
        {children}
      </main>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}

/**
 * Layout shell component that wraps page content.
 * Renders one of five layout variants based on the config:
 * - **sidebar**: fixed sidebar (collapsible on mobile) + main content area
 * - **top-nav**: horizontal nav bar + content below
 * - **stacked**: vertical header/sidebar/main/footer sections
 * - **minimal**: centered content, no nav (auth pages, onboarding)
 * - **full-width**: edge-to-edge, no nav (landing pages)
 *
 * @param props - Layout configuration, optional nav element, and children
 */
export function Layout({ config, nav, slots, children }: LayoutProps) {
  const registeredLayout = resolveLayout(config.variant);
  if (registeredLayout) {
    const RegisteredLayout = registeredLayout.component;
    return (
      <RegisteredLayout
        config={config as Record<string, unknown>}
        nav={nav}
        slots={slots}
      >
        {children}
      </RegisteredLayout>
    );
  }

  if (
    typeof process !== "undefined" &&
    process.env?.["NODE_ENV"] !== "production" &&
    ![
      "sidebar",
      "top-nav",
      "stacked",
      "minimal",
      "full-width",
      "centered",
    ].includes(config.variant)
  ) {
    console.warn(
      `[snapshot] Unknown layout "${config.variant}", falling back to sidebar.`,
    );
  }

  switch (config.variant) {
    case "sidebar":
      return (
        <SidebarLayout
          nav={nav}
          slots={slots}
          surfaceConfig={config}
        >
          {children}
        </SidebarLayout>
      );
    case "top-nav":
      return (
        <TopNavLayout
          nav={nav}
          slots={slots}
          surfaceConfig={config}
        >
          {children}
        </TopNavLayout>
      );
    case "stacked":
      return (
        <StackedLayout slots={slots} surfaceConfig={config}>
          {children}
        </StackedLayout>
      );
    case "minimal":
      return (
        <MinimalLayout slots={slots} surfaceConfig={config}>
          {children}
        </MinimalLayout>
      );
    case "full-width":
      return (
        <FullWidthLayout surfaceConfig={config}>
          {children}
        </FullWidthLayout>
      );
    case "centered":
      return (
        <MinimalLayout slots={slots} surfaceConfig={config}>
          {children}
        </MinimalLayout>
      );
    default:
      return (
        <SidebarLayout
          nav={nav}
          slots={slots}
          surfaceConfig={config}
        >
          {children}
        </SidebarLayout>
      );
  }
}
