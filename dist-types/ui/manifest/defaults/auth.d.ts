import type { ManifestConfig } from "../types";
export type DefaultAuthScreen = "login" | "register" | "forgot-password" | "reset-password" | "verify-email" | "mfa" | "sso-callback";
export declare function normalizeAuthScreens(screens: NonNullable<ManifestConfig["auth"]>["screens"] | undefined): Record<DefaultAuthScreen, "default" | false>;
export declare function buildDefaultAuthFragment(manifest: ManifestConfig): Pick<ManifestConfig, "routes" | "i18n" | "workflows">;
