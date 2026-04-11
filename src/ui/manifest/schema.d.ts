/**
 * Manifest Zod schemas.
 *
 * Defines the validation schemas for the snapshot manifest format
 * (`snapshot.manifest.json`). Uses a dynamic component schema registry
 * so each component phase can register its own schema.
 */
import { z } from "zod";
/** Zod schema for a FromRef value. */
export declare const fromRefSchema: any;
/**
 * Accept either a literal string or an environment reference.
 */
export declare const stringOrEnvRef: any;
/** Policy reference used by guards and component visibility. */
export declare const policyRefSchema: any;
/** Manifest policy expression schema. */
export declare const policyExprSchema: z.ZodType;
/** Top-level named policies schema. */
export declare const policiesSchema: any;
export declare function registerComponentSchema(type: string, schema: z.ZodType): void;
export declare function getRegisteredSchemaTypes(): string[];
export declare const baseComponentConfigSchema: any;
export declare const rowConfigSchema: z.ZodType;
export declare const headingConfigSchema: any;
export declare const buttonConfigSchema: any;
export declare const selectConfigSchema: any;
export declare const customComponentPropSchema: any;
export declare const customComponentDeclarationSchema: any;
/**
 * Manifest toast defaults used by the `toast` action runtime.
 */
export declare const toastConfigSchema: any;
/**
 * Analytics provider declaration schema.
 */
export declare const analyticsProviderSchema: any;
/**
 * Manifest analytics runtime configuration.
 */
export declare const analyticsConfigSchema: any;
export declare const observabilityConfigSchema: any;
/**
 * Manifest push-notification runtime configuration.
 */
export declare const pushConfigSchema: any;
/**
 * Schema for a single manifest-declared custom workflow action input.
 */
export declare const customWorkflowActionInputSchema: any;
/**
 * Schema for a manifest-declared custom workflow action.
 */
export declare const customWorkflowActionDeclarationSchema: any;
/**
 * Schema for manifest workflow definitions plus action declarations.
 */
export declare const workflowsConfigSchema: any;
/**
 * Manifest auth contract overrides.
 */
export declare const authContractSchema: any;
/**
 * Manifest client declaration for per-resource backend selection.
 */
export declare const clientConfigSchema: any;
/**
 * Named client registry in the manifest.
 */
export declare const clientsSchema: any;
/**
 * Manifest realtime WebSocket configuration.
 *
 * `events` is merged into `on` so runtime workflow resolution can treat
 * lifecycle hooks and event hooks uniformly.
 */
export declare const realtimeWsSchema: any;
/**
 * Manifest realtime SSE endpoint configuration.
 *
 * `events` is merged into `on` so runtime workflow resolution can treat
 * lifecycle hooks and event hooks uniformly.
 */
export declare const realtimeSseEndpointSchema: any;
/**
 * Manifest realtime configuration.
 */
export declare const realtimeConfigSchema: any;
export declare const componentsConfigSchema: any;
export declare const componentConfigSchema: z.ZodType;
export declare const navItemSchema: z.ZodType;
export declare const navigationConfigSchema: any;
/**
 * Auth provider declaration schema.
 *
 * Declared at `manifest.auth.providers.<name>`.
 */
export declare const authProviderSchema: any;
/**
 * Manifest auth session settings.
 */
export declare const authSessionSchema: any;
export declare const authScreenConfigSchema: any;
export declare const layoutSchema: any;
export declare const pageConfigSchema: any;
/**
 * Slot declaration for a route layout.
 */
export declare const routeLayoutSlotSchema: any;
/**
 * Route layout declaration.
 *
 * Supports built-in layout names and object form for explicit props/slots.
 */
export declare const routeLayoutSchema: any;
export declare const routeGuardConfigSchema: any;
export declare const routeGuardSchema: any;
export declare const routeConfigSchema: any;
export declare const stateValueConfigSchema: any;
/**
 * Manifest cache defaults for TanStack Query.
 */
export declare const appCacheSchema: any;
export declare const appConfigSchema: any;
/**
 * Server-side rendering configuration for the manifest app.
 *
 * When `rsc` is enabled, the manifest renderer loads `rsc-manifest.json`
 * once at startup and passes it to `renderPage()` for two-pass RSC rendering.
 */
export declare const manifestSsrConfigSchema: any;
export declare const overlayConfigSchema: z.ZodType;
/**
 * Inheritance flags for mounted sub-manifests.
 */
export declare const subAppInheritSchema: any;
/**
 * Sub-application mount configuration.
 */
export declare const subAppConfigSchema: any;
/**
 * Named sub-application map keyed by sub-app id.
 */
export declare const subAppsSchema: any;
export declare const manifestConfigSchema: any;
export declare function withManifestCustomComponents<T>(manifest: unknown, callback: () => T): T;
