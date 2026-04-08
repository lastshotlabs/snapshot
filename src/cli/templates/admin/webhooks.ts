export function generateWebhooksPageComponent(): string {
  return `import { useHead } from '@unhead/react'
import { Link } from '@tanstack/react-router'
import { useWebhookEndpoints, useCreateWebhookEndpoint, useDeleteWebhookEndpoint } from '@lib/snapshot'
import { useState } from 'react'

export function WebhooksPage() {
  useHead({ title: 'Webhooks' })
  const { data: endpoints = [], isLoading } = useWebhookEndpoints()
  const createEndpoint = useCreateWebhookEndpoint()
  const deleteEndpoint = useDeleteWebhookEndpoint()
  const [newUrl, setNewUrl] = useState('')
  const [newEvents, setNewEvents] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const events = newEvents.split(',').map((s) => s.trim()).filter(Boolean)
    if (!newUrl || events.length === 0) return
    createEndpoint.mutate({ url: newUrl, events }, {
      onSuccess: () => {
        setNewUrl('')
        setNewEvents('')
      },
    })
  }

  if (isLoading) return <div className="p-4">Loading...</div>

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Webhook Endpoints</h1>

      <form onSubmit={handleCreate} className="space-y-2 border rounded p-4">
        <h2 className="font-semibold">Add Endpoint</h2>
        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="https://example.com/webhook"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <input
          className="w-full border rounded p-2 text-sm"
          placeholder="Events (comma-separated, e.g. community:thread.created)"
          value={newEvents}
          onChange={(e) => setNewEvents(e.target.value)}
        />
        <button
          type="submit"
          disabled={createEndpoint.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
        >
          {createEndpoint.isPending ? 'Adding...' : 'Add endpoint'}
        </button>
      </form>

      {endpoints.length === 0 ? (
        <p className="text-muted-foreground">No webhook endpoints configured.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">URL</th>
              <th className="py-2 pr-4">Events</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.id} className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">{ep.url}</td>
                <td className="py-2 pr-4">{ep.events.join(', ')}</td>
                <td className="py-2 pr-4">{ep.isActive ? 'Active' : 'Inactive'}</td>
                <td className="py-2 space-x-2">
                  <Link
                    to="/webhooks/$endpointId"
                    params={{ endpointId: ep.id }}
                    className="text-primary underline"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteEndpoint.mutate({ endpointId: ep.id })}
                    className="text-destructive underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
`;
}

export function generateWebhookDetailPageComponent(): string {
  return `import { useHead } from '@unhead/react'
import { useWebhookEndpoint, useWebhookDeliveries, useTestWebhookEndpoint } from '@lib/snapshot'
import { useState } from 'react'

interface Props {
  endpointId: string
}

export function WebhookDetailPage({ endpointId }: Props) {
  const { data: endpoint, isLoading } = useWebhookEndpoint(endpointId)
  const { data: deliveries } = useWebhookDeliveries({ endpointId })
  const testEndpoint = useTestWebhookEndpoint()
  const [testEvent, setTestEvent] = useState('')

  useHead({ title: endpoint ? \`Webhook: \${endpoint.url}\` : 'Webhook' })

  if (isLoading) return <div className="p-4">Loading...</div>
  if (!endpoint) return <div className="p-4">Endpoint not found.</div>

  const items = deliveries?.items ?? []

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!testEvent.trim()) return
    testEndpoint.mutate({ endpointId, event: testEvent })
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhook Endpoint</h1>
        <p className="font-mono text-sm mt-1">{endpoint.url}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Events: {endpoint.events.join(', ')}
        </p>
        <p className="text-sm text-muted-foreground">
          Secret hint: <span className="font-mono">{endpoint.secretHint}</span>
        </p>
      </div>

      <form onSubmit={handleTest} className="flex gap-2">
        <input
          className="flex-1 border rounded p-2 text-sm"
          placeholder="Event name (e.g. community:thread.created)"
          value={testEvent}
          onChange={(e) => setTestEvent(e.target.value)}
        />
        <button
          type="submit"
          disabled={testEndpoint.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
        >
          {testEndpoint.isPending ? 'Sending...' : 'Send test'}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-2">Delivery Log</h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No deliveries yet.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">Event</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Attempts</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-b">
                  <td className="py-2 pr-4 font-mono text-xs">{d.event}</td>
                  <td className="py-2 pr-4">{d.status}</td>
                  <td className="py-2 pr-4">{d.attempts}/{d.maxAttempts}</td>
                  <td className="py-2 text-xs">{d.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
`;
}

export function generateWebhooksRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { WebhooksPage } from '@pages/admin/WebhooksPage'

export const Route = createFileRoute('/_authenticated/webhooks')({
  component: WebhooksPage,
})
`;
}

export function generateWebhookDetailRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { WebhookDetailPage } from '@pages/admin/WebhookDetailPage'

export const Route = createFileRoute('/_authenticated/webhooks/$endpointId')({
  component: function RouteComponent() {
    const { endpointId } = Route.useParams()
    return <WebhookDetailPage endpointId={endpointId} />
  },
})
`;
}
