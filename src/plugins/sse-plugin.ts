import { useEffect, useRef, useState } from "react";
import { SseManager } from "../sse/manager";
import type { SseConnectionStatus } from "../sse/manager";
import type { SseEndpointConfig, SseEventHookResult, SseHookResult } from "../types";
import type { SnapshotPlugin, SnapshotPluginContext } from "./types";

// ── SSE plugin config ────────────────────────────────────────────────────────

export interface SsePluginConfig {
  endpoints: Record<string, SseEndpointConfig>;
  reconnectOnLogin?: boolean;
}

// ── Shared state ─────────────────────────────────────────────────────────────

export interface SseSharedState {
  registry: Map<string, { manager: SseManager; url: string }>;
}

export const SSE_SHARED_KEY = "sse" as const;

// ── SSE plugin hooks type ────────────────────────────────────────────────────

export interface SsePluginHooks {
  useSSE(endpoint: string): SseHookResult;
  useSseEvent<T = unknown>(endpoint: string, event: string): SseEventHookResult<T>;
  onSseEvent(endpoint: string, event: string, handler: (payload: unknown) => void): () => void;
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createSsePlugin(pluginConfig: SsePluginConfig): SnapshotPlugin<SsePluginHooks> {
  const sseRegistry = new Map<string, { manager: SseManager; url: string }>();

  return {
    name: "sse",

    setup(ctx: SnapshotPluginContext) {
      for (const [path, endpointCfg] of Object.entries(pluginConfig.endpoints)) {
        const url = `${ctx.config.apiUrl}${path}`;
        const manager = new SseManager({
          withCredentials: endpointCfg.withCredentials,
          onConnected: endpointCfg.onConnected,
          onError: endpointCfg.onError,
          onClosed: endpointCfg.onClosed,
        });
        manager.connect(url);
        sseRegistry.set(path, { manager, url });
      }

      // Store registry for other plugins (e.g. community notifications)
      ctx.shared.set(SSE_SHARED_KEY, {
        registry: sseRegistry,
      } satisfies SseSharedState);

      // Register cross-plugin callbacks
      if (pluginConfig.reconnectOnLogin !== false) {
        ctx.callbacks.onLoginSuccess.push(() => {
          for (const [, { manager, url }] of sseRegistry) {
            manager.connect(url);
          }
        });
      }

      ctx.callbacks.onLogoutSuccess.push(() => {
        for (const [, { manager }] of sseRegistry) {
          manager.close();
        }
      });
    },

    createHooks(): SsePluginHooks {
      function useSSE(endpoint: string): SseHookResult {
        const entry = sseRegistry.get(endpoint);
        const [status, setStatus] = useState<SseConnectionStatus>(
          entry ? entry.manager.state : "closed",
        );

        useEffect(() => {
          if (!entry) return;
          const { manager } = entry;

          const es = manager.eventSource;
          if (!es) {
            setStatus(manager.state);
            return;
          }

          const onOpen = () => setStatus("open");
          const onError = () => setStatus(manager.state);

          es.addEventListener("open", onOpen);
          es.addEventListener("error", onError);
          setStatus(manager.state);

          return () => {
            es.removeEventListener("open", onOpen);
            es.removeEventListener("error", onError);
          };
        }, [endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

        return { status };
      }

      function useSseEvent<T = unknown>(endpoint: string, event: string): SseEventHookResult<T> {
        const entry = sseRegistry.get(endpoint);
        const [data, setData] = useState<T | null>(null);
        const [status, setStatus] = useState<SseConnectionStatus>(
          entry ? entry.manager.state : "closed",
        );

        const setDataRef = useRef(setData);
        setDataRef.current = setData;

        useEffect(() => {
          if (!entry) return;
          const { manager } = entry;

          const handler = (payload: unknown) => {
            setDataRef.current(payload as T);
          };

          manager.on(event, handler);
          setStatus(manager.state);

          const es = manager.eventSource;
          const onOpen = () => setStatus("open");
          const onError = () => setStatus(manager.state);

          if (es) {
            es.addEventListener("open", onOpen);
            es.addEventListener("error", onError);
          }

          return () => {
            manager.off(event, handler);
            if (es) {
              es.removeEventListener("open", onOpen);
              es.removeEventListener("error", onError);
            }
          };
        }, [endpoint, event]); // eslint-disable-line react-hooks/exhaustive-deps

        return { data, status };
      }

      function onSseEvent(
        endpoint: string,
        event: string,
        handler: (payload: unknown) => void,
      ): () => void {
        const entry = sseRegistry.get(endpoint);
        if (!entry) return () => {};
        entry.manager.on(event, handler);
        return () => entry.manager.off(event, handler);
      }

      return { useSSE, useSseEvent, onSseEvent };
    },

    teardown() {
      for (const [, { manager }] of sseRegistry) {
        manager.close();
      }
      sseRegistry.clear();
    },
  };
}
