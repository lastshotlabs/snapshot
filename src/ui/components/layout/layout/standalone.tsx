'use client';

import type { CSSProperties, ReactNode } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

// ── CSS blocks ───────────────────────────────────────────────────────────────

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

// ── Standalone Props ──────────────────────────────────────────────────────────

/** Named slot content map for slot-aware layouts. */
export type LayoutBaseSlots = Record<string, ReactNode>;

export type LayoutBaseVariant =
  | "sidebar"
  | "top-nav"
  | "stacked"
  | "minimal"
  | "full-width"
  | "centered";

export interface LayoutBaseProps {
  /** Layout variant determines the overall page structure. */
  variant?: LayoutBaseVariant;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
  /** The nav element to render in the layout. */
  nav?: ReactNode;
  /** Optional named slot content for slot-aware layout variants. */
  layoutSlots?: LayoutBaseSlots;
  /** The page content to render inside the layout. */
  children: ReactNode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function readSlot(
  slots: LayoutBaseSlots | undefined,
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

// ── Sub-layouts ──────────────────────────────────────────────────────────────

function SidebarLayout({
  layoutSlots,
  nav,
  children,
  surfaceConfig,
}: {
  layoutSlots?: LayoutBaseSlots;
  nav?: ReactNode;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const header = readSlot(layoutSlots, "header");
  const sidebar = readSlot(layoutSlots, "sidebar", nav);
  const main = readSlot(layoutSlots, "main", children);
  const footer = readSlot(layoutSlots, "footer");
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

function TopNavLayout({
  layoutSlots,
  nav,
  children,
  surfaceConfig,
}: {
  layoutSlots?: LayoutBaseSlots;
  nav?: ReactNode;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const header = readSlot(layoutSlots, "header", nav);
  const sidebar = readSlot(layoutSlots, "sidebar");
  const main = readSlot(layoutSlots, "main", children);
  const footer = readSlot(layoutSlots, "footer");
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

function StackedLayout({
  layoutSlots,
  children,
  surfaceConfig,
}: {
  layoutSlots?: LayoutBaseSlots;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const header = readSlot(layoutSlots, "header");
  const sidebar = readSlot(layoutSlots, "sidebar");
  const main = readSlot(layoutSlots, "main", children);
  const footer = readSlot(layoutSlots, "footer");
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

function MinimalLayout({
  layoutSlots,
  children,
  surfaceConfig,
}: {
  layoutSlots?: LayoutBaseSlots;
  children: ReactNode;
  surfaceConfig?: Record<string, unknown>;
}) {
  const main = readSlot(layoutSlots, "main", children);
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

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Layout -- a layout shell component that wraps page content.
 * Renders one of six layout variants without manifest context.
 *
 * @example
 * ```tsx
 * <LayoutBase variant="sidebar" nav={<MyNav />}>
 *   <p>Page content</p>
 * </LayoutBase>
 * ```
 */
export function LayoutBase({
  variant = "sidebar",
  className,
  style,
  nav,
  layoutSlots,
  children,
}: LayoutBaseProps) {
  const surfaceConfig = className || style ? { className, style } : undefined;

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
    ].includes(variant)
  ) {
    console.warn(
      `[snapshot] Unknown layout "${variant}", falling back to sidebar.`,
    );
  }

  switch (variant) {
    case "sidebar":
      return (
        <SidebarLayout
          nav={nav}
          layoutSlots={layoutSlots}
          surfaceConfig={surfaceConfig}
        >
          {children}
        </SidebarLayout>
      );
    case "top-nav":
      return (
        <TopNavLayout
          nav={nav}
          layoutSlots={layoutSlots}
          surfaceConfig={surfaceConfig}
        >
          {children}
        </TopNavLayout>
      );
    case "stacked":
      return (
        <StackedLayout layoutSlots={layoutSlots} surfaceConfig={surfaceConfig}>
          {children}
        </StackedLayout>
      );
    case "minimal":
      return (
        <MinimalLayout layoutSlots={layoutSlots} surfaceConfig={surfaceConfig}>
          {children}
        </MinimalLayout>
      );
    case "full-width":
      return (
        <FullWidthLayout surfaceConfig={surfaceConfig}>
          {children}
        </FullWidthLayout>
      );
    case "centered":
      return (
        <MinimalLayout layoutSlots={layoutSlots} surfaceConfig={surfaceConfig}>
          {children}
        </MinimalLayout>
      );
    default:
      return (
        <SidebarLayout
          nav={nav}
          layoutSlots={layoutSlots}
          surfaceConfig={surfaceConfig}
        >
          {children}
        </SidebarLayout>
      );
  }
}
