import type { AvatarConfig } from "./types";
/**
 * Avatar component — a config-driven avatar with image, initials, or icon fallback.
 *
 * Renders an image if `src` is provided, falls back to initials from `name`,
 * then to `icon`, then to a generic placeholder.
 *
 * @param props - Component props containing the avatar configuration
 *
 * @example
 * ```json
 * {
 *   "type": "avatar",
 *   "src": "https://example.com/photo.jpg",
 *   "name": "Jane Doe",
 *   "size": "lg",
 *   "status": "online"
 * }
 * ```
 */
export declare function Avatar({ config }: {
    config: AvatarConfig;
}): import("react/jsx-runtime").JSX.Element | null;
