import type { WebSocketManager } from "../../../ws/manager";
export declare function useLiveData({ event, onRefresh, debounce, indicator, wsManager, enabled, }: {
    event: string;
    onRefresh: () => void;
    debounce?: number;
    indicator?: boolean;
    wsManager: WebSocketManager<Record<string, unknown>> | null;
    enabled: boolean;
}): {
    hasNewData: boolean;
    refresh: () => void;
};
