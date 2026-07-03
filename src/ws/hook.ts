import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { wsManagerAtom } from "./atom";
import type { SocketHook } from "../types";
import type { WebSocketManager } from "./manager";

export function createWsHooks<TEvents extends Record<string, unknown>>(
  getManager?: () => WebSocketManager<TEvents> | null,
) {
  function useWebSocketManager(): WebSocketManager<TEvents> | null {
    const [current, setManager] = useAtom(wsManagerAtom);
    const instance = getManager?.() ?? null;
    // Seed the atom from the instance closure on first use so every consumer
    // (useSocket/useRoom/useRoomEvent) sees the manager without requiring the
    // app to mount a dedicated initializer first.
    if (instance !== null && current === null) {
      setManager(instance);
    }
    return (current ?? instance) as WebSocketManager<TEvents> | null;
  }

  function useSocket(): SocketHook<TEvents> {
    const manager = useWebSocketManager();
    const [isConnected, setIsConnected] = useState(
      manager?.isConnected ?? false,
    );

    useEffect(() => {
      if (!manager) return;

      const interval = setInterval(() => {
        setIsConnected(manager.isConnected);
      }, 500);

      return () => clearInterval(interval);
    }, [manager]);

    return {
      isConnected,
      send: (type, payload) => manager?.send(type, payload),
      subscribe: (room) => manager?.subscribe(room),
      unsubscribe: (room) => manager?.unsubscribe(room),
      getRooms: () => manager?.getRooms() ?? [],
      // Type safety enforced at SocketHook API boundary
      on: (event, handler) =>
        manager?.on(event, handler as (data: unknown) => void),
      off: (event, handler) =>
        manager?.off(event, handler as (data: unknown) => void),
      reconnect: () => manager?.reconnect(),
    };
  }

  function useRoom(room: string): { isSubscribed: boolean } {
    const manager = useWebSocketManager();
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
      if (!manager) return;
      manager.subscribe(room);
      setIsSubscribed(true);
      return () => {
        manager.unsubscribe(room);
        setIsSubscribed(false);
      };
    }, [room, manager]);

    return { isSubscribed };
  }

  function useRoomEvent<T>(
    room: string,
    event: string,
    handler: (data: T) => void,
  ): void {
    const manager = useWebSocketManager();

    useEffect(() => {
      if (!manager) return;

      // Scoped: only handle events tagged to this room
      const scoped = (
        data: { room?: string; payload?: T } & Record<string, unknown>,
      ) => {
        if (data["room"] === room) {
          handler(("payload" in data ? data["payload"] : data) as T);
        }
      };

      manager.on(
        event as keyof TEvents,
        scoped as (data: unknown) => void,
      );
      return () => {
        manager.off(
          event as keyof TEvents,
          scoped as (data: unknown) => void,
        );
      };
    }, [room, event, handler, manager]);
  }

  return { useWebSocketManager, useSocket, useRoom, useRoomEvent };
}
