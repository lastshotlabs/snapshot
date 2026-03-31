import { useCallback, useEffect, useState } from "react";
import { createCommunityHooks } from "../community/hooks";
import type { CommunityHooks } from "../community/hooks";
import type { SseManager } from "../sse/manager";
import type {
  CommunityNotification,
  UseCommunityNotificationsOpts,
  UseCommunityNotificationsResult,
} from "../types";
import { SSE_SHARED_KEY, type SseSharedState } from "./sse-plugin";
import type { SnapshotPlugin, SnapshotPluginContext } from "./types";

// ── Community plugin config ──────────────────────────────────────────────────

export interface CommunityPluginConfig {
  notifications?: {
    /** SSE endpoint for real-time notifications. Default: `'/__sse/notifications'`. */
    sseEndpoint?: string;
    /** API base path for notification CRUD. Default: `'/community/notifications'`. */
    apiBase?: string;
  };
}

// ── Community plugin hooks type ──────────────────────────────────────────────

export type CommunityPluginHooks = CommunityHooks & {
  useCommunityNotifications?: (
    opts?: UseCommunityNotificationsOpts,
  ) => UseCommunityNotificationsResult;
};

// ── Factory ──────────────────────────────────────────────────────────────────

export function createCommunityPlugin(
  pluginConfig: CommunityPluginConfig = {},
): SnapshotPlugin<CommunityPluginHooks> {
  return {
    name: "community",

    createHooks(ctx: SnapshotPluginContext): CommunityPluginHooks {
      const communityHooks = createCommunityHooks({
        api: ctx.api,
        queryClient: ctx.queryClient,
      });

      // Build notifications hook only if SSE plugin registered the notifications endpoint
      const sseShared = ctx.shared.get(SSE_SHARED_KEY) as SseSharedState | undefined;
      const notifEndpoint = pluginConfig.notifications?.sseEndpoint ?? "/__sse/notifications";
      const sseRegistry = sseShared?.registry;

      if (!sseRegistry?.has(notifEndpoint)) {
        return { ...communityHooks };
      }

      const notifEntry = sseRegistry.get(notifEndpoint)!;
      const sseManager = notifEntry.manager;

      function useCommunityNotifications(
        opts?: UseCommunityNotificationsOpts,
      ): UseCommunityNotificationsResult {
        const apiBase =
          opts?.apiBase ?? pluginConfig.notifications?.apiBase ?? "/community/notifications";
        const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
        const [isConnected, setIsConnected] = useState(false);

        const fetchNotifications = useCallback(async (): Promise<CommunityNotification[]> => {
          try {
            const result = await ctx.api.get<{
              items: CommunityNotification[];
              nextCursor?: string;
            }>(apiBase);
            const items = result.items;
            setNotifications(items);
            setIsConnected(sseManager.state === "open");
            return items;
          } catch {
            return [];
          }
        }, [apiBase]);

        useEffect(() => {
          setIsConnected(sseManager.state === "open");
          void fetchNotifications();
        }, [fetchNotifications]);

        useEffect(() => {
          const handler = async () => {
            const fresh = await fetchNotifications();
            if (
              fresh.length > 0 &&
              typeof document !== "undefined" &&
              document.visibilityState !== "visible" &&
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              const newest = fresh.find((n) => !n.read);
              if (newest) {
                const title =
                  newest.type === "reply"
                    ? "New reply to your thread"
                    : newest.type === "mention"
                      ? "You were mentioned"
                      : "Account update";
                new Notification(title);
              }
            }
          };

          sseManager.on("community:notification.created", handler);
          return () => {
            sseManager.off("community:notification.created", handler);
          };
        }, [fetchNotifications]);

        return {
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
          isConnected,
          markRead: async (id: string) => {
            await ctx.api.put<{ success: boolean }>(`${apiBase}/${id}/read`, undefined);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
          },
          markAllRead: async () => {
            await ctx.api.post<{ success: boolean }>(`${apiBase}/read-all`, undefined);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          },
        };
      }

      return {
        ...communityHooks,
        useCommunityNotifications,
      };
    },
  };
}
