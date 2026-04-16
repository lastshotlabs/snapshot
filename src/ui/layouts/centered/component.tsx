'use client';

import type { ReactNode } from "react";

export interface CenteredLayoutConfig {
  maxWidth?: "xs" | "sm" | "md" | "lg";
}

const MAX_WIDTH_MAP: Record<NonNullable<CenteredLayoutConfig["maxWidth"]>, string> =
  {
    xs: "var(--sn-container-xs, 20rem)",
    sm: "var(--sn-container-sm, 28rem)",
    md: "var(--sn-container-md, 32rem)",
    lg: "var(--sn-container-lg, 40rem)",
  };

export function CenteredLayout({
  config,
  children,
}: {
  config: CenteredLayoutConfig;
  children: ReactNode;
}) {
  const maxWidth = config.maxWidth ?? "sm";

  return (
    <div
      data-snapshot-layout="centered"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        padding: "var(--sn-spacing-lg)",
      }}
    >
      <main
        data-centered-card=""
        style={{
          width: "100%",
          maxWidth: MAX_WIDTH_MAP[maxWidth],
          padding: "var(--sn-spacing-2xl, 2rem)",
          background: "var(--sn-color-card, var(--sn-color-background))",
          color:
            "var(--sn-color-card-foreground, var(--sn-color-foreground))",
          borderRadius: "var(--sn-radius-lg, 0.75rem)",
          border:
            "var(--sn-border-thin, 1px) solid var(--sn-color-border, currentColor)",
          boxShadow: "var(--sn-shadow-lg, 0 24px 64px rgba(0, 0, 0, 0.08))",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export const centeredLayoutDefaultConfig = {
  maxWidth: "sm",
} as const satisfies CenteredLayoutConfig;
