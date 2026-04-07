/**
 * Registers all built-in config-driven components with the manifest system.
 * Import this module to make modal, drawer, and tabs available for manifest rendering.
 */
import { registerComponent } from "../manifest/component-registry";
import { registerComponentSchema } from "../manifest/schema";
import { ModalComponent, modalConfigSchema } from "./overlay/modal";
import { DrawerComponent, drawerConfigSchema } from "./overlay/drawer";
import { TabsComponent, tabsConfigSchema } from "./navigation/tabs";

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
