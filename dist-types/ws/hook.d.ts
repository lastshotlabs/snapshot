import type { SocketHook } from "../types";
import type { WebSocketManager } from "./manager";
export declare function createWsHooks<TEvents extends Record<string, unknown>>(): {
    useWebSocketManager: () => WebSocketManager<TEvents> | null;
    useSocket: () => SocketHook<TEvents>;
    useRoom: (room: string) => {
        isSubscribed: boolean;
    };
    useRoomEvent: <T>(room: string, event: string, handler: (data: T) => void) => void;
};
