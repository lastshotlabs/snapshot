import type { ReactNode } from "react";
export interface AutoErrorStateConfig {
    title?: string;
    description?: string;
    retry?: boolean | {
        label: string;
    };
    icon?: string;
}
export declare function AutoErrorState({ config, onRetry, }: {
    config: AutoErrorStateConfig;
    onRetry?: () => void;
}): ReactNode;
