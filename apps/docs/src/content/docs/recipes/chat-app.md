---
title: Chat Application
description: Real-time chat with rooms, messages, presence, and typing indicators.
draft: false
---

A complete chat application with room selection, live messages, typing indicators, and presence.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  LayoutBase, NavBase, ColumnBase, RowBase,
  ChatWindowBase, MessageThreadBase, TypingIndicatorBase,
  PresenceIndicatorBase, InputField, ButtonBase, ListBase,
} from "@lastshotlabs/snapshot/ui";
import { useState, useCallback } from "react";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    app: { auth: { loginPath: "/login", homePath: "/" } },
    realtime: { ws: { url: "wss://api.example.com/ws" } },
  },
});

// ── App Shell ──────────────────────────────────────────────────────────────

export function ChatApp() {
  const { user, isLoading } = snap.useUser();
  const [activeRoom, setActiveRoom] = useState("general");

  if (isLoading) return null;
  if (!user) return null;

  return (
    <snap.QueryProvider>
      <LayoutBase
        variant="sidebar"
        nav={
          <NavBase
            variant="sidebar"
            logo={{ text: "Chat", path: "/" }}
            items={[
              { label: "General", path: "#", icon: "hash", active: activeRoom === "general" },
              { label: "Random", path: "#", icon: "hash", active: activeRoom === "random" },
              { label: "Help", path: "#", icon: "hash", active: activeRoom === "help" },
            ]}
            onNavigate={() => {}}
          />
        }
      >
        <ChatRoom roomId={activeRoom} currentUser={user} />
      </LayoutBase>
    </snap.QueryProvider>
  );
}

// ── Chat Room ──────────────────────────────────────────────────────────────

function ChatRoom({ roomId, currentUser }: { roomId: string; currentUser: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ name: string; avatar?: string }[]>([]);
  const [input, setInput] = useState("");
  const { send, isConnected } = snap.useSocket();

  // Subscribe to room
  snap.useRoom(`chat:${roomId}`);

  // Listen for new messages
  snap.useRoomEvent(`chat:${roomId}`, "message", useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []));

  // Listen for typing events
  snap.useRoomEvent(`chat:${roomId}`, "typing", useCallback(({ user, isTyping }: TypingEvent) => {
    setTypingUsers((prev) =>
      isTyping
        ? [...prev.filter((u) => u.name !== user.name), user]
        : prev.filter((u) => u.name !== user.name)
    );
  }, []));

  const sendMessage = () => {
    if (!input.trim()) return;
    send({
      type: "chat:message",
      room: `chat:${roomId}`,
      body: input,
      author: currentUser?.name,
      avatar: currentUser?.avatarUrl,
    });
    setInput("");
  };

  const handleTyping = () => {
    send({ type: "chat:typing", room: `chat:${roomId}`, isTyping: true });
  };

  return (
    <ChatWindowBase
      title={`#${roomId}`}
      subtitle={isConnected ? "Connected" : "Reconnecting..."}
      height="calc(100vh - 2rem)"
      showHeader
      showTypingIndicator={typingUsers.length > 0}
      threadSlot={
        <MessageThreadBase
          messages={messages}
          contentField="body"
          authorNameField="author"
          authorAvatarField="avatar"
          timestampField="timestamp"
          showTimestamps
          groupByDate
        />
      }
      typingSlot={
        typingUsers.length > 0
          ? <TypingIndicatorBase users={typingUsers} maxDisplay={3} />
          : null
      }
      inputSlot={
        <RowBase gap="sm" align="center">
          <InputField
            value={input}
            onChange={(v) => { setInput(v); handleTyping(); }}
            placeholder={`Message #${roomId}`}
          />
          <ButtonBase
            label="Send"
            icon="send"
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected}
          />
        </RowBase>
      }
    />
  );
}

// ── Online Users Sidebar ───────────────────────────────────────────────────

function OnlineUsers({ users }: { users: OnlineUser[] }) {
  return (
    <ColumnBase gap="sm">
      <h3>Online ({users.filter((u) => u.status === "online").length})</h3>
      {users.map((user) => (
        <RowBase key={user.id} gap="sm" align="center">
          <PresenceIndicatorBase status={user.status} showDot size="sm" />
          <span>{user.name}</span>
        </RowBase>
      ))}
    </ColumnBase>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  body: string;
  author: string;
  avatar?: string;
  timestamp: string;
}

interface TypingEvent {
  user: { name: string; avatar?: string };
  isTyping: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  status: "online" | "away" | "busy" | "offline";
}
```

## What this includes

- WebSocket room subscription with auto-cleanup
- Live message streaming
- Typing indicators (who is typing)
- Presence indicators (online/offline status)
- Sidebar room navigation
- Message input with send button
- Date-grouped message display

## Adding community features

Replace the raw WebSocket messages with Snapshot's community hooks for persistent data:

```tsx
const { data: threads } = snap.useContainerThreads(roomId);
const { data: replies } = snap.useThreadReplies(threadId);
const { mutate: createReply } = snap.useCreateReply();
const { mutate: addReaction } = snap.useAddReplyReaction();
```

## Related

- [Community and Chat guide](/guides/community-and-chat/) -- full community hooks
- [Realtime guide](/guides/realtime/) -- WebSocket and SSE details
- [Layout guide](/guides/layout-and-navigation/) -- app shell composition
