import React, { useEffect, useState } from "react";
import {
  ComponentRenderer,
  PageContextProvider,
  crudPage,
  dashboardPage,
  settingsPage,
  usePublish,
} from "@lastshotlabs/snapshot/ui";

type Page =
  | "dashboard"
  | "data"
  | "forms"
  | "overlay"
  | "structural"
  | "primitives"
  | "navigation"
  | "content"
  | "workflow"
  | "communication"
  | "presets"
  | "feed-chart-wizard";

const PAGES: {
  key: Page;
  label: string;
  group: string;
  count: number;
  description: string;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    group: "Core",
    count: 4,
    description:
      "Executive metric cards with API-backed values, trend semantics, icons, and tokenized layout behavior.",
  },
  {
    key: "data",
    label: "Data",
    group: "Core",
    count: 2,
    description:
      "Tables and detail views for dense operational data, selection, search, sorting, actions, and loading states.",
  },
  {
    key: "primitives",
    label: "Primitives",
    group: "Foundation",
    count: 18,
    description:
      "Small, reusable atoms that set the baseline for color, rhythm, focus, feedback, and empty-state quality.",
  },
  {
    key: "forms",
    label: "Forms",
    group: "Input",
    count: 9,
    description:
      "Form inputs, creation flows, validation, inline editing, tagging, location search, and quick entry patterns.",
  },
  {
    key: "overlay",
    label: "Overlay",
    group: "Interaction",
    count: 7,
    description:
      "Modals, drawers, command surfaces, popovers, context menus, tabs, and filters that need clear focus states and low-friction exits.",
  },
  {
    key: "navigation",
    label: "Navigation",
    group: "Interaction",
    count: 6,
    description:
      "Wayfinding patterns for hierarchy, branching, tabbing, menus, tree structures, and step-based flows.",
  },
  {
    key: "content",
    label: "Content",
    group: "Expression",
    count: 8,
    description:
      "Editors, timelines, markdown, code, file input, and compare views where readability and containment matter most.",
  },
  {
    key: "workflow",
    label: "Workflow",
    group: "Systems",
    count: 5,
    description:
      "Kanban, calendar, pricing, audit logs, and notification feeds that stress-test density, drag affordances, and large-card balance.",
  },
  {
    key: "structural",
    label: "Structural",
    group: "Foundation",
    count: 3,
    description:
      "Raw layout primitives for rows, headings, buttons, and selects before they are wrapped into product screens.",
  },
  {
    key: "communication",
    label: "Communication",
    group: "Expression",
    count: 15,
    description:
      "Messaging, threads, comments, embeds, emoji, reactions, and presence components with realistic conversation payloads.",
  },
  {
    key: "presets",
    label: "Presets",
    group: "Composed",
    count: 3,
    description:
      "Generated page presets that combine primitives into CRUD, dashboard, and account settings experiences.",
  },
  {
    key: "feed-chart-wizard",
    label: "Feed + Chart + Wizard",
    group: "Composed",
    count: 9,
    description:
      "Recent additions for activity streams, chart empty states, and multi-step onboarding flows.",
  },
];

const PAGE_BY_KEY = Object.fromEntries(
  PAGES.map((page) => [page.key, page]),
) as Record<Page, (typeof PAGES)[number]>;

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
      id: "users-count",
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

// DataTable uses useComponentData for data fetching
const dataTable = {
  type: "data-table",
  id: "users-table",
  data: "GET /api/users",
  columns: [
    { field: "name", label: "Name", sortable: true },
    { field: "email", label: "Email", sortable: true },
    {
      field: "role",
      label: "Role",
      format: "badge",
      badgeColors: { Admin: "blue", Editor: "green", Viewer: "gray" },
    },
    {
      field: "status",
      label: "Status",
      format: "badge",
      badgeColors: { active: "green", inactive: "red" },
    },
    { field: "joined", label: "Joined", format: "date", sortable: true },
  ],
  searchable: { placeholder: "Search users...", fields: ["name", "email"] },
  selectable: true,
  pagination: { type: "offset", pageSize: 10 },
  density: "default",
  actions: [
    {
      label: "Edit",
      icon: "pencil",
      action: { type: "toast", message: "Edit clicked for {name}" },
    },
    {
      label: "Delete",
      icon: "trash",
      action: {
        type: "confirm",
        title: "Delete user?",
        message: "Are you sure you want to delete {name}?",
        onConfirm: { type: "toast", message: "Deleted {name}" },
      },
    },
  ],
  bulkActions: [
    {
      label: "Delete {count} users",
      icon: "trash",
      action: { type: "toast", message: "Bulk delete triggered" },
    },
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
    {
      label: "Edit Profile",
      icon: "pencil",
      action: { type: "toast", message: "Edit profile clicked" },
    },
  ],
};

// ── Forms page configs ──────────────────────────────────────────────────

const autoForm = {
  type: "form",
  id: "user-form",
  submit: "/api/users",
  method: "POST",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Full Name",
      required: true,
      placeholder: "Enter full name",
      validation: { minLength: 2 },
    },
    {
      name: "email",
      type: "email",
      label: "Email Address",
      required: true,
      placeholder: "user@example.com",
    },
    {
      name: "role",
      type: "select",
      label: "Role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Viewer", value: "viewer" },
      ],
    },
    {
      name: "department",
      type: "text",
      label: "Department",
      placeholder: "Engineering",
    },
    {
      name: "bio",
      type: "textarea",
      label: "Bio",
      placeholder: "Tell us about yourself...",
    },
    {
      name: "notifications",
      type: "checkbox",
      label: "Enable email notifications",
    },
  ],
  submitLabel: "Create User",
  onSuccess: {
    type: "toast",
    message: "User created successfully!",
    variant: "success",
  },
  onError: {
    type: "toast",
    message: "Failed to create user",
    variant: "error",
  },
};

// ── Overlay page configs ────────────────────────────────────────────────

const modalTrigger = {
  type: "button",
  label: "Open Modal",
  action: { type: "open-modal", modal: "demo-modal" },
  variant: "default",
};

const modal = {
  type: "modal",
  id: "demo-modal",
  title: "Example Modal",
  size: "md",
  content: [
    { type: "heading", text: "Send Feedback", level: 3 },
    {
      type: "form",
      submit: "/api/feedback",
      fields: [
        {
          name: "feedback",
          type: "textarea",
          label: "Your Feedback",
          required: true,
        },
        {
          name: "rating",
          type: "select",
          label: "Rating",
          options: [
            { label: "Great", value: "5" },
            { label: "Good", value: "4" },
            { label: "OK", value: "3" },
          ],
        },
      ],
      submitLabel: "Submit Feedback",
      onSuccess: { type: "close-modal", modal: "demo-modal" },
    },
  ],
};

const drawerTrigger = {
  type: "button",
  label: "Open Drawer",
  action: { type: "open-modal", modal: "demo-drawer" },
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
        {
          name: "theme",
          type: "select",
          label: "Theme",
          options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ],
        },
        {
          name: "language",
          type: "select",
          label: "Language",
          options: [
            { label: "English", value: "en" },
            { label: "Spanish", value: "es" },
          ],
        },
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
        {
          type: "stat-card",
          data: "GET /api/stats/revenue",
          field: "value",
          label: "Revenue",
          format: "currency",
        },
      ],
    },
    {
      label: "Details",
      content: [
        { type: "heading", text: "Details Tab", level: 3 },
        {
          type: "detail-card",
          data: "GET /api/user/1",
          title: "User Info",
          fields: "auto",
        },
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
        {
          type: "button",
          label: "Cancel",
          action: { type: "toast", message: "Cancelled" },
          variant: "outline",
          size: "sm",
        },
        {
          type: "button",
          label: "Save",
          action: {
            type: "toast",
            message: "Saved!",
            variant: "success",
          },
          variant: "default",
          size: "sm",
        },
        {
          type: "button",
          label: "Delete",
          action: {
            type: "confirm",
            title: "Delete?",
            message: "This cannot be undone.",
            onConfirm: { type: "toast", message: "Deleted" },
          },
          variant: "destructive",
          size: "sm",
        },
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

// ── Primitives page configs ────────────────────────────────────────────

const badgeRow = {
  type: "row",
  gap: "sm",
  wrap: true,
  children: [
    { type: "badge", text: "Default", variant: "soft" },
    { type: "badge", text: "Primary", color: "primary", variant: "solid" },
    { type: "badge", text: "Success", color: "success", variant: "soft" },
    { type: "badge", text: "Warning", color: "warning", variant: "outline" },
    {
      type: "badge",
      text: "Destructive",
      color: "destructive",
      variant: "solid",
    },
    { type: "badge", text: "Info", color: "info", variant: "soft" },
    { type: "badge", text: "Dot Variant", color: "success", variant: "dot" },
    {
      type: "badge",
      text: "Large",
      color: "info",
      variant: "solid",
      size: "lg",
    },
    {
      type: "badge",
      text: "Small",
      color: "warning",
      variant: "outline",
      size: "sm",
    },
    { type: "badge", text: "Muted", color: "muted", variant: "soft" },
    {
      type: "badge",
      text: "Secondary",
      color: "secondary",
      variant: "outline",
    },
  ],
};

const avatarRow = {
  type: "row",
  gap: "md",
  align: "center",
  children: [
    { type: "avatar", name: "Alice Johnson", size: "xs" },
    { type: "avatar", name: "Bob Smith", size: "sm", color: "accent" },
    { type: "avatar", name: "Carol Davis", size: "md", status: "online" },
    {
      type: "avatar",
      name: "Dave Wilson",
      size: "lg",
      status: "busy",
      color: "secondary",
    },
    { type: "avatar", name: "Eve", size: "xl", status: "away" },
    { type: "avatar", shape: "square", name: "SQ", size: "lg" },
  ],
};

const alerts = {
  type: "row",
  gap: "md",
  children: [
    {
      type: "alert",
      variant: "info",
      title: "Information",
      description: "This is an informational message about the system.",
      span: 12,
    },
    {
      type: "alert",
      variant: "success",
      title: "Success!",
      description: "Your changes have been saved successfully.",
      dismissible: true,
      span: 12,
    },
    {
      type: "alert",
      variant: "warning",
      description: "Your trial expires in 3 days. Upgrade now.",
      actionLabel: "Upgrade",
      action: { type: "toast", message: "Upgrade clicked" },
      span: 12,
    },
    {
      type: "alert",
      variant: "destructive",
      title: "Error",
      description:
        "Failed to connect to the database. Please check your configuration.",
      dismissible: true,
      span: 12,
    },
  ],
};

const progressBars = {
  type: "row",
  gap: "md",
  children: [
    {
      type: "progress",
      value: 75,
      label: "Upload Progress",
      showValue: true,
      color: "primary",
      span: 6,
    },
    {
      type: "progress",
      value: 45,
      label: "Storage Used",
      showValue: true,
      color: "warning",
      size: "lg",
      span: 6,
    },
    {
      type: "progress",
      value: 100,
      label: "Complete",
      showValue: true,
      color: "success",
      size: "sm",
      span: 6,
    },
    { type: "progress", label: "Loading...", color: "info", span: 6 },
  ],
};

const skeletonDemo = {
  type: "row",
  gap: "md",
  children: [
    { type: "skeleton", variant: "text", lines: 3, span: 4 },
    { type: "skeleton", variant: "circular", width: 64, height: 64, span: 2 },
    { type: "skeleton", variant: "card", span: 6 },
  ],
};

const emptyStateDemo = {
  type: "empty-state",
  title: "No results found",
  description:
    "Try adjusting your search or filter to find what you're looking for.",
  icon: "search",
  actionLabel: "Clear Filters",
  action: { type: "toast", message: "Filters cleared" },
};

const switchDemo = {
  type: "row",
  gap: "lg",
  children: [
    {
      type: "switch",
      label: "Email notifications",
      description: "Receive email updates about activity",
      defaultChecked: true,
      color: "primary",
      span: 4,
    },
    { type: "switch", label: "Dark mode", color: "secondary", span: 4 },
    {
      type: "switch",
      label: "Auto-save",
      description: "Automatically save changes",
      defaultChecked: true,
      color: "success",
      size: "sm",
      span: 4,
    },
  ],
};

const tooltipDemo = {
  type: "row",
  gap: "md",
  children: [
    {
      type: "tooltip",
      text: "This is a tooltip on top",
      placement: "top",
      content: [
        {
          type: "button",
          label: "Hover Me (Top)",
          variant: "outline",
          size: "sm",
        },
      ],
    },
    {
      type: "tooltip",
      text: "Tooltip on the right side",
      placement: "right",
      content: [
        {
          type: "button",
          label: "Hover Me (Right)",
          variant: "outline",
          size: "sm",
        },
      ],
    },
    {
      type: "tooltip",
      text: "Bottom tooltip here",
      placement: "bottom",
      content: [
        {
          type: "button",
          label: "Hover Me (Bottom)",
          variant: "outline",
          size: "sm",
        },
      ],
    },
  ],
};

const listDemo = {
  type: "list",
  variant: "bordered",
  divider: true,
  items: [
    {
      title: "Alice Johnson",
      description: "Senior Engineer - Engineering",
      icon: "user",
      badge: "Admin",
      badgeColor: "primary",
    },
    {
      title: "Bob Smith",
      description: "Product Manager - Product",
      icon: "user",
      badge: "Editor",
      badgeColor: "success",
    },
    {
      title: "Carol Davis",
      description: "Designer - Design",
      icon: "user",
      badge: "Viewer",
      badgeColor: "secondary",
    },
    {
      title: "Dave Wilson",
      description: "DevOps - Infrastructure",
      icon: "user",
    },
  ],
};

const sortableListDemo = {
  type: "list",
  variant: "card",
  sortable: true,
  reorderAction: {
    type: "toast",
    message: "List reordered!",
    variant: "success",
  },
  items: [
    {
      title: "1. Design tokens",
      description: "Set up the color, spacing, and typography system",
      icon: "palette",
    },
    {
      title: "2. Component library",
      description: "Build all config-driven components",
      icon: "layout-dashboard",
    },
    {
      title: "3. Responsive system",
      description: "Add breakpoint hooks and media queries",
      icon: "smartphone",
    },
    {
      title: "4. Drag and drop",
      description: "Enable reordering with @dnd-kit",
      icon: "grip-vertical",
    },
    {
      title: "5. Testing",
      description: "Write schema + rendering tests",
      icon: "check-circle",
    },
  ],
};

// ── Navigation page configs ───────────────────────────────────────────

const accordionDemo = {
  type: "accordion",
  variant: "bordered",
  mode: "single",
  items: [
    {
      title: "What is Snapshot?",
      content: [
        {
          type: "heading",
          text: "Snapshot is a config-driven UI framework that lets you build enterprise applications from JSON manifests.",
          level: 5,
        },
      ],
    },
    {
      title: "How does theming work?",
      content: [
        {
          type: "heading",
          text: "Snapshot uses a design token system with flavors, semantic colors, and component-level overrides - all customizable at runtime.",
          level: 5,
        },
      ],
    },
    {
      title: "Can I use custom components?",
      content: [
        {
          type: "heading",
          text: "Yes! Register custom components via the component registry and reference them as { type: 'custom', component: 'MyComponent' }.",
          level: 5,
        },
      ],
    },
    {
      title: "Disabled Section",
      disabled: true,
      content: [{ type: "heading", text: "This is disabled" }],
    },
  ],
};

const breadcrumbDemo = {
  type: "breadcrumb",
  separator: "chevron",
  items: [
    { label: "Home", path: "/", icon: "home" },
    { label: "Settings", path: "/settings" },
    { label: "Profile", path: "/settings/profile" },
    { label: "Notifications" },
  ],
};

const stepperDemo = {
  type: "stepper",
  activeStep: 1,
  orientation: "horizontal",
  steps: [
    { title: "Account", description: "Create your account" },
    { title: "Profile", description: "Fill in your details" },
    { title: "Preferences", description: "Set your preferences" },
    { title: "Complete", description: "All done!" },
  ],
};

const treeViewDemo = {
  type: "tree-view",
  selectable: true,
  showConnectors: true,
  items: [
    {
      label: "Documents",
      icon: "folder",
      value: "docs",
      expanded: true,
      children: [
        { label: "report.pdf", icon: "file", value: "report" },
        { label: "invoice.xlsx", icon: "file", value: "invoice" },
        {
          label: "Images",
          icon: "folder",
          value: "images",
          children: [
            { label: "logo.png", icon: "image", value: "logo" },
            { label: "banner.jpg", icon: "image", value: "banner" },
          ],
        },
      ],
    },
    {
      label: "Source Code",
      icon: "folder",
      value: "src",
      children: [
        { label: "index.ts", icon: "code", value: "index" },
        { label: "app.tsx", icon: "code", value: "app" },
      ],
    },
    { label: "README.md", icon: "file-text", value: "readme" },
  ],
};

const dropdownDemo = {
  type: "dropdown-menu",
  trigger: { label: "Actions", variant: "outline" },
  items: [
    { type: "label", text: "User Actions" },
    {
      type: "item",
      label: "Edit Profile",
      icon: "edit",
      action: { type: "toast", message: "Edit profile" },
    },
    {
      type: "item",
      label: "Settings",
      icon: "settings",
      action: { type: "toast", message: "Settings" },
    },
    { type: "separator" },
    {
      type: "item",
      label: "Delete Account",
      icon: "trash-2",
      action: { type: "toast", message: "Delete clicked" },
      destructive: true,
    },
  ],
};

// ── Content page configs ──────────────────────────────────────────────

const timelineDemo = {
  type: "timeline",
  variant: "default",
  items: [
    {
      title: "Project Created",
      description: "Initial repository setup and scaffolding",
      date: "2025-01-15",
      color: "primary",
    },
    {
      title: "First Release",
      description: "v1.0.0 shipped to production",
      date: "2025-02-20",
      color: "success",
    },
    {
      title: "Security Patch",
      description: "Critical vulnerability fixed in auth module",
      date: "2025-03-10",
      color: "destructive",
    },
    {
      title: "Major Update",
      description: "v2.0 with new component library and token system",
      date: "2025-04-01",
      color: "info",
    },
  ],
};

const codeBlockDemo = {
  type: "code-block",
  title: "example.ts",
  language: "typescript",
  showLineNumbers: true,
  showCopy: true,
  code: `import { createSnapshot } from "@lastshotlabs/snapshot";

const app = createSnapshot({
  apiUrl: "https://api.example.com",
  auth: { strategy: "jwt" },
});

export const { useLogin, useLogout, useUser } = app;`,
};

const codeBlockPythonDemo = {
  type: "code-block",
  title: "server.py",
  language: "python",
  showLineNumbers: true,
  code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str
    email: str
    role: str = "viewer"

@app.get("/users/{user_id}")
async def get_user(user_id: int) -> User:
    """Fetch a user by ID."""
    if user_id <= 0:
        raise HTTPException(status_code=404, detail="User not found")
    return User(name="Alice", email="alice@example.com")`,
};

const richTextEditorDemo = {
  type: "rich-text-editor",
  content: `# Welcome to the Editor

This is a **rich text editor** with _markdown_ support.

## Features

- Bold, italic, strikethrough formatting
- Headings (h1-h3)
- Bullet and ordered lists
- Inline \`code\` and code blocks
- [Links](https://example.com)
- Blockquotes

> This is a blockquote with **bold** text.

\`\`\`typescript
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`

Try editing this content!`,
  toolbar: true,
  mode: "edit",
  minHeight: "300px",
  maxHeight: "500px",
  id: "demo-editor",
};

const richTextEditorPreviewDemo = {
  type: "rich-text-editor",
  content: `# Read-Only Preview

This editor is in **preview mode**. The toolbar is hidden and content is rendered as formatted markdown.

- Item one
- Item two
- Item three`,
  readonly: true,
  toolbar: false,
  mode: "preview",
  minHeight: "150px",
};

const fileUploaderDemo = {
  type: "file-uploader",
  accept: "image/*,.pdf",
  maxSize: 5242880,
  maxFiles: 3,
  label: "Upload Documents",
  description: "PDF or images up to 5MB each. Maximum 3 files.",
  variant: "dropzone",
};

// ── Workflow page configs ─────────────────────────────────────────────

const kanbanDemo = {
  type: "kanban",
  data: "GET /api/tasks",
  sortable: true,
  reorderAction: { type: "toast", message: "Card moved!", variant: "success" },
  columns: [
    { key: "todo", title: "To Do", color: "secondary" },
    { key: "in-progress", title: "In Progress", color: "info", limit: 3 },
    { key: "review", title: "Review", color: "warning" },
    { key: "done", title: "Done", color: "success" },
  ],
  columnField: "status",
  titleField: "title",
  descriptionField: "description",
};

const calendarDemo = {
  type: "calendar",
  view: "month",
  events: [
    { title: "Sprint Planning", date: "2025-04-07", color: "primary" },
    { title: "Design Review", date: "2025-04-09", color: "info" },
    { title: "Release v2.1", date: "2025-04-15", color: "success" },
    { title: "Team Retro", date: "2025-04-18", color: "warning" },
    { title: "Deadline", date: "2025-04-25", color: "destructive" },
  ],
};

const pricingDemo = {
  type: "pricing-table",
  currency: "$",
  variant: "cards",
  tiers: [
    {
      name: "Starter",
      price: 0,
      period: "/month",
      description: "For individuals getting started",
      features: [
        { text: "Up to 3 projects", included: true },
        { text: "Basic analytics", included: true },
        { text: "Email support", included: true },
        { text: "Custom domains", included: false },
        { text: "API access", included: false },
      ],
      actionLabel: "Get Started",
      action: { type: "toast", message: "Starter selected" },
    },
    {
      name: "Pro",
      price: 29,
      period: "/month",
      description: "For teams and professionals",
      highlighted: true,
      badge: "Most Popular",
      features: [
        { text: "Unlimited projects", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Priority support", included: true },
        { text: "Custom domains", included: true },
        { text: "API access", included: false },
      ],
      actionLabel: "Upgrade to Pro",
      action: { type: "toast", message: "Pro selected" },
    },
    {
      name: "Enterprise",
      price: 99,
      period: "/month",
      description: "For large organizations",
      features: [
        { text: "Unlimited projects", included: true },
        { text: "Advanced analytics", included: true },
        { text: "24/7 support", included: true },
        { text: "Custom domains", included: true },
        { text: "Full API access", included: true },
      ],
      actionLabel: "Contact Sales",
      action: { type: "toast", message: "Enterprise selected" },
    },
  ],
};

const avatarGroupDemo = {
  type: "avatar-group",
  max: 4,
  size: "md",
  avatars: [
    { name: "Alice Johnson" },
    { name: "Bob Smith" },
    { name: "Charlie Brown" },
    { name: "Diana Prince" },
    { name: "Eve Wilson" },
    { name: "Frank Miller" },
  ],
};

const locationInputDemo = {
  type: "location-input",
  id: "demo-location",
  label: "Venue Location",
  placeholder: "Search for a place...",
  searchEndpoint: "GET /api/geocode",
  helperText: "Start typing to search for locations",
};

// ── UI helpers ──────────────────────────────────────────────────────────

function ShowcaseSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="showcase__section">
      <div className="showcase__section-header">
        <span>{title}</span>
        <span className="showcase__section-tag">Demo</span>
      </div>
      <div className="showcase__section-body">{children}</div>
    </div>
  );
}

function RenderConfig({ config }: { config: any }) {
  return <ComponentRenderer config={config} />;
}

/** Each page gets its own PageContextProvider for clean state isolation */
function PageWrapper({ children }: { children: React.ReactNode }) {
  return <PageContextProvider>{children}</PageContextProvider>;
}

function DashboardPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Stat Cards">
          <RenderConfig config={statCards} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

function DataPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Data Table">
          <p
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              marginBottom: "var(--sn-spacing-md, 1rem)",
            }}
          >
            Live mock API data with search, sort, selection, pagination, row
            actions, and bulk actions enabled.
          </p>
          <RenderConfig config={dataTable} />
        </ShowcaseSection>
        <ShowcaseSection title="Detail Card">
          <RenderConfig config={detailCard} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

function FormsPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Auto Form">
          <RenderConfig config={autoForm} />
        </ShowcaseSection>
        <ShowcaseSection title="Input">
          <RenderConfig config={inputDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Textarea">
          <RenderConfig config={textareaDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Toggle">
          <RenderConfig config={toggleDemo2} />
        </ShowcaseSection>
        <ShowcaseSection title="Multi-Select">
          <RenderConfig config={multiSelectDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Tag Selector">
          <RenderConfig config={tagSelectorDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Inline Edit">
          <RenderConfig config={inlineEditDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Quick Add">
          <RenderConfig config={quickAddDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Location Input (Geocode)">
          <RenderConfig config={locationInputDemo} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

function OverlayPage() {
  return (
    <PageWrapper>
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
        <ShowcaseSection title="Command Palette">
          <RenderConfig config={commandPaletteDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Filter Bar">
          <RenderConfig config={filterBarDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Popover">
          <RenderConfig config={popoverDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Context Menu">
          <RenderConfig config={contextMenuDemo} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

// ── New primitives demos ──────────────────────────────────────────────────

const separatorDemo = {
  type: "row",
  gap: "md",
  direction: "column",
  children: [
    { type: "separator" },
    { type: "separator", label: "OR" },
    { type: "separator", label: "Section Break" },
  ],
};

const inputDemo = {
  type: "row",
  gap: "md",
  direction: "column",
  children: [
    {
      type: "input",
      label: "Email",
      placeholder: "you@example.com",
      inputType: "email",
      icon: "mail",
      helperText: "We'll never share your email",
    },
    {
      type: "input",
      label: "Password",
      placeholder: "Enter password",
      inputType: "password",
      icon: "lock",
      required: true,
    },
    {
      type: "input",
      label: "With Error",
      value: "bad input",
      errorText: "This field is invalid",
      icon: "alert-circle",
    },
  ],
};

const textareaDemo = {
  type: "textarea",
  label: "Description",
  placeholder: "Write a description...",
  rows: 4,
  maxLength: 500,
  helperText: "Supports plain text only",
};

const toggleDemo2 = {
  type: "row",
  gap: "sm",
  children: [
    { type: "toggle", label: "Bold", icon: "bold" },
    { type: "toggle", label: "Italic", icon: "italic" },
    { type: "toggle", label: "Underline", icon: "underline", pressed: true },
    { type: "toggle", icon: "list", variant: "outline" },
    { type: "toggle", icon: "list-ordered", variant: "outline" },
  ],
};

const multiSelectDemo = {
  type: "multi-select",
  label: "Select Technologies",
  placeholder: "Choose frameworks...",
  searchable: true,
  options: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Svelte", value: "svelte" },
    { label: "Next.js", value: "nextjs" },
    { label: "Remix", value: "remix" },
    { label: "Astro", value: "astro" },
  ],
};

const filterBarDemo = {
  type: "filter-bar",
  searchPlaceholder: "Search items...",
  filters: [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Bug", value: "bug" },
        { label: "Feature", value: "feature" },
        { label: "Task", value: "task" },
      ],
      multiple: true,
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
    },
  ],
};

const tagSelectorDemo = {
  type: "tag-selector",
  label: "Tags",
  allowCreate: true,
  tags: [
    { label: "Bug", value: "bug", color: "#ef4444" },
    { label: "Feature", value: "feature", color: "#3b82f6" },
    { label: "Enhancement", value: "enhancement", color: "#8b5cf6" },
    { label: "Documentation", value: "docs", color: "#22c55e" },
    { label: "Urgent", value: "urgent", color: "#f59e0b" },
  ],
};

const inlineEditDemo = {
  type: "row",
  gap: "md",
  direction: "column",
  children: [
    {
      type: "inline-edit",
      value: "Click me to edit",
      saveAction: { type: "toast", message: "Saved!", variant: "success" },
    },
    {
      type: "inline-edit",
      placeholder: "Click to add title",
      fontSize: "var(--sn-font-size-xl, 1.25rem)",
    },
  ],
};

const highlightedTextDemo = {
  type: "highlighted-text",
  text: "The quick brown fox jumps over the lazy dog. The fox was very quick indeed.",
  highlight: "fox",
};

const favoriteButtonDemo = {
  type: "row",
  gap: "md",
  children: [
    { type: "favorite-button", size: "sm" },
    { type: "favorite-button", size: "md", active: true },
    { type: "favorite-button", size: "lg" },
  ],
};

const notificationBellDemo = {
  type: "row",
  gap: "lg",
  children: [
    { type: "notification-bell", count: 3 },
    { type: "notification-bell", count: 42, size: "lg" },
    { type: "notification-bell", count: 150, max: 99 },
    { type: "notification-bell", count: 0 },
  ],
};

const saveIndicatorDemo = {
  type: "row",
  gap: "xl",
  children: [
    { type: "save-indicator", status: "saving" },
    { type: "save-indicator", status: "saved" },
    { type: "save-indicator", status: "error" },
  ],
};

const quickAddDemo = {
  type: "quick-add",
  placeholder: "Add a new task...",
  submitAction: { type: "toast", message: "Item added!", variant: "success" },
};

const markdownDemo = {
  type: "markdown",
  content:
    "# Hello World\n\nThis is **bold** and *italic* text.\n\n## Features\n- List item one\n- List item two\n- List item three\n\n> A blockquote with some wisdom.\n\n```typescript\nconst x = 42;\nconsole.log(`The answer is ${x}`);\n```\n\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |",
  maxHeight: "400px",
};

const compareViewDemo = {
  type: "compare-view",
  leftLabel: "Original",
  rightLabel: "Modified",
  left: "function greet(name) {\n  console.log('Hello ' + name);\n  return true;\n}\n\ngreet('world');",
  right:
    "function greet(name: string) {\n  console.log(`Hello ${name}`);\n  return true;\n}\n\nconst result = greet('world');\nconsole.log(result);",
  maxHeight: "300px",
};

const commandPaletteDemo = {
  type: "command-palette",
  placeholder: "Type a command...",
  groups: [
    {
      label: "Navigation",
      items: [
        {
          label: "Go to Dashboard",
          icon: "layout-dashboard",
          shortcut: "Ctrl+D",
        },
        { label: "Go to Settings", icon: "settings", shortcut: "Ctrl+," },
        { label: "Go to Profile", icon: "user" },
      ],
    },
    {
      label: "Actions",
      items: [
        { label: "Create New Item", icon: "plus", shortcut: "Ctrl+N" },
        { label: "Search Files", icon: "search", shortcut: "Ctrl+P" },
        { label: "Toggle Dark Mode", icon: "moon" },
      ],
    },
  ],
};

const entityPickerDemo = {
  type: "entity-picker",
  id: "team-member-picker",
  label: "Assign to...",
  data: "GET /api/team-members",
  labelField: "name",
  valueField: "id",
  descriptionField: "email",
  searchable: true,
  multiple: true,
};

const scrollAreaDemo = {
  type: "scroll-area",
  maxHeight: "200px",
  orientation: "vertical",
  showScrollbar: "hover",
  content: [
    { type: "heading", text: "Scrollable Content", level: 4 },
    {
      type: "list",
      variant: "bordered",
      divider: true,
      items: Array.from({ length: 12 }, (_, i) => ({
        title: `Item ${i + 1}`,
        description: `Description for list item number ${i + 1}`,
        icon: "file",
      })),
    },
  ],
};

const popoverDemo = {
  type: "popover",
  trigger: "Show Popover",
  triggerIcon: "settings",
  triggerVariant: "outline",
  placement: "bottom",
  width: "300px",
  content: [
    { type: "heading", text: "Popover Content", level: 4 },
    {
      type: "form",
      submit: "/api/settings",
      fields: [
        {
          name: "theme",
          type: "select",
          label: "Theme",
          options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ],
        },
        { name: "compact", type: "checkbox", label: "Compact mode" },
      ],
      submitLabel: "Apply",
    },
  ],
};

const contextMenuDemo = {
  type: "context-menu",
  triggerText: "Right-click this area to open the context menu",
  items: [
    {
      label: "Edit",
      icon: "pencil",
      action: { type: "toast", message: "Edit clicked" },
    },
    {
      label: "Duplicate",
      icon: "copy",
      action: { type: "toast", message: "Duplicate clicked" },
    },
    { label: "", separator: true },
    {
      label: "Delete",
      icon: "trash-2",
      variant: "destructive",
      action: {
        type: "confirm",
        title: "Delete?",
        message: "This cannot be undone.",
        onConfirm: { type: "toast", message: "Deleted" },
      },
    },
  ],
};

const auditLogDemo = {
  type: "audit-log",
  data: "GET /api/audit-log",
  userField: "user",
  actionField: "action",
  timestampField: "timestamp",
  detailsField: "details",
  pagination: { pageSize: 10 },
};

const notificationFeedDemo = {
  type: "notification-feed",
  data: "GET /api/notifications",
  titleField: "title",
  messageField: "message",
  timestampField: "timestamp",
  readField: "read",
  typeField: "type",
  markReadAction: {
    type: "toast",
    message: "Marked as read",
    variant: "success",
  },
  itemAction: { type: "toast", message: "Notification clicked" },
  maxHeight: "400px",
  emptyMessage: "No notifications",
};

const messageThreadDemo = {
  type: "message-thread",
  data: "GET /api/messages",
  showTimestamps: true,
  groupByDate: true,
  maxHeight: "400px",
  emptyMessage: "No messages yet",
};

function PrimitivesPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Badges">
          <RenderConfig config={badgeRow} />
        </ShowcaseSection>
        <ShowcaseSection title="Avatars">
          <RenderConfig config={avatarRow} />
        </ShowcaseSection>
        <ShowcaseSection title="Alerts">
          <RenderConfig config={alerts} />
        </ShowcaseSection>
        <ShowcaseSection title="Progress Bars">
          <RenderConfig config={progressBars} />
        </ShowcaseSection>
        <ShowcaseSection title="Loading Skeletons">
          <RenderConfig config={skeletonDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Switches">
          <RenderConfig config={switchDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Tooltips">
          <RenderConfig config={tooltipDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="List">
          <RenderConfig config={listDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Sortable List (Drag & Drop)">
          <RenderConfig config={sortableListDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Empty State">
          <RenderConfig config={emptyStateDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Separator">
          <RenderConfig config={separatorDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Highlighted Text">
          <RenderConfig config={highlightedTextDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Favorite Button">
          <RenderConfig config={favoriteButtonDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Notification Bell">
          <RenderConfig config={notificationBellDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Save Indicator">
          <RenderConfig config={saveIndicatorDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Avatar Group">
          <RenderConfig config={avatarGroupDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Entity Picker">
          <RenderConfig config={entityPickerDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Scroll Area">
          <RenderConfig config={scrollAreaDemo} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

function NavigationPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Breadcrumb">
          <RenderConfig config={breadcrumbDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Accordion">
          <RenderConfig config={accordionDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Stepper">
          <RenderConfig config={stepperDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Tabs">
          <RenderConfig config={tabs} />
        </ShowcaseSection>
        <ShowcaseSection title="Tree View">
          <RenderConfig config={treeViewDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Dropdown Menu">
          <RenderConfig config={dropdownDemo} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

function ContentPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Rich Text Editor">
          <RenderConfig config={richTextEditorDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Rich Text Editor (Preview Only)">
          <RenderConfig config={richTextEditorPreviewDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Timeline">
          <RenderConfig config={timelineDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Code Block (TypeScript)">
          <RenderConfig config={codeBlockDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Code Block (Python)">
          <RenderConfig config={codeBlockPythonDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="File Uploader">
          <RenderConfig config={fileUploaderDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Markdown Renderer">
          <RenderConfig config={markdownDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Compare View (Diff)">
          <RenderConfig config={compareViewDemo} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

function WorkflowPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Kanban Board">
          <RenderConfig config={kanbanDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Calendar">
          <RenderConfig config={calendarDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Pricing Table">
          <RenderConfig config={pricingDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Audit Log">
          <RenderConfig config={auditLogDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Notification Feed">
          <RenderConfig config={notificationFeedDemo} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

// ── Communication page configs ────────────────────────────────────────────

const richInputDemo = {
  type: "rich-input",
  id: "demo-input",
  placeholder: "Type a message... (Enter to send, Shift+Enter for newline)",
  features: [
    "bold",
    "italic",
    "underline",
    "strike",
    "code",
    "link",
    "bullet-list",
    "ordered-list",
  ],
  minHeight: "3rem",
  maxHeight: "10rem",
};

const richInputWithSendDemo = {
  type: "rich-input",
  id: "demo-input-send",
  placeholder: "Type and press Enter to send...",
  sendOnEnter: true,
  maxLength: 280,
  sendAction: { type: "toast", message: "Message sent!", variant: "success" },
  features: ["bold", "italic", "code"],
};

const emojiPickerDemo = {
  type: "emoji-picker",
  id: "emoji",
  perRow: 8,
  maxHeight: "250px",
};

const reactionBarDemo = {
  type: "reaction-bar",
  reactions: [
    { emoji: "\ud83d\udc4d", count: 12, active: true },
    { emoji: "\u2764\ufe0f", count: 8 },
    { emoji: "\ud83d\ude02", count: 5 },
    { emoji: "\ud83d\ude31", count: 2 },
    { emoji: "\ud83d\ude80", count: 1 },
  ],
  addAction: { type: "toast", message: "Reaction added!", variant: "success" },
};

const presenceIndicatorDemos = {
  type: "row",
  gap: "lg",
  children: [
    { type: "presence-indicator", status: "online", label: "Alice" },
    { type: "presence-indicator", status: "away", label: "Bob" },
    { type: "presence-indicator", status: "busy", label: "Charlie" },
    { type: "presence-indicator", status: "dnd", label: "Diana" },
    { type: "presence-indicator", status: "offline", label: "Eve" },
  ],
};

const typingIndicatorDemos = {
  type: "row",
  gap: "lg",
  direction: "column",
  children: [
    { type: "typing-indicator", users: [{ name: "Alice" }] },
    { type: "typing-indicator", users: [{ name: "Alice" }, { name: "Bob" }] },
    {
      type: "typing-indicator",
      users: [
        { name: "Alice" },
        { name: "Bob" },
        { name: "Charlie" },
        { name: "Diana" },
      ],
      maxDisplay: 2,
    },
  ],
};

const commentSectionDemo = {
  type: "comment-section",
  data: [
    {
      id: "c1",
      content:
        "<p>This is a <b>great</b> feature! Really looking forward to seeing it in production.</p>",
      author: { name: "Alice Johnson", avatar: null },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "c2",
      content:
        "<p>I agree! The design tokens make it really easy to customize.</p>",
      author: { name: "Bob Smith", avatar: null },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "c3",
      content:
        "<p>Can we add <code>dark mode</code> support? That would be awesome.</p>",
      author: { name: "Charlie Brown", avatar: null },
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
  ],
  inputPlaceholder: "Write a comment...",
  submitAction: {
    type: "toast",
    message: "Comment posted!",
    variant: "success",
  },
};

const chatWindowDemo = {
  type: "chat-window",
  title: "general",
  subtitle: "Team discussion channel",
  data: [
    {
      id: "m1",
      content:
        "<p>Hey everyone! \ud83d\udc4b How's the new feature coming along?</p>",
      author: { name: "Alice Johnson", avatar: null },
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "m2",
      content:
        "<p>Going well! Just finished the <b>token system</b> updates. All tests passing.</p>",
      author: { name: "Bob Smith", avatar: null },
      timestamp: new Date(Date.now() - 7100000).toISOString(),
    },
    {
      id: "m3",
      content: "<p>Nice! I'll review the PR this afternoon.</p>",
      author: { name: "Alice Johnson", avatar: null },
      timestamp: new Date(Date.now() - 7000000).toISOString(),
    },
    {
      id: "m4",
      content:
        '<p>FYI the staging deploy went through. You can test it at <a href="#">staging.example.com</a></p>',
      author: { name: "Charlie Brown", avatar: null },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "m5",
      content:
        "<p>Just tried it \u2014 looks great! One small thing: the <code>border-radius</code> on the cards could be a bit smaller.</p>",
      author: { name: "Diana Prince", avatar: null },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "m6",
      content:
        "<p>Good catch, I'll update the radius tokens. Should be a one-line change \ud83d\ude04</p>",
      author: { name: "Bob Smith", avatar: null },
      timestamp: new Date(Date.now() - 1700000).toISOString(),
    },
  ],
  inputPlaceholder: "Message #general",
  sendAction: { type: "toast", message: "Message sent!", variant: "success" },
  height: "500px",
};

// ── Embed demos ───────────────────────────────────────────────────────────

const youtubeEmbedDemo = {
  type: "link-embed",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  maxWidth: "560px",
};

const twitterEmbedDemo = {
  type: "link-embed",
  url: "https://twitter.com/elonmusk/status/1234567890",
  meta: {
    title: "Elon Musk on X",
    description:
      "This is an example tweet embed card showing Open Graph metadata.",
    siteName: "Twitter",
    image: undefined,
    color: "#1da1f2",
  },
  maxWidth: "500px",
};

const genericEmbedDemo = {
  type: "link-embed",
  url: "https://github.com/lastshotlabs/snapshot",
  meta: {
    title: "lastshotlabs/snapshot: Config-driven UI SDK",
    description:
      "The frontend SDK for bunshot-powered backends. Design tokens, config-addressable components, page composition from manifest.",
    siteName: "GitHub",
    image: "https://opengraph.githubassets.com/1/lastshotlabs/snapshot",
    favicon: "https://github.githubassets.com/favicons/favicon.svg",
  },
  maxWidth: "500px",
};

const gifEmbedDemo = {
  type: "link-embed",
  url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWx5b3IwOHh4d3o0YnVpc2s1a3d5c3J5MXRuYXV5MWx1MGRsdWVzOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif",
};

const gifPickerDemo = {
  type: "gif-picker",
  gifs: [
    {
      id: "1",
      url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
      title: "Cat typing",
    },
    {
      id: "2",
      url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
      title: "Thumbs up",
    },
    {
      id: "3",
      url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
      title: "Celebration",
    },
    {
      id: "4",
      url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
      title: "Mind blown",
    },
  ],
  columns: 2,
  maxHeight: "250px",
  attribution: "Powered by GIPHY",
};

const chatWithEmbedsDemo = {
  type: "chat-window",
  title: "media-sharing",
  subtitle: "Share links, GIFs, and media",
  data: [
    {
      id: "e1",
      content: "<p>Check out this video!</p>",
      author: { name: "Alice", avatar: null },
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      embeds: [{ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
    },
    {
      id: "e2",
      content: "<p>Here's a cool project on GitHub</p>",
      author: { name: "Bob", avatar: null },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      embeds: [
        {
          url: "https://github.com/lastshotlabs/snapshot",
          meta: {
            title: "lastshotlabs/snapshot",
            description: "Config-driven UI SDK for bunshot backends",
            siteName: "GitHub",
            color: "#333",
          },
        },
      ],
    },
    {
      id: "e3",
      content:
        '<p><img class="sn-custom-emoji" src="https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji/png/128/emoji_u1f389.png" alt=":tada:" title="Party" draggable="false" /> Launch day!</p>',
      author: { name: "Charlie", avatar: null },
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
  ],
  inputPlaceholder: "Share a link or GIF...",
  sendAction: { type: "toast", message: "Sent!", variant: "success" },
  height: "450px",
};

function CommunicationPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="Chat Window">
          <RenderConfig config={chatWindowDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Rich Input (WYSIWYG)">
          <RenderConfig config={richInputDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Rich Input (with Send)">
          <RenderConfig config={richInputWithSendDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Comment Section">
          <RenderConfig config={commentSectionDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Reaction Bar">
          <RenderConfig config={reactionBarDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Emoji Picker">
          <RenderConfig config={emojiPickerDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Presence Indicators">
          <RenderConfig config={presenceIndicatorDemos} />
        </ShowcaseSection>
        <ShowcaseSection title="Typing Indicators">
          <RenderConfig config={typingIndicatorDemos} />
        </ShowcaseSection>
        <ShowcaseSection title="Message Thread">
          <RenderConfig config={messageThreadDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Chat with Embeds">
          <RenderConfig config={chatWithEmbedsDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="YouTube Embed">
          <RenderConfig config={youtubeEmbedDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Twitter/X Embed (OG Card)">
          <RenderConfig config={twitterEmbedDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="Generic Link Embed (GitHub)">
          <RenderConfig config={genericEmbedDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="GIF Embed">
          <RenderConfig config={gifEmbedDemo} />
        </ShowcaseSection>
        <ShowcaseSection title="GIF Picker">
          <RenderConfig config={gifPickerDemo} />
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

function StructuralPage() {
  return (
    <PageWrapper>
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
    </PageWrapper>
  );
}

// ── Preset page configs ───────────────────────────────────────────────────────

const usersPresetPage = crudPage({
  title: "Users",
  listEndpoint: "GET /api/users",
  createEndpoint: "POST /api/users",
  updateEndpoint: "PUT /api/users/{id}",
  deleteEndpoint: "DELETE /api/users/{id}",
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", badge: true },
    { key: "createdAt", label: "Joined", format: "date" },
  ],
  createForm: {
    fields: [
      {
        key: "name",
        type: "text",
        label: "Full Name",
        required: true,
        placeholder: "Enter full name",
      },
      {
        key: "email",
        type: "email",
        label: "Email",
        required: true,
        placeholder: "user@example.com",
      },
      {
        key: "role",
        type: "select",
        label: "Role",
        options: [
          { label: "Admin", value: "admin" },
          { label: "Editor", value: "editor" },
          { label: "Viewer", value: "viewer" },
        ],
      },
    ],
  },
  updateForm: {
    fields: [
      { key: "name", type: "text", label: "Full Name", required: true },
      {
        key: "role",
        type: "select",
        label: "Role",
        options: [
          { label: "Admin", value: "admin" },
          { label: "Editor", value: "editor" },
          { label: "Viewer", value: "viewer" },
        ],
      },
    ],
  },
});

const overviewPresetPage = dashboardPage({
  title: "Overview",
  stats: [
    {
      label: "Total Users",
      endpoint: "GET /api/stats/users",
      valueKey: "value",
      format: "number",
      icon: "users",
      trend: { key: "change", positive: "up" },
    },
    {
      label: "Revenue",
      endpoint: "GET /api/stats/revenue",
      valueKey: "value",
      format: "currency",
      icon: "dollar-sign",
      trend: { key: "change", positive: "up" },
    },
    {
      label: "Orders",
      endpoint: "GET /api/stats/orders",
      valueKey: "value",
      format: "number",
      icon: "shopping-cart",
      trend: { key: "change", positive: "up" },
    },
    {
      label: "Conversion Rate",
      endpoint: "GET /api/stats/conversion",
      valueKey: "value",
      format: "percent",
      icon: "trending-up",
      trend: { key: "change", positive: "up" },
    },
  ],
  recentActivity: "GET /api/activity",
});

const accountSettingsPresetPage = settingsPage({
  title: "Account Settings",
  sections: [
    {
      label: "Profile",
      submitEndpoint: "PATCH /api/me/profile",
      dataEndpoint: "GET /api/me/profile",
      icon: "user",
      submitLabel: "Update Profile",
      fields: [
        {
          key: "name",
          type: "text",
          label: "Full Name",
          required: true,
          placeholder: "Enter your name",
        },
        { key: "email", type: "email", label: "Email", required: true },
        {
          key: "bio",
          type: "textarea",
          label: "Bio",
          placeholder: "Tell us about yourself",
        },
      ],
    },
    {
      label: "Password",
      submitEndpoint: "POST /api/me/password",
      method: "POST",
      icon: "lock",
      fields: [
        {
          key: "currentPassword",
          type: "password",
          label: "Current Password",
          required: true,
        },
        {
          key: "newPassword",
          type: "password",
          label: "New Password",
          required: true,
        },
        {
          key: "confirmPassword",
          type: "password",
          label: "Confirm New Password",
          required: true,
        },
      ],
    },
    {
      label: "Notifications",
      submitEndpoint: "PUT /api/me/notifications",
      method: "PUT",
      icon: "bell",
      submitLabel: "Save Preferences",
      fields: [
        {
          key: "emailNotifications",
          type: "toggle",
          label: "Email Notifications",
        },
        {
          key: "pushNotifications",
          type: "toggle",
          label: "Push Notifications",
        },
        { key: "marketingEmails", type: "toggle", label: "Marketing Emails" },
        { key: "weeklyDigest", type: "toggle", label: "Weekly Digest" },
      ],
    },
  ],
});

function PresetsPage() {
  return (
    <PageWrapper>
      <div className="showcase">
        <ShowcaseSection title="crudPage - Users">
          <p
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground)",
              marginBottom: "var(--sn-spacing-md, 1rem)",
            }}
          >
            Generated from{" "}
            <code>crudPage(&#123; title: &quot;Users&quot;, ... &#125;)</code>.
            Includes data table, create modal, edit drawer, and delete action.
          </p>
          {usersPresetPage.content.map((config, i) => (
            <ComponentRenderer key={i} config={config as any} />
          ))}
        </ShowcaseSection>
        <ShowcaseSection title="dashboardPage - Overview">
          <p
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground)",
              marginBottom: "var(--sn-spacing-md, 1rem)",
            }}
          >
            Generated from{" "}
            <code>
              dashboardPage(&#123; title: &quot;Overview&quot;, stats: [...]
              &#125;)
            </code>
            . Includes stat cards and recent activity list.
          </p>
          {overviewPresetPage.content.map((config, i) => (
            <ComponentRenderer key={i} config={config as any} />
          ))}
        </ShowcaseSection>
        <ShowcaseSection title="settingsPage - Account Settings">
          <p
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground)",
              marginBottom: "var(--sn-spacing-md, 1rem)",
            }}
          >
            Generated from{" "}
            <code>
              settingsPage(&#123; title: &quot;Account Settings&quot;, sections:
              [...] &#125;)
            </code>
            . Includes tabbed settings sections, each with an AutoForm.
          </p>
          {accountSettingsPresetPage.content.map((config, i) => (
            <ComponentRenderer key={i} config={config as any} />
          ))}
        </ShowcaseSection>
      </div>
    </PageWrapper>
  );
}

// ── Feed data provider (injects data into page context) ───────────────────────

const feedActivityItems = [
  {
    id: "1",
    message: "Alice deployed v2.3.0 to production",
    detail: "Deploy succeeded in 42s",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    type: "success",
  },
  {
    id: "2",
    message: "Build #241 failed",
    detail: "TypeScript error in src/ui.ts line 42",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    type: "error",
  },
  {
    id: "3",
    message: "Bob opened PR #88: Add Chart component",
    detail: "3 files changed, +420 -12",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    type: "info",
  },
  {
    id: "4",
    message: "Security scan completed",
    detail: "No vulnerabilities found",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    type: "success",
  },
  {
    id: "5",
    message: "Charlie reviewed PR #85",
    detail: "Approved with 2 suggestions",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    type: "info",
  },
  {
    id: "6",
    message: "Database migration ran",
    detail: "migration_20260407.sql applied",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    type: "warning",
  },
  {
    id: "7",
    message: "New user registered",
    detail: "diana@example.com",
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    type: "info",
  },
  {
    id: "8",
    message: "Weekly backup completed",
    detail: "Backup size: 2.4GB",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    type: "success",
  },
];

/** Injects fixture data into the page context for demos using from-ref */
function FeedDataProvider({
  id,
  data,
  children,
}: {
  id: string;
  data: unknown[];
  children: React.ReactNode;
}) {
  const publish = usePublish(id);
  useEffect(() => {
    publish(data);
  }, [id, data, publish]);
  return <>{children}</>;
}

// ── Feed configs ─────────────────────────────────────────────────────────────

const feedPopulatedConfig = {
  type: "feed",
  data: { from: "feed-demo-source" },
  title: "message",
  description: "detail",
  timestamp: "createdAt",
  badge: {
    field: "type",
    colorMap: {
      success: "success",
      error: "destructive",
      warning: "warning",
      info: "info",
    },
  },
  emptyMessage: "No activity yet",
  pageSize: 4,
};

const feedEmptyConfig = {
  type: "feed",
  data: { from: "feed-empty-source" },
  title: "message",
  emptyMessage: "No activity yet. Events will appear here.",
};

// ── Chart data ───────────────────────────────────────────────────────────────

const chartMonthlyData = [
  { month: "Jan", revenue: 42000, expenses: 28000, profit: 14000 },
  { month: "Feb", revenue: 38000, expenses: 25000, profit: 13000 },
  { month: "Mar", revenue: 55000, expenses: 31000, profit: 24000 },
  { month: "Apr", revenue: 47000, expenses: 29000, profit: 18000 },
  { month: "May", revenue: 61000, expenses: 34000, profit: 27000 },
  { month: "Jun", revenue: 58000, expenses: 32000, profit: 26000 },
];

const chartPieData = [
  { category: "Engineering", headcount: 45 },
  { category: "Sales", headcount: 22 },
  { category: "Marketing", headcount: 15 },
  { category: "Support", headcount: 12 },
  { category: "Other", headcount: 6 },
];

const chartBarConfig = {
  type: "chart",
  data: { from: "chart-monthly-source" },
  chartType: "bar",
  xKey: "month",
  series: [
    { key: "revenue", label: "Revenue" },
    { key: "expenses", label: "Expenses" },
    { key: "profit", label: "Profit" },
  ],
  height: 300,
  legend: true,
  grid: true,
  emptyMessage: "No data",
};

const chartLineConfig = {
  type: "chart",
  data: { from: "chart-monthly-source" },
  chartType: "line",
  xKey: "month",
  series: [
    { key: "revenue", label: "Revenue", color: "var(--sn-chart-1)" },
    { key: "profit", label: "Profit", color: "var(--sn-chart-2)" },
  ],
  height: 280,
  legend: true,
  grid: true,
  emptyMessage: "No data",
};

const chartPieConfig = {
  type: "chart",
  data: { from: "chart-pie-source" },
  chartType: "pie",
  xKey: "category",
  series: [{ key: "headcount", label: "Headcount" }],
  height: 280,
  legend: true,
  grid: false,
  emptyMessage: "No data",
};

const chartDonutConfig = {
  type: "chart",
  data: { from: "chart-pie-source" },
  chartType: "donut",
  xKey: "category",
  series: [{ key: "headcount", label: "Headcount" }],
  height: 280,
  legend: true,
  grid: false,
  emptyMessage: "No data",
};

const chartEmptyConfig = {
  type: "chart",
  data: { from: "chart-empty-source" },
  chartType: "bar",
  xKey: "month",
  series: [{ key: "value", label: "Value" }],
  height: 250,
  legend: true,
  grid: true,
  emptyMessage: "No chart data available yet.",
};

// ── Wizard configs ────────────────────────────────────────────────────────────

const wizardOnboardingConfig = {
  type: "wizard",
  id: "demo-wizard",
  steps: [
    {
      title: "Account Details",
      description: "Create your account credentials",
      fields: [
        {
          name: "email",
          type: "email",
          label: "Email address",
          required: true,
          placeholder: "you@example.com",
        },
        {
          name: "password",
          type: "password",
          label: "Password",
          required: true,
          placeholder: "Min 8 characters",
          validation: { minLength: 8 },
        },
      ],
    },
    {
      title: "Personal Info",
      description: "Tell us a bit about yourself",
      fields: [
        {
          name: "name",
          type: "text",
          label: "Full Name",
          required: true,
          placeholder: "Alice Smith",
        },
        {
          name: "role",
          type: "select",
          label: "Role",
          options: [
            { label: "Developer", value: "developer" },
            { label: "Designer", value: "designer" },
            { label: "Manager", value: "manager" },
            { label: "Other", value: "other" },
          ],
        },
      ],
      submitLabel: "Create Account",
    },
  ],
  submitLabel: "Create Account",
  onComplete: {
    type: "toast",
    message: "Account created successfully!",
    variant: "success",
  },
  allowSkip: true,
};

const wizardSkippableConfig = {
  type: "wizard",
  steps: [
    {
      title: "Required Step",
      fields: [
        { name: "name", type: "text", label: "Your Name", required: true },
      ],
    },
    {
      title: "Optional Step",
      description: "This step can be skipped",
      fields: [
        {
          name: "bio",
          type: "textarea",
          label: "Short Bio",
          placeholder: "Tell us about yourself...",
        },
      ],
    },
    {
      title: "Final Step",
      fields: [
        {
          name: "agree",
          type: "checkbox",
          label: "I agree to the terms",
          required: true,
        },
      ],
      submitLabel: "Finish",
    },
  ],
  submitLabel: "Finish",
  allowSkip: true,
  onComplete: { type: "toast", message: "Done!", variant: "success" },
};

function FeedChartWizardPage() {
  return (
    <PageWrapper>
      <FeedDataProvider id="feed-demo-source" data={feedActivityItems}>
        <FeedDataProvider id="feed-empty-source" data={[]}>
          <FeedDataProvider id="chart-monthly-source" data={chartMonthlyData}>
            <FeedDataProvider id="chart-pie-source" data={chartPieData}>
              <FeedDataProvider id="chart-empty-source" data={[]}>
                <div className="showcase">
                  {/* Feed */}
                  <ShowcaseSection title="Feed - Populated (with badges, timestamps, descriptions)">
                    <RenderConfig config={feedPopulatedConfig} />
                  </ShowcaseSection>

                  <ShowcaseSection title="Feed - Empty State">
                    <RenderConfig config={feedEmptyConfig} />
                  </ShowcaseSection>

                  {/* Chart */}
                  <ShowcaseSection title="Chart - Bar (multi-series)">
                    <RenderConfig config={chartBarConfig} />
                  </ShowcaseSection>

                  <ShowcaseSection title="Chart - Line">
                    <RenderConfig config={chartLineConfig} />
                  </ShowcaseSection>

                  <ShowcaseSection title="Chart - Pie">
                    <RenderConfig config={chartPieConfig} />
                  </ShowcaseSection>

                  <ShowcaseSection title="Chart - Donut">
                    <RenderConfig config={chartDonutConfig} />
                  </ShowcaseSection>

                  <ShowcaseSection title="Chart - Empty State">
                    <RenderConfig config={chartEmptyConfig} />
                  </ShowcaseSection>

                  {/* Wizard */}
                  <ShowcaseSection title="Wizard - Multi-step Onboarding (2 steps)">
                    <div style={{ maxWidth: "32rem" }}>
                      <RenderConfig config={wizardOnboardingConfig} />
                    </div>
                  </ShowcaseSection>

                  <ShowcaseSection title="Wizard - With Skip (3 steps, step 2 optional)">
                    <div style={{ maxWidth: "32rem" }}>
                      <RenderConfig config={wizardSkippableConfig} />
                    </div>
                  </ShowcaseSection>
                </div>
              </FeedDataProvider>
            </FeedDataProvider>
          </FeedDataProvider>
        </FeedDataProvider>
      </FeedDataProvider>
    </PageWrapper>
  );
}

export function ComponentShowcase() {
  const [page, setPage] = useState<Page>("dashboard");
  const currentPage = PAGE_BY_KEY[page];

  return (
    <>
      <div className="showcase-overview" aria-live="polite">
        <div>
          <p className="showcase-overview__eyebrow">{currentPage.group}</p>
          <h2>{currentPage.label}</h2>
          <p>{currentPage.description}</p>
        </div>
        <dl className="showcase-overview__stats">
          <div>
            <dt>Demos</dt>
            <dd>{currentPage.count}</dd>
          </div>
          <div>
            <dt>Total surface</dt>
            <dd>{PAGES.reduce((total, item) => total + item.count, 0)}</dd>
          </div>
        </dl>
      </div>
      <nav className="page-tabs" aria-label="Playground sections">
        {PAGES.map(({ key, label }) => (
          <button
            key={key}
            className={`page-tab ${page === key ? "page-tab--active" : ""}`}
            aria-current={page === key ? "page" : undefined}
            onClick={() => setPage(key)}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {page === "dashboard" && <DashboardPage />}
      {page === "data" && <DataPage />}
      {page === "primitives" && <PrimitivesPage />}
      {page === "forms" && <FormsPage />}
      {page === "overlay" && <OverlayPage />}
      {page === "navigation" && <NavigationPage />}
      {page === "content" && <ContentPage />}
      {page === "workflow" && <WorkflowPage />}
      {page === "structural" && <StructuralPage />}
      {page === "communication" && <CommunicationPage />}

      {page === "presets" && <PresetsPage />}
      {page === "feed-chart-wizard" && <FeedChartWizardPage />}
    </>
  );
}
