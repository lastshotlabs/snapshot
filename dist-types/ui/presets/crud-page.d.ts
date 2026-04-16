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
import type { CrudPageOptions } from "./types";
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
export declare function crudPage(options: CrudPageOptions): PageConfig;
