/**
 * Option types for page-level preset factories.
 *
 * These types describe the high-level developer-facing API for each preset.
 * Presets accept these options and return a valid manifest `PageConfig`.
 */

// ── Column and form field definitions ───────────────────────────────────────

/**
 * A single column definition for the CRUD page table.
 */
export interface ColumnDef {
  /** The field name in the data object. */
  key: string;
  /** Display label for the column header. */
  label: string;
  /** Render the value as a badge. */
  badge?: boolean;
  /** How to format the value. */
  format?: "date" | "currency" | "number" | "boolean";
}

/**
 * An option entry for select/radio form fields.
 */
export interface FormFieldOption {
  label: string;
  value: string;
}

/**
 * A single form field definition.
 */
export interface FormFieldDef {
  /** Field name — maps to the key in the submitted values object. */
  key: string;
  /** Input type to render. */
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "toggle";
  /** Human-readable label. */
  label: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Options for select fields. */
  options?: FormFieldOption[];
  /** Placeholder text. */
  placeholder?: string;
}

/**
 * A form definition used in CRUD create/update modals and settings tabs.
 */
export interface FormDef {
  /** The fields to render in the form. */
  fields: FormFieldDef[];
}

// ── Filter definition ────────────────────────────────────────────────────────

/**
 * A filter option entry.
 */
export interface FilterOption {
  label: string;
  value: string;
}

/**
 * A filter definition for the CRUD page toolbar.
 */
export interface FilterDef {
  /** The field to filter on. */
  key: string;
  /** Display label. */
  label: string;
  /** Filter input type. */
  type: "select" | "text";
  /** Options for select filters. */
  options?: FilterOption[];
}

// ── Stat definition ──────────────────────────────────────────────────────────

/**
 * A single stat card definition for the dashboard page.
 */
export interface StatDef {
  /** Display label for the stat card. */
  label: string;
  /** API endpoint to fetch the stat from. */
  endpoint: string;
  /** The response field that holds the metric value. */
  valueKey: string;
  /** How to format the value. */
  format?: "number" | "currency" | "percent";
  /** Trend indicator configuration. */
  trend?: {
    /** The response field that holds the trend comparison value. */
    key: string;
    /** Whether an upward trend is positive or negative. */
    positive?: "up" | "down";
  };
  /** Optional icon name (Lucide). */
  icon?: string;
}

// ── Settings section definition ──────────────────────────────────────────────

/**
 * A single settings section (one tab in the settings page).
 */
export interface SettingsSectionDef {
  /** Tab label. */
  label: string;
  /** The API endpoint to submit this section's form to. */
  submitEndpoint: string;
  /** The HTTP method for submission. Defaults to PATCH. */
  method?: "POST" | "PUT" | "PATCH";
  /** Optional endpoint to load initial values from. */
  dataEndpoint?: string;
  /** The form fields for this section. */
  fields: FormFieldDef[];
  /** Submit button label. Defaults to "Save Changes". */
  submitLabel?: string;
  /** Optional icon name for the tab. */
  icon?: string;
}

// ── Preset option types ──────────────────────────────────────────────────────

/**
 * Options for the `crudPage` preset factory.
 *
 * Produces a full CRUD page with a data table, create/edit modals, and row actions.
 *
 * @example
 * ```ts
 * const usersPage = crudPage({
 *   title: "Users",
 *   listEndpoint: "GET /api/users",
 *   createEndpoint: "POST /api/users",
 *   deleteEndpoint: "DELETE /api/users/{id}",
 *   columns: [
 *     { key: "name", label: "Name" },
 *     { key: "email", label: "Email" },
 *     { key: "role", label: "Role", badge: true },
 *   ],
 * });
 * ```
 */
export interface CrudPageOptions {
  /** Page title shown in the heading. */
  title: string;
  /** API endpoint to fetch the list of records. e.g. "GET /api/users" */
  listEndpoint: string;
  /** API endpoint to create a new record. e.g. "POST /api/users" */
  createEndpoint?: string;
  /** API endpoint to update an existing record. e.g. "PUT /api/users/{id}" */
  updateEndpoint?: string;
  /** API endpoint to delete a record. e.g. "DELETE /api/users/{id}" */
  deleteEndpoint?: string;
  /** Column definitions for the data table. */
  columns: ColumnDef[];
  /** Form definition for the create modal. Required if createEndpoint is set. */
  createForm?: FormDef;
  /** Form definition for the edit drawer. Required if updateEndpoint is set. */
  updateForm?: FormDef;
  /** Optional filter definitions for the table toolbar. */
  filters?: FilterDef[];
  /**
   * ID prefix for context refs used by subcomponents.
   * Defaults to a slugified version of the title.
   */
  id?: string;
}

/**
 * Options for the `dashboardPage` preset factory.
 *
 * Produces a dashboard with stat cards and an optional activity feed.
 *
 * @example
 * ```ts
 * const myDashboard = dashboardPage({
 *   title: "Overview",
 *   stats: [
 *     { label: "Total Users", endpoint: "GET /api/stats/users", valueKey: "count" },
 *     { label: "Revenue", endpoint: "GET /api/stats/revenue", valueKey: "total", format: "currency" },
 *   ],
 * });
 * ```
 */
export interface DashboardPageOptions {
  /** Page title shown in the heading. */
  title: string;
  /** Stat card definitions — one card per entry. */
  stats: StatDef[];
  /** Optional API endpoint for the recent activity list. */
  recentActivity?: string;
  /**
   * ID prefix for context refs.
   * Defaults to a slugified version of the title.
   */
  id?: string;
}

/**
 * Options for the `settingsPage` preset factory.
 *
 * Produces a settings page with a tab per section, each containing an AutoForm.
 *
 * @example
 * ```ts
 * const mySettings = settingsPage({
 *   title: "Settings",
 *   sections: [
 *     {
 *       label: "Profile",
 *       submitEndpoint: "PATCH /api/me/profile",
 *       fields: [
 *         { key: "name", type: "text", label: "Name", required: true },
 *         { key: "email", type: "email", label: "Email", required: true },
 *       ],
 *     },
 *   ],
 * });
 * ```
 */
export interface SettingsPageOptions {
  /** Page title shown in the heading. */
  title: string;
  /** Settings sections — one tab per section. */
  sections: SettingsSectionDef[];
  /**
   * ID prefix for context refs.
   * Defaults to a slugified version of the title.
   */
  id?: string;
}
