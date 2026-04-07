export {
  registerComponent,
  getRegisteredComponent,
  getRegisteredTypes,
} from "./component-registry";
export type { ConfigDrivenComponent } from "./component-registry";
export {
  registerComponentSchema,
  getComponentSchema,
  componentConfigSchema,
  baseComponentConfigSchema,
  fromRefSchema,
} from "./schema";
export { ComponentRenderer } from "./renderer";
export type { ComponentConfig } from "./renderer";
