import type { I18nConfig } from "../i18n/schema";
export interface ResolveTemplateOptions {
    locale?: string;
    i18n?: I18nConfig;
}
export declare function resolveTemplate(template: string, context: Record<string, unknown>, options?: ResolveTemplateOptions): string;
export declare function resolveTemplateValue(template: unknown, context: Record<string, unknown>, options?: ResolveTemplateOptions): unknown;
