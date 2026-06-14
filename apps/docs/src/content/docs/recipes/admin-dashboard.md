---
title: Admin Dashboard
description: Full admin app with nav, stats, CRUD table, modals, and drawers.
draft: false
---

A complete admin dashboard with sidebar navigation, live KPI stats, a CRUD data table backed by API calls, and create/edit/delete flows with loading and error handling.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  LayoutBase, NavBase, NavUserMenuBase, ContainerBase,
  GridBase, RowBase, ColumnBase, SpacerBase,
  StatCardBase, DataTableBase, ButtonBase,
  ModalBase, DrawerBase, ConfirmDialogBase,
  InputField, SelectField, AlertBase, SkeletonBase,
  resolveTokens,
} from "@lastshotlabs/snapshot/ui";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const snap = createSnapshot({
  apiUrl: "/api",
  loginPath: "/login",
  homePath: "/",
});

const snapshotCss = resolveTokens({
  flavor: "neutral",
  overrides: {
    colors: { primary: "#3b82f6" },
    font: { sans: "Inter" },
  },
});

// ── Types ─────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  status: "active" | "inactive";
}

interface Stats {
  revenue: number;
  revenueTrend: number;
  users: number;
  usersTrend: number;
  orders: number;
  ordersTrend: number;
  conversion: number;
  conversionTrend: number;
}

// ── App Shell ─────────────────────────────────────────────────────────────

export function AdminApp() {
  const { user, isLoading } = snap.useUser();
  const { mutate: logout } = snap.useLogout();

  if (isLoading) return null;
  if (!user) return null;

  return (
    <snap.QueryProvider>
      <LayoutBase
        variant="sidebar"
        nav={
          <NavBase
            variant="sidebar"
            logo={{ text: "Admin", path: "/" }}
            items={[
              { label: "Dashboard", path: "/", icon: "home" },
              { label: "Users", path: "/users", icon: "users" },
              { label: "Orders", path: "/orders", icon: "shopping-cart" },
              { label: "Settings", path: "/settings", icon: "settings" },
            ]}
            collapsible
          />
        }
      >
        <ContainerBase maxWidth="xl" padding="lg">
          <RowBase justify="between" align="center">
            <h1>Dashboard</h1>
            <NavUserMenuBase
              userName={user.name}
              userAvatar={user.avatarUrl}
              items={[
                { label: "Profile", icon: "user", onClick: () => (window.location.href = "/profile") },
                { label: "Sign out", icon: "log-out", onClick: () => logout() },
              ]}
            />
          </RowBase>
          <SpacerBase size="lg" />
          <StatsRow />
          <SpacerBase size="xl" />
          <UsersTable />
        </ContainerBase>
      </LayoutBase>
    </snap.QueryProvider>
  );
}

// ── Stats Row ─────────────────────────────────────────────────────────────

function StatsRow() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/stats/dashboard"],
    queryFn: () => snap.api.get("/stats/dashboard"),
  });

  if (isLoading) {
    return (
      <GridBase columns={4} gap="md">
        {[1, 2, 3, 4].map((i) => <SkeletonBase key={i} height="120px" />)}
      </GridBase>
    );
  }

  return (
    <GridBase columns={4} gap="md">
      <StatCardBase
        label="Total Revenue"
        value={`$${(stats?.revenue ?? 0).toLocaleString()}`}
        icon="dollar-sign"
        trend={{
          direction: (stats?.revenueTrend ?? 0) >= 0 ? "up" : "down",
          value: `${(stats?.revenueTrend ?? 0) >= 0 ? "+" : ""}${stats?.revenueTrend ?? 0}%`,
          percentage: Math.abs(stats?.revenueTrend ?? 0),
          sentiment: (stats?.revenueTrend ?? 0) >= 0 ? "positive" : "negative",
        }}
      />
      <StatCardBase
        label="Active Users"
        value={(stats?.users ?? 0).toLocaleString()}
        icon="users"
        trend={{
          direction: (stats?.usersTrend ?? 0) >= 0 ? "up" : "down",
          value: `${(stats?.usersTrend ?? 0) >= 0 ? "+" : ""}${stats?.usersTrend ?? 0}%`,
          percentage: Math.abs(stats?.usersTrend ?? 0),
          sentiment: (stats?.usersTrend ?? 0) >= 0 ? "positive" : "negative",
        }}
      />
      <StatCardBase
        label="Orders"
        value={(stats?.orders ?? 0).toLocaleString()}
        icon="shopping-cart"
        trend={{
          direction: (stats?.ordersTrend ?? 0) >= 0 ? "up" : "down",
          value: `${(stats?.ordersTrend ?? 0) >= 0 ? "+" : ""}${stats?.ordersTrend ?? 0}%`,
          percentage: Math.abs(stats?.ordersTrend ?? 0),
          sentiment: (stats?.ordersTrend ?? 0) >= 0 ? "positive" : "negative",
        }}
      />
      <StatCardBase
        label="Conversion"
        value={`${stats?.conversion ?? 0}%`}
        icon="percent"
        trend={{
          direction: (stats?.conversionTrend ?? 0) >= 0 ? "up" : "down",
          value: `${(stats?.conversionTrend ?? 0) >= 0 ? "+" : ""}${stats?.conversionTrend ?? 0}%`,
          percentage: Math.abs(stats?.conversionTrend ?? 0),
          sentiment: (stats?.conversionTrend ?? 0) >= 0 ? "positive" : "neutral",
        }}
      />
    </GridBase>
  );
}

// ── Users CRUD Table ──────────────────────────────────────────────────────

function UsersTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ column: "name", direction: "asc" as "asc" | "desc" });
  const pageSize = 10;

  // Fetch users with server-side pagination, search, and sorting
  const url = `/users?page=${page}&pageSize=${pageSize}&search=${search}&sort=${sort.column}&order=${sort.direction}`;
  const { data, isLoading, error } = useQuery<{ items: User[]; total: number }>({
    queryKey: ["/users", page, pageSize, search, sort.column, sort.direction],
    queryFn: () => snap.api.get(url),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (user: Omit<User, "id">) => snap.api.post("/users", user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/users"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (user: User) => snap.api.patch(`/users/${user.id}`, user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => snap.api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/users"] }),
  });

  // Overlay state
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const columns = [
    { field: "name" as const, label: "Name", sortable: true },
    { field: "email" as const, label: "Email", sortable: true },
    { field: "role" as const, label: "Role", format: "badge" as const, badgeColors: { admin: "blue", member: "gray" } },
    { field: "status" as const, label: "Status", format: "badge" as const, badgeColors: { active: "green", inactive: "red" } },
  ];

  return (
    <>
      {successMsg && <AlertBase severity="success" onClose={() => setSuccessMsg(null)}>{successMsg}</AlertBase>}

      <RowBase justify="between" align="center">
        <h2>Users</h2>
        <ButtonBase label="Add User" icon="plus" onClick={() => setCreateOpen(true)} />
      </RowBase>
      <SpacerBase size="md" />

      <DataTableBase
        columns={columns}
        rows={data?.items ?? []}
        isLoading={isLoading}
        error={error?.message}
        emptyMessage="No users found"
        searchable
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={(col) => setSort((prev) =>
          prev.column === col
            ? { column: col, direction: prev.direction === "asc" ? "desc" : "asc" }
            : { column: col, direction: "asc" }
        )}
        pagination={{
          currentPage: page,
          totalPages: Math.ceil((data?.total ?? 0) / pageSize),
          pageSize,
          totalRows: data?.total ?? 0,
        }}
        onPageChange={setPage}
        hoverable
        striped
        rowActions={[
          { label: "Edit", icon: "edit", onAction: (row) => setEditUser(row as User) },
          { label: "Delete", icon: "trash", variant: "destructive", onAction: (row) => setDeleteUser(row as User) },
        ]}
      />

      {/* Create Modal */}
      <UserFormModal
        title="Create User"
        open={createOpen}
        onClose={() => { setCreateOpen(false); createMutation.reset(); }}
        onSave={(user) => {
          createMutation.mutate(user, {
            onSuccess: () => { setCreateOpen(false); showSuccess(`${user.name} created`); },
          });
        }}
        isPending={createMutation.isPending}
        error={createMutation.error?.message}
      />

      {/* Edit Drawer */}
      <EditUserDrawer
        user={editUser}
        onClose={() => { setEditUser(null); updateMutation.reset(); }}
        onSave={(updated) => {
          updateMutation.mutate(updated, {
            onSuccess: () => { setEditUser(null); showSuccess(`${updated.name} updated`); },
          });
        }}
        isPending={updateMutation.isPending}
        error={updateMutation.error?.message}
      />

      {/* Delete Confirmation */}
      <ConfirmDialogBase
        title="Delete User"
        description={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
        open={deleteUser !== null}
        onClose={() => { setDeleteUser(null); deleteMutation.reset(); }}
        onConfirm={() => {
          if (deleteUser) {
            const name = deleteUser.name;
            deleteMutation.mutate(deleteUser.id, {
              onSuccess: () => showSuccess(`${name} deleted`),
            });
            setDeleteUser(null);
          }
        }}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

// ── Create User Modal ─────────────────────────────────────────────────────

function UserFormModal({ title, open, onClose, onSave, isPending, error }: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, "id">) => void;
  isPending: boolean;
  error?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const handleClose = () => {
    setName(""); setEmail(""); setRole("member");
    onClose();
  };

  return (
    <ModalBase
      title={title}
      open={open}
      onClose={handleClose}
      footer={[
        { label: "Cancel", variant: "outline", onClick: handleClose },
        {
          label: isPending ? "Creating..." : "Create",
          onClick: () => onSave({ name, email, role, status: "active" }),
          disabled: isPending || !name || !email,
        },
      ]}
    >
      <ColumnBase gap="md">
        {error && <AlertBase severity="error">{error}</AlertBase>}
        <InputField label="Name" value={name} onChange={setName} required />
        <InputField label="Email" type="email" value={email} onChange={setEmail} required />
        <SelectField
          label="Role"
          value={role}
          onChange={(v) => setRole(v as "admin" | "member")}
          options={[{ label: "Admin", value: "admin" }, { label: "Member", value: "member" }]}
        />
      </ColumnBase>
    </ModalBase>
  );
}

// ── Edit User Drawer ──────────────────────────────────────────────────────

function EditUserDrawer({ user, onClose, onSave, isPending, error }: {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
  isPending: boolean;
  error?: string;
}) {
  const [draft, setDraft] = useState<User | null>(null);

  // Sync draft when a new user is opened for editing
  useEffect(() => {
    if (user) setDraft({ ...user });
  }, [user?.id]);

  const activeUser = draft ?? user;

  return (
    <DrawerBase
      title="Edit User"
      side="right"
      size="md"
      open={user !== null}
      onClose={() => { setDraft(null); onClose(); }}
      footer={[
        { label: "Cancel", variant: "outline", onClick: () => { setDraft(null); onClose(); } },
        {
          label: isPending ? "Saving..." : "Save",
          onClick: () => { if (activeUser) onSave(activeUser); },
          disabled: isPending,
        },
      ]}
    >
      {activeUser && (
        <ColumnBase gap="md">
          {error && <AlertBase severity="error">{error}</AlertBase>}
          <InputField label="Name" value={activeUser.name} onChange={(v) => setDraft({ ...activeUser, name: v })} />
          <InputField label="Email" type="email" value={activeUser.email} onChange={(v) => setDraft({ ...activeUser, email: v })} />
          <SelectField
            label="Role"
            value={activeUser.role}
            onChange={(v) => setDraft({ ...activeUser, role: v as "admin" | "member" })}
            options={[{ label: "Admin", value: "admin" }, { label: "Member", value: "member" }]}
          />
          <SelectField
            label="Status"
            value={activeUser.status}
            onChange={(v) => setDraft({ ...activeUser, status: v as "active" | "inactive" })}
            options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]}
          />
        </ColumnBase>
      )}
    </DrawerBase>
  );
}
```

## What this includes

- **Sidebar navigation** with collapsible menu
- **User dropdown** with sign-out
- **Live KPI stats** fetched from `/stats/dashboard` with skeleton loading
- **Server-paginated data table** with search, sorting, and row actions
- **Create user modal** with loading state and error display
- **Edit user drawer** with draft state so edits don't mutate the original
- **Delete confirmation** with loading state
- **Success alerts** that auto-dismiss after 3 seconds
- **Query invalidation** so the table refreshes after every mutation

## API contract

This recipe expects your Bunshot backend to expose:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/stats/dashboard` | Returns `Stats` object |
| GET | `/users?page=&pageSize=&search=&sort=&order=` | Returns `{ items: User[], total: number }` |
| POST | `/users` | Creates a user, returns `User` |
| PATCH | `/users/:id` | Updates a user, returns `User` |
| DELETE | `/users/:id` | Deletes a user |

## Related

- [Layout and Navigation guide](/guides/layout-and-navigation/) -- app shell patterns
- [Data Tables guide](/guides/data-tables/) -- pagination, filtering, and sorting
- [Overlays guide](/guides/overlays/) -- modals, drawers, and confirm dialogs
- [Authentication guide](/guides/authentication/) -- auth hooks and route guards
