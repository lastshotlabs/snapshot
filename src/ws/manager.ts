import type { SnapshotConfig } from "../types";

type WsConfig = NonNullable<SnapshotConfig["ws"]>;
type EventHandler<T = unknown> = (data: T) => void;

export class WebSocketManager<
  TEvents extends Record<string, unknown> = Record<string, unknown>,
> {
  private ws: WebSocket | null = null;
  private readonly rooms = new Set<string>();
  private readonly listeners = new Map<string, Set<EventHandler>>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  private readonly url: string;
  private readonly autoReconnect: boolean;
  private readonly reconnectOnFocus: boolean;
  private readonly maxReconnectAttempts: number;
  private readonly reconnectBaseDelay: number;
  private readonly reconnectMaxDelay: number;
  private readonly onConnected: (() => void) | undefined;
  private readonly onDisconnected: (() => void) | undefined;
  private readonly onReconnecting: ((attempt: number) => void) | undefined;
  private readonly onReconnectFailed: (() => void) | undefined;

  constructor(config: WsConfig) {
    this.url = config.url;
    this.autoReconnect = config.autoReconnect ?? true;
    this.reconnectOnFocus = config.reconnectOnFocus ?? true;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? Infinity;
    this.reconnectBaseDelay = config.reconnectBaseDelay ?? 1000;
    this.reconnectMaxDelay = config.reconnectMaxDelay ?? 30000;
    this.onConnected = config.onConnected;
    this.onDisconnected = config.onDisconnected;
    this.onReconnecting = config.onReconnecting;
    this.onReconnectFailed = config.onReconnectFailed;

    this.connect();

    if (this.reconnectOnFocus) {
      document.addEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private handleVisibilityChange = () => {
    if (
      document.visibilityState === "visible" &&
      !this.isConnected &&
      !this.destroyed
    ) {
      this.reconnect();
    }
  };

  private connect() {
    if (this.destroyed) return;

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();
      this.onConnected?.();
      // Re-subscribe to all tracked rooms after reconnect
      this.rooms.forEach((room) =>
        this.sendMessage({ action: "subscribe", room }),
      );
    };

    this.ws.onclose = () => {
      this.onDisconnected?.();
      if (this.autoReconnect && !this.destroyed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose fires after onerror — reconnect logic is handled there
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as {
          type?: string;
          event?: string;
          [key: string]: unknown;
        };
        const handlers = this.listeners.get(
          message["event"] ?? message["type"] ?? "",
        );
        handlers?.forEach((h) => h(message));
      } catch {
        // Ignore unparseable messages
      }
    };
  }

  private sendMessage(message: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer !== null) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onReconnectFailed?.();
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.reconnectMaxDelay,
    );

    this.onReconnecting?.(this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  subscribe(room: string) {
    this.rooms.add(room);
    this.sendMessage({ action: "subscribe", room });
  }

  unsubscribe(room: string) {
    this.rooms.delete(room);
    this.sendMessage({ action: "unsubscribe", room });
  }

  getRooms(): string[] {
    return Array.from(this.rooms);
  }

  send(type: string, payload: unknown) {
    this.sendMessage({ type, payload });
  }

  on<K extends keyof TEvents>(event: K, handler: (data: TEvents[K]) => void) {
    const key = event as string;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(handler as EventHandler);
  }

  off<K extends keyof TEvents>(event: K, handler: (data: TEvents[K]) => void) {
    const key = event as string;
    this.listeners.get(key)?.delete(handler as EventHandler);
  }

  reconnect() {
    this.clearReconnectTimer();
    if (this.ws) {
      // Close without triggering auto-reconnect cycle — we'll connect immediately
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.connect();
  }

  disconnect() {
    this.destroyed = true;
    this.clearReconnectTimer();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}
