import { type I18nConfig } from "../../i18n/schema";
interface PrimitiveValueOptions {
    context: Record<string, unknown>;
    locale?: string;
    i18n?: I18nConfig;
}
export declare function resolvePrimitiveValue(value: unknown, { context, locale, i18n }: PrimitiveValueOptions): string;
export declare function resolveOptionalPrimitiveValue(value: unknown, options: PrimitiveValueOptions): string | undefined;
export {};
