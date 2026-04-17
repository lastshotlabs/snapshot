import type { ReactNode } from "react";
export interface AutoErrorStateConfig extends Record<string, unknown> {
    id?: string;
    className?: string;
    style?: Record<string, string | number>;
    title?: string;
    description?: string;
    retry?: boolean | {
        label: string;
    };
    icon?: string;
    slots?: {
        root?: Record<string, unknown>;
        icon?: Record<string, unknown>;
        title?: Record<string, unknown>;
        description?: Record<string, unknown>;
        retry?: Record<string, unknown>;
    };
}
export declare function AutoErrorState({ config, onRetry, }: {
    config: AutoErrorStateConfig;
    onRetry?: () => void;
}): ReactNode;
