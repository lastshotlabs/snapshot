interface WsConfig {
    url: string;
    autoReconnect?: boolean;
    reconnectOnLogin?: boolean;
    reconnectOnFocus?: boolean;
    maxReconnectAttempts?: number;
    reconnectBaseDelay?: number;
    reconnectMaxDelay?: number;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onReconnecting?: (attempt: number) => void;
    onReconnectFailed?: () => void;
}
/**
 * Per-instance WebSocket connection manager.
 */
export declare class WebSocketManager<TEvents extends Record<string, unknown> = Record<string, unknown>> {
    private ws;
    private readonly rooms;
    private readonly listeners;
    private reconnectAttempts;
    private reconnectTimer;
    private destroyed;
    private readonly url;
    private readonly autoReconnect;
    private readonly reconnectOnFocus;
    private readonly maxReconnectAttempts;
    private readonly reconnectBaseDelay;
    private readonly reconnectMaxDelay;
    private readonly onConnected;
    private readonly onDisconnected;
    private readonly onReconnecting;
    private readonly onReconnectFailed;
    constructor(config: WsConfig);
    get isConnected(): boolean;
    private handleVisibilityChange;
    private connect;
    private sendMessage;
    private scheduleReconnect;
    private clearReconnectTimer;
    subscribe(room: string): void;
    unsubscribe(room: string): void;
    getRooms(): string[];
    send(type: string, payload: unknown): void;
    on<K extends keyof TEvents>(event: K, handler: (data: TEvents[K]) => void): void;
    off<K extends keyof TEvents>(event: K, handler: (data: TEvents[K]) => void): void;
    reconnect(): void;
    disconnect(): void;
}
export {};
