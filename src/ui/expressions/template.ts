import { getNestedValue } from "../context/utils";
import type { I18nConfig } from "../i18n/schema";
import { resolveTRef } from "../i18n/resolve";

export interface ResolveTemplateOptions {
  locale?: string;
  i18n?: I18nConfig;
}

function resolvePath(path: string, context: Record<string, unknown>): unknown {
  return getNestedValue(context, path);
}

function resolveTemplateToken(
  token: string,
  context: Record<string, unknown>,
  options: ResolveTemplateOptions,
): unknown {
  const locale = options.locale ?? "en";

  if (token.startsWith("i18n:")) {
    const key = token.slice(5);
    return resolveTRef({ t: key }, locale, options.i18n) || key;
  }

  if (token.startsWith("date:")) {
    return resolveDateTemplate(token.slice(5), context, locale);
  }

  if (token.startsWith("number:")) {
    return resolveNumberTemplate(token.slice(7), context, locale);
  }

  return resolvePath(token, context);
}

function resolveDateTemplate(
  token: string,
  context: Record<string, unknown>,
  locale: string,
): string | undefined {
  const [path = "", format = "medium"] = token.split("|");
  const value = resolvePath(path, context);
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const dateStyleMap = {
    short: "short",
    medium: "medium",
    long: "long",
    full: "full",
  } as const;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: dateStyleMap[format as keyof typeof dateStyleMap] ?? "medium",
  }).format(date);
}

function resolveNumberTemplate(
  token: string,
  context: Record<string, unknown>,
  locale: string,
): string | undefined {
  const [path = "", ...rawOptions] = token.split("|");
  const value = resolvePath(path, context);
  if (value == null || Number.isNaN(Number(value))) {
    return undefined;
  }

  const options = rawOptions.reduce<Intl.NumberFormatOptions>(
    (result, option) => {
      const [key, rawValue] = option.split(":");
      if (!key || !rawValue) {
        return result;
      }

      if (key === "style") {
        result.style = rawValue as Intl.NumberFormatOptions["style"];
      } else if (key === "currency") {
        result.currency = rawValue;
      }

      return result;
    },
    {},
  );

  return new Intl.NumberFormat(locale, options).format(Number(value));
}

export function resolveTemplate(
  template: string,
  context: Record<string, unknown>,
  options: ResolveTemplateOptions = {},
): string {
  if (!template.includes("{")) {
    return template;
  }

  return template.replace(/\{([^}]+)\}/g, (match, token: string) => {
    const resolved = resolveTemplateToken(token, context, options);
    if (resolved == null) {
      return match;
    }
    return String(resolved);
  });
}

export function resolveTemplateValue(
  template: unknown,
  context: Record<string, unknown>,
  options: ResolveTemplateOptions = {},
): unknown {
  if (typeof template !== "string" || !template.includes("{")) {
    return template;
  }

  const singleTokenMatch = template.match(/^\{([^}]+)\}$/);
  if (!singleTokenMatch) {
    return resolveTemplate(template, context, options);
  }

  const resolved = resolveTemplateToken(singleTokenMatch[1]!, context, options);
  return resolved == null ? template : resolved;
}
