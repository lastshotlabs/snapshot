import { ForgotPassword } from "./auth/forgot-password";
import { forgotPasswordConfigSchema } from "./auth/forgot-password.schema";
// Auth components
import { Login } from "./auth/login";
import { loginConfigSchema } from "./auth/login.schema";
import { Register } from "./auth/register";
import { registerConfigSchema } from "./auth/register.schema";
import { Chart } from "./data/chart";
import { chartConfigSchema } from "./data/chart.schema";
import { Detail } from "./data/detail";
import { detailConfigSchema } from "./data/detail.schema";
import { Feed } from "./data/feed";
import { feedConfigSchema } from "./data/feed.schema";
import { StatCard } from "./data/stat-card";
import { statCardConfigSchema } from "./data/stat-card.schema";
// Data components
import { Table } from "./data/table";
import { tableConfigSchema } from "./data/table.schema";
import { EmptyState } from "./feedback/empty-state";
import { emptyStateConfigSchema } from "./feedback/empty-state.schema";
// Feedback components
import { Modal } from "./feedback/modal";
import { modalConfigSchema } from "./feedback/modal.schema";
// Form components
import { Form } from "./forms/form";
import { formConfigSchema } from "./forms/form.schema";
import { Card } from "./layout/card";
import { cardConfigSchema } from "./layout/card.schema";
// Layout components
import { Row } from "./layout/row";
import { rowConfigSchema } from "./layout/row.schema";
import { SidebarLayout } from "./layout/sidebar";
import { sidebarLayoutConfigSchema } from "./layout/sidebar.schema";
import { Stack } from "./layout/stack";
import { stackConfigSchema } from "./layout/stack.schema";
import { Breadcrumb } from "./nav/breadcrumb";
import { breadcrumbConfigSchema } from "./nav/breadcrumb.schema";
// Nav components
import { Nav } from "./nav/nav";
import { navConfigSchema } from "./nav/nav.schema";
import { createComponentRegistry } from "./registry";
import type { ComponentRegistry } from "./registry";

/**
 * Creates the default component registry with all built-in components.
 *
 * Users extend this via `registry.extend()` to add custom components
 * or override built-in ones.
 *
 * @example
 * ```ts
 * const base = createDefaultRegistry()
 * const custom = base.extend()
 * custom.register('kanban', KanbanComponent, kanbanSchema)
 * ```
 */
export function createDefaultRegistry(): ComponentRegistry {
  const registry = createComponentRegistry();

  // Layout
  registry.register(
    "row",
    Row as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    rowConfigSchema,
  );
  registry.register(
    "stack",
    Stack as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    stackConfigSchema,
  );
  registry.register(
    "card",
    Card as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    cardConfigSchema,
  );
  registry.register(
    "sidebar-layout",
    SidebarLayout as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    sidebarLayoutConfigSchema,
  );

  // Data
  registry.register(
    "table",
    Table as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    tableConfigSchema,
  );
  registry.register(
    "detail",
    Detail as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    detailConfigSchema,
  );
  registry.register(
    "stat-card",
    StatCard as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    statCardConfigSchema,
  );
  registry.register(
    "feed",
    Feed as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    feedConfigSchema,
  );
  registry.register(
    "chart",
    Chart as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    chartConfigSchema,
  );

  // Forms
  registry.register(
    "form",
    Form as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    formConfigSchema,
  );

  // Auth
  registry.register(
    "login",
    Login as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    loginConfigSchema,
  );
  registry.register(
    "register",
    Register as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    registerConfigSchema,
  );
  registry.register(
    "forgot-password",
    ForgotPassword as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    forgotPasswordConfigSchema,
  );

  // Nav
  registry.register(
    "nav",
    Nav as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    navConfigSchema,
  );
  registry.register(
    "breadcrumb",
    Breadcrumb as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    breadcrumbConfigSchema,
  );

  // Feedback
  registry.register(
    "modal",
    Modal as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    modalConfigSchema,
  );
  registry.register(
    "empty-state",
    EmptyState as React.ComponentType<{ config: Record<string, unknown>; id?: string }>,
    emptyStateConfigSchema,
  );

  return registry;
}
