import React from "react";
import { ICON_PATHS } from "./paths";

const ICON_ALIASES: Record<string, string> = {
  pencil: "edit",
  trash: "trash-2",
  "table-properties": "layout-list",
  "gantt-chart": "bar-chart",
};

/** Props for the {@link Icon} component. */
export interface IconProps {
  /** Lucide icon name in kebab-case (e.g. `"user"`, `"check"`, `"arrow-left"`). */
  name: string;
  /** Size in pixels. Both width and height are set to this value. @default 16 */
  size?: number;
  /** CSS color value applied as the SVG `stroke`. @default "currentColor" */
  color?: string;
  /** Additional CSS class name applied to the root element. */
  className?: string;
  /** Accessible label. When provided the icon is announced to screen readers;
   *  when omitted the icon is treated as decorative (`aria-hidden`). */
  label?: string;
}

/**
 * Renders a Lucide icon by name using inline SVG.
 *
 * Icons are resolved from a static lookup table ({@link ICON_PATHS}) that
 * ships ~100 commonly used Lucide icons. If the requested name is not found
 * the component renders the raw `name` string as a text fallback so the UI
 * never silently swallows a missing icon.
 *
 * All icons use a 24x24 viewBox with stroke-based rendering
 * (`fill="none"`, `stroke="currentColor"`, `strokeWidth={2}`).
 *
 * @example
 * ```tsx
 * <Icon name="check" />
 * <Icon name="user" size={24} color="var(--sn-color-primary)" label="Profile" />
 * ```
 */
function normalizeIconName(name: string): string {
  // Accept both kebab-case ("arrow-left") and PascalCase ("ArrowLeft")
  const kebabCase = name.includes("-")
    ? name
    : name.replace(/([A-Z])/g, (_match, ch, i) =>
        i === 0 ? ch.toLowerCase() : `-${ch.toLowerCase()}`,
      );
  return ICON_ALIASES[kebabCase] ?? kebabCase;
}

/**
 * Render a Snapshot icon from the built-in icon registry.
 */
export function Icon({
  name,
  size = 16,
  color = "currentColor",
  className,
  label,
}: IconProps): React.JSX.Element {
  const svgContent = ICON_PATHS[normalizeIconName(name)];

  if (!svgContent) {
    return (
      <span
        className={className}
        style={{ fontSize: size, color, lineHeight: 1 }}
        aria-hidden={!label}
        aria-label={label}
      >
        {name}
      </span>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={!label}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
