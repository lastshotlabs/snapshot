import type { AvatarGroupConfig } from "./types";
/**
 * AvatarGroup — displays a row of overlapping avatars with "+N" overflow.
 *
 * Supports static `avatars` array or API-loaded data. Each avatar shows
 * an image or initials fallback with a deterministic background color.
 *
 * @param props - Component props containing the avatar group configuration
 */
export declare function AvatarGroup({ config }: {
    config: AvatarGroupConfig;
}): import("react/jsx-runtime").JSX.Element | null;
