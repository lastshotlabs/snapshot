---
title: Realtime
description: WebSocket rooms, SSE streams, push notifications, and live-updating data.
draft: false
---

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";

const snap = createSnapshot({
  apiUrl: "/api",
  ws: { url: "wss://api.example.com/ws" },
  sse: {
    endpoints: {
      notifications: { url: "/api/sse/notifications" },
    },
  },
});

function LiveDashboard() {
  snap.useRoom("dashboard");
  snap.useRoomEvent("dashboard", "stats:update", (data) => {
    console.log("New stats:", data);
  });

  return <div>Live dashboard</div>;
}
```

## WebSocket

### Connect and manage rooms

```tsx
// useSocket returns the WebSocket manager
const { isConnected, send, reconnect } = snap.useSocket();

// useRoom auto-subscribes to a room on mount and unsubscribes on unmount
snap.useRoom("chat:general");

// useRoomEvent listens for specific events within a room
snap.useRoomEvent("chat:general", "message:new", (data) => {
  appendMessage(data);
});
```

### Send messages

```tsx
const { send } = snap.useSocket();

send({ type: "chat:message", room: "chat:general", body: "Hello!" });
```

### Connection lifecycle

```tsx
const { isConnected, reconnect } = snap.useSocket();

if (!isConnected) {
  return <ButtonBase label="Reconnect" onClick={reconnect} />;
}
```

### Live-updating table

```tsx
function LiveUserTable() {
  const [users, setUsers] = useState([]);
  snap.useRoom("admin:users");

  snap.useRoomEvent("admin:users", "user:created", (user) => {
    setUsers((prev) => [...prev, user]);
  });

  snap.useRoomEvent("admin:users", "user:updated", (user) => {
    setUsers((prev) => prev.map((u) => u.id === user.id ? user : u));
  });

  snap.useRoomEvent("admin:users", "user:deleted", ({ id }) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  });

  return <DataTableBase columns={columns} rows={users} />;
}
```

## Server-Sent Events (SSE)

### Connect to an SSE endpoint

```tsx
const { status, data, error } = snap.useSSE("notifications");
// status: "connecting" | "open" | "closed"

if (status === "connecting") return <p>Connecting...</p>;
if (error) return <p>SSE error: {error.message}</p>;
```

### Listen for specific events

```tsx
snap.useSseEvent("notifications", "new-message", (data) => {
  showToast(`New message from ${data.sender}`);
});

snap.useSseEvent("notifications", "system-alert", (data) => {
  showAlert(data.message);
});
```

### Non-hook event listener

For use outside React components:

```tsx
const unsubscribe = snap.onSseEvent("notifications", "heartbeat", (data) => {
  console.log("Server heartbeat:", data);
});

// Later: unsubscribe();
```

### Community notifications via SSE

```tsx
const { data: notifications } = snap.useCommunityNotifications({
  // Automatically connects to the configured SSE endpoint for community events
});
```

## Push notifications

```tsx
import { usePushNotifications } from "@lastshotlabs/snapshot";

function NotificationSettings() {
  const { state, subscribe, unsubscribe } = usePushNotifications({
    vapidPublicKey: "YOUR_VAPID_KEY",
  });

  // state: "unsupported" | "denied" | "pending" | "subscribed" | "unsubscribed"

  if (state === "unsupported") return <p>Push notifications not supported</p>;
  if (state === "denied") return <p>Notifications blocked by browser</p>;

  return (
    <SwitchField
      label="Push notifications"
      checked={state === "subscribed"}
      onChange={(checked) => checked ? subscribe() : unsubscribe()}
    />
  );
}
```

## Realtime config

Configure WebSocket and SSE endpoints directly on the snapshot runtime:

```tsx
const snap = createSnapshot({
  apiUrl: "/api",
  ws: {
    url: "wss://api.example.com/ws",
  },
  sse: {
    endpoints: {
      notifications: {
        url: "/api/sse/notifications",
      },
      activity: {
        url: "/api/sse/activity",
      },
    },
  },
});
```

## Composition: live chat room with typing expiry

Typing indicators must auto-expire -- if a user closes their browser mid-type, you'll never get an `isTyping: false` event. Use a timeout to clear stale indicators:

```tsx
import { useState, useRef, useEffect, useCallback } from "react";

function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ name: string; avatar?: string }[]>([]);
  const { send, isConnected } = snap.useSocket();
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  snap.useRoom(`chat:${roomId}`);

  snap.useRoomEvent(`chat:${roomId}`, "message", useCallback((msg: any) => {
    setMessages((prev) => [...prev, msg]);
  }, []));

  snap.useRoomEvent(`chat:${roomId}`, "typing", useCallback(({ user, isTyping }: any) => {
    // Clear any existing expiry timer for this user
    const existing = typingTimers.current.get(user.name);
    if (existing) clearTimeout(existing);

    if (isTyping) {
      setTypingUsers((prev) =>
        prev.some((u) => u.name === user.name) ? prev : [...prev, user]
      );
      // Auto-expire after 3 seconds
      typingTimers.current.set(user.name, setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.name !== user.name));
        typingTimers.current.delete(user.name);
      }, 3000));
    } else {
      setTypingUsers((prev) => prev.filter((u) => u.name !== user.name));
      typingTimers.current.delete(user.name);
    }
  }, []));

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => typingTimers.current.forEach((t) => clearTimeout(t));
  }, []);

  const sendMessage = (body: string) => {
    send({ type: "chat:message", room: `chat:${roomId}`, body });
  };

  return (
    <ColumnBase>
      {!isConnected && <AlertBase severity="warning">Reconnecting...</AlertBase>}
      <ChatWindowBase
        title={`Room: ${roomId}`}
        threadSlot={
          <MessageThreadBase messages={messages} contentField="body" authorNameField="name" showTimestamps />
        }
        typingSlot={typingUsers.length > 0 ? <TypingIndicatorBase users={typingUsers} maxDisplay={3} /> : null}
        inputSlot={<ChatInput onSend={sendMessage} disabled={!isConnected} />}
      />
    </ColumnBase>
  );
}
```

## Optimistic updates with WebSocket confirmation

For the best UX, show the user's action immediately and reconcile when the server confirms:

```tsx
function LiveTodoList() {
  const [todos, setTodos] = useState<any[]>([]);
  const { send } = snap.useSocket();

  snap.useRoom("todos");

  // Server confirms the create
  snap.useRoomEvent("todos", "todo:created", useCallback((todo: any) => {
    setTodos((prev) => {
      // Replace optimistic entry (matched by tempId) with server version
      const without = prev.filter((t) => t.id !== todo.tempId);
      return [...without, todo];
    });
  }, []));

  snap.useRoomEvent("todos", "todo:toggled", useCallback((update: any) => {
    setTodos((prev) => prev.map((t) => t.id === update.id ? { ...t, done: update.done } : t));
  }, []));

  const addTodo = (text: string) => {
    const tempId = crypto.randomUUID();
    // Optimistic: show immediately
    setTodos((prev) => [...prev, { id: tempId, text, done: false, optimistic: true }]);
    // Send to server
    send({ type: "todo:create", text, tempId });
  };

  return (
    <ListBase
      items={todos.map((t) => ({
        id: t.id,
        title: t.text,
        description: t.optimistic ? "Saving..." : undefined,
        icon: t.done ? "check-circle" : "circle",
        onClick: () => send({ type: "todo:toggle", id: t.id }),
      }))}
    />
  );
}
```

## Next steps

- [Community and Chat](/guides/community-and-chat/) -- full community CRUD hooks
- [Chat Application recipe](/recipes/chat-app/) -- complete chat application
- [Data Tables and Lists](/guides/data-tables/) -- live-updating data displays
