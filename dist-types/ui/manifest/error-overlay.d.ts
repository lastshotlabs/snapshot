interface ManifestErrorOverlayIssue {
    path: string;
    message: string;
    expected?: string;
    received?: string;
}
/**
 * Development overlay for manifest validation and compilation errors.
 */
export declare function ManifestErrorOverlay({ errors, manifestFile, }: {
    errors: ManifestErrorOverlayIssue[];
    manifestFile?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
