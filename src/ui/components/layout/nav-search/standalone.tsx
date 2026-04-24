'use client';

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NavSearchBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** Keyboard shortcut label (e.g., "Ctrl+K" or "/"). */
  shortcut?: string;
  /** Callback fired when the search form is submitted. */
  onSearch?: (value: string) => void;
  /** Callback fired when the search value changes. */
  onValueChange?: (value: string) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, input, shortcut). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone NavSearch -- a search input with optional keyboard shortcut display.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <NavSearchBase
 *   placeholder="Search..."
 *   shortcut="Ctrl+K"
 *   onSearch={(value) => console.log(value)}
 * />
 * ```
 */
export function NavSearchBase({
  id,
  placeholder = "Search...",
  shortcut,
  onSearch,
  onValueChange,
  className,
  style,
  slots,
}: NavSearchBaseProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Notify parent of value changes
  useEffect(() => {
    onValueChange?.(value);
  }, [value, onValueChange]);

  // Keyboard shortcut to focus
  useEffect(() => {
    if (!shortcut || typeof window === "undefined") return;
    const sc = shortcut.toLowerCase();
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (sc === "ctrl+k" && ctrl && key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (sc === "/" && key === "/" && !isTypingContext(e)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value);
  };

  const rootId = id ?? "nav-search";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      position: "relative",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      width: "100%",
      minHeight: "2rem",
      padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
      border: "1px solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      background: "var(--sn-color-background, #fff)",
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontFamily: "inherit",
      outline: "none",
      transition:
        "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      focus: {
        borderColor: "var(--sn-color-primary, #2563eb)",
        ring: true,
      },
    },
    componentSurface: slots?.input,
  });
  const shortcutSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-shortcut`,
    implementationBase: {
      position: "absolute",
      right: "var(--sn-spacing-sm, 0.5rem)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      pointerEvents: "none",
      opacity: value ? 0 : 0.6,
    },
    componentSurface: slots?.shortcut,
  });

  return (
    <form
      onSubmit={handleSubmit}
      data-snapshot-component="nav-search"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        data-snapshot-id={`${rootId}-input`}
        className={inputSurface.className}
        style={inputSurface.style as CSSProperties}
        aria-label={placeholder}
      />
      {shortcut && (
        <kbd
          data-snapshot-id={`${rootId}-shortcut`}
          className={shortcutSurface.className}
          style={shortcutSurface.style}
        >
          {shortcut}
        </kbd>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
      <SurfaceStyles css={shortcutSurface.scopedCss} />
    </form>
  );
}

function isTypingContext(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
