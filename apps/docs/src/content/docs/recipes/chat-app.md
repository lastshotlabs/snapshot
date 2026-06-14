---
title: Chat Application
description: Real-time chat with rooms, messages, presence, and typing indicators.
draft: false
---

A complete chat application with room selection, live messages, typing indicators with auto-expiry, presence tracking, and reconnection handling.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  LayoutBase, NavBase, ColumnBase, RowBase, SpacerBase,
  ChatWindowBase, MessageThreadBase, TypingIndicatorBase,
  PresenceIndicatorBase, InputField, ButtonBase, AlertBase,
  AvatarBase, BadgeBase, SplitPaneBase,
} from "@lastshotlabs/snapshot/ui";
import { useState, useCallback, useRef, useEffect } from "react";

const snap = createSnapshot({
  apiUrl: "/api",
  loginPath: "/login",
  homePath: "/",
  ws: { url: "wss://api.example.com/ws" },
});

// ── Types ─────────────────────────────────────────────────────────────────

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

interface PresenceEvent {
  userId: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "offline";
}

// ── App Shell ─────────────────────────────────────────────────────────────

const ROOMS = [
  { id: "general", label: "General", icon: "hash" },
  { id: "random", label: "Random", icon: "hash" },
  { id: "help", label: "Help", icon: "help-circle" },
  { id: "announcements", label: "Announcements", icon: "megaphone" },
];

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
            items={ROOMS.map((room) => ({
              label: room.label,
              path: `#${room.id}`,
              icon: room.icon,
              active: activeRoom === room.id,
            }))}
            onNavigate={(path) => setActiveRoom(path.replace("#", ""))}
          />
        }
      >
        <SplitPaneBase
          direction="horizontal"
          defaultSplit={80}
          minSize={300}
          first={
            // Key forces full remount when switching rooms — clears messages, typing, etc.
            <ChatRoom key={activeRoom} roomId={activeRoom} currentUser={user} />
          }
          second={
            <OnlineUsers roomId={activeRoom} />
          }
        />
      </LayoutBase>
    </snap.QueryProvider>
  );
}

// ── Chat Room ─────────────────────────────────────────────────────────────

function ChatRoom({ roomId, currentUser }: { roomId: string; currentUser: { name: string; avatarUrl?: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ name: string; avatar?: string }[]>([]);
  const [input, setInput] = useState("");
  const { send, isConnected } = snap.useSocket();
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const typingSent = useRef(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Subscribe to room
  snap.useRoom(`chat:${roomId}`);

  // Listen for new messages
  snap.useRoomEvent(`chat:${roomId}`, "message", useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []));

  // Listen for typing events — auto-expire after 3 seconds of silence
  snap.useRoomEvent(`chat:${roomId}`, "typing", useCallback(({ user, isTyping }: TypingEvent) => {
    // Don't show self as typing
    if (user.name === currentUser.name) return;

    // Clear any existing timer for this user
    const existing = typingTimers.current.get(user.name);
    if (existing) clearTimeout(existing);

    if (isTyping) {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.name === user.name)) return prev;
        return [...prev, user];
      });
      // Auto-remove after 3 seconds if no new typing event
      typingTimers.current.set(user.name, setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.name !== user.name));
        typingTimers.current.delete(user.name);
      }, 3000));
    } else {
      setTypingUsers((prev) => prev.filter((u) => u.name !== user.name));
      typingTimers.current.delete(user.name);
    }
  }, [currentUser.name]));

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      typingTimers.current.forEach((timer) => clearTimeout(timer));
      typingTimers.current.clear();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !isConnected) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      body: input,
      author: currentUser.name,
      avatar: currentUser.avatarUrl,
      timestamp: new Date().toISOString(),
    };

    send({ type: "chat:message", room: `chat:${roomId}`, ...msg });

    // Optimistically add to local messages
    setMessages((prev) => [...prev, msg]);
    setInput("");

    // Stop typing indicator
    send({ type: "chat:typing", room: `chat:${roomId}`, isTyping: false });
    typingSent.current = false;
  };

  const handleInputChange = (value: string) => {
    setInput(value);

    // Debounced typing indicator — send "typing" once, then stop after 2s of no input
    if (!typingSent.current && value.trim()) {
      send({ type: "chat:typing", room: `chat:${roomId}`, isTyping: true });
      typingSent.current = true;
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      send({ type: "chat:typing", room: `chat:${roomId}`, isTyping: false });
      typingSent.current = false;
    }, 2000);
  };

  return (
    <ColumnBase style={{ height: "100vh" }}>
      {!isConnected && (
        <AlertBase severity="warning">Reconnecting to server...</AlertBase>
      )}
      <ChatWindowBase
        title={`#${roomId}`}
        subtitle={`${messages.length} messages`}
        height="100%"
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
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <RowBase gap="sm" align="center">
              <InputField
                value={input}
                onChange={handleInputChange}
                placeholder={`Message #${roomId}`}
                disabled={!isConnected}
              />
              <ButtonBase
                label="Send"
                icon="send"
                type="submit"
                disabled={!input.trim() || !isConnected}
              />
            </RowBase>
          </form>
        }
      />
    </ColumnBase>
  );
}

// ── Online Users Sidebar ──────────────────────────────────────────────────

function OnlineUsers({ roomId }: { roomId: string }) {
  const [users, setUsers] = useState<PresenceEvent[]>([]);

  snap.useRoom(`presence:${roomId}`);

  snap.useRoomEvent(`presence:${roomId}`, "update", useCallback((event: PresenceEvent) => {
    setUsers((prev) => {
      const without = prev.filter((u) => u.userId !== event.userId);
      if (event.status === "offline") return without;
      return [...without, event];
    });
  }, []));

  const online = users.filter((u) => u.status === "online");
  const away = users.filter((u) => u.status === "away");

  return (
    <ColumnBase gap="md" style={{ padding: "1rem", borderLeft: "1px solid var(--sn-color-border)" }}>
      <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--sn-color-muted-foreground)" }}>
        Online — {online.length}
      </h3>
      {online.map((user) => (
        <RowBase key={user.userId} gap="sm" align="center">
          <PresenceIndicatorBase status="online" showDot size="sm" />
          {user.avatar
            ? <AvatarBase src={user.avatar} name={user.name} size="sm" />
            : null
          }
          <span style={{ fontSize: "0.875rem" }}>{user.name}</span>
        </RowBase>
      ))}

      {away.length > 0 && (
        <>
          <SpacerBase size="sm" />
          <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--sn-color-muted-foreground)" }}>
            Away — {away.length}
          </h3>
          {away.map((user) => (
            <RowBase key={user.userId} gap="sm" align="center">
              <PresenceIndicatorBase status="away" showDot size="sm" />
              <span style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground)" }}>{user.name}</span>
            </RowBase>
          ))}
        </>
      )}
    </ColumnBase>
  );
}
```

## What this includes

- **Room switching** with `key` prop that fully resets chat state per room
- **Live messages** via WebSocket room events
- **Optimistic message rendering** -- your message appears instantly before server acknowledgment
- **Typing indicators** with 3-second auto-expiry so stale indicators clear themselves
- **Debounced typing events** -- sends one "typing" event, then stops after 2 seconds of no input
- **Presence sidebar** showing online and away users via a separate presence room
- **Reconnection banner** when WebSocket connection drops
- **Form-based input** so Enter key sends the message

## Room architecture

The app subscribes to two rooms per channel:

| Room | Purpose |
|------|---------|
| `chat:{roomId}` | Messages and typing events |
| `presence:{roomId}` | Online/away/offline status updates |

This separation keeps presence updates from interfering with message delivery.

## Adding persistent messages

Replace the local `useState` messages with Snapshot's community hooks for server-persisted, paginated threads:

```tsx
function PersistentChatRoom({ roomId }: { roomId: string }) {
  const { data: thread } = snap.useContainerThreads({ containerId: roomId });
  const { data: replies } = snap.useThreadReplies({ threadId: thread?.items[0]?.id ?? "" });
  const { mutate: createReply } = snap.useCreateReply();

  // Merge persisted replies with live WebSocket messages for real-time + persistence
}
```

See [Community and Chat guide](/guides/community-and-chat/) for the full pattern.

## Related

- [Community and Chat guide](/guides/community-and-chat/) -- community hooks for persistent threads
- [Realtime guide](/guides/realtime/) -- WebSocket and SSE details
- [Layout guide](/guides/layout-and-navigation/) -- app shell composition
