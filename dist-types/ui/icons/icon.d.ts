import React from "react";
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
 * Render a Snapshot icon from the built-in icon registry.
 */
export declare function Icon({ name, size, color, className, label, }: IconProps): React.JSX.Element;
