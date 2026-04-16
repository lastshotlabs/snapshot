import type { ReactNode } from "react";
import type { ActionConfig } from "../../actions/types";
export interface AutoEmptyStateConfig {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        action: ActionConfig | ActionConfig[];
        icon?: string;
        variant?: "default" | "primary" | "outline";
    };
}
export declare function AutoEmptyState({ config, }: {
    config: AutoEmptyStateConfig;
}): ReactNode;
