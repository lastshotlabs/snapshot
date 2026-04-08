/**
 * `crudPage` preset factory.
 *
 * Composes a full CRUD page from high-level options and returns a valid
 * manifest `PageConfig`. The generated page includes:
 *
 * - A page heading
 * - A "Create" button (when `createEndpoint` is provided)
 * - A DataTable bound to `listEndpoint` with row actions
 * - A Modal containing an AutoForm for record creation
 * - A Drawer containing an AutoForm for record editing
 * - Confirm-then-delete row action wired to `deleteEndpoint`
 */

import type { PageConfig } from "../manifest/types";
import type { CrudPageOptions, ColumnDef, FormFieldDef } from "./types";

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Converts a title to a slug suitable for component IDs.
 * e.g. "My Users" → "my-users"
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Maps a preset ColumnDef to the DataTable column config shape.
 */
function mapColumn(col: ColumnDef): Record<string, unknown> {
  const config: Record<string, unknown> = {
    field: col.key,
    label: col.label,
    sortable: true,
  };

  if (col.badge) {
    config.format = "badge";
  } else if (col.format) {
    config.format = col.format;
  }

  return config;
}

/**
 * Maps a preset FormFieldDef to the AutoForm field config shape.
 * The AutoForm uses `name` instead of `key`, and `checkbox` for toggle.
 */
function mapFormField(field: FormFieldDef): Record<string, unknown> {
  const mapped: Record<string, unknown> = {
    name: field.key,
    type: field.type === "toggle" ? "checkbox" : field.type,
    label: field.label,
  };

  if (field.required !== undefined) mapped.required = field.required;
  if (field.placeholder !== undefined) mapped.placeholder = field.placeholder;
  if (field.options !== undefined) mapped.options = field.options;

  return mapped;
}

// ── crudPage factory ─────────────────────────────────────────────────────────

/**
 * Builds a manifest `PageConfig` for a standard CRUD page.
 *
 * Consumers drop the result into their manifest's `pages` record:
 *
 * ```ts
 * const manifest = {
 *   pages: {
 *     "/users": crudPage({
 *       title: "Users",
 *       listEndpoint: "GET /api/users",
 *       createEndpoint: "POST /api/users",
 *       deleteEndpoint: "DELETE /api/users/{id}",
 *       columns: [
 *         { key: "name", label: "Name" },
 *         { key: "email", label: "Email" },
 *         { key: "role", label: "Role", badge: true },
 *       ],
 *       createForm: {
 *         fields: [
 *           { key: "name", type: "text", label: "Name", required: true },
 *           { key: "email", type: "email", label: "Email", required: true },
 *         ],
 *       },
 *     }),
 *   },
 * };
 * ```
 *
 * @param options - High-level CRUD page options
 * @returns A valid manifest `PageConfig`
 */
export function crudPage(options: CrudPageOptions): PageConfig {
  const slug = options.id ?? slugify(options.title);
  const tableId = `${slug}-table`;
  const createModalId = `${slug}-create-modal`;
  const editDrawerId = `${slug}-edit-drawer`;

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns = options.columns.map(mapColumn);

  // ── Row actions ──────────────────────────────────────────────────────────

  const rowActions: Record<string, unknown>[] = [];

  if (options.updateEndpoint && options.updateForm) {
    rowActions.push({
      label: "Edit",
      icon: "pencil",
      action: { type: "open-modal", modal: editDrawerId },
    });
  }

  if (options.deleteEndpoint) {
    rowActions.push({
      label: "Delete",
      icon: "trash",
      action: [
        {
          type: "confirm",
          message: `Delete this ${options.title.replace(/s$/i, "").toLowerCase()}?`,
          confirmLabel: "Delete",
          variant: "destructive",
        },
        {
          type: "api",
          method: "DELETE",
          endpoint: options.deleteEndpoint,
          onSuccess: [
            { type: "refresh", target: tableId },
            {
              type: "toast",
              message: `${options.title.replace(/s$/i, "")} deleted`,
              variant: "success",
            },
          ],
          onError: {
            type: "toast",
            message: "Delete failed. Please try again.",
            variant: "error",
          },
        },
      ],
    });
  }

  // ── Content components ────────────────────────────────────────────────────

  const content: Record<string, unknown>[] = [];

  // Header row: title + create button
  const headerChildren: Record<string, unknown>[] = [
    {
      type: "heading",
      text: options.title,
      level: 1,
    },
  ];

  if (options.createEndpoint && options.createForm) {
    headerChildren.push({
      type: "button",
      label: `New ${options.title.replace(/s$/i, "")}`,
      icon: "plus",
      variant: "default",
      action: { type: "open-modal", modal: createModalId },
    });
  }

  content.push({
    type: "row",
    justify: "between",
    align: "center",
    children: headerChildren,
  });

  // DataTable
  const tableConfig: Record<string, unknown> = {
    type: "data-table",
    id: tableId,
    data: options.listEndpoint,
    columns,
    pagination: { type: "offset", pageSize: 20 },
    searchable: true,
    emptyMessage: `No ${options.title.toLowerCase()} yet`,
  };

  if (rowActions.length > 0) {
    tableConfig.actions = rowActions;
  }

  content.push(tableConfig);

  // Create modal
  if (options.createEndpoint && options.createForm) {
    const createFormFields = options.createForm.fields.map(mapFormField);

    content.push({
      type: "modal",
      id: createModalId,
      title: `New ${options.title.replace(/s$/i, "")}`,
      size: "md",
      content: [
        {
          type: "form",
          submit: options.createEndpoint,
          method: "POST",
          fields: createFormFields,
          submitLabel: "Create",
          resetOnSubmit: true,
          onSuccess: [
            { type: "close-modal", modal: createModalId },
            { type: "refresh", target: tableId },
            {
              type: "toast",
              message: `${options.title.replace(/s$/i, "")} created`,
              variant: "success",
            },
          ],
        },
      ],
    });
  }

  // Edit drawer
  if (options.updateEndpoint && options.updateForm) {
    const updateFormFields = options.updateForm.fields.map(mapFormField);

    content.push({
      type: "drawer",
      id: editDrawerId,
      title: `Edit ${options.title.replace(/s$/i, "")}`,
      size: "md",
      side: "right",
      content: [
        {
          type: "form",
          submit: options.updateEndpoint,
          method: "PUT",
          fields: updateFormFields,
          submitLabel: "Save Changes",
          onSuccess: [
            { type: "close-modal", modal: editDrawerId },
            { type: "refresh", target: tableId },
            {
              type: "toast",
              message: `${options.title.replace(/s$/i, "")} updated`,
              variant: "success",
            },
          ],
        },
      ],
    });
  }

  return {
    title: options.title,
    content: content as PageConfig["content"],
  };
}
