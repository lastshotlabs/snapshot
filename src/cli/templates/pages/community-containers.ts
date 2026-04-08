export function generateCommunityContainersPageComponent(): string {
  return `import { Link } from '@tanstack/react-router'
import { useHead } from '@unhead/react'
import { useContainers } from '@lib/snapshot'

export function CommunityContainersPage() {
  useHead({ title: 'Community' })
  const { data, isLoading } = useContainers()

  if (isLoading) return <div className="p-4">Loading...</div>

  const containers = data?.items ?? []

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Community</h1>
      {containers.length === 0 ? (
        <p className="text-muted-foreground">No communities yet.</p>
      ) : (
        <ul className="space-y-2">
          {containers.map((container) => (
            <li key={container.id} className="border rounded p-3">
              <Link
                to="/community/$containerId"
                params={{ containerId: container.id }}
                className="font-medium hover:underline"
              >
                {container.name}
              </Link>
              {container.description && (
                <p className="text-sm text-muted-foreground mt-1">{container.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
`;
}

export function generateCommunityThreadListPageComponent(): string {
  return `import { Link } from '@tanstack/react-router'
import { useHead } from '@unhead/react'
import { useContainerThreads, useContainer } from '@lib/snapshot'

interface Props {
  containerId: string
}

export function CommunityThreadListPage({ containerId }: Props) {
  const { data: container } = useContainer(containerId)
  const { data, isLoading } = useContainerThreads({ containerId })
  useHead({ title: container?.name ?? 'Threads' })

  if (isLoading) return <div className="p-4">Loading...</div>

  const threads = data?.items ?? []

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{container?.name ?? 'Threads'}</h1>
      {threads.length === 0 ? (
        <p className="text-muted-foreground">No threads yet.</p>
      ) : (
        <ul className="space-y-2">
          {threads.map((thread) => (
            <li key={thread.id} className="border rounded p-3">
              <Link
                to="/community/$containerId/$threadId"
                params={{ containerId, threadId: thread.id }}
                className="font-medium hover:underline"
              >
                {thread.title}
              </Link>
              <div className="text-xs text-muted-foreground mt-1">
                {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                {thread.isPinned && ' · Pinned'}
                {thread.isLocked && ' · Locked'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
`;
}

export function generateCommunityThreadPageComponent(): string {
  return `import { useState } from 'react'
import { useHead } from '@unhead/react'
import { useContainerThread, useThreadReplies, useCreateReply, useAddThreadReaction } from '@lib/snapshot'

interface Props {
  threadId: string
  containerId: string
}

export function CommunityThreadPage({ threadId, containerId }: Props) {
  const { data: thread, isLoading } = useContainerThread(threadId)
  const { data: repliesData } = useThreadReplies({ threadId })
  const createReply = useCreateReply()
  const addReaction = useAddThreadReaction()
  const [body, setBody] = useState('')

  useHead({ title: thread?.title ?? 'Thread' })

  if (isLoading) return <div className="p-4">Loading...</div>
  if (!thread) return <div className="p-4">Thread not found.</div>

  const replies = repliesData?.items ?? []

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    createReply.mutate({ threadId, body }, {
      onSuccess: () => setBody(''),
    })
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{thread.title}</h1>
        <p className="mt-2 text-base">{thread.body}</p>
        <button
          type="button"
          className="mt-2 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => addReaction.mutate({ threadId, containerId, emoji: '👍' })}
        >
          👍 React
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        {replies.map((reply) => (
          <div key={reply.id} className="border rounded p-3">
            <p>{reply.body}</p>
          </div>
        ))}
      </div>

      {!thread.isLocked && (
        <form onSubmit={handleReply} className="space-y-2">
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="Write a reply..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="submit"
            disabled={createReply.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
          >
            {createReply.isPending ? 'Posting...' : 'Post reply'}
          </button>
        </form>
      )}
    </div>
  )
}
`;
}
