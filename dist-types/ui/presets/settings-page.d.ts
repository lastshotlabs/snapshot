/**
 * `settingsPage` preset factory.
 *
 * Composes a settings page from high-level options and returns a valid
 * manifest `PageConfig`. The generated page includes:
 *
 * - A page heading
 * - A Tabs component with one tab per section
 * - Each tab contains an AutoForm for that section's fields
 */
import type { PageConfig } from "../manifest/types";
import type { SettingsPageOptions } from "./types";
/**
 * Builds a manifest `PageConfig` for a settings page.
 *
 * Consumers drop the result into their manifest's `pages` record:
 *
 * ```ts
 * const manifest = {
 *   pages: {
 *     "/settings": settingsPage({
 *       title: "Settings",
 *       sections: [
 *         {
 *           label: "Profile",
 *           submitEndpoint: "PATCH /api/me/profile",
 *           dataEndpoint: "GET /api/me/profile",
 *           fields: [
 *             { key: "name", type: "text", label: "Name", required: true },
 *             { key: "bio", type: "textarea", label: "Bio" },
 *           ],
 *         },
 *         {
 *           label: "Password",
 *           submitEndpoint: "POST /api/me/password",
 *           fields: [
 *             { key: "currentPassword", type: "password", label: "Current Password", required: true },
 *             { key: "newPassword", type: "password", label: "New Password", required: true },
 *           ],
 *         },
 *       ],
 *     }),
 *   },
 * };
 * ```
 *
 * @param options - High-level settings page options
 * @returns A valid manifest `PageConfig`
 */
export declare function settingsPage(options: SettingsPageOptions): PageConfig;
