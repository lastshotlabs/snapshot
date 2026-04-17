import { type ReactNode } from "react";
export interface AutoSkeletonConfig extends Record<string, unknown> {
    id?: string;
    className?: string;
    style?: Record<string, string | number>;
    variant?: "auto" | "table" | "list" | "card" | "text" | "chart" | "stat";
    rows?: number;
    count?: number;
    delay?: number;
    slots?: {
        root?: Record<string, unknown>;
        row?: Record<string, unknown>;
        card?: Record<string, unknown>;
        block?: Record<string, unknown>;
    };
}
export declare function AutoSkeleton({ componentType, config, }: {
    componentType?: string;
    config?: AutoSkeletonConfig;
}): ReactNode;
