/**
 * Lightweight HTML sanitizer for message content.
 * Strips all tags except an allowlist, removes dangerous attributes.
 * No external dependency (no DOMPurify).
 */

const ALLOWED_TAGS = new Set([
  "b",
  "i",
  "u",
  "s",
  "em",
  "strong",
  "code",
  "pre",
  "a",
  "br",
  "p",
  "ul",
  "ol",
  "li",
  "blockquote",
  "span",
  "img",
  "div",
  "mark",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  span: new Set(["data-mention", "class"]),
  code: new Set(["class"]),
  pre: new Set(["class"]),
  img: new Set(["src", "alt", "title", "class", "width", "height", "draggable"]),
  div: new Set(["class", "data-embed-url", "data-platform"]),
  mark: new Set(["class"]),
};

/**
 * Sanitizes HTML content for safe rendering in message threads.
 * Only allows a curated set of tags and attributes.
 *
 * @param html - Raw HTML string from TipTap or other source
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeMessageHtml(html: string): string {
  if (!html) return "";

  // Use the browser's DOMParser for robust parsing
  if (typeof DOMParser === "undefined") {
    // SSR fallback: strip all tags
    return html.replace(/<[^>]*>/g, "");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  function sanitizeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent ?? "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    // Strip disallowed tags but keep their text content
    if (!ALLOWED_TAGS.has(tag)) {
      let inner = "";
      for (const child of Array.from(el.childNodes)) {
        inner += sanitizeNode(child);
      }
      return inner;
    }

    // Build safe attributes
    const allowedAttrs = ALLOWED_ATTRS[tag];
    let attrs = "";
    if (allowedAttrs) {
      for (const attr of Array.from(el.attributes)) {
        if (allowedAttrs.has(attr.name)) {
          // Block javascript: URLs in href and src
          if (
            (attr.name === "href" || attr.name === "src") &&
            attr.value.trim().toLowerCase().startsWith("javascript:")
          ) {
            continue;
          }
          attrs += ` ${attr.name}="${escapeAttr(attr.value)}"`;
        }
      }
    }

    // Self-closing tags
    if (tag === "br") {
      return `<br />`;
    }
    if (tag === "img") {
      return `<img${attrs} />`;
    }

    let inner = "";
    for (const child of Array.from(el.childNodes)) {
      inner += sanitizeNode(child);
    }

    return `<${tag}${attrs}>${inner}</${tag}>`;
  }

  let result = "";
  for (const child of Array.from(doc.body.childNodes)) {
    result += sanitizeNode(child);
  }
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(text: string): string {
  return text.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
