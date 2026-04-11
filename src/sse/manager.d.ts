export type SseConnectionStatus = "connecting" | "open" | "closed";
interface SseManagerConfig {
    withCredentials?: boolean;
    onConnected?: () => void;
    onError?: (e: Event) => void;
    onClosed?: () => void;
}
/**
 * SseManager — manages a single EventSource connection for one endpoint URL.
 * Per-endpoint: createSnapshot creates one SseManager per entry in config.sse.endpoints.
 */
export declare class SseManager {
    private readonly cfg;
    private es;
    private listeners;
    private _state;
    constructor(cfg: SseManagerConfig);
    get state(): SseConnectionStatus;
    connect(url: string): void;
    close(): void;
    on(event: string, handler: (payload: unknown) => void): void;
    off(event: string, handler: (payload: unknown) => void): void;
}
export {};
