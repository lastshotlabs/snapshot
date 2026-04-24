---
title: Realtime
description: WebSocket rooms, SSE streams, push notifications, and live-updating data.
draft: false
---

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";

const snap = createSnapshot({ apiUrl: "/api", manifest: {
  realtime: {
    ws: { url: "wss://api.example.com/ws" },
    sse: { endpoints: { notifications: { url: "/api/sse/notifications" } } },
  },
}});

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

## Manifest realtime config

Configure WebSocket and SSE endpoints in your manifest:

```tsx
const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    realtime: {
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
    },
  },
});
```

## Composition: live chat room

```tsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const { send } = snap.useSocket();

  snap.useRoom(`chat:${roomId}`);

  snap.useRoomEvent(`chat:${roomId}`, "message", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  snap.useRoomEvent(`chat:${roomId}`, "typing", ({ user, isTyping }) => {
    setTypingUsers((prev) =>
      isTyping ? [...prev.filter((u) => u.name !== user.name), user] : prev.filter((u) => u.name !== user.name)
    );
  });

  const sendMessage = (body) => {
    send({ type: "chat:message", room: `chat:${roomId}`, body });
  };

  return (
    <ChatWindowBase
      title={`Room: ${roomId}`}
      threadSlot={
        <MessageThreadBase messages={messages} contentField="body" authorNameField="name" showTimestamps />
      }
      typingSlot={<TypingIndicatorBase users={typingUsers} />}
      inputSlot={<ChatInput onSend={sendMessage} />}
    />
  );
}
```

## Next steps

- [Community and Chat](/guides/community-and-chat/) -- full community CRUD hooks
- [Chat Application recipe](/recipes/chat-app/) -- complete chat application
- [Data Tables and Lists](/guides/data-tables/) -- live-updating data displays
