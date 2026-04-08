export function generateAdminLayoutComponent(): string {
  return `import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useLogout, useUser } from '@lib/snapshot'

const navItems = [
  { to: '/users', label: 'Users' },
  { to: '/audit-log', label: 'Audit Log' },
  { to: '/groups', label: 'Groups' },
  { to: '/orgs', label: 'Orgs' },
  { to: '/capabilities', label: 'Capabilities' },
] as const

export function AdminLayout() {
  const { user } = useUser()
  const logout = useLogout()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout.mutateAsync()
    void navigate({ to: '/auth/login' })
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-background border-r border-border flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <span className="font-semibold text-foreground">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeProps={{ className: 'text-foreground bg-muted' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          {user && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <button
                onClick={() => void handleLogout()}
                className="text-sm text-muted-foreground hover:text-foreground w-full text-left"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
`;
}

export function generateCapabilityContextComponent(): string {
  return `import { useCapabilities } from '@lib/capabilities'
import type { ManagedUserCapabilities } from '@lib/capabilities'

interface CapabilityGateProps {
  capability: keyof ManagedUserCapabilities
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function CapabilityGate({ capability, children, fallback = null }: CapabilityGateProps) {
  const { capabilities, isLoading } = useCapabilities()
  if (isLoading) return <div className="animate-pulse h-8 bg-gray-100 rounded" />
  // Unknown/missing capability keys default to false (safe default)
  const value = capabilities[capability]
  if (!value) return <>{fallback}</>
  return <>{children}</>
}
`;
}

export function generateUsersPageComponent(): string {
  return `import { useState, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@lib/snapshot'

const PAGE_SIZE = 50

type StatusFilter = 'all' | 'active' | 'suspended'

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  const timer = useCallback(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  useState(timer)
  return debounced
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', { search: debouncedSearch, status, page }],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      })
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (status !== 'all') params.set('status', status)
      return api.get(\`/admin/users?\${params.toString()}\`)
    },
  })

  const users: Array<{
    id: string
    email: string
    displayName?: string
    status: string
    roles: string[]
  }> = (data as { users?: unknown[] })?.users ?? []
  const total: number = (data as { total?: number })?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="border border-border rounded-md px-3 py-1.5 text-sm bg-background w-64"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(0) }}
          className="border border-border rounded-md px-3 py-1.5 text-sm bg-background"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load users.</p>}

      {!isLoading && !isError && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Display Name</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Roles</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.displayName ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        u.status === 'suspended'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-green-100 text-green-800',
                      ].join(' ')}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{u.roles.join(', ') || '—'}</td>
                  <td className="px-4 py-2">
                    <Link
                      to="/users/\$userId"
                      params={{ userId: u.id }}
                      className="text-primary hover:underline text-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
`;
}

export function generateUserDetailPageComponent(): string {
  return `import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@lib/snapshot'
import { CapabilityGate } from '@components/admin/CapabilityGate'

export function UserDetailPage() {
  const { userId } = useParams({ from: '/_authenticated/users/\$userId' })
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editForm, setEditForm] = useState<{ displayName: string; firstName: string; lastName: string } | null>(null)

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => api.get(\`/admin/users/\${userId}\`),
  })

  const updateMutation = useMutation({
    mutationFn: (body: { displayName?: string; firstName?: string; lastName?: string }) =>
      api.patch(\`/admin/users/\${userId}\`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] })
      setEditForm(null)
    },
  })

  const suspendMutation = useMutation({
    mutationFn: () => api.post(\`/admin/users/\${userId}/suspend\`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] }),
  })

  const unsuspendMutation = useMutation({
    mutationFn: () => api.post(\`/admin/users/\${userId}/unsuspend\`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(\`/admin/users/\${userId}\`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (isError || !user) return <p className="text-sm text-destructive">Failed to load user.</p>

  const u = user as {
    id: string
    email: string
    displayName?: string
    firstName?: string
    lastName?: string
    status: string
    roles: string[]
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link to="/users" className="text-sm text-muted-foreground hover:text-foreground">
          ← Users
        </Link>
        <h1 className="text-xl font-semibold">{u.email}</h1>
        <span
          className={[
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            u.status === 'suspended'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-green-100 text-green-800',
          ].join(' ')}
        >
          {u.status}
        </span>
      </div>

      {/* Profile card */}
      <div className="border border-border rounded-md p-4 space-y-2">
        <h2 className="text-sm font-medium">Profile</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">ID</dt>
          <dd className="font-mono text-xs">{u.id}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{u.email}</dd>
          <dt className="text-muted-foreground">Display Name</dt>
          <dd>{u.displayName ?? '—'}</dd>
          <dt className="text-muted-foreground">First Name</dt>
          <dd>{u.firstName ?? '—'}</dd>
          <dt className="text-muted-foreground">Last Name</dt>
          <dd>{u.lastName ?? '—'}</dd>
          <dt className="text-muted-foreground">Roles</dt>
          <dd>{u.roles.join(', ') || '—'}</dd>
        </dl>
        {editForm === null ? (
          <button
            onClick={() => setEditForm({ displayName: u.displayName ?? '', firstName: u.firstName ?? '', lastName: u.lastName ?? '' })}
            className="text-xs text-primary hover:underline mt-2"
          >
            Edit profile
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate(editForm)
            }}
            className="space-y-2 mt-2"
          >
            <input
              className="border border-border rounded px-2 py-1 text-sm w-full bg-background"
              placeholder="Display name"
              value={editForm.displayName}
              onChange={(e) => setEditForm((f) => f ? { ...f, displayName: e.target.value } : f)}
            />
            <input
              className="border border-border rounded px-2 py-1 text-sm w-full bg-background"
              placeholder="First name"
              value={editForm.firstName}
              onChange={(e) => setEditForm((f) => f ? { ...f, firstName: e.target.value } : f)}
            />
            <input
              className="border border-border rounded px-2 py-1 text-sm w-full bg-background"
              placeholder="Last name"
              value={editForm.lastName}
              onChange={(e) => setEditForm((f) => f ? { ...f, lastName: e.target.value } : f)}
            />
            <div className="flex gap-2">
              <button type="submit" disabled={updateMutation.isPending} className="text-xs text-primary hover:underline">
                Save
              </button>
              <button type="button" onClick={() => setEditForm(null)} className="text-xs text-muted-foreground hover:underline">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-4 text-sm border-b border-border pb-2">
        <Link
          to="/users/\$userId/sessions"
          params={{ userId: u.id }}
          className="text-muted-foreground hover:text-foreground"
          activeProps={{ className: 'text-foreground font-medium' }}
        >
          Sessions
        </Link>
        <Link
          to="/users/\$userId/audit-log"
          params={{ userId: u.id }}
          className="text-muted-foreground hover:text-foreground"
          activeProps={{ className: 'text-foreground font-medium' }}
        >
          Audit Log
        </Link>
      </div>

      {/* Danger zone */}
      <div className="border border-destructive/30 rounded-md p-4 space-y-3">
        <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
        <div className="flex items-center gap-3">
          <CapabilityGate
            capability={u.status === 'suspended' ? 'canUnsuspendUsers' : 'canSuspendUsers'}
            fallback={<p className="text-sm text-muted-foreground">This action is not available with your current provider.</p>}
          >
            {u.status === 'suspended' ? (
              <button
                onClick={() => unsuspendMutation.mutate()}
                disabled={unsuspendMutation.isPending}
                className="text-sm border border-border rounded px-3 py-1.5 hover:bg-muted disabled:opacity-50"
              >
                Unsuspend
              </button>
            ) : (
              <button
                onClick={() => suspendMutation.mutate()}
                disabled={suspendMutation.isPending}
                className="text-sm border border-destructive/50 text-destructive rounded px-3 py-1.5 hover:bg-destructive/5 disabled:opacity-50"
              >
                Suspend
              </button>
            )}
          </CapabilityGate>
          <CapabilityGate
            capability="canDeleteUsers"
            fallback={<p className="text-sm text-muted-foreground">This action is not available with your current provider.</p>}
          >
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm border border-destructive text-destructive rounded px-3 py-1.5 hover:bg-destructive/10"
              >
                Delete user
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive">Are you sure?</span>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="text-sm bg-destructive text-white rounded px-3 py-1.5 disabled:opacity-50"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            )}
          </CapabilityGate>
        </div>
      </div>
    </div>
  )
}
`;
}

export function generateUserSessionsPageComponent(): string {
  return `import { useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@lib/snapshot'
import { CapabilityGate } from '@components/admin/CapabilityGate'

export function UserSessionsPage() {
  const { userId } = useParams({ from: '/_authenticated/users/\$userId/sessions' })
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', userId, 'sessions'],
    queryFn: () => api.get(\`/admin/users/\${userId}/sessions\`),
  })

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => api.delete(\`/admin/users/\${userId}/sessions/\${sessionId}\`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, 'sessions'] }),
  })

  const revokeAllMutation = useMutation({
    mutationFn: () => api.delete(\`/admin/users/\${userId}/sessions\`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, 'sessions'] }),
  })

  const sessions: Array<{
    id: string
    createdAt: string
    ip?: string
    userAgent?: string
  }> = (data as { sessions?: unknown[] })?.sessions ?? []

  return (
    <CapabilityGate
      capability="canListSessions"
      fallback={<p className="text-sm text-muted-foreground">Session management is not available with your current provider.</p>}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Active Sessions</h2>
          {sessions.length > 0 && (
            <button
              onClick={() => revokeAllMutation.mutate()}
              disabled={revokeAllMutation.isPending}
              className="text-sm border border-destructive/50 text-destructive rounded px-3 py-1.5 hover:bg-destructive/5 disabled:opacity-50"
            >
              Revoke All
            </button>
          )}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {isError && <p className="text-sm text-destructive">Failed to load sessions.</p>}

        {!isLoading && !isError && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Session ID</th>
                  <th className="text-left px-4 py-2">Created At</th>
                  <th className="text-left px-4 py-2">IP</th>
                  <th className="text-left px-4 py-2">User Agent</th>
                  <th className="text-left px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-2 font-mono text-xs">{s.id.slice(0, 12)}…</td>
                    <td className="px-4 py-2">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{s.ip ?? '—'}</td>
                    <td className="px-4 py-2 max-w-48 truncate">{s.userAgent ?? '—'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => revokeMutation.mutate(s.id)}
                        disabled={revokeMutation.isPending}
                        className="text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      No active sessions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CapabilityGate>
  )
}
`;
}

export function generateUserAuditLogPageComponent(): string {
  return `import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '@lib/snapshot'

const PAGE_SIZE = 50

export function UserAuditLogPage() {
  const { userId } = useParams({ from: '/_authenticated/users/\$userId/audit-log' })
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', userId, 'audit-log', { from, to, page }],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      return api.get(\`/admin/users/\${userId}/audit-log?\${params.toString()}\`)
    },
  })

  const entries: Array<{
    id: string
    timestamp: string
    method: string
    path: string
    status: number
    ip?: string
    action?: string
  }> = (data as { entries?: unknown[] })?.entries ?? []
  const total: number = (data as { total?: number })?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <h2 className="text-base font-medium">Audit Log</h2>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(0) }}
            className="ml-2 border border-border rounded px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-sm text-muted-foreground">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(0) }}
            className="ml-2 border border-border rounded px-2 py-1 text-sm bg-background"
          />
        </label>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load audit log.</p>}

      {!isLoading && !isError && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Timestamp</th>
                <th className="text-left px-4 py-2">Method</th>
                <th className="text-left px-4 py-2">Path</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">IP</th>
                <th className="text-left px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-2 text-xs">{new Date(e.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.method}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.path}</td>
                  <td className="px-4 py-2">
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        e.status >= 400 ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800',
                      ].join(' ')}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">{e.ip ?? '—'}</td>
                  <td className="px-4 py-2 text-xs">{e.action ?? '—'}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    No audit log entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
`;
}

export function generateAuditLogPageComponent(): string {
  return `import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@lib/snapshot'

const PAGE_SIZE = 50

export function AuditLogPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [userId, setUserId] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'audit-log', { from, to, userId, page }],
    queryFn: () => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (userId) params.set('userId', userId)
      return api.get(\`/admin/audit-log?\${params.toString()}\`)
    },
  })

  const entries: Array<{
    id: string
    timestamp: string
    method: string
    path: string
    status: number
    ip?: string
    action?: string
    userId?: string
  }> = (data as { entries?: unknown[] })?.entries ?? []
  const total: number = (data as { total?: number })?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Audit Log</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-muted-foreground">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(0) }}
            className="ml-2 border border-border rounded px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-sm text-muted-foreground">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(0) }}
            className="ml-2 border border-border rounded px-2 py-1 text-sm bg-background"
          />
        </label>
        <input
          type="text"
          placeholder="Filter by user ID…"
          value={userId}
          onChange={(e) => { setUserId(e.target.value); setPage(0) }}
          className="border border-border rounded px-2 py-1 text-sm bg-background w-56"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load audit log.</p>}

      {!isLoading && !isError && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Timestamp</th>
                <th className="text-left px-4 py-2">Method</th>
                <th className="text-left px-4 py-2">Path</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">IP</th>
                <th className="text-left px-4 py-2">Action</th>
                <th className="text-left px-4 py-2">User ID</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-2 text-xs">{new Date(e.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.method}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.path}</td>
                  <td className="px-4 py-2">
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        e.status >= 400 ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800',
                      ].join(' ')}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs">{e.ip ?? '—'}</td>
                  <td className="px-4 py-2 text-xs">{e.action ?? '—'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.userId ? e.userId.slice(0, 8) + '…' : '—'}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No audit log entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
`;
}

export function generateGroupsPageComponent(): string {
  return `// NOTE: Groups are managed by bunshot-auth, not bunshot-admin.
// This page calls the auth-owned /auth/groups endpoint, not an admin endpoint.
import { useQuery } from '@tanstack/react-query'
import { api } from '@lib/snapshot'

export function GroupsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'groups'],
    queryFn: () => api.get('/auth/groups'),
  })

  const groups: Array<{
    id: string
    name: string
    description?: string
    memberCount?: number
  }> = (data as { groups?: unknown[] })?.groups ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Groups</h1>
        <p className="text-xs text-muted-foreground">Managed by bunshot-auth</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load groups.</p>}

      {!isLoading && !isError && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Group Name</th>
                <th className="text-left px-4 py-2">Description</th>
                <th className="text-left px-4 py-2">Member Count</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-2 font-medium">{g.name}</td>
                  <td className="px-4 py-2">{g.description ?? '—'}</td>
                  <td className="px-4 py-2">{g.memberCount ?? '—'}</td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    No groups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
`;
}

export function generateOrgsPageComponent(): string {
  return `// NOTE: Orgs are managed by bunshot-auth. This page calls /auth/orgs.
import { useQuery } from '@tanstack/react-query'
import { api } from '@lib/snapshot'

export function OrgsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', 'orgs'],
    queryFn: () => api.get('/auth/orgs'),
  })

  const orgs: Array<{
    id: string
    name: string
    description?: string
    memberCount?: number
  }> = (data as { orgs?: unknown[] })?.orgs ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Organisations</h1>
        <p className="text-xs text-muted-foreground">Managed by bunshot-auth</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load orgs.</p>}

      {!isLoading && !isError && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Org Name</th>
                <th className="text-left px-4 py-2">Description</th>
                <th className="text-left px-4 py-2">Member Count</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-2 font-medium">{o.name}</td>
                  <td className="px-4 py-2">{o.description ?? '—'}</td>
                  <td className="px-4 py-2">{o.memberCount ?? '—'}</td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    No orgs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
`;
}

export function generateCapabilitiesPageComponent(): string {
  return `import { useQuery } from '@tanstack/react-query'
import { api } from '@lib/snapshot'
import type { ManagedUserCapabilities } from '@lib/capabilities'

export function CapabilitiesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'capabilities'],
    queryFn: () => api.get('/admin/capabilities'),
  })

  const caps = data as ManagedUserCapabilities | null

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Capabilities</h1>
      <p className="text-sm text-muted-foreground">
        Debug view of the capabilities object returned by{' '}
        <code className="font-mono text-xs">/admin/capabilities</code>.
      </p>

      {!isLoading && !isError && caps?.accessProvider && (
        <div className="text-sm text-muted-foreground mb-4">
          <span>Access provider: <code>{caps.accessProvider}</code></span>
          {' · '}
          <span>User provider: <code>{caps.managedUserProvider}</code></span>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load capabilities.</p>}

      {!isLoading && !isError && caps && (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Capability</th>
                <th className="text-left px-4 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(caps)
                .filter(([, value]) => typeof value === 'boolean')
                .map(([key, value]) => (
                <tr key={key} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-2 font-mono text-xs">{key}</td>
                  <td className="px-4 py-2">
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        value ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive',
                      ].join(' ')}
                    >
                      {value ? 'yes' : 'no'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
`;
}
