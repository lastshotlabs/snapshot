type Theme = "light" | "dark";
/**
 * Bind the persisted theme to the document root.
 *
 * @returns Theme state and setters for the current app instance
 */
export declare function useTheme(): {
    theme: Theme;
    toggle: () => void;
    set: (t: Theme) => void;
};
export {};
