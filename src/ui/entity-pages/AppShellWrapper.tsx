"use client";

import type { ReactNode } from "react";
import { Nav } from "../components/layout/nav";
import type { NavConfig } from "../components/layout/nav/schema";

export interface AppShellWrapperProps {
  /** Resolved shell mode. */
  readonly shell: "sidebar" | "top-nav" | "none";
  /** Resolved Nav component config. */
  readonly navConfig?: NavConfig;
  /** Current pathname for active nav state. */
  readonly pathname: string;
  /** Wrapped page content. */
  readonly children: ReactNode;
}

/**
 * Thin SSR shell wrapper for entity pages rendered outside ManifestApp.
 *
 * @param props - Shell mode, nav config, current pathname, and page content.
 * @returns Shell-wrapped page content.
 */
export function AppShellWrapper({
  shell,
  navConfig,
  pathname,
  children,
}: AppShellWrapperProps) {
  if (!navConfig || shell === "none") {
    return <>{children}</>;
  }

  if (shell === "top-nav") {
    return (
      <div
        data-snapshot-entity-shell="top-nav"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
          }}
        >
          <Nav config={navConfig} pathname={pathname} />
        </header>
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    );
  }

  return (
    <div
      data-snapshot-entity-shell="sidebar"
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <aside
        style={{
          width: "280px",
          borderRight: "1px solid var(--sn-color-border, #e5e7eb)",
          flexShrink: 0,
        }}
      >
        <Nav config={navConfig} pathname={pathname} />
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  );
}
