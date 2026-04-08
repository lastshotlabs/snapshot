export type SseConnectionStatus = "connecting" | "open" | "closed";

interface SseManagerConfig {
  withCredentials?: boolean; // default false
  onConnected?: () => void; // EventSource 'open' event
  onError?: (e: Event) => void; // EventSource 'error' event (transient; SSE auto-reconnects)
  onClosed?: () => void; // only called by explicit .close()
}

/**
 * SseManager — manages a single EventSource connection for one endpoint URL.
 * Per-endpoint: createSnapshot creates one SseManager per entry in config.sse.endpoints.
 */
export class SseManager {
  private es: EventSource | null = null;
  // raw handler → EventListener wrapper (so we can removeEventListener by identity)
  private listeners: Map<string, Map<Function, EventListener>> = new Map();
  private _state: SseConnectionStatus = "closed";

  constructor(private readonly cfg: SseManagerConfig) {}

  get state(): SseConnectionStatus {
    return this._state;
  }

  connect(url: string): void {
    // 1. If es already exists, close it silently (no onClosed — this is internal replacement)
    if (this.es !== null) {
      this.es.close();
      this.es = null;
    }
    // 2. Create EventSource
    const es = new EventSource(url, {
      withCredentials: this.cfg.withCredentials ?? false,
    });
    this.es = es;
    // 3. _state = 'connecting'
    this._state = "connecting";
    // 4. open handler
    es.onopen = () => {
      this._state = "open";
      this.cfg.onConnected?.();
    };
    // 5. error handler
    es.onerror = (e) => {
      if (this.es !== null) this._state = "connecting"; // auto-reconnect; not explicitly closed
      this.cfg.onError?.(e);
    };
    // 6. Re-attach all pending/existing listeners to the new EventSource
    for (const [event, handlers] of this.listeners) {
      for (const [, wrapped] of handlers) {
        es.addEventListener(event, wrapped);
      }
    }
  }

  close(): void {
    this.es?.close();
    this.es = null;
    this._state = "closed";
    this.cfg.onClosed?.();
    // NOTE: does NOT clear this.listeners — survives reconnect via connect()
  }

  on(event: string, handler: (payload: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Map());
    }
    const wrappedHandler: EventListener = (e: Event) => {
      let payload: unknown;
      try {
        payload = JSON.parse((e as MessageEvent).data);
      } catch {
        this.cfg.onError?.(e);
        return;
      }
      handler(payload);
    };
    this.listeners.get(event)!.set(handler, wrappedHandler);
    if (this.es !== null) {
      this.es.addEventListener(event, wrappedHandler);
    }
  }

  off(event: string, handler: (payload: unknown) => void): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    const wrapped = handlers.get(handler);
    if (!wrapped) return;
    if (this.es !== null) {
      this.es.removeEventListener(event, wrapped);
    }
    handlers.delete(handler);
  }
}
