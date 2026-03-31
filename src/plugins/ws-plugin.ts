import { useAtom } from "jotai";
import type { SocketHook } from "../types";
import { wsManagerAtom } from "../ws/atom";
import { createWsHooks } from "../ws/hook";
import { WebSocketManager } from "../ws/manager";
import type { SnapshotPlugin, SnapshotPluginContext } from "./types";

// ── WS plugin config ─────────────────────────────────────────────────────────

export interface WsPluginConfig {
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

// ── WS plugin hooks type ─────────────────────────────────────────────────────

export interface WsPluginHooks<
  TWSEvents extends Record<string, unknown> = Record<string, unknown>,
> {
  useSocket: () => SocketHook<TWSEvents>;
  useRoom: (room: string) => { isSubscribed: boolean };
  useRoomEvent: <T>(room: string, event: string, handler: (data: T) => void) => void;
  useWebSocketManager: () => WebSocketManager<TWSEvents> | null;
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createWsPlugin<TWSEvents extends Record<string, unknown> = Record<string, unknown>>(
  pluginConfig: WsPluginConfig,
): SnapshotPlugin<WsPluginHooks<TWSEvents>> {
  let wsManager: WebSocketManager<TWSEvents> | null = null;

  return {
    name: "ws",

    setup(ctx: SnapshotPluginContext) {
      wsManager = new WebSocketManager<TWSEvents>({
        url: pluginConfig.url,
        autoReconnect: pluginConfig.autoReconnect,
        reconnectOnFocus: pluginConfig.reconnectOnFocus,
        maxReconnectAttempts: pluginConfig.maxReconnectAttempts,
        reconnectBaseDelay: pluginConfig.reconnectBaseDelay,
        reconnectMaxDelay: pluginConfig.reconnectMaxDelay,
        onConnected: pluginConfig.onConnected,
        onDisconnected: pluginConfig.onDisconnected,
        onReconnecting: pluginConfig.onReconnecting,
        onReconnectFailed: pluginConfig.onReconnectFailed,
      });

      if (pluginConfig.reconnectOnLogin !== false) {
        ctx.callbacks.onLoginSuccess.push(() => wsManager?.reconnect());
      }
    },

    createHooks(): WsPluginHooks<TWSEvents> {
      const { useSocket, useRoom, useRoomEvent } = createWsHooks<TWSEvents>();

      function useWebSocketManager(): WebSocketManager<TWSEvents> | null {
        const [current, setManager] = useAtom(wsManagerAtom);
        if (wsManager !== null && current === null) {
          setManager(wsManager);
        }
        return current as WebSocketManager<TWSEvents> | null;
      }

      return {
        useSocket,
        useRoom,
        useRoomEvent,
        useWebSocketManager,
      };
    },

    teardown() {
      wsManager?.disconnect();
      wsManager = null;
    },
  };
}
