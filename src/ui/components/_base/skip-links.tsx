"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";

export function SkipLinks({
  links,
}: {
  links?: Array<{ label: string; target: string }>;
}) {
  const handleClick = useCallback(
    (targetId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.tabIndex = target.tabIndex >= 0 ? target.tabIndex : -1;
      target.focus();
      target.scrollIntoView({ block: "start" });
      window.history.replaceState(window.history.state, "", `#${targetId}`);
    },
    [],
  );

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Skip links"
      data-snapshot-skip-links=""
      style={{ position: "relative", zIndex: "var(--sn-z-index-toast, 60)" }}
    >
      {links.map((link) => (
        <a
          key={`${link.target}:${link.label}`}
          href={`#${link.target}`}
          onClick={handleClick(link.target)}
          style={{
            position: "absolute",
            top: "var(--sn-spacing-sm, 0.5rem)",
            left: "var(--sn-spacing-sm, 0.5rem)",
            transform: "translateY(calc(-100% - var(--sn-spacing-sm, 0.5rem)))",
            padding:
              "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #ffffff)",
            textDecoration: "none",
            boxShadow: "var(--sn-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.15))",
            transition:
              "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
          }}
          onFocus={(event) => {
            event.currentTarget.style.transform = "translateY(0)";
          }}
          onBlur={(event) => {
            event.currentTarget.style.transform =
              "translateY(calc(-100% - var(--sn-spacing-sm, 0.5rem)))";
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
