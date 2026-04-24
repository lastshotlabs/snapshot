---
title: Admin Dashboard
description: Full admin app with nav, stats, CRUD table, modals, and drawers.
draft: false
---

A complete admin dashboard with sidebar navigation, KPI stats, a CRUD data table, create/edit modals, and delete confirmation.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  LayoutBase, NavBase, NavUserMenuBase, ContainerBase,
  GridBase, RowBase, ColumnBase, SpacerBase,
  StatCardBase, DataTableBase, ButtonBase,
  ModalBase, DrawerBase, ConfirmDialogBase,
  InputField, SelectField,
} from "@lastshotlabs/snapshot/ui";
import { useState } from "react";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    app: { auth: { loginPath: "/login", homePath: "/" } },
    theme: {
      colors: { primary: "#3b82f6" },
      fonts: { sans: "Inter" },
    },
  },
});

// ── App Shell ──────────────────────────────────────────────────────────────

export function AdminApp() {
  const { user, isLoading } = snap.useUser();
  const { mutate: logout } = snap.useLogout();

  if (isLoading) return null;
  if (!user) return null; // redirect to login handled by auth

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
                { label: "Profile", icon: "user", onClick: () => {} },
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

// ── Stats Row ──────────────────────────────────────────────────────────────

function StatsRow() {
  return (
    <GridBase columns={4} gap="md">
      <StatCardBase
        label="Total Revenue"
        value="$48,200"
        icon="dollar-sign"
        trend={{ direction: "up", value: "+12.5%", percentage: 12.5, sentiment: "positive" }}
      />
      <StatCardBase
        label="Active Users"
        value="1,234"
        icon="users"
        trend={{ direction: "up", value: "+5.2%", percentage: 5.2, sentiment: "positive" }}
      />
      <StatCardBase
        label="Orders"
        value="567"
        icon="shopping-cart"
        trend={{ direction: "down", value: "-3.1%", percentage: 3.1, sentiment: "negative" }}
      />
      <StatCardBase
        label="Conversion"
        value="3.2%"
        icon="percent"
        trend={{ direction: "flat", value: "0%", percentage: 0, sentiment: "neutral" }}
      />
    </GridBase>
  );
}

// ── Users CRUD Table ───────────────────────────────────────────────────────

const USERS = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "admin", status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "member", status: "active" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "member", status: "inactive" },
];

function UsersTable() {
  const [users, setUsers] = useState(USERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<typeof USERS[0] | null>(null);
  const [deleteUser, setDeleteUser] = useState<typeof USERS[0] | null>(null);

  const columns = [
    { field: "name", label: "Name", sortable: true },
    { field: "email", label: "Email" },
    { field: "role", label: "Role", format: "badge" as const, badgeColors: { admin: "blue", member: "gray" } },
    { field: "status", label: "Status", format: "badge" as const, badgeColors: { active: "green", inactive: "red" } },
  ];

  return (
    <>
      <RowBase justify="between" align="center">
        <h2>Users</h2>
        <ButtonBase label="Add User" icon="plus" onClick={() => setCreateOpen(true)} />
      </RowBase>
      <SpacerBase size="md" />
      <DataTableBase
        columns={columns}
        rows={users}
        searchable
        hoverable
        striped
        rowActions={[
          { label: "Edit", icon: "edit", onAction: (row) => setEditUser(row as typeof USERS[0]) },
          { label: "Delete", icon: "trash", variant: "destructive", onAction: (row) => setDeleteUser(row as typeof USERS[0]) },
        ]}
      />

      {/* Create Modal */}
      <UserFormModal
        title="Create User"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={(user) => {
          setUsers((prev) => [...prev, { ...user, id: String(Date.now()) }]);
          setCreateOpen(false);
        }}
      />

      {/* Edit Drawer */}
      <DrawerBase
        title="Edit User"
        side="right"
        size="md"
        open={editUser !== null}
        onClose={() => setEditUser(null)}
        footer={[
          { label: "Cancel", variant: "outline", onClick: () => setEditUser(null) },
          { label: "Save", onClick: () => {
            if (editUser) {
              setUsers((prev) => prev.map((u) => u.id === editUser.id ? editUser : u));
              setEditUser(null);
            }
          }},
        ]}
      >
        {editUser && (
          <ColumnBase gap="md">
            <InputField label="Name" value={editUser.name} onChange={(v) => setEditUser({ ...editUser, name: v })} />
            <InputField label="Email" type="email" value={editUser.email} onChange={(v) => setEditUser({ ...editUser, email: v })} />
            <SelectField
              label="Role"
              value={editUser.role}
              onChange={(v) => setEditUser({ ...editUser, role: v })}
              options={[{ label: "Admin", value: "admin" }, { label: "Member", value: "member" }]}
            />
          </ColumnBase>
        )}
      </DrawerBase>

      {/* Delete Confirmation */}
      <ConfirmDialogBase
        title="Delete User"
        description={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone.`}
        open={deleteUser !== null}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => {
          if (deleteUser) {
            setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
            setDeleteUser(null);
          }
        }}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

// ── User Form Modal ────────────────────────────────────────────────────────

function UserFormModal({ title, open, onClose, onSave }: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (user: { name: string; email: string; role: string; status: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  return (
    <ModalBase
      title={title}
      open={open}
      onClose={onClose}
      footer={[
        { label: "Cancel", variant: "outline", onClick: onClose },
        { label: "Create", onClick: () => { onSave({ name, email, role, status: "active" }); setName(""); setEmail(""); }},
      ]}
    >
      <ColumnBase gap="md">
        <InputField label="Name" value={name} onChange={setName} required />
        <InputField label="Email" type="email" value={email} onChange={setEmail} required />
        <SelectField
          label="Role"
          value={role}
          onChange={setRole}
          options={[{ label: "Admin", value: "admin" }, { label: "Member", value: "member" }]}
        />
      </ColumnBase>
    </ModalBase>
  );
}
```

## What this includes

- Sidebar navigation with collapsible menu
- User dropdown menu with sign-out
- 4 KPI stat cards with trend indicators
- Searchable, sortable data table
- Create user modal with form
- Edit user drawer (slide-in side panel)
- Delete confirmation dialog
- Themed with tokens

## Related

- [Layout and Navigation guide](/guides/layout-and-navigation/)
- [Data Tables guide](/guides/data-tables/)
- [Overlays guide](/guides/overlays/)
- [Authentication guide](/guides/authentication/)
