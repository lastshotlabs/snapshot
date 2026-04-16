import type { HeadingConfig } from "./types";
/**
 * Heading component for manifest-driven page titles and section headings.
 *
 * Resolves FromRef and template-backed text, then renders an `h1`-`h6`
 * element with Snapshot token-based typography defaults.
 */
export declare function Heading({ config }: {
    config: HeadingConfig;
}): import("react/jsx-runtime").JSX.Element;
