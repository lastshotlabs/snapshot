import type { ReactNode } from "react";
export interface AutoSkeletonConfig {
    variant?: "auto" | "table" | "list" | "card" | "text" | "chart" | "stat";
    rows?: number;
    count?: number;
}
export declare function AutoSkeleton({ componentType, config, }: {
    componentType?: string;
    config?: AutoSkeletonConfig;
}): ReactNode;
