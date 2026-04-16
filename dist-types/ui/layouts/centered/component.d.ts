import type { ReactNode } from "react";
export interface CenteredLayoutConfig {
    maxWidth?: "xs" | "sm" | "md" | "lg";
}
export declare function CenteredLayout({ config, children, }: {
    config: CenteredLayoutConfig;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare const centeredLayoutDefaultConfig: {
    readonly maxWidth: "sm";
};
