# Phase F: Real-Time — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | F.1 | WebSocket Connection | Not started | WS |
> | F.2 | Event-to-Action Mapping | Not started | WS |
> | F.3 | WS Send Action | Not started | WS |
> | F.4 | Server-Sent Events | Not started | SSE |
> | F.5 | Presence | Not started | WS |
> | F.6 | Live Data Binding | Not started | Data |
>
> **Priority:** P1 — enables real-time collaborative and live-updating applications.
> **Depends on:** Phase A (CSS Foundation), Phase D (Interactivity — action executor).
> **Blocks:** Nothing directly, but enables live features in consuming apps.

---

## Vision

### Before (Today)

Snapshot has WebSocket and SSE infrastructure at the SDK level, but the manifest-driven
UI layer does not expose real-time features to consumers:

1. **WebSocket manager exists but is not manifest-addressable.** `src/ws/manager.ts` provides
   a `WsManager` class with connect, disconnect, send, and event handling. `src/ws/atom.ts`
   stores it in a Jotai atom. `src/ws/hook.ts` provides a `useWs()` hook. But there is no
   `manifest.realtime.ws` config — consumers must write TypeScript to use WebSockets.
2. **SSE manager exists but is not manifest-addressable.** `src/sse/manager.ts` provides
   `SseManager` with connect and event handling. `src/sse/atom.ts` and `src/sse/hook.ts`
   provide atom storage and a hook. No manifest config for SSE.
3. **No event-to-action mapping.** When a WS/SSE event arrives, there is no way to declare
   "on event X, execute action Y" in manifest JSON. The `ManifestRealtimeWorkflowBridge`
   exists (referenced in app.tsx imports) but events cannot trigger the standard action
   vocabulary.
4. **No WS send action.** The action vocabulary has no `ws-send` type for sending messages
   through the WebSocket connection.
5. **No presence support.** No heartbeat-based presence tracking or presence indicator
   tied to the WS connection.
6. **No live data binding.** Data components cannot auto-refresh when a WS event signals
   new data. There is no `live` prop that creates the event-to-refresh binding automatically.

### After (This Spec)

1. `manifest.realtime.ws` configures the WebSocket connection from JSON.
2. `events` map routes WS/SSE events to action arrays.
3. `ws-send` action type sends data through the WS connection.
4. `manifest.realtime.sse` configures SSE connections from JSON.
5. `manifest.realtime.presence` enables presence tracking with heartbeat.
6. `live` prop on data components auto-refreshes on WS events.

---

## What Already Exists on Main

### WebSocket Manager

| File | Lines | What Exists |
|---|---|---|
| `src/ws/manager.ts` | ~200 | `WsManager` class: `connect(url, options)`, `disconnect()`, `send(event, data)`, `on(event, handler)`, `off(event, handler)`. Handles reconnection with exponential backoff. |
| `src/ws/atom.ts` | ~20 | Jotai atom storing the `WsManager` instance. |
| `src/ws/hook.ts` | ~40 | `useWs()` hook — returns the WsManager from the atom. |
| `src/ws/manager.d.ts` | ~30 | Type declarations for WsManager. |

### SSE Manager

| File | Lines | What Exists |
|---|---|---|
| `src/sse/manager.ts` | ~150 | `SseManager` class: `connect(url)`, `close()`, `on(event, handler)`, `off(event, handler)`. Uses `EventSource` API. |
| `src/sse/atom.ts` | ~20 | Jotai atom storing SseManager instances (registry pattern — one per endpoint). |
| `src/sse/hook.ts` | ~40 | `useSse()` hook — returns the SseManager from the atom. |
| `src/sse/manager.d.ts` | ~30 | Type declarations for SseManager. |

### Workflow Bridge

| File | What |
|---|---|
| `src/ui/manifest/app.tsx` (import) | Imports workflow engine. ManifestApp integrates workflow execution. |
| `src/ui/workflows/engine.ts` | `runWorkflow()` — executes workflow steps. Can be triggered by events. |

### Presence Indicator Component

| File | What |
|---|---|
| `src/ui/components/communication/presence-indicator/` | Registered component with schema. Renders presence dots. Currently requires manual data — no WS integration. |

### Action Executor

| File | What |
|---|---|
| `src/ui/actions/executor.ts` | 17 action types. No `ws-send`. |
| `src/ui/actions/types.ts` | `ACTION_TYPES` array. No WS-related types. |

---

## Developer Context

### Build & Test Commands

```sh
cd /c/Users/email/projects/snapshot
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier
bun run build            # tsup + oclif manifest
bun test                 # vitest
```

### Key Files

| Path | What | Lines |
|---|---|---|
| `src/ws/manager.ts` | WebSocket manager | ~200 |
| `src/ws/atom.ts` | WS Jotai atom | ~20 |
| `src/ws/hook.ts` | `useWs()` hook | ~40 |
| `src/sse/manager.ts` | SSE manager | ~150 |
| `src/sse/atom.ts` | SSE Jotai atom | ~20 |
| `src/sse/hook.ts` | `useSse()` hook | ~40 |
| `src/ui/actions/executor.ts` | Action executor | ~400 |
| `src/ui/actions/types.ts` | Action type definitions | ~200 |
| `src/ui/manifest/app.tsx` | ManifestApp | ~600 |
| `src/ui/manifest/schema.ts` | Manifest schemas | ~1400 |
| `src/ui/manifest/runtime.tsx` | Runtime providers | ~300 |
| `src/ui/workflows/engine.ts` | Workflow engine | ~300 |
| `src/ui/components/communication/presence-indicator/` | Presence UI component | ~100 |

---

## Non-Negotiable Engineering Constraints

1. **Manifest-only** (Rule: Config-Driven UI #6) — all real-time features configurable from JSON.
2. **No `any`** (Rule: Code Patterns #3) — strict types on event payloads and WS configs.
3. **SSR safe** (Rule: SSR #3) — WebSocket/EventSource connections only in `useEffect`.
4. **One code path** (Rule: Config-Driven UI #1) — use existing `WsManager` and `SseManager`, do not create alternatives.
5. **Registries, not switches** (Rule: Config-Driven UI #4) — event handlers registered, not hardcoded.
6. **Semantic tokens** — presence indicator and any real-time UI uses `--sn-*` tokens.
7. **Clean reconnection** — all connections must handle reconnect, auth token refresh, and cleanup.

---

## Phase F.1: WebSocket Connection

### Goal

Add `manifest.realtime.ws` config that declares the WebSocket connection. `ManifestApp`
establishes the connection on mount using the existing `WsManager`. Verify the existing
manager handles all config options (reconnect, heartbeat, auth).

### Types

Add to `src/ui/manifest/schema.ts`:

```ts
/**
 * WebSocket connection configuration.
 * Declared in manifest.realtime.ws.
 */
export const wsConfigSchema = z.object({
  /** WebSocket server URL. Supports env refs. */
  url: stringOrEnvRef,
  /**
   * Authentication strategy.
   * - "token" — sends auth token as a query parameter or in first message.
   * - "header" — not supported by browser WebSocket API, use "token".
   */
  auth: z.object({
    /** How to send the auth token. */
    strategy: z.enum(["query-param", "first-message"]),
    /** Query parameter name (for strategy: "query-param"). */
    paramName: z.string().default("token"),
  }).optional(),
  /** Reconnection configuration. */
  reconnect: z.object({
    /** Enable automatic reconnection. Default: true. */
    enabled: z.boolean().default(true),
    /** Maximum number of reconnection attempts. Default: 10. */
    maxAttempts: z.number().int().positive().default(10),
    /** Base delay in ms for exponential backoff. Default: 1000. */
    baseDelay: z.number().int().positive().default(1000),
    /** Maximum delay in ms. Default: 30000. */
    maxDelay: z.number().int().positive().default(30000),
  }).optional(),
  /** Heartbeat/ping configuration to keep the connection alive. */
  heartbeat: z.object({
    /** Enable heartbeat pings. */
    enabled: z.boolean().default(false),
    /** Interval in ms between pings. Default: 30000. */
    interval: z.number().int().positive().default(30000),
    /** The message to send as a ping. Default: "ping". */
    message: z.string().default("ping"),
  }).optional(),
});

/** Real-time configuration section of the manifest. */
export const realtimeConfigSchema = z.object({
  ws: wsConfigSchema.optional(),
  sse: z.unknown().optional(), // Defined in F.4
  presence: z.unknown().optional(), // Defined in F.5
});
```

Add to manifest root:

```ts
export const manifestSchema = z.object({
  // ... existing ...
  realtime: realtimeConfigSchema.optional(),
});
```

### Implementation

**1. Verify `WsManager` supports all options:**

Audit `src/ws/manager.ts` to confirm it handles:
- URL with query params for auth
- Reconnection with backoff
- Heartbeat ping
- First-message auth

If any are missing, extend the manager.

**2. Create `src/ui/manifest/realtime.ts`:**

```ts
'use client';

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { wsManagerAtom } from "../../ws/atom";
import { WsManager } from "../../ws/manager";
import type { ActionConfig } from "../actions/types";

export interface RealtimeWsConfig {
  url: string;
  auth?: {
    strategy: "query-param" | "first-message";
    paramName: string;
  };
  reconnect?: {
    enabled: boolean;
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
  };
  heartbeat?: {
    enabled: boolean;
    interval: number;
    message: string;
  };
}

/**
 * Hook that manages the WebSocket connection lifecycle from manifest config.
 * Connects on mount, disconnects on unmount.
 */
export function useManifestWs(
  config: RealtimeWsConfig | undefined,
  authToken: string | null,
): WsManager | null {
  const [manager, setManager] = useAtom(wsManagerAtom);
  const configRef = useRef(config);

  useEffect(() => {
    if (!config) return;

    let url = config.url;

    // Apply auth
    if (config.auth?.strategy === "query-param" && authToken) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}${config.auth.paramName}=${encodeURIComponent(authToken)}`;
    }

    const ws = new WsManager();
    ws.connect(url, {
      reconnect: config.reconnect,
      heartbeat: config.heartbeat,
    });

    // First-message auth
    if (config.auth?.strategy === "first-message" && authToken) {
      ws.send("auth", { token: authToken });
    }

    setManager(ws);

    return () => {
      ws.disconnect();
      setManager(null);
    };
  }, [config?.url, authToken]);

  return manager;
}
```

**3. Wire into `ManifestApp`:**

```ts
// In ManifestApp component:
const wsConfig = compiled.manifest.realtime?.ws;
const wsManager = useManifestWs(wsConfig, authToken);
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/realtime.ts` |
| Modify | `src/ui/manifest/schema.ts` — add `wsConfigSchema`, `realtimeConfigSchema`, add `realtime` to manifest |
| Modify | `src/ui/manifest/types.ts` — add `realtime` to `CompiledManifest` |
| Modify | `src/ui/manifest/app.tsx` — call `useManifestWs` |
| Modify | `src/ws/manager.ts` — extend if heartbeat/auth options are missing |

### Documentation Impact

- JSDoc on `wsConfigSchema`, `useManifestWs`.
- JSDoc on any new WsManager options.

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/realtime.test.ts` (create) | Tests: WS connects with URL, auth query param appended, heartbeat config passed, cleanup disconnects. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: `realtime.ws` config validates, missing fields use defaults. |

### Exit Criteria

- [ ] `{ "realtime": { "ws": { "url": "wss://api.example.com/ws" } } }` establishes WS connection on app mount.
- [ ] `{ "auth": { "strategy": "query-param" } }` appends token to URL.
- [ ] `{ "reconnect": { "maxAttempts": 5 } }` reconnects up to 5 times.
- [ ] `{ "heartbeat": { "enabled": true, "interval": 15000 } }` sends pings.
- [ ] Unmounting ManifestApp disconnects the WebSocket.
- [ ] SSR safe — connection established in `useEffect`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase F.2: Event-to-Action Mapping

### Goal

Add `events` map that routes WS/SSE event names to action arrays. When an event arrives,
the corresponding actions execute with `{event}` as context.

### Types

```ts
/**
 * Event-to-action mapping.
 * Keys are event names, values are actions to execute when the event fires.
 */
export const eventActionMapSchema = z.record(
  z.string(),
  z.union([actionConfigSchema, z.array(actionConfigSchema)]),
);
```

Add to WS config and SSE config:

```ts
export const wsConfigSchema = z.object({
  // ... existing from F.1 ...
  /** Map of WS event names to actions. */
  events: eventActionMapSchema.optional(),
});
```

Add to route config (for page-scoped events):

```ts
export const routeConfigSchema = z.object({
  // ... existing ...
  /** Event-to-action mappings scoped to this route. */
  events: eventActionMapSchema.optional(),
});
```

### Implementation

**1. Create `src/ui/manifest/event-bridge.ts`:**

```ts
'use client';

import { useEffect } from "react";
import type { WsManager } from "../../ws/manager";
import type { ActionConfig, ActionExecuteFn } from "../actions/types";

export interface EventActionMap {
  [eventName: string]: ActionConfig | ActionConfig[];
}

/**
 * Bridges WS events to the action executor.
 * Subscribes to each event in the map and executes the corresponding actions.
 */
export function useEventBridge(
  wsManager: WsManager | null,
  events: EventActionMap | undefined,
  executeAction: ActionExecuteFn,
): void {
  useEffect(() => {
    if (!wsManager || !events) return;

    const cleanups: (() => void)[] = [];

    for (const [eventName, actionConfig] of Object.entries(events)) {
      const handler = (payload: unknown) => {
        const context = { event: payload, eventName };
        const actions = Array.isArray(actionConfig) ? actionConfig : [actionConfig];
        for (const action of actions) {
          executeAction(action, context);
        }
      };

      wsManager.on(eventName, handler);
      cleanups.push(() => wsManager.off(eventName, handler));
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [wsManager, events, executeAction]);
}
```

**2. Wire into ManifestApp** for app-level events and into route runtime for route-scoped events.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/event-bridge.ts` |
| Modify | `src/ui/manifest/schema.ts` — add `eventActionMapSchema`, add `events` to WS config and route config |
| Modify | `src/ui/manifest/app.tsx` — call `useEventBridge` for app-level events |
| Modify | `src/ui/manifest/runtime.tsx` — call `useEventBridge` for route-scoped events |
| Modify | `src/ui/manifest/types.ts` — add `events` to compiled types |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/event-bridge.test.ts` (create) | Tests: subscribes to events, executes action on event, provides {event} context, cleans up on unmount. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: `events` map validates. |

### Exit Criteria

- [ ] `{ "events": { "user:updated": { "type": "refresh" } } }` refreshes on WS event.
- [ ] `{ "events": { "notification": { "type": "toast", "message": "{event.message}" } } }` shows toast from event payload.
- [ ] Event payload available as `{event}` in action context.
- [ ] Multiple actions per event execute sequentially.
- [ ] Route-scoped events only fire when the route is active.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase F.3: WS Send Action

### Goal

Add `ws-send` action type for sending messages through the WebSocket connection.

### Types

```ts
export interface WsSendAction {
  type: "ws-send";
  /** The event name to send. */
  event: string;
  /**
   * The data payload. Supports template interpolation and FromRef.
   * Serialized as JSON.
   */
  data?: Record<string, unknown> | { from: string };
}
```

### Implementation

Add to `src/ui/actions/executor.ts`:

```ts
case "ws-send": {
  const wsManager = getWsManager(); // from Jotai atom or context
  if (!wsManager) {
    console.warn("[Snapshot] ws-send action failed: no WebSocket connection");
    break;
  }

  let data = action.data;
  if (data && typeof data === "object" && "from" in data) {
    data = resolveFromRef(data as FromRef, fromRefContext) as Record<string, unknown>;
  } else if (data) {
    // Resolve templates in data values
    data = resolveTemplateObject(data, mergedContext);
  }

  wsManager.send(action.event, data);
  break;
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/ui/actions/types.ts` — add `WsSendAction`, add `"ws-send"` to `ACTION_TYPES` |
| Modify | `src/ui/actions/executor.ts` — handle `ws-send` |

### Tests

| File | What |
|---|---|
| `src/ui/actions/__tests__/executor.test.ts` | Add: ws-send calls manager.send, ws-send with FromRef data resolves, ws-send without manager warns. |

### Exit Criteria

- [ ] `{ "type": "ws-send", "event": "typing", "data": { "userId": "{userId}" } }` sends typing event.
- [ ] Data supports `{ from: "form-data" }` ref.
- [ ] Missing WS connection logs warning, does not throw.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase F.4: Server-Sent Events

### Goal

Add `manifest.realtime.sse` config for SSE connections. One-directional (server to client).
Events map to actions using the same `eventActionMapSchema` from F.2.

### Types

```ts
/**
 * SSE connection configuration.
 */
export const sseConfigSchema = z.object({
  /** SSE endpoint URL. Supports env refs. */
  url: stringOrEnvRef,
  /** Whether to include credentials. Default: true. */
  withCredentials: z.boolean().default(true),
  /** Event-to-action mappings. */
  events: eventActionMapSchema.optional(),
  /** Reconnect on error. Default: true (EventSource auto-reconnects). */
  reconnect: z.boolean().default(true),
});
```

Add to `realtimeConfigSchema`:

```ts
export const realtimeConfigSchema = z.object({
  ws: wsConfigSchema.optional(),
  sse: sseConfigSchema.optional(),
  presence: z.unknown().optional(), // Defined in F.5
});
```

### Implementation

**1. Create `src/ui/manifest/realtime-sse.ts`:**

```ts
'use client';

import { useEffect } from "react";
import { SseManager } from "../../sse/manager";
import type { ActionExecuteFn } from "../actions/types";
import type { EventActionMap } from "./event-bridge";

export interface RealtimeSseConfig {
  url: string;
  withCredentials: boolean;
  events?: EventActionMap;
  reconnect: boolean;
}

/**
 * Hook that manages SSE connection lifecycle from manifest config.
 */
export function useManifestSse(
  config: RealtimeSseConfig | undefined,
  executeAction: ActionExecuteFn,
): void {
  useEffect(() => {
    if (!config) return;

    const sse = new SseManager();
    sse.connect(config.url, {
      withCredentials: config.withCredentials,
    });

    // Register event handlers
    const cleanups: (() => void)[] = [];
    if (config.events) {
      for (const [eventName, actionConfig] of Object.entries(config.events)) {
        const handler = (data: unknown) => {
          const context = { event: data, eventName };
          const actions = Array.isArray(actionConfig) ? actionConfig : [actionConfig];
          for (const action of actions) {
            executeAction(action, context);
          }
        };

        sse.on(eventName, handler);
        cleanups.push(() => sse.off(eventName, handler));
      }
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
      sse.close();
    };
  }, [config?.url]);
}
```

**2. Wire into ManifestApp:**

```ts
const sseConfig = compiled.manifest.realtime?.sse;
useManifestSse(sseConfig, executeAction);
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/realtime-sse.ts` |
| Modify | `src/ui/manifest/schema.ts` — add `sseConfigSchema`, update `realtimeConfigSchema` |
| Modify | `src/ui/manifest/app.tsx` — call `useManifestSse` |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/realtime-sse.test.ts` (create) | Tests: SSE connects with URL, events mapped to actions, cleanup closes connection. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: `realtime.sse` config validates. |

### Exit Criteria

- [ ] `{ "realtime": { "sse": { "url": "/api/events", "events": { "update": { "type": "refresh" } } } } }` opens SSE and refreshes on events.
- [ ] SSE events fire mapped actions with payload as `{event}`.
- [ ] Connection closes on unmount.
- [ ] SSR safe — EventSource only in `useEffect`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase F.5: Presence

### Goal

Add `manifest.realtime.presence` config. Sends periodic heartbeats over the WS connection.
Provides presence data to the existing `presence-indicator` component.

### Types

```ts
/**
 * Presence tracking configuration.
 * Requires an active WebSocket connection (manifest.realtime.ws).
 */
export const presenceConfigSchema = z.object({
  /** Enable presence tracking. */
  enabled: z.boolean().default(false),
  /** Channel/room name for scoping presence. Supports template interpolation. */
  channel: z.string(),
  /** Heartbeat interval in ms. Default: 10000 (10s). */
  heartbeatInterval: z.number().int().positive().default(10000),
  /** How long before a user is considered offline (ms). Default: 30000 (30s). */
  offlineThreshold: z.number().int().positive().default(30000),
  /** User data to include in presence. */
  userData: z.record(z.string(), z.unknown()).optional(),
});
```

### Implementation

**1. Create `src/ui/manifest/presence.ts`:**

```ts
'use client';

import { useEffect, useCallback, useMemo, useState } from "react";
import type { WsManager } from "../../ws/manager";

export interface PresenceUser {
  id: string;
  lastSeen: number;
  data?: Record<string, unknown>;
}

export interface PresenceState {
  users: PresenceUser[];
  isConnected: boolean;
}

export interface PresenceConfig {
  enabled: boolean;
  channel: string;
  heartbeatInterval: number;
  offlineThreshold: number;
  userData?: Record<string, unknown>;
}

/**
 * Manages presence tracking over a WebSocket connection.
 * Sends heartbeats at the configured interval.
 * Tracks other users' presence from incoming events.
 */
export function usePresence(
  config: PresenceConfig | undefined,
  wsManager: WsManager | null,
  userId: string | null,
): PresenceState {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const isConnected = wsManager !== null;

  useEffect(() => {
    if (!config?.enabled || !wsManager || !userId) return;

    // Send heartbeat
    const sendHeartbeat = () => {
      wsManager.send("presence:heartbeat", {
        channel: config.channel,
        userId,
        data: config.userData,
      });
    };

    // Initial heartbeat
    sendHeartbeat();

    // Periodic heartbeat
    const timer = setInterval(sendHeartbeat, config.heartbeatInterval);

    // Listen for presence updates
    const handlePresenceUpdate = (payload: unknown) => {
      if (typeof payload === "object" && payload !== null && "users" in payload) {
        setUsers((payload as { users: PresenceUser[] }).users);
      }
    };

    wsManager.on("presence:update", handlePresenceUpdate);

    // Send leave on unmount
    return () => {
      clearInterval(timer);
      wsManager.off("presence:update", handlePresenceUpdate);
      wsManager.send("presence:leave", {
        channel: config.channel,
        userId,
      });
    };
  }, [config?.enabled, config?.channel, wsManager, userId]);

  // Prune stale users
  useEffect(() => {
    if (!config?.enabled) return;

    const pruneTimer = setInterval(() => {
      const now = Date.now();
      setUsers((prev) =>
        prev.filter((user) => now - user.lastSeen < (config?.offlineThreshold ?? 30000)),
      );
    }, 5000);

    return () => clearInterval(pruneTimer);
  }, [config?.enabled, config?.offlineThreshold]);

  return useMemo(
    () => ({ users, isConnected }),
    [users, isConnected],
  );
}
```

**2. Store presence state in a Jotai atom** so the `presence-indicator` component can read it.

**3. Update `presence-indicator` component** to optionally read from the presence atom
when no explicit `users` data is provided.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/presence.ts` |
| Modify | `src/ui/manifest/schema.ts` — add `presenceConfigSchema`, update `realtimeConfigSchema` |
| Modify | `src/ui/manifest/app.tsx` — call `usePresence`, store in atom |
| Modify | `src/ui/components/communication/presence-indicator/component.tsx` — read from presence atom |
| Modify | `src/ui/components/communication/presence-indicator/schema.ts` — add `channel` prop for auto-connect |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/presence.test.ts` (create) | Tests: sends heartbeat on mount, sends at interval, prunes stale users, sends leave on unmount. |
| `src/ui/manifest/__tests__/schema.test.ts` | Add: `realtime.presence` config validates. |

### Exit Criteria

- [ ] `{ "realtime": { "presence": { "enabled": true, "channel": "dashboard" } } }` starts heartbeat.
- [ ] Heartbeat sends every `heartbeatInterval` ms.
- [ ] Presence indicator component auto-displays users from the same channel.
- [ ] Stale users pruned after `offlineThreshold`.
- [ ] Leave event sent on unmount.
- [ ] SSR safe — heartbeat and WS only in `useEffect`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase F.6: Live Data Binding

### Goal

Add `live` prop on data components (data-table, list, chart, stat-card, feed). When a WS
event fires, the component auto-refreshes its data. This is syntactic sugar for an
event-to-refresh action binding.

### Types

```ts
/**
 * Live data binding. Auto-refreshes the component when the specified
 * WS event fires. Syntactic sugar for events → refresh action.
 */
export const liveConfigSchema = z.union([
  z.boolean(),
  z.object({
    /** The WS event name that triggers a refresh. */
    event: z.string(),
    /**
     * Debounce refresh by N ms.
     * Prevents rapid re-fetches when events fire in bursts.
     */
    debounce: z.number().int().positive().optional(),
    /**
     * Whether to show a subtle indicator that new data is available
     * instead of auto-refreshing. The user clicks to refresh.
     */
    indicator: z.boolean().default(false),
  }),
]);
```

### Implementation

**1. Create `src/ui/components/_base/use-live-data.ts`:**

```ts
'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import type { WsManager } from "../../../ws/manager";

export interface UseLiveDataOptions {
  /** The WS event name to listen for. */
  event: string;
  /** Callback to refresh data. */
  onRefresh: () => void;
  /** Debounce in ms. */
  debounce?: number;
  /** Show indicator instead of auto-refresh. */
  indicator?: boolean;
  /** The WsManager instance. */
  wsManager: WsManager | null;
  /** Whether live binding is enabled. */
  enabled: boolean;
}

export interface UseLiveDataResult {
  /** Whether new data is available (only when indicator mode is on). */
  hasNewData: boolean;
  /** Manually trigger refresh (used with indicator mode). */
  refresh: () => void;
}

export function useLiveData(options: UseLiveDataOptions): UseLiveDataResult {
  const { event, onRefresh, debounce, indicator = false, wsManager, enabled } = options;
  const [hasNewData, setHasNewData] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const handleRefresh = useCallback(() => {
    setHasNewData(false);
    onRefreshRef.current();
  }, []);

  useEffect(() => {
    if (!enabled || !wsManager) return;

    const handler = () => {
      if (indicator) {
        setHasNewData(true);
        return;
      }

      if (debounce) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          onRefreshRef.current();
        }, debounce);
      } else {
        onRefreshRef.current();
      }
    };

    wsManager.on(event, handler);

    return () => {
      wsManager.off(event, handler);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [event, enabled, wsManager, indicator, debounce]);

  return { hasNewData, refresh: handleRefresh };
}
```

**2. Update data components** to call `useLiveData` when `live` is truthy. Show a
"New data available" banner when `indicator` mode is on.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/components/_base/use-live-data.ts` |
| Modify | `src/ui/components/data/data-table/schema.ts` — add `live` |
| Modify | `src/ui/components/data/data-table/component.tsx` — wire `useLiveData` |
| Modify | `src/ui/components/data/list/schema.ts` — add `live` |
| Modify | `src/ui/components/data/list/component.tsx` — wire `useLiveData` |
| Modify | `src/ui/components/data/chart/schema.ts` — add `live` |
| Modify | `src/ui/components/data/stat-card/schema.ts` — add `live` |
| Modify | `src/ui/components/data/feed/schema.ts` — add `live` |

### Tests

| File | What |
|---|---|
| `src/ui/components/_base/__tests__/use-live-data.test.ts` (create) | Tests: auto-refreshes on event, debounces rapid events, indicator mode sets flag without refreshing, manual refresh clears flag. |

### Exit Criteria

- [ ] `{ "type": "data-table", "live": true }` auto-refreshes on any WS event.
- [ ] `{ "live": { "event": "data:updated", "debounce": 500 } }` debounces refresh.
- [ ] `{ "live": { "event": "data:updated", "indicator": true } }` shows "New data available" banner.
- [ ] Clicking the banner triggers a refresh.
- [ ] No live binding when WS is not configured (graceful no-op).
- [ ] SSR safe — WS listener in `useEffect`.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Parallelization & Sequencing

### Track Overview

Three tracks:

| Track | Phases | Files Owned |
|---|---|---|
| WS | F.1, F.2, F.3, F.5 | `src/ui/manifest/realtime.ts`, `src/ui/manifest/event-bridge.ts`, `src/ui/manifest/presence.ts`, `src/ws/manager.ts` |
| SSE | F.4 | `src/ui/manifest/realtime-sse.ts` |
| Data | F.6 | `src/ui/components/_base/use-live-data.ts`, data component schemas |

### Why Tracks Are Independent

- **WS** is self-contained — creates the connection, bridges events, adds send action, adds presence.
- **SSE** is parallel — uses the same event bridge pattern but different transport.
- **Data** depends on WS (needs a WsManager to listen to) but only reads from it.

### File Conflicts

- **F.1 and F.2** both touch `src/ui/manifest/app.tsx`. Run sequentially.
- **F.2 and F.4** share `eventActionMapSchema`. F.2 creates it, F.4 reuses it.
- **F.5** depends on F.1 (needs WS connection).
- **F.6** depends on F.1 (needs WsManager) and can run after F.1.
- **F.3** depends on F.1 (needs WsManager in executor context).

### Recommended Order

1. **F.1** (WS connection — everything depends on it)
2. **F.2** (event mapping — needed by F.4 and F.6)
3. **F.3** (WS send action — standalone after F.1)
4. **F.4** (SSE — reuses patterns from F.1/F.2)
5. **F.5** (presence — builds on WS)
6. **F.6** (live data — builds on WS, most component changes)

### Branch Strategy

```
branch: phase-f-realtime
base: main
```

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Audit `src/ws/manager.ts` and `src/sse/manager.ts` to verify existing capabilities.
4. Start with F.1.
5. For each phase:
   a. Create/modify files exactly as listed.
   b. Add JSDoc to all new exports.
   c. Run `bun run typecheck && bun test`.
   d. Run `bun run format:check`.
   e. Commit with message: `feat(phase-f.N): <title>`.
6. After all phases:
   a. Run `bun run build`.
   b. Verify all WS/SSE connections clean up on unmount.
   c. Verify SSR safety.
7. Push branch, do not merge.

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| WS reconnection storms | Exponential backoff with max delay. Test with mock disconnections. |
| Event handler memory leaks | All handlers cleaned up in useEffect return. |
| Presence stale state | Client-side pruning timer. Server is source of truth. |
| SSE EventSource browser compat | EventSource is supported in all modern browsers. Provide clear error if missing. |

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # No type errors
bun test                 # All tests pass
bun run format:check     # Prettier clean
```

### Per-Track Checks

- [ ] No `any` casts.
- [ ] All WS/SSE connections establish in `useEffect` only.
- [ ] All connections clean up on unmount.
- [ ] All new exports have JSDoc.

### Documentation Checks

- [ ] JSDoc on `wsConfigSchema`, `sseConfigSchema`, `presenceConfigSchema`, `liveConfigSchema`.
- [ ] JSDoc on `useManifestWs`, `useManifestSse`, `useEventBridge`, `usePresence`, `useLiveData`.
- [ ] `src/ui.ts` exports updated if applicable.

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds
bun test                 # All real-time tests pass
```

- [ ] All 6 sub-phases have passing tests.
- [ ] WS connects, events trigger actions, send works, presence heartbeats.
- [ ] SSE connects and bridges events.
- [ ] Live data binding auto-refreshes components.
- [ ] No TypeScript required for any real-time feature.
