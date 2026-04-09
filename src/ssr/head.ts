// src/ssr/head.ts

/**
 * SsrMeta shape — structural equivalent of `SsrMeta` from `@lastshotlabs/bunshot-ssr`.
 *
 * Defined here so consumers can import from `@lastshotlabs/snapshot/ssr` only,
 * without needing to install bunshot-ssr as a dependency.
 */
export interface SsrMetaShape {
  /** Page title. Injected as `<title>`. */
  title?: string;
  /** Meta description. Injected as `<meta name="description">`. */
  description?: string;
  /** Canonical URL. Injected as `<link rel="canonical">`. */
  canonical?: string;
  /** Robots meta tag content. e.g. `'noindex, nofollow'` */
  robots?: string;
  /** Additional arbitrary `<meta>` tag attributes. */
  meta?: ReadonlyArray<Readonly<Record<string, string>>>;
  /** Open Graph tags. */
  og?: {
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    type?: string;
    url?: string;
    siteName?: string;
  };
  /** Twitter Card tags. */
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    site?: string;
  };
  /**
   * JSON-LD structured data. Must be JSON-serializable.
   * Injected as `<script type="application/ld+json">`.
   */
  jsonLd?: Record<string, unknown>;
}

/**
 * Build `<head>` tag strings from an `SsrMeta` object.
 *
 * Returns a safe string of HTML tags for injection into the document `<head>`.
 * All attribute values are HTML-escaped via `escapeHtml()`. Undefined fields
 * are omitted — no empty tags are emitted.
 *
 * **Streaming compatibility:** This function runs synchronously before
 * `renderToReadableStream`. The head tags are part of the preamble written before
 * the React stream begins, which is the correct approach for streaming SSR — head
 * content cannot be deferred via Suspense.
 *
 * @param meta - The route's meta configuration, or `undefined` for no tags.
 * @returns Safe HTML string ready for `<head>` injection. Empty string when `meta` is
 *   `undefined` or has no defined fields.
 */
export function buildHeadTags(meta: SsrMetaShape | undefined): string {
  if (!meta) return "";

  const tags: string[] = [];

  if (meta.title) {
    tags.push(`<title>${escapeHtml(meta.title)}</title>`);
  }

  if (meta.description) {
    tags.push(
      `<meta name="description" content="${escapeHtml(meta.description)}">`,
    );
  }

  if (meta.canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonical)}">`);
  }

  if (meta.robots) {
    tags.push(`<meta name="robots" content="${escapeHtml(meta.robots)}">`);
  }

  for (const attrs of meta.meta ?? []) {
    const attrStr = Object.entries(attrs)
      .map(([k, v]) => `${escapeHtml(k)}="${escapeHtml(v)}"`)
      .join(" ");
    tags.push(`<meta ${attrStr}>`);
  }

  const og = meta.og;
  if (og) {
    if (og.title)
      tags.push(`<meta property="og:title" content="${escapeHtml(og.title)}">`);
    if (og.description)
      tags.push(
        `<meta property="og:description" content="${escapeHtml(og.description)}">`,
      );
    if (og.image)
      tags.push(`<meta property="og:image" content="${escapeHtml(og.image)}">`);
    if (og.imageAlt)
      tags.push(
        `<meta property="og:image:alt" content="${escapeHtml(og.imageAlt)}">`,
      );
    if (og.type)
      tags.push(`<meta property="og:type" content="${escapeHtml(og.type)}">`);
    if (og.url)
      tags.push(`<meta property="og:url" content="${escapeHtml(og.url)}">`);
    if (og.siteName)
      tags.push(
        `<meta property="og:site_name" content="${escapeHtml(og.siteName)}">`,
      );
  }

  const tw = meta.twitter;
  if (tw) {
    if (tw.card)
      tags.push(`<meta name="twitter:card" content="${escapeHtml(tw.card)}">`);
    if (tw.title)
      tags.push(
        `<meta name="twitter:title" content="${escapeHtml(tw.title)}">`,
      );
    if (tw.description)
      tags.push(
        `<meta name="twitter:description" content="${escapeHtml(tw.description)}">`,
      );
    if (tw.image)
      tags.push(
        `<meta name="twitter:image" content="${escapeHtml(tw.image)}">`,
      );
    if (tw.imageAlt)
      tags.push(
        `<meta name="twitter:image:alt" content="${escapeHtml(tw.imageAlt)}">`,
      );
    if (tw.site)
      tags.push(`<meta name="twitter:site" content="${escapeHtml(tw.site)}">`);
  }

  if (meta.jsonLd) {
    const json = safeJsonForJsonLd(meta.jsonLd);
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }

  return tags.join("\n");
}

/**
 * Escape HTML special characters in attribute values and text content.
 * Prevents XSS via meta tag attribute injection.
 *
 * @internal
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * JSON-stringify for JSON-LD script tags — escapes `</script>` sequences.
 *
 * @internal
 */
function safeJsonForJsonLd(value: unknown): string {
  return JSON.stringify(value, null, 2)
    .replace(/<\//g, "<\\/")
    .replace(/<!--/g, "<\\!--");
}
