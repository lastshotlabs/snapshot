"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WebSocketManager } from "../../../ws/manager";

export function useLiveData({
  event,
  onRefresh,
  debounce,
  indicator = false,
  wsManager,
  enabled,
}: {
  event: string;
  onRefresh: () => void;
  debounce?: number;
  indicator?: boolean;
  wsManager: WebSocketManager<Record<string, unknown>> | null;
  enabled: boolean;
}): {
  hasNewData: boolean;
  refresh: () => void;
} {
  const [hasNewData, setHasNewData] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const refresh = useCallback(() => {
    setHasNewData(false);
    onRefreshRef.current();
  }, []);

  useEffect(() => {
    if (!enabled || !wsManager) {
      return;
    }

    const handler = () => {
      if (indicator) {
        setHasNewData(true);
        return;
      }

      if (debounce) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          onRefreshRef.current();
        }, debounce);
        return;
      }

      onRefreshRef.current();
    };

    wsManager.on(event, handler);
    return () => {
      wsManager.off(event, handler);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [debounce, enabled, event, indicator, wsManager]);

  return { hasNewData, refresh };
}
