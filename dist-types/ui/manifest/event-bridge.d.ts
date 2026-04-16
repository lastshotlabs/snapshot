import type { ActionConfig, ActionExecuteFn } from "../actions/types";
import type { WebSocketManager } from "../../ws/manager";
export type EventActionMap = Record<string, ActionConfig | ActionConfig[]>;
export declare function useEventBridge(wsManager: WebSocketManager<Record<string, unknown>> | null, events: EventActionMap | undefined, executeAction: ActionExecuteFn): void;
export declare function useSseEventBridge(subscribe: (endpoint: string, event: string, handler: (payload: unknown) => void) => () => void, endpoints: Record<string, {
    eventActions?: EventActionMap;
}> | undefined, executeAction: ActionExecuteFn): void;
