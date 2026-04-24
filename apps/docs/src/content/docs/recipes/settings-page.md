---
title: Settings Page
description: Tabbed settings with profile, password, notifications, sessions, and account deletion.
draft: false
---

A complete settings page with tabs for profile editing, password changes, notification preferences, session management, and account deletion.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  TabsBase, CardBase, ColumnBase, RowBase, SpacerBase,
  InputField, TextareaField, SwitchField, ButtonBase,
  DataTableBase, ConfirmDialogBase, ContainerBase,
} from "@lastshotlabs/snapshot/ui";
import { useState } from "react";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: { app: { auth: { loginPath: "/login", homePath: "/" } } },
});

// ── Settings Page ──────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <ContainerBase maxWidth="lg" padding="xl">
      <h1>Settings</h1>
      <SpacerBase size="lg" />
      <TabsBase
        tabs={[
          { label: "Profile", content: <ProfileTab /> },
          { label: "Password", content: <PasswordTab /> },
          { label: "Notifications", content: <NotificationsTab /> },
          { label: "Sessions", content: <SessionsTab /> },
          { label: "Account", content: <AccountTab /> },
        ]}
      />
    </ContainerBase>
  );
}

// ── Profile Tab ────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = snap.useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    // Call your API to update profile
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <CardBase title="Profile Information" gap="md">
      <InputField label="Full name" value={name} onChange={setName} />
      <InputField label="Email" type="email" value={email} onChange={setEmail} />
      <TextareaField label="Bio" value={bio} onChange={setBio} maxLength={300} rows={3} />
      <RowBase justify="end" gap="sm">
        {saved && <span style={{ color: "var(--sn-color-success)" }}>Saved</span>}
        <ButtonBase label="Save changes" onClick={save} />
      </RowBase>
    </CardBase>
  );
}

// ── Password Tab ───────────────────────────────────────────────────────────

function PasswordTab() {
  const { mutate: setPassword, isPending, isSuccess, isError } = snap.useSetPassword();
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <CardBase title="Change Password" gap="md">
      <InputField label="Current password" type="password" value={current} onChange={setCurrent} />
      <InputField label="New password" type="password" value={newPwd} onChange={setNewPwd} />
      <InputField
        label="Confirm new password"
        type="password"
        value={confirm}
        onChange={setConfirm}
        errorText={confirm && confirm !== newPwd ? "Passwords don't match" : undefined}
      />
      {isSuccess && <p style={{ color: "var(--sn-color-success)" }}>Password updated</p>}
      {isError && <p style={{ color: "var(--sn-color-error)" }}>Failed to update password</p>}
      <RowBase justify="end">
        <ButtonBase
          label="Update password"
          onClick={() => setPassword({ password: newPwd, currentPassword: current })}
          disabled={isPending || !current || !newPwd || newPwd !== confirm}
        />
      </RowBase>
    </CardBase>
  );
}

// ── Notifications Tab ──────────────────────────────────────────────────────

function NotificationsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <CardBase title="Notification Preferences" gap="lg">
      <SwitchField
        label="Email notifications"
        description="Receive notifications via email"
        checked={emailNotifs}
        onChange={setEmailNotifs}
      />
      <SwitchField
        label="Push notifications"
        description="Receive browser push notifications"
        checked={pushNotifs}
        onChange={setPushNotifs}
      />
      <SwitchField
        label="Weekly digest"
        description="Receive a weekly summary email"
        checked={weeklyDigest}
        onChange={setWeeklyDigest}
      />
      <SwitchField
        label="Mention alerts"
        description="Get notified when someone mentions you"
        checked={mentions}
        onChange={setMentions}
      />
    </CardBase>
  );
}

// ── Sessions Tab ───────────────────────────────────────────────────────────

function SessionsTab() {
  const { sessions, isLoading } = snap.useSessions();
  const { mutate: revoke } = snap.useRevokeSession();

  return (
    <CardBase title="Active Sessions" gap="md">
      <DataTableBase
        columns={[
          { field: "device", label: "Device" },
          { field: "ip", label: "IP Address" },
          { field: "lastActive", label: "Last Active", format: "date" },
          { field: "current", label: "Current", format: "boolean" },
        ]}
        rows={sessions ?? []}
        isLoading={isLoading}
        rowActions={[
          {
            label: "Revoke",
            icon: "x",
            variant: "destructive",
            onAction: (row) => revoke(row.id as string),
          },
        ]}
      />
      <RowBase justify="end">
        <ButtonBase
          label="Revoke all other sessions"
          variant="destructive"
          onClick={() => {
            sessions?.filter((s) => !s.current).forEach((s) => revoke(s.id as string));
          }}
        />
      </RowBase>
    </CardBase>
  );
}

// ── Account Tab ────────────────────────────────────────────────────────────

function AccountTab() {
  const { mutate: deleteAccount, isPending } = snap.useDeleteAccount();
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <CardBase title="Danger Zone" gap="md">
      <p>Permanently delete your account and all associated data.</p>
      <ButtonBase
        label="Delete account"
        variant="destructive"
        onClick={() => setShowConfirm(true)}
      />

      <ConfirmDialogBase
        title="Delete Account"
        description="This action is permanent and cannot be undone. All your data will be deleted."
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deleteAccount({ password })}
        confirmLabel="Delete my account"
        confirmVariant="destructive"
      />
    </CardBase>
  );
}
```

## What this includes

- Tabbed navigation with 5 sections
- Profile editing with save feedback
- Password change with confirmation validation
- Notification toggles with descriptions
- Active session management with revocation
- Account deletion with confirmation dialog
- Uses real Snapshot auth hooks (`useSetPassword`, `useSessions`, `useRevokeSession`, `useDeleteAccount`)

## Related

- [Authentication guide](/guides/authentication/) -- all auth hooks
- [Forms guide](/guides/forms/) -- form components in detail
- [Data Tables guide](/guides/data-tables/) -- session table patterns
