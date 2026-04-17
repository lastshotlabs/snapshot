import type { ReactNode } from "react";
import type { ActionConfig } from "../../actions/types";
export interface AutoEmptyStateConfig extends Record<string, unknown> {
    id?: string;
    className?: string;
    style?: Record<string, string | number>;
    size?: "sm" | "md" | "lg";
    icon?: string;
    iconColor?: string;
    title: string;
    description?: string;
    action?: {
        label?: string;
        action: ActionConfig | ActionConfig[];
        icon?: string;
        variant?: "default" | "primary" | "outline";
    };
    slots?: {
        root?: Record<string, unknown>;
        icon?: Record<string, unknown>;
        title?: Record<string, unknown>;
        description?: Record<string, unknown>;
        action?: Record<string, unknown>;
    };
}
export declare function AutoEmptyState({ config, }: {
    config: AutoEmptyStateConfig;
}): ReactNode;
