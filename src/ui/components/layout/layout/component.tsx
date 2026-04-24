'use client';

import type { ReactNode } from "react";
import type { LayoutProps, LayoutSlots } from "./types";
import { resolveLayout } from "../../../layouts/registry";
import { LayoutBase } from "./standalone";
import type { LayoutBaseVariant } from "./standalone";

/**
 * Manifest adapter — resolves registered custom layouts, then delegates
 * to LayoutBase for built-in variants.
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

  return (
    <LayoutBase
      variant={config.variant as LayoutBaseVariant}
      className={config.className as string | undefined}
      style={config.style as import("react").CSSProperties | undefined}
      nav={nav}
      layoutSlots={slots}
    >
      {children}
    </LayoutBase>
  );
}
