interface WsConfig {
  url: string;
  autoReconnect?: boolean;
  reconnectOnLogin?: boolean;
  reconnectOnFocus?: boolean;
  maxReconnectAttempts?: number;
  reconnectBaseDelay?: number;
  reconnectMaxDelay?: number;
  auth?: {
    strategy: "query-param" | "first-message";
    paramName?: string;
    token?: string | null | (() => string | null | undefined);
  };
  heartbeat?: {
    enabled?: boolean;
    interval?: number;
    message?: string;
  };
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: (attempt: number) => void;
  onReconnectFailed?: () => void;
}

type EventHandler<T = unknown> = (data: T) => void;

/**
 * Outcome of writing a frame.
 *
 * - `"sent"` — written to an OPEN socket this instant.
 * - `"queued"` — the socket was not OPEN (connecting / reconnecting), so the
 *   frame was buffered and WILL be flushed, in order, the moment the socket
 *   opens. It has NOT reached the server yet.
 * - `"dropped"` — the manager is destroyed, or the caller opted out of
 *   queueing (a frame that is reconstructed on reconnect anyway), so the frame
 *   was discarded.
 *
 * A caller that needs to know its write is not yet delivered (e.g. a game input
 * that must not report "sent" until the server confirms) can read this — a
 * `"queued"` result is an explicit "deferred, not delivered" signal. Note that
 * even `"sent"` is not proof of *delivery*: a frame written to an OPEN socket
 * can still be lost in a half-open connection. Only an application-level ack
 * proves the server received it.
 */
export type SendResult = "sent" | "queued" | "dropped";

/**
 * Frames buffered while the socket is not OPEN are held here and flushed in
 * order on open. Capped so a socket that never opens cannot grow it without
 * bound; on overflow the OLDEST buffered frame is dropped (a stale game input
 * is worth less than the newest one, and the app layer's ack/resend recovers
 * anything that matters).
 */
const MAX_QUEUED_FRAMES = 256;

/**
 * Per-instance WebSocket connection manager.
 */
export class WebSocketManager<
  TEvents extends Record<string, unknown> = Record<string, unknown>,
> {
  private ws: WebSocket | null = null;
  private readonly rooms = new Set<string>();
  private readonly listeners = new Map<string, Set<EventHandler>>();
  /**
   * Serialized frames written while the socket was not OPEN, awaiting a flush
   * on the next `open`. Ordered oldest-first; flushed and cleared atomically.
   */
  private outbound: string[] = [];
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
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
  private readonly auth: WsConfig["auth"];
  private readonly heartbeat: Required<NonNullable<WsConfig["heartbeat"]>>;

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
    this.auth = config.auth;
    this.heartbeat = {
      enabled: config.heartbeat?.enabled ?? false,
      interval: config.heartbeat?.interval ?? 30000,
      message: config.heartbeat?.message ?? "ping",
    };

    this.connect();

    if (this.reconnectOnFocus && typeof document !== "undefined") {
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
    if (typeof document === "undefined") {
      return;
    }

    if (
      document.visibilityState === "visible" &&
      !this.isConnected &&
      !this.destroyed
    ) {
      this.reconnect();
    }
  };

  private resolveAuthToken(): string | null {
    const token = this.auth?.token;
    if (typeof token === "function") {
      return token() ?? null;
    }

    return token ?? null;
  }

  private buildConnectionUrl(): string {
    if (this.auth?.strategy !== "query-param") {
      return this.url;
    }

    const token = this.resolveAuthToken();
    if (!token) {
      return this.url;
    }

    const base =
      typeof window !== "undefined" && window.location.origin !== "null"
        ? window.location.origin
        : "http://localhost";
    const url = new URL(this.url, base);
    url.searchParams.set(this.auth.paramName ?? "token", token);
    return url.toString();
  }

  private emit(event: string, payload: unknown): void {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
    if (event !== "*") {
      this.listeners.get("*")?.forEach((handler) => handler(payload));
    }
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeatTimer();
    if (!this.heartbeat.enabled) {
      return;
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(this.heartbeat.message);
      }
    }, this.heartbeat.interval);
  }

  private connect() {
    if (this.destroyed) return;

    try {
      this.ws = new WebSocket(this.buildConnectionUrl());
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();
      this.startHeartbeat();
      if (this.auth?.strategy === "first-message") {
        const token = this.resolveAuthToken();
        if (token) {
          this.sendMessage({ type: "auth", token });
        }
      }
      this.onConnected?.();
      this.emit("connected", { connected: true });
      // Rebuild room subscriptions first (durable desired state, not queued —
      // see subscribe/unsubscribe), then flush everything that was written
      // while the socket was down, in order. Subscribes go out before the
      // buffered frames so a queued input lands on a re-subscribed session.
      this.rooms.forEach((room) =>
        this.sendMessage({ action: "subscribe", room }, { queue: false }),
      );
      this.flushOutbound();
    };

    this.ws.onclose = () => {
      this.clearHeartbeatTimer();
      this.onDisconnected?.();
      this.emit("disconnected", { connected: false });
      if (this.autoReconnect && !this.destroyed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose fires after onerror; reconnect logic lives there.
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as {
          type?: string;
          event?: string;
          [key: string]: unknown;
        };
        const eventName = message["event"] ?? message["type"] ?? "message";
        this.emit(eventName, message);
      } catch {
        this.emit("message", event.data);
      }
    };
  }

  /**
   * Write a frame, or buffer it if the socket is not OPEN.
   *
   * The old implementation dropped any frame written while the socket was not
   * OPEN — silently, no throw, no return value — so a game input sent during a
   * ~200ms reconnect simply VANISHED and the caller could never tell. Now such
   * a frame is queued and flushed, in order, on the next `open` (see
   * `flushOutbound`), and the caller gets back whether it was sent, queued, or
   * dropped.
   *
   * `{ queue: false }` opts a frame OUT of buffering — used for frames that are
   * reconstructed on reconnect anyway (room subscribes, which the `onopen`
   * handler replays from `this.rooms`), so they are never sent twice.
   */
  private sendMessage(
    message: Record<string, unknown>,
    opts?: { queue?: boolean },
  ): SendResult {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return "sent";
    }
    if (this.destroyed || opts?.queue === false) {
      return "dropped";
    }
    // Buffer for the next open. Cap the backlog: drop the OLDEST frame if we
    // are over the limit so a socket that never opens cannot leak memory.
    if (this.outbound.length >= MAX_QUEUED_FRAMES) {
      this.outbound.shift();
    }
    this.outbound.push(JSON.stringify(message));
    return "queued";
  }

  /**
   * Flush every buffered frame to the (now OPEN) socket, in the order they were
   * written, then clear the buffer. A no-op if the socket is not OPEN.
   */
  private flushOutbound(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }
    if (this.outbound.length === 0) {
      return;
    }
    // Swap out the buffer before sending so a re-entrant send during flush
    // (e.g. a handler firing off another frame) appends to a fresh buffer
    // instead of being replayed here.
    const pending = this.outbound;
    this.outbound = [];
    for (const frame of pending) {
      this.ws.send(frame);
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectTimer !== null) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onReconnectFailed?.();
      this.emit("reconnectFailed", { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.reconnectMaxDelay,
    );

    this.onReconnecting?.(this.reconnectAttempts);
    this.emit("reconnecting", { attempt: this.reconnectAttempts, delay });

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
    // Not queued: the room set is the durable desired state and `onopen`
    // replays it on every (re)connect, so a subscribe written while offline is
    // recovered without risking a double-subscribe from a flushed duplicate.
    this.sendMessage({ action: "subscribe", room }, { queue: false });
  }

  unsubscribe(room: string) {
    this.rooms.delete(room);
    this.sendMessage({ action: "unsubscribe", room }, { queue: false });
  }

  getRooms(): string[] {
    return Array.from(this.rooms);
  }

  /**
   * Send an application event frame. Returns whether it was written now
   * (`"sent"`), buffered for the next open (`"queued"`), or discarded
   * (`"dropped"`). A buffered frame is flushed, in order, on reconnect — it is
   * no longer silently lost.
   */
  send(type: string, payload: unknown): SendResult {
    return this.sendMessage({ action: "event", event: type, payload });
  }

  on<K extends keyof TEvents | "*">(
    event: K,
    handler: (data: K extends keyof TEvents ? TEvents[K] : unknown) => void,
  ) {
    const key = event as string;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(handler as EventHandler);
  }

  off<K extends keyof TEvents | "*">(
    event: K,
    handler: (data: K extends keyof TEvents ? TEvents[K] : unknown) => void,
  ) {
    const key = event as string;
    this.listeners.get(key)?.delete(handler as EventHandler);
  }

  reconnect() {
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.connect();
  }

  disconnect() {
    this.destroyed = true;
    this.outbound = [];
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    if (typeof document !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange,
      );
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}
