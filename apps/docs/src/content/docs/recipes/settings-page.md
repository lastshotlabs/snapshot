---
title: Settings Page
description: Tabbed settings with profile, password, notifications, sessions, and account deletion.
draft: false
---

A complete settings page with tabs for profile editing, password changes, notification preferences, session management, and account deletion -- all wired to real API calls with loading and error feedback.

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  TabsBase, CardBase, ColumnBase, RowBase, SpacerBase,
  InputField, TextareaField, SwitchField, ButtonBase,
  DataTableBase, ConfirmDialogBase, ModalBase, ContainerBase, AlertBase,
} from "@lastshotlabs/snapshot/ui";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const snap = createSnapshot({
  apiUrl: "/api",
  loginPath: "/login",
  homePath: "/",
});

// ── Settings Page ─────────────────────────────────────────────────────────

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

// ── Profile Tab ───────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = snap.useUser();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  const updateProfile = useMutation({
    mutationFn: (data: { name: string; email: string; bio: string }) =>
      snap.api.patch("/auth/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
    },
  });

  return (
    <CardBase title="Profile Information" gap="md">
      {updateProfile.isSuccess && (
        <AlertBase severity="success">Profile saved</AlertBase>
      )}
      {updateProfile.error && (
        <AlertBase severity="error">{updateProfile.error.message}</AlertBase>
      )}
      <InputField label="Full name" value={name} onChange={setName} />
      <InputField label="Email" type="email" value={email} onChange={setEmail} />
      <TextareaField label="Bio" value={bio} onChange={setBio} maxLength={300} rows={3} />
      <RowBase justify="end">
        <ButtonBase
          label={updateProfile.isPending ? "Saving..." : "Save changes"}
          onClick={() => updateProfile.mutate({ name, email, bio })}
          disabled={updateProfile.isPending}
        />
      </RowBase>
    </CardBase>
  );
}

// ── Password Tab ──────────────────────────────────────────────────────────

function PasswordTab() {
  const { mutate: setPassword, isPending, isSuccess, error, reset } = snap.useSetPassword();
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && confirm !== newPwd;
  const canSubmit = current && newPwd && confirm && !mismatch && !isPending;

  const handleSubmit = () => {
    setPassword(
      { password: newPwd, currentPassword: current },
      {
        onSuccess: () => {
          setCurrent("");
          setNewPwd("");
          setConfirm("");
        },
      },
    );
  };

  return (
    <CardBase title="Change Password" gap="md">
      {isSuccess && <AlertBase severity="success">Password updated</AlertBase>}
      {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
      <InputField label="Current password" type="password" value={current} onChange={(v) => { setCurrent(v); reset(); }} />
      <InputField label="New password" type="password" value={newPwd} onChange={setNewPwd} />
      <InputField
        label="Confirm new password"
        type="password"
        value={confirm}
        onChange={setConfirm}
        errorText={mismatch ? "Passwords don't match" : undefined}
      />
      <RowBase justify="end">
        <ButtonBase
          label={isPending ? "Updating..." : "Update password"}
          onClick={handleSubmit}
          disabled={!canSubmit}
        />
      </RowBase>
    </CardBase>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────

interface NotificationPrefs {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  mentionAlerts: boolean;
}

function NotificationsTab() {
  const { data: prefs, isLoading } = useQuery<NotificationPrefs>({
    queryKey: ["/settings/notifications"],
    queryFn: () => snap.api.get("/settings/notifications"),
  });

  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: (data: Partial<NotificationPrefs>) =>
      snap.api.patch("/settings/notifications", data),
    onSuccess: (_, vars) => {
      queryClient.setQueryData<NotificationPrefs>(
        ["/settings/notifications"],
        (old) => old ? { ...old, ...vars } : old,
      );
    },
  });

  if (isLoading || !prefs) return null;

  const toggle = (key: keyof NotificationPrefs) => {
    update.mutate({ [key]: !prefs[key] });
  };

  return (
    <CardBase title="Notification Preferences" gap="lg">
      {update.error && (
        <AlertBase severity="error">{update.error.message}</AlertBase>
      )}
      <SwitchField
        label="Email notifications"
        description="Receive notifications via email"
        checked={prefs.emailNotifications}
        onChange={() => toggle("emailNotifications")}
      />
      <SwitchField
        label="Push notifications"
        description="Receive browser push notifications"
        checked={prefs.pushNotifications}
        onChange={() => toggle("pushNotifications")}
      />
      <SwitchField
        label="Weekly digest"
        description="Receive a weekly summary email"
        checked={prefs.weeklyDigest}
        onChange={() => toggle("weeklyDigest")}
      />
      <SwitchField
        label="Mention alerts"
        description="Get notified when someone mentions you"
        checked={prefs.mentionAlerts}
        onChange={() => toggle("mentionAlerts")}
      />
    </CardBase>
  );
}

// ── Sessions Tab ──────────────────────────────────────────────────────────

function SessionsTab() {
  const { sessions, isLoading } = snap.useSessions();
  const { mutate: revoke, isPending: revoking } = snap.useRevokeSession();
  const [revokeAllConfirm, setRevokeAllConfirm] = useState(false);

  const otherSessions = sessions?.filter((s) => !s.current) ?? [];

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
        emptyMessage="No active sessions"
        rowActions={[
          {
            label: "Revoke",
            icon: "x",
            variant: "destructive",
            onAction: (row) => revoke(row.id as string),
            hidden: (row) => row.current as boolean,
          },
        ]}
      />
      {otherSessions.length > 0 && (
        <RowBase justify="end">
          <ButtonBase
            label={revoking ? "Revoking..." : "Revoke all other sessions"}
            variant="destructive"
            onClick={() => setRevokeAllConfirm(true)}
            disabled={revoking}
          />
        </RowBase>
      )}

      <ConfirmDialogBase
        title="Revoke All Sessions"
        description="This will sign you out of all other devices. You'll stay signed in here."
        open={revokeAllConfirm}
        onClose={() => setRevokeAllConfirm(false)}
        onConfirm={() => {
          otherSessions.forEach((s) => revoke(s.id as string));
          setRevokeAllConfirm(false);
        }}
        confirmLabel="Revoke all"
        confirmVariant="destructive"
      />
    </CardBase>
  );
}

// ── Account Tab ───────────────────────────────────────────────────────────

function AccountTab() {
  const { mutate: deleteAccount, isPending, error } = snap.useDeleteAccount();
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");

  return (
    <CardBase title="Danger Zone" gap="md">
      <p>Permanently delete your account and all associated data. This cannot be undone.</p>
      <ButtonBase
        label="Delete account"
        variant="destructive"
        onClick={() => setShowConfirm(true)}
      />

      <ModalBase
        title="Delete Account"
        open={showConfirm}
        onClose={() => { setShowConfirm(false); setPassword(""); }}
        size="sm"
        footer={[
          { label: "Cancel", variant: "outline", onClick: () => { setShowConfirm(false); setPassword(""); } },
          {
            label: isPending ? "Deleting..." : "Delete my account",
            variant: "destructive",
            onClick: () => deleteAccount({ password }),
            disabled: isPending || !password,
          },
        ]}
      >
        <ColumnBase gap="md">
          <p style={{ color: "var(--sn-color-muted-foreground)" }}>
            This action is permanent and cannot be undone. All your data will be deleted.
          </p>
          {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
          <InputField
            label="Enter your password to confirm"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
        </ColumnBase>
      </ModalBase>
    </CardBase>
  );
}
```

## What this includes

- **Profile editing** saved to `/auth/profile` with loading and success feedback
- **Password change** with confirmation validation and `formatAuthError` error display
- **Notification preferences** fetched from and saved to `/settings/notifications` with optimistic updates
- **Session management** with current-session detection and bulk revocation
- **Account deletion** with password confirmation inside the dialog
- All mutations show loading state on the button and display errors inline

## API contract

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PATCH | `/auth/profile` | Update user profile |
| GET | `/settings/notifications` | Fetch notification preferences |
| PATCH | `/settings/notifications` | Update notification preferences |

Session and account deletion endpoints are handled by Snapshot's built-in auth hooks.

## Related

- [Authentication guide](/guides/authentication/) -- all auth hooks
- [Forms guide](/guides/forms/) -- form components in detail
- [Data Tables guide](/guides/data-tables/) -- session table patterns
