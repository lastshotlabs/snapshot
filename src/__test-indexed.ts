import type { ManifestConfig } from "./ui/manifest/types";

// Test indexed access on ManifestConfig
type AppSection = ManifestConfig["app"];
type ResourcesSection = NonNullable<ManifestConfig["resources"]>;
type ThemeSection = ManifestConfig["theme"];
type AuthSection = ManifestConfig["auth"];
type NavSection = ManifestConfig["navigation"];
type RoutesSection = ManifestConfig["routes"];
type StateSection = NonNullable<ManifestConfig["state"]>;
type ToastSection = ManifestConfig["toast"];
type AnalyticsSection = ManifestConfig["analytics"];
type PushSection = ManifestConfig["push"];

// Check types of array elements
type RouteArrayElement = ManifestConfig["routes"] extends (infer R)[] ? R : never;
type StateRecordElement = StateSection extends Record<string, infer S> ? S : never;
type ResourcesRecordElement = ResourcesSection extends Record<string, infer R> ? R : never;

// Test that these types work for satisfies
const appTest = {
  apiUrl: "https://api.example.com",
  title: "My App",
} satisfies AppSection;

const routeTest = {
  id: "home",
  path: "/",
  content: [],
} satisfies RouteArrayElement;

const stateTest = {
  scope: "app" as const,
  default: null,
} satisfies StateRecordElement;

export {};
