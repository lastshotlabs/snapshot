import React, { useState } from "react";
import { ComponentRenderer } from "@lastshotlabs/snapshot/ui";

type Page = "dashboard" | "data" | "forms" | "overlay" | "structural";

const PAGES: { key: Page; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "data", label: "Data Display" },
  { key: "forms", label: "Forms" },
  { key: "overlay", label: "Overlay" },
  { key: "structural", label: "Structural" },
];

// ── Dashboard page configs ──────────────────────────────────────────────

const statCards = {
  type: "row",
  gap: "md",
  children: [
    {
      type: "stat-card",
      id: "revenue",
      data: "GET /api/stats/revenue",
      field: "value",
      label: "Total Revenue",
      format: "currency",
      currency: "USD",
      icon: "dollar-sign",
      trend: { field: "change", sentiment: "up-is-good", format: "percent" },
      span: 3,
    },
    {
      type: "stat-card",
      id: "users",
      data: "GET /api/stats/users",
      field: "value",
      label: "Total Users",
      format: "compact",
      icon: "users",
      trend: { field: "change", sentiment: "up-is-good", format: "percent" },
      span: 3,
    },
    {
      type: "stat-card",
      id: "orders",
      data: "GET /api/stats/orders",
      field: "value",
      label: "Orders",
      format: "number",
      icon: "shopping-cart",
      trend: { field: "change", sentiment: "up-is-good", format: "percent" },
      span: 3,
    },
    {
      type: "stat-card",
      id: "conversion",
      data: "GET /api/stats/conversion",
      field: "value",
      label: "Conversion Rate",
      format: "percent",
      icon: "trending-up",
      trend: { field: "change", sentiment: "up-is-good", format: "percent" },
      span: 3,
    },
  ],
};

// ── Data page configs ───────────────────────────────────────────────────

const dataTable = {
  type: "data-table",
  id: "users-table",
  data: "GET /api/users",
  columns: [
    { field: "name", label: "Name", sortable: true },
    { field: "email", label: "Email", sortable: true },
    { field: "role", label: "Role", format: "badge", badgeColors: { Admin: "blue", Editor: "green", Viewer: "gray" } },
    { field: "status", label: "Status", format: "badge", badgeColors: { active: "green", inactive: "red" } },
    { field: "joined", label: "Joined", format: "date", sortable: true },
  ],
  searchable: { placeholder: "Search users...", fields: ["name", "email"] },
  selectable: true,
  pagination: { type: "offset", pageSize: 10 },
  density: "default",
  actions: [
    { label: "Edit", icon: "pencil", action: { type: "toast", message: "Edit clicked for {name}" } },
    { label: "Delete", icon: "trash", action: { type: "confirm", title: "Delete user?", message: "Are you sure you want to delete {name}?", onConfirm: { type: "toast", message: "Deleted {name}" } } },
  ],
  bulkActions: [
    { label: "Delete {count} users", icon: "trash", action: { type: "toast", message: "Bulk delete" } },
  ],
};

const detailCard = {
  type: "detail-card",
  data: "GET /api/user/1",
  title: "User Profile",
  fields: [
    { field: "name", label: "Full Name" },
    { field: "email", label: "Email", format: "email" },
    { field: "role", label: "Role", format: "badge" },
    { field: "department", label: "Department" },
    { field: "location", label: "Location" },
    { field: "phone", label: "Phone" },
    { field: "verified", label: "Verified", format: "boolean" },
    { field: "joined", label: "Member Since", format: "date" },
  ],
  actions: [
    { label: "Edit Profile", icon: "pencil", action: { type: "toast", message: "Edit profile clicked" } },
  ],
};

// ── Forms page configs ──────────────────────────────────────────────────

const autoForm = {
  type: "form",
  id: "user-form",
  submit: "/api/users",
  method: "POST",
  fields: [
    { name: "name", type: "text", label: "Full Name", required: true, placeholder: "Enter full name", validation: { minLength: 2 } },
    { name: "email", type: "email", label: "Email Address", required: true, placeholder: "user@example.com" },
    { name: "role", type: "select", label: "Role", options: [{ label: "Admin", value: "admin" }, { label: "Editor", value: "editor" }, { label: "Viewer", value: "viewer" }] },
    { name: "department", type: "text", label: "Department", placeholder: "Engineering" },
    { name: "bio", type: "textarea", label: "Bio", placeholder: "Tell us about yourself..." },
    { name: "notifications", type: "checkbox", label: "Enable email notifications" },
  ],
  submitLabel: "Create User",
  onSuccess: { type: "toast", message: "User created successfully!", variant: "success" },
  onError: { type: "toast", message: "Failed to create user", variant: "error" },
};

// ── Overlay page configs ────────────────────────────────────────────────

const modalTrigger = {
  type: "button",
  label: "Open Modal",
  action: { type: "open-modal", modalId: "demo-modal" },
  variant: "default",
};

const modal = {
  type: "modal",
  id: "demo-modal",
  title: "Example Modal",
  size: "md",
  content: [
    { type: "heading", text: "Modal Content", level: 3 },
    {
      type: "form",
      submit: "/api/feedback",
      fields: [
        { name: "feedback", type: "textarea", label: "Your Feedback", required: true },
        { name: "rating", type: "select", label: "Rating", options: [{ label: "Great", value: "5" }, { label: "Good", value: "4" }, { label: "OK", value: "3" }] },
      ],
      submitLabel: "Submit Feedback",
      onSuccess: { type: "close-modal", modalId: "demo-modal" },
    },
  ],
};

const drawerTrigger = {
  type: "button",
  label: "Open Drawer",
  action: { type: "open-modal", modalId: "demo-drawer" },
  variant: "outline",
};

const drawer = {
  type: "drawer",
  id: "demo-drawer",
  title: "Settings Drawer",
  side: "right",
  size: "md",
  content: [
    { type: "heading", text: "Preferences", level: 3 },
    {
      type: "form",
      submit: "/api/settings",
      fields: [
        { name: "theme", type: "select", label: "Theme", options: [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }] },
        { name: "language", type: "select", label: "Language", options: [{ label: "English", value: "en" }, { label: "Spanish", value: "es" }] },
        { name: "compact", type: "checkbox", label: "Compact mode" },
      ],
      submitLabel: "Save Settings",
    },
  ],
};

// ── Tabs config ─────────────────────────────────────────────────────────

const tabs = {
  type: "tabs",
  id: "demo-tabs",
  variant: "underline",
  children: [
    {
      label: "Overview",
      content: [
        { type: "heading", text: "Overview Tab", level: 3 },
        { type: "stat-card", data: "GET /api/stats/revenue", field: "value", label: "Revenue", format: "currency" },
      ],
    },
    {
      label: "Details",
      content: [
        { type: "heading", text: "Details Tab", level: 3 },
        { type: "detail-card", data: "GET /api/user/1", title: "User Info", fields: "auto" },
      ],
    },
    {
      label: "Settings",
      disabled: true,
      content: [{ type: "heading", text: "Disabled tab" }],
    },
  ],
};

// ── Structural configs ──────────────────────────────────────────────────

const structuralRow = {
  type: "row",
  gap: "md",
  justify: "between",
  align: "center",
  children: [
    { type: "heading", text: "Left Side", level: 4 },
    {
      type: "row",
      gap: "sm",
      children: [
        { type: "button", label: "Cancel", action: { type: "toast", message: "Cancelled" }, variant: "outline", size: "sm" },
        { type: "button", label: "Save", action: { type: "toast", message: "Saved!", variant: "success" }, variant: "default", size: "sm" },
        { type: "button", label: "Delete", action: { type: "confirm", title: "Delete?", message: "This cannot be undone.", onConfirm: { type: "toast", message: "Deleted" } }, variant: "destructive", size: "sm" },
      ],
    },
  ],
};

const headings = {
  type: "row",
  gap: "sm",
  children: [
    { type: "heading", text: "Heading 1", level: 1 },
    { type: "heading", text: "Heading 2", level: 2 },
    { type: "heading", text: "Heading 3", level: 3 },
    { type: "heading", text: "Heading 4", level: 4 },
    { type: "heading", text: "Heading 5", level: 5 },
    { type: "heading", text: "Heading 6", level: 6 },
  ],
};

const selectDemo = {
  type: "select",
  id: "color-picker",
  options: [
    { label: "Red", value: "red" },
    { label: "Green", value: "green" },
    { label: "Blue", value: "blue" },
    { label: "Purple", value: "purple" },
  ],
  placeholder: "Pick a color...",
};

// ── Page renderer ───────────────────────────────────────────────────────

function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="showcase__section">
      <div className="showcase__section-header">{title}</div>
      <div className="showcase__section-body">{children}</div>
    </div>
  );
}

function RenderConfig({ config }: { config: any }) {
  return <ComponentRenderer config={config} />;
}

function DashboardPage() {
  return (
    <div className="showcase">
      <ShowcaseSection title="Stat Cards">
        <RenderConfig config={statCards} />
      </ShowcaseSection>
    </div>
  );
}

function DataPage() {
  return (
    <div className="showcase">
      <ShowcaseSection title="Data Table">
        <RenderConfig config={dataTable} />
      </ShowcaseSection>
      <ShowcaseSection title="Detail Card">
        <RenderConfig config={detailCard} />
      </ShowcaseSection>
    </div>
  );
}

function FormsPage() {
  return (
    <div className="showcase">
      <ShowcaseSection title="Auto Form">
        <RenderConfig config={autoForm} />
      </ShowcaseSection>
    </div>
  );
}

function OverlayPage() {
  return (
    <div className="showcase">
      <ShowcaseSection title="Modal">
        <div className="showcase__row">
          <RenderConfig config={modalTrigger} />
        </div>
        <RenderConfig config={modal} />
      </ShowcaseSection>
      <ShowcaseSection title="Drawer">
        <div className="showcase__row">
          <RenderConfig config={drawerTrigger} />
        </div>
        <RenderConfig config={drawer} />
      </ShowcaseSection>
      <ShowcaseSection title="Tabs">
        <RenderConfig config={tabs} />
      </ShowcaseSection>
    </div>
  );
}

function StructuralPage() {
  return (
    <div className="showcase">
      <ShowcaseSection title="Row Layout + Buttons">
        <RenderConfig config={structuralRow} />
      </ShowcaseSection>
      <ShowcaseSection title="Headings">
        <RenderConfig config={headings} />
      </ShowcaseSection>
      <ShowcaseSection title="Select">
        <RenderConfig config={selectDemo} />
      </ShowcaseSection>
    </div>
  );
}

export function ComponentShowcase() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <>
      <div className="page-tabs">
        {PAGES.map(({ key, label }) => (
          <button
            key={key}
            className={`page-tab ${page === key ? "page-tab--active" : ""}`}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {page === "dashboard" && <DashboardPage />}
      {page === "data" && <DataPage />}
      {page === "forms" && <FormsPage />}
      {page === "overlay" && <OverlayPage />}
      {page === "structural" && <StructuralPage />}
    </>
  );
}
