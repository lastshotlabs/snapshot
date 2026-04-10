'use client';

import type { CSSProperties, ReactNode } from "react";
import type { LayoutProps, LayoutSlots } from "./types";

function readSlot(
  slots: LayoutSlots | undefined,
  name: string,
  fallback?: ReactNode,
): ReactNode {
  return slots?.[name] ?? fallback ?? null;
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
  style,
  className,
}: {
  slots?: LayoutSlots;
  nav?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const header = readSlot(slots, "header");
  const sidebar = readSlot(slots, "sidebar", nav);
  const main = readSlot(slots, "main", children);
  const footer = readSlot(slots, "footer");

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="sidebar"
      className={className}
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        ...style,
      }}
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
              overflow: "auto",
            }}
          >
            {sidebar}
          </aside>
        ) : null}
        <main
          aria-label="Main content"
          data-layout-content=""
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
      <style>{`
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
      `}</style>
    </div>
  );
}

/**
 * Top-nav layout with slot support for `header`, `sidebar`, `main`, and `footer`.
 */
function TopNavLayout({
  slots,
  nav,
  children,
  style,
  className,
}: {
  slots?: LayoutSlots;
  nav?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const header = readSlot(slots, "header", nav);
  const sidebar = readSlot(slots, "sidebar");
  const main = readSlot(slots, "main", children);
  const footer = readSlot(slots, "footer");

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="top-nav"
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        ...style,
      }}
    >
      {header ? (
        <header
          data-layout-header=""
          style={{
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
          aria-label="Main content"
          data-layout-content=""
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
  );
}

/**
 * Stacked layout with vertical regions for `header`, `sidebar`, `main`, and `footer`.
 */
function StackedLayout({
  slots,
  children,
  style,
  className,
}: {
  slots?: LayoutSlots;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const header = readSlot(slots, "header");
  const sidebar = readSlot(slots, "sidebar");
  const main = readSlot(slots, "main", children);
  const footer = readSlot(slots, "footer");

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="stacked"
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        ...style,
      }}
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
        aria-label="Main content"
        data-layout-content=""
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
    </div>
  );
}

/**
 * Minimal layout: centered content, no persistent nav.
 */
function MinimalLayout({
  slots,
  children,
  style,
  className,
}: {
  slots?: LayoutSlots;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const main = readSlot(slots, "main", children);

  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="minimal"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        padding: "var(--sn-spacing-md, 1rem)",
        ...style,
      }}
    >
      <main
        aria-label="Main content"
        data-layout-content=""
        style={{
          width: "100%",
          maxWidth: "var(--sn-container-md, 32rem)",
        }}
      >
        {main}
      </main>
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
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      data-snapshot-component="layout"
      data-layout-variant="full-width"
      className={className}
      style={{
        minHeight: "100vh",
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        ...style,
      }}
    >
      <main aria-label="Main content" data-layout-content="">
        {children}
      </main>
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
  const rootStyle = (config.style as CSSProperties) ?? undefined;
  const cn = config.className;
  switch (config.variant) {
    case "sidebar":
      return (
        <SidebarLayout
          nav={nav}
          slots={slots}
          style={rootStyle}
          className={cn}
        >
          {children}
        </SidebarLayout>
      );
    case "top-nav":
      return (
        <TopNavLayout
          nav={nav}
          slots={slots}
          style={rootStyle}
          className={cn}
        >
          {children}
        </TopNavLayout>
      );
    case "stacked":
      return (
        <StackedLayout slots={slots} style={rootStyle} className={cn}>
          {children}
        </StackedLayout>
      );
    case "minimal":
      return (
        <MinimalLayout slots={slots} style={rootStyle} className={cn}>
          {children}
        </MinimalLayout>
      );
    case "full-width":
      return (
        <FullWidthLayout style={rootStyle} className={cn}>
          {children}
        </FullWidthLayout>
      );
  }
}
