import { useState, useEffect, useCallback } from "react";

/**
 * Convert a URL-safe base64 string to a Uint8Array.
 * Required for VAPID applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushState =
  | "unsupported"
  | "denied"
  | "pending"
  | "subscribed"
  | "unsubscribed";

export interface UsePushNotificationsOpts {
  /** URL to fetch the VAPID public key from. Default: '/__push/vapid-public-key' */
  vapidPublicKeyUrl?: string;
  /** URL for subscribe/unsubscribe requests. Default: '/__push/subscribe' */
  subscribeUrl?: string;
  /** Service worker path. Default: '/sw.js' */
  swPath?: string;
}

export interface UsePushNotificationsResult {
  /** Current push subscription state */
  state: PushState;
  /** Current Notification API permission */
  permission: NotificationPermission;
  /** Request permission, register SW, and subscribe to push */
  subscribe(): Promise<void>;
  /** Unsubscribe from push and notify backend */
  unsubscribe(): Promise<void>;
}

/**
 * Standalone hook for Web Push subscription management.
 * No dependency on Snapshot's SSE or auth infrastructure.
 *
 * CSRF: /__push/* routes are CSRF-exempt by design. No CSRF header is sent.
 * Auth: requests use credentials: 'include' (cookie auth).
 *
 * Service worker setup: copy sw.js from node_modules/@lastshotlabs/snapshot/dist/sw.js
 * to your project's public/sw.js, OR use `snapshot init` which scaffolds it automatically.
 */
export function usePushNotifications(
  opts?: UsePushNotificationsOpts,
): UsePushNotificationsResult {
  const vapidPublicKeyUrl =
    opts?.vapidPublicKeyUrl ?? "/__push/vapid-public-key";
  const subscribeUrl = opts?.subscribeUrl ?? "/__push/subscribe";
  const swPath = opts?.swPath ?? "/sw.js";

  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const [state, setState] = useState<PushState>(() => {
    if (!isSupported) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    return "pending";
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window))
      return "default";
    return Notification.permission;
  });

  // On mount: hydrate state from existing subscription
  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setState(subscription !== null ? "subscribed" : "unsubscribed");
      })
      .catch(() => {});
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") {
      setState(perm === "denied" ? "denied" : "pending");
      return;
    }

    await navigator.serviceWorker.register(swPath);
    const registration = await navigator.serviceWorker.ready;

    const keyRes = await fetch(vapidPublicKeyUrl);
    if (!keyRes.ok)
      throw new Error(`Failed to fetch VAPID public key: ${keyRes.status}`);
    const { publicKey } = (await keyRes.json()) as { publicKey: string };

    const keyBytes = urlBase64ToUint8Array(publicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes.buffer as ArrayBuffer,
    });

    const subJson = subscription.toJSON();
    const res = await fetch(subscribeUrl, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys?.["p256dh"],
          auth: subJson.keys?.["auth"],
        },
      }),
    });

    if (!res.ok)
      throw new Error(`Failed to save push subscription: ${res.status}`);
    setState("subscribed");
  }, [isSupported, vapidPublicKeyUrl, subscribeUrl, swPath]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      setState("unsubscribed");
      return;
    }

    await fetch(subscribeUrl, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
    setState("unsubscribed");
  }, [isSupported, subscribeUrl]);

  return { state, permission, subscribe, unsubscribe };
}
