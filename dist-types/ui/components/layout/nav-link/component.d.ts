import type { NavLinkConfig } from "./types";
export declare function NavLink({ config, onNavigate, }: {
    config: NavLinkConfig;
    onNavigate?: (path: string) => void;
}): import("react/jsx-runtime").JSX.Element | null;
