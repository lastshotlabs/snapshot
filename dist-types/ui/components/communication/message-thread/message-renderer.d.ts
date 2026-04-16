/**
 * Lightweight HTML sanitizer for message content.
 * Strips all tags except an allowlist, removes dangerous attributes.
 * No external dependency (no DOMPurify).
 */
/**
 * Sanitizes HTML content for safe rendering in message threads.
 * Only allows a curated set of tags and attributes.
 *
 * @param html - Raw HTML string from TipTap or other source
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export declare function sanitizeMessageHtml(html: string): string;
