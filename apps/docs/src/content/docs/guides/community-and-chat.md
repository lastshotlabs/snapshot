---
title: Community and Chat
description: Threads, replies, reactions, chat windows, moderation, and notifications.
draft: false
---

```tsx
import { useState } from "react";
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  ChatWindowBase, MessageThreadBase, TypingIndicatorBase,
  InputField, ButtonBase,
} from "@lastshotlabs/snapshot/ui";

const snap = createSnapshot({ apiUrl: "/api", manifest: {} });

function ChatRoom({ containerId }: { containerId: string }) {
  const { data } = snap.useContainerThreads({ containerId });
  const thread = data?.items?.[0];
  const { data: replies } = snap.useThreadReplies({
    threadId: thread?.id ?? "",
  });
  const { mutate: createReply, isPending } = snap.useCreateReply();
  const [message, setMessage] = useState("");

  return (
    <ChatWindowBase
      title="Chat"
      threadSlot={
        <MessageThreadBase
          messages={replies?.items ?? []}
          contentField="body"
          authorNameField="author.name"
          authorAvatarField="author.avatar"
          timestampField="createdAt"
          showTimestamps
          groupByDate
        />
      }
      typingSlot={<TypingIndicatorBase users={[]} />}
      inputSlot={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!thread || !message.trim()) return;
            createReply({ threadId: thread.id, body: message });
            setMessage("");
          }}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <InputField
            label=""
            value={message}
            onChange={setMessage}
            placeholder="Type a message..."
          />
          <ButtonBase
            label="Send"
            onClick={() => {}}
            disabled={isPending || !message.trim()}
          />
        </form>
      }
    />
  );
}
```

Snapshot provides 49 community hooks and 7 communication components. The hooks handle CRUD for containers, threads, replies, reactions, moderation, and notifications. The components render chat windows, message threads, comment sections, typing indicators, presence, reactions, and emoji pickers.

## Containers, threads, and replies

Containers are top-level groupings (forums, channels, rooms). Threads live inside containers. Replies live inside threads.

### Listing and creating threads

```tsx
function ForumChannel({ containerId }: { containerId: string }) {
  const { data, isLoading } = snap.useContainerThreads({ containerId });
  const { mutate: createThread, isPending } = snap.useCreateThread();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (isLoading) return <p>Loading threads...</p>;

  return (
    <div>
      <h2>Threads</h2>
      <ul>
        {data?.items.map((thread) => (
          <li key={thread.id}>
            <strong>{thread.title}</strong> — {thread.replyCount} replies
            {thread.isPinned && " (pinned)"}
            {thread.isLocked && " (locked)"}
          </li>
        ))}
      </ul>

      <form onSubmit={(e) => {
        e.preventDefault();
        createThread({ containerId, title, body });
        setTitle("");
        setBody("");
      }}>
        <InputField label="Title" value={title} onChange={setTitle} />
        <InputField label="Body" value={body} onChange={setBody} />
        <ButtonBase label="Post Thread" onClick={() => {}} disabled={isPending} />
      </form>
    </div>
  );
}
```

### Thread detail with replies

```tsx
function ThreadDetail({ threadId }: { threadId: string }) {
  const { data: thread } = snap.useContainerThread(threadId);
  const { data: replies, isLoading } = snap.useThreadReplies({ threadId });
  const { mutate: createReply, isPending } = snap.useCreateReply();
  const [body, setBody] = useState("");

  return (
    <div>
      <h2>{thread?.title}</h2>
      <p>{thread?.body}</p>

      <CommentSectionBase
        comments={replies?.items ?? []}
        loading={isLoading}
        contentField="body"
        authorNameField="author.name"
        authorAvatarField="author.avatar"
        timestampField="createdAt"
        sortOrder="oldest"
        emptyText="No replies yet — be the first!"
        inputSlot={
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            createReply({ threadId, body });
            setBody("");
          }} style={{ display: "flex", gap: "0.5rem" }}>
            <InputField label="" value={body} onChange={setBody} placeholder="Write a reply..." />
            <ButtonBase label="Reply" onClick={() => {}} disabled={isPending} />
          </form>
        }
      />
    </div>
  );
}
```

### Container CRUD

```tsx
const { data } = snap.useContainers();
const { mutate: create } = snap.useCreateContainer();
const { mutate: update } = snap.useUpdateContainer();
const { mutate: remove } = snap.useDeleteContainer();

create({ slug: "general", name: "General", description: "General discussion" });
update({ containerId: "abc", name: "Renamed" });
remove({ containerId: "abc" });
```

### Thread moderation

```tsx
const { mutate: publish } = snap.usePublishThread();
const { mutate: lock } = snap.useLockThread();
const { mutate: pin } = snap.usePinThread();
const { mutate: unpin } = snap.useUnpinThread();
const { mutate: deleteThread } = snap.useDeleteThread();
```

## Reactions

### Adding reactions to threads and replies

```tsx
import { ReactionBarBase } from "@lastshotlabs/snapshot/ui";

function ThreadReactions({ threadId, containerId }: { threadId: string; containerId: string }) {
  const { data: reactions } = snap.useThreadReactions(threadId);
  const { mutate: addReaction } = snap.useAddThreadReaction();
  const { mutate: removeReaction } = snap.useRemoveThreadReaction();

  // Build reaction counts from raw emoji list
  const counts = new Map<string, { count: number; active: boolean }>();
  reactions?.forEach((r) => {
    const existing = counts.get(r.emoji);
    if (existing) existing.count++;
    else counts.set(r.emoji, { count: 1, active: false });
  });

  return (
    <ReactionBarBase
      reactions={[...counts.entries()].map(([emoji, { count, active }]) => ({
        emoji,
        count,
        active,
      }))}
      showAddButton
      onReactionClick={(emoji, wasActive) => {
        if (wasActive) removeReaction({ threadId, containerId, emoji });
        else addReaction({ threadId, containerId, emoji });
      }}
      onEmojiSelect={({ emoji }) => addReaction({ threadId, containerId, emoji })}
    />
  );
}
```

Reply reactions work the same way with `useReplyReactions`, `useAddReplyReaction`, and `useRemoveReplyReaction`:

```tsx
const { data: replyReactions } = snap.useReplyReactions(replyId);
const { mutate: addReplyReaction } = snap.useAddReplyReaction();
const { mutate: removeReplyReaction } = snap.useRemoveReplyReaction();
```

## Chat components

### ChatWindowBase

Container for chat UI with slots for thread, input, and typing indicator:

```tsx
<ChatWindowBase
  title="Support Chat"
  subtitle="3 members online"
  height="500px"
  showHeader
  showTypingIndicator
  threadSlot={<MessageThreadBase messages={messages} />}
  inputSlot={<ChatInput />}
  typingSlot={<TypingIndicatorBase users={typingUsers} />}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Header title |
| `subtitle` | `string` | — | Header subtitle |
| `height` | `string` | `"clamp(300px, 70vh, 500px)"` | Chat window height |
| `showHeader` | `boolean` | `true` | Show header bar |
| `threadSlot` | `ReactNode` | **required** | Message thread content |
| `inputSlot` | `ReactNode` | **required** | Input area content |
| `typingSlot` | `ReactNode` | — | Typing indicator content |
| `showTypingIndicator` | `boolean` | `true` | Show typing area |

### MessageThreadBase

Scrollable message list with avatars, date separators, auto-scroll, and consecutive-message grouping:

```tsx
<MessageThreadBase
  messages={[
    { id: "1", author: { name: "Alice", avatar: "/alice.jpg" }, content: "Hello!", timestamp: "2026-01-15T10:00:00Z" },
    { id: "2", author: { name: "Bob" }, content: "Hi there!", timestamp: "2026-01-15T10:01:00Z" },
  ]}
  showTimestamps
  groupByDate
  onMessageClick={(msg) => openThread(msg)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `Record<string, unknown>[]` | `[]` | Message records |
| `contentField` | `string` | `"content"` | Field name for message body |
| `authorNameField` | `string` | `"author.name"` | Field name for author name |
| `authorAvatarField` | `string` | `"author.avatar"` | Field name for avatar URL |
| `timestampField` | `string` | `"timestamp"` | Field name for timestamp |
| `showTimestamps` | `boolean` | `true` | Show timestamps |
| `groupByDate` | `boolean` | `true` | Group messages by date |
| `loading` | `boolean` | `false` | Show skeleton state |
| `error` | `ReactNode` | — | Error message |
| `emptyText` | `string` | `"No messages yet"` | Empty state text |
| `maxHeight` | `string` | — | Scrollable area max height |
| `onMessageClick` | `(msg) => void` | — | Message click handler |

### CommentSectionBase

Comment list with avatars, timestamps, delete actions, and an input slot:

```tsx
import { CommentSectionBase } from "@lastshotlabs/snapshot/ui";

<CommentSectionBase
  comments={[
    { id: "1", author: { name: "Alice" }, content: "Great work!", timestamp: "2026-01-15T10:00:00Z" },
  ]}
  sortOrder="newest"
  showDelete
  onDelete={(comment) => deleteReply({ replyId: comment.id as string })}
  inputSlot={<ReplyInput />}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `comments` | `Record<string, unknown>[]` | `[]` | Comment records |
| `sortOrder` | `"newest" \| "oldest"` | `"newest"` | Sort direction |
| `showDelete` | `boolean` | `false` | Show delete button |
| `onDelete` | `(comment) => void` | — | Delete handler |
| `inputSlot` | `ReactNode` | — | Input area at bottom |
| `loading` | `boolean` | `false` | Show skeleton state |
| `error` | `ReactNode` | — | Error message |
| `emptyText` | `string` | `"No comments yet"` | Empty state text |

## Presence and typing

### TypingIndicatorBase

Shows animated dots with user names. Pass an empty array to hide automatically:

```tsx
import { TypingIndicatorBase } from "@lastshotlabs/snapshot/ui";

<TypingIndicatorBase
  users={[
    { name: "Alice", avatar: "/alice.jpg" },
    { name: "Bob" },
  ]}
  maxDisplay={3}
/>
// Renders: "Alice and Bob are typing" with bouncing dots
```

### PresenceIndicatorBase

Shows user status with a colored dot and label. Supports `"online"`, `"offline"`, `"away"`, `"busy"`, and `"dnd"`:

```tsx
import { PresenceIndicatorBase } from "@lastshotlabs/snapshot/ui";

<PresenceIndicatorBase status="online" label="Alice" size="md" showDot showLabel />
```

### Combining presence with a member list

```tsx
function MemberList({ containerId }: { containerId: string }) {
  const { data: members } = snap.useContainerMembers(containerId);

  return (
    <ul>
      {members?.map((member) => (
        <li key={member.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <PresenceIndicatorBase
            status={member.isOnline ? "online" : "offline"}
            label={member.name}
            showDot
            showLabel
            size="sm"
          />
        </li>
      ))}
    </ul>
  );
}
```

## Reactions and emoji

### ReactionBarBase

Row of emoji reaction pills with counts. The `active` flag highlights reactions the current user has applied:

```tsx
import { ReactionBarBase } from "@lastshotlabs/snapshot/ui";

<ReactionBarBase
  reactions={[
    { emoji: "👍", count: 3, active: true },
    { emoji: "❤️", count: 1, active: false },
  ]}
  showAddButton
  onReactionClick={(emoji, wasActive) => toggleReaction(emoji, wasActive)}
  onEmojiSelect={({ emoji }) => addReaction(emoji)}
/>
```

### EmojiPickerBase

Full emoji picker panel for standalone use:

```tsx
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui";

<EmojiPickerBase
  perRow={8}
  maxHeight="300px"
  onSelect={({ emoji, name }) => insertEmoji(emoji)}
/>
```

## Moderation

### Reports

Users can report content. Moderators review, resolve, or dismiss:

```tsx
function ModerationPanel() {
  const { data: reports, isLoading } = snap.useReports();
  const { mutate: resolve } = snap.useResolveReport();
  const { mutate: dismiss } = snap.useDismissReport();

  if (isLoading) return <p>Loading reports...</p>;

  return (
    <div>
      <h2>Open Reports</h2>
      {reports?.items.map((report) => (
        <CardBase key={report.id} title={`Report: ${report.targetType}`}>
          <p><strong>Reason:</strong> {report.reason}</p>
          <p><strong>Status:</strong> {report.status}</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <ButtonBase
              label="Resolve"
              onClick={() => resolve({ reportId: report.id, action: "warn" })}
            />
            <ButtonBase
              label="Dismiss"
              variant="secondary"
              onClick={() => dismiss({ reportId: report.id })}
            />
          </div>
        </CardBase>
      ))}
    </div>
  );
}
```

### Bans

```tsx
function BanManager({ userId }: { userId: string }) {
  const { data: banCheck } = snap.useCheckBan(userId);
  const { mutate: ban } = snap.useCreateBan();
  const { mutate: unban } = snap.useRemoveBan();

  if (banCheck?.banned) {
    return (
      <div>
        <p>User is banned. Reason: {banCheck.ban?.reason}</p>
        <ButtonBase
          label="Unban"
          onClick={() => unban({ banId: banCheck.ban!.id, userId })}
        />
      </div>
    );
  }

  return (
    <ButtonBase
      label="Ban User"
      variant="destructive"
      onClick={() => ban({ userId, reason: "Repeated violations" })}
    />
  );
}
```

### Members and roles

```tsx
const { data: members } = snap.useContainerMembers(containerId);
const { data: moderators } = snap.useContainerModerators(containerId);
const { data: owners } = snap.useContainerOwners(containerId);

const { mutate: addMember } = snap.useAddMember();
const { mutate: removeMember } = snap.useRemoveMember();
const { mutate: assignMod } = snap.useAssignModerator();
const { mutate: removeMod } = snap.useRemoveModerator();
const { mutate: assignOwner } = snap.useAssignOwner();
const { mutate: removeOwner } = snap.useRemoveOwner();
```

## Notifications

```tsx
function NotificationBell() {
  const { data: unread } = snap.useNotificationsUnreadCount();
  const { data: notifications } = snap.useNotifications();
  const { mutate: markRead } = snap.useMarkNotificationRead();
  const { mutate: markAllRead } = snap.useMarkAllNotificationsRead();

  return (
    <div>
      <ButtonBase
        label={`Notifications ${unread ? `(${unread})` : ""}`}
        onClick={() => markAllRead()}
      />
      <ul>
        {notifications?.items.map((n) => (
          <li
            key={n.id}
            style={{ opacity: n.read ? 0.6 : 1 }}
            onClick={() => markRead({ notificationId: n.id })}
          >
            {n.type}: {String(n.payload)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Search

```tsx
function ThreadSearch({ containerId }: { containerId: string }) {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = snap.useSearchThreads({
    q: query,
    containerId,
    limit: 20,
  });

  return (
    <div>
      <InputField label="Search" value={query} onChange={setQuery} placeholder="Search threads..." />
      {isLoading && <p>Searching...</p>}
      {results?.threads?.items.map((thread) => (
        <div key={thread.id}>
          <strong>{thread.title}</strong> — {thread.replyCount} replies
        </div>
      ))}
    </div>
  );
}
```

## All community hooks

| Domain | Hooks |
|--------|-------|
| Containers | `useContainers`, `useContainer`, `useCreateContainer`, `useUpdateContainer`, `useDeleteContainer` |
| Threads | `useContainerThreads`, `useContainerThread`, `useCreateThread`, `useUpdateThread`, `useDeleteThread`, `usePublishThread`, `useLockThread`, `usePinThread`, `useUnpinThread` |
| Replies | `useThreadReplies`, `useReply`, `useCreateReply`, `useUpdateReply`, `useDeleteReply` |
| Reactions | `useThreadReactions`, `useAddThreadReaction`, `useRemoveThreadReaction`, `useReplyReactions`, `useAddReplyReaction`, `useRemoveReplyReaction` |
| Moderation | `useContainerMembers`, `useContainerModerators`, `useContainerOwners`, `useAddMember`, `useRemoveMember`, `useAssignModerator`, `useRemoveModerator`, `useAssignOwner`, `useRemoveOwner` |
| Reports | `useReports`, `useReport`, `useCreateReport`, `useResolveReport`, `useDismissReport` |
| Bans | `useBans`, `useCheckBan`, `useCreateBan`, `useRemoveBan` |
| Notifications | `useNotifications`, `useNotificationsUnreadCount`, `useMarkNotificationRead`, `useMarkAllNotificationsRead` |
| Search | `useSearchThreads`, `useSearchReplies` |

## Next steps

- [Realtime](/guides/realtime/) -- WebSocket and SSE for live updates
- [Overlays and Modals](/guides/overlays/) -- overlay patterns for thread details
- [Chat Application recipe](/recipes/chat-app/) -- complete chat app
