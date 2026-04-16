/**
 * Page preset factories.
 *
 * Each preset accepts high-level options and returns a valid manifest `PageConfig`
 * that consumers can drop directly into their manifest's `pages` record.
 *
 * @example
 * ```ts
 * import { crudPage, dashboardPage, settingsPage } from "@lastshotlabs/snapshot/ui";
 *
 * const manifest = {
 *   pages: {
 *     "/users": crudPage({ title: "Users", listEndpoint: "GET /api/users", columns: [...] }),
 *     "/dashboard": dashboardPage({ title: "Overview", stats: [...] }),
 *     "/settings": settingsPage({ title: "Settings", sections: [...] }),
 *   },
 * };
 * ```
 */
export { crudPage } from "./crud-page";
export { dashboardPage } from "./dashboard-page";
export { settingsPage } from "./settings-page";
export { authPage } from "./auth-page";
export { expandPreset } from "./expand";
export { authPresetConfigSchema, crudPresetConfigSchema, dashboardPresetConfigSchema, settingsPresetConfigSchema, } from "./schemas";
export type { ActivityFeedDef, AuthBrandingDef, AuthPageOptions, ChartDef, CrudPageOptions, DashboardPageOptions, EmptyStateDef, SettingsPageOptions, ColumnDef, FormDef, FormFieldDef, FormFieldOption, FilterDef, FilterOption, PaginationDef, StatDef, SettingsSectionDef, } from "./types";
