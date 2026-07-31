import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WebSocketManager } from "../manager";

// ── Mock WebSocket ────────────────────────────────────────────────────────────
//
// A frame written to a socket that is not OPEN used to VANISH silently inside
// the manager. These tests drive that exact path: they build a manager, write a
// game input while the socket is still CONNECTING, and assert the server (this
// mock) actually receives the frame once the socket opens. Run this file against
// the pre-fix manager (drop instead of queue) and the load-bearing test goes
// red — the frame never arrives.

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  static instances: MockWebSocket[] = [];

  url: string;
  readyState = MockWebSocket.CONNECTING;
  onopen: ((e: Event) => void) | null = null;
  onclose: ((e: CloseEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;

  // Every frame the server received, as raw strings and parsed objects.
  readonly sentRaw: string[] = [];
  readonly send = vi.fn((data: string) => {
    this.sentRaw.push(data);
  });
  readonly close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  /** The messages the server saw, parsed. */
  get received(): Array<Record<string, unknown>> {
    return this.sentRaw.map((s) => JSON.parse(s) as Record<string, unknown>);
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new Event("close") as CloseEvent);
  }

  /** A frame arriving FROM the server. */
  simulateMessage(frame: Record<string, unknown>) {
    this.onmessage?.({ data: JSON.stringify(frame) } as MessageEvent);
  }
}

const OriginalWebSocket = (globalThis as unknown as { WebSocket?: unknown })
  .WebSocket;

beforeEach(() => {
  MockWebSocket.instances = [];
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = MockWebSocket;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  (globalThis as unknown as { WebSocket: unknown }).WebSocket =
    OriginalWebSocket;
});

/** The socket the manager opened first. */
function firstSocket(): MockWebSocket {
  const ws = MockWebSocket.instances[0];
  if (!ws) throw new Error("manager never opened a socket");
  return ws;
}

describe("WebSocketManager frame delivery", () => {
  it("THE LOAD-BEARING TEST: a game input written while the socket is not OPEN still reaches the server", () => {
    const manager = new WebSocketManager({ url: "/game" });
    const ws = firstSocket();
    // Socket is CONNECTING — exactly the ~200ms reconnect window a real player
    // taps a wager in.
    expect(ws.readyState).toBe(MockWebSocket.CONNECTING);

    const result = manager.send("game:input", {
      type: "game:input",
      channel: "dailyDoubleWager",
      data: { amount: 4000 },
      sequence: 7,
    });

    // Pre-fix, this returned undefined and the frame was gone. Now it is a
    // deferred-not-delivered signal, and nothing has reached the server yet.
    expect(result).toBe("queued");
    expect(ws.send).not.toHaveBeenCalled();

    // The socket opens (reconnect completes).
    ws.simulateOpen();

    // The buffered wager was flushed to the server, intact.
    const inputs = ws.received.filter((m) => m["event"] === "game:input");
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toEqual({
      action: "event",
      event: "game:input",
      payload: {
        type: "game:input",
        channel: "dailyDoubleWager",
        data: { amount: 4000 },
        sequence: 7,
      },
    });

    manager.disconnect();
  });

  it("reports 'sent' and delivers immediately when the socket is OPEN", () => {
    const manager = new WebSocketManager({ url: "/game" });
    const ws = firstSocket();
    ws.simulateOpen();

    const result = manager.send("game:input", { sequence: 1 });

    expect(result).toBe("sent");
    const inputs = ws.received.filter((m) => m["event"] === "game:input");
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toMatchObject({ payload: { sequence: 1 } });

    manager.disconnect();
  });

  it("flushes buffered frames in the order they were written", () => {
    const manager = new WebSocketManager({ url: "/game" });
    const ws = firstSocket();

    expect(manager.send("game:input", { sequence: 1 })).toBe("queued");
    expect(manager.send("game:input", { sequence: 2 })).toBe("queued");
    expect(manager.send("game:input", { sequence: 3 })).toBe("queued");

    ws.simulateOpen();

    const sequences = ws.received
      .filter((m) => m["event"] === "game:input")
      .map((m) => (m["payload"] as { sequence: number }).sequence);
    expect(sequences).toEqual([1, 2, 3]);

    manager.disconnect();
  });

  it("survives a full reconnect: a frame written while down flushes onto the NEW socket", () => {
    const manager = new WebSocketManager({
      url: "/game",
      reconnectBaseDelay: 10,
    });
    const first = firstSocket();
    first.simulateOpen();

    // Connection drops.
    first.simulateClose();
    expect(manager.isConnected).toBe(false);

    // Player acts while offline.
    expect(manager.send("game:input", { sequence: 99 })).toBe("queued");

    // Reconnect timer fires → a new socket is created and opens.
    vi.advanceTimersByTime(50);
    const second = MockWebSocket.instances[1];
    expect(second).toBeDefined();
    second!.simulateOpen();

    const inputs = second!.received.filter((m) => m["event"] === "game:input");
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toMatchObject({ payload: { sequence: 99 } });

    manager.disconnect();
  });

  it("replays subscribes on open without double-sending a flushed duplicate", () => {
    const manager = new WebSocketManager({ url: "/game" });
    const ws = firstSocket();

    // Subscribe while CONNECTING. It must NOT be buffered as a queued frame
    // (the room set + onopen replay is the durable path); otherwise the flush
    // would send it a second time.
    manager.subscribe("room-a");
    expect(ws.send).not.toHaveBeenCalled();

    ws.simulateOpen();

    const subs = ws.received.filter((m) => m["action"] === "subscribe");
    expect(subs).toEqual([{ action: "subscribe", room: "room-a" }]);

    manager.disconnect();
  });

  it("orders auth → subscribe → buffered input on open (first-message auth)", () => {
    const manager = new WebSocketManager({
      url: "/game",
      auth: { strategy: "first-message", token: "tok-123" },
    });
    const ws = firstSocket();
    manager.subscribe("room-a");
    expect(manager.send("game:input", { sequence: 1 })).toBe("queued");

    ws.simulateOpen();

    const order = ws.received.map(
      (m) => m["type"] ?? m["event"] ?? m["action"],
    );
    // auth first (so the session is authed before anything rides it), then the
    // room subscribe, then the buffered game input.
    expect(order.indexOf("auth")).toBeLessThan(order.indexOf("subscribe"));
    expect(order.indexOf("subscribe")).toBeLessThan(
      order.indexOf("game:input"),
    );
    expect(ws.received[0]).toEqual({ type: "auth", token: "tok-123" });

    manager.disconnect();
  });

  it("drops frames once destroyed instead of buffering them forever", () => {
    const manager = new WebSocketManager({ url: "/game" });
    manager.disconnect();

    expect(manager.send("game:input", { sequence: 1 })).toBe("dropped");
  });
});

// ── Input-epoch stamping ─────────────────────────────────────────────────────
//
// The server bumps a session's INPUT EPOCH on every phase transition and stamps
// it on every frame it broadcasts; an input echoing an OLDER epoch is rejected
// as stale. The manager's half of that contract: learn the epoch from incoming
// frames, and stamp outbound `game:input` payloads AT WRITE TIME — so a frame
// buffered through a reconnect carries the epoch of the state the player was
// actually looking at when they acted, not whatever the world advanced to
// while their phone was offline.
describe("WebSocketManager input-epoch stamping", () => {
  function openManagerWithEpoch(epoch: number) {
    const manager = new WebSocketManager({ url: "/game" });
    const ws = firstSocket();
    ws.simulateOpen();
    ws.simulateMessage({
      type: "game:phase.entered",
      sessionId: "sess-1",
      phase: "pick",
      epoch,
    });
    return { manager, ws };
  }

  it("stamps an outbound game:input with the last epoch seen for its session", () => {
    const { manager, ws } = openManagerWithEpoch(5);

    manager.send("game:input", {
      type: "game:input",
      sessionId: "sess-1",
      channel: "pick",
      data: { v: 1 },
      sequence: 1,
    });

    const input = ws.received.find((m) => m["event"] === "game:input")!;
    expect((input["payload"] as Record<string, unknown>)["epoch"]).toBe(5);
    manager.disconnect();
  });

  it("THE RECONNECT CASE: a frame buffered while offline keeps the epoch from WRITE time", () => {
    const { manager, ws } = openManagerWithEpoch(5);

    // The phone drops. The player taps their move against the epoch-5 screen.
    ws.simulateClose();
    expect(
      manager.send("game:input", {
        type: "game:input",
        sessionId: "sess-1",
        channel: "pick",
        data: { v: 1 },
        sequence: 1,
      }),
    ).toBe("queued");

    // Reconnect. The world moved on to epoch 6 — the server's snapshot says so
    // — but the buffered frame must still say 5, because THAT is the state the
    // player acted against. The server decides staleness, not the client.
    vi.advanceTimersByTime(5000);
    const ws2 = MockWebSocket.instances[1]!;
    ws2.simulateOpen();
    ws2.simulateMessage({
      type: "game:state.snapshot",
      sessionId: "sess-1",
      epoch: 6,
    });

    const flushed = ws2.received.find((m) => m["event"] === "game:input")!;
    expect((flushed["payload"] as Record<string, unknown>)["epoch"]).toBe(5);

    // …and a FRESH move composed after the snapshot is stamped 6.
    manager.send("game:input", {
      type: "game:input",
      sessionId: "sess-1",
      channel: "pick",
      data: { v: 2 },
      sequence: 2,
    });
    const fresh = ws2.received.filter((m) => m["event"] === "game:input")[1]!;
    expect((fresh["payload"] as Record<string, unknown>)["epoch"]).toBe(6);
    manager.disconnect();
  });

  it("never overwrites an explicit epoch, never stamps other frame types, never goes backwards", () => {
    const { manager, ws } = openManagerWithEpoch(5);

    // A late/reordered frame reporting an older epoch must not lower the value.
    ws.simulateMessage({
      type: "game:score.changed",
      sessionId: "sess-1",
      epoch: 3,
    });

    manager.send("game:input", {
      type: "game:input",
      sessionId: "sess-1",
      channel: "pick",
      data: { v: 1 },
      sequence: 1,
      epoch: 2, // an app doing build-time stamping (or a resend) wins
    });
    manager.send("game:other", { type: "game:other", sessionId: "sess-1" });
    manager.send("game:input", {
      type: "game:input",
      sessionId: "sess-1",
      channel: "pick",
      data: { v: 2 },
      sequence: 2,
    });

    const frames = ws.received.filter((m) => m["action"] === "event");
    const payloads = frames.map((f) => f["payload"] as Record<string, unknown>);
    expect(payloads[0]!["epoch"]).toBe(2); // explicit stamp preserved
    expect(payloads[1]!["epoch"]).toBeUndefined(); // not a game:input
    expect(payloads[2]!["epoch"]).toBe(5); // monotonic: 3 did not lower 5
    manager.disconnect();
  });

  it("leaves inputs unstamped for sessions whose epoch it has never seen", () => {
    const manager = new WebSocketManager({ url: "/game" });
    const ws = firstSocket();
    ws.simulateOpen();

    manager.send("game:input", {
      type: "game:input",
      sessionId: "sess-unknown",
      channel: "pick",
      data: { v: 1 },
      sequence: 1,
    });

    const input = ws.received.find((m) => m["event"] === "game:input")!;
    expect(
      (input["payload"] as Record<string, unknown>)["epoch"],
    ).toBeUndefined();
    manager.disconnect();
  });
});
