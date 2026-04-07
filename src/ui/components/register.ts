/**
 * Registers all built-in config-driven components with the manifest system.
 * Import this module as a side-effect to make all components available for manifest rendering.
 */
import { registerComponent } from "../manifest/component-registry";
import { registerComponentSchema } from "../manifest/schema";
import { StatCard, statCardConfigSchema } from "./data/stat-card/index";
import { DataTable } from "./data/data-table/index";
import { dataTableConfigSchema } from "./data/data-table/schema";
import { AutoForm } from "./forms/auto-form/index";
import { autoFormConfigSchema } from "./forms/auto-form/schema";
import { ModalComponent, modalConfigSchema } from "./overlay/modal";
import { DrawerComponent, drawerConfigSchema } from "./overlay/drawer";
import { TabsComponent, tabsConfigSchema } from "./navigation/tabs";

registerComponent(
  "stat-card",
  StatCard as Parameters<typeof registerComponent>[1],
);
registerComponentSchema("stat-card", statCardConfigSchema);

registerComponent(
  "data-table",
  DataTable as Parameters<typeof registerComponent>[1],
);
registerComponentSchema("data-table", dataTableConfigSchema);

registerComponent(
  "form",
  AutoForm as Parameters<typeof registerComponent>[1],
);
registerComponentSchema("form", autoFormConfigSchema);

registerComponent(
  "modal",
  ModalComponent as Parameters<typeof registerComponent>[1],
);
registerComponentSchema("modal", modalConfigSchema);

registerComponent(
  "drawer",
  DrawerComponent as Parameters<typeof registerComponent>[1],
);
registerComponentSchema("drawer", drawerConfigSchema);

registerComponent(
  "tabs",
  TabsComponent as Parameters<typeof registerComponent>[1],
);
registerComponentSchema("tabs", tabsConfigSchema);
