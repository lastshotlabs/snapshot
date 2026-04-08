/**
 * Shared utility functions for config-driven components.
 *
 * Centralizes commonly-needed helpers so component files stay focused on
 * rendering logic. Every function here must be pure and side-effect free.
 */

/**
 * Format a Date as a human-readable relative time string.
 *
 * Returns "just now", "X min ago", "X hour(s) ago", "Yesterday", "X days ago",
 * or a short date for older values.
 *
 * @param date - The date to format
 * @param options - Optional configuration
 * @param options.includeTime - Include time for "Yesterday" (e.g., "Yesterday at 3:45 PM")
 * @param options.short - Use compact format ("5m", "2h", "3d") instead of words
 */
export function formatRelativeTime(
  date: Date,
  options?: { includeTime?: boolean; short?: boolean },
): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (options?.short) {
    if (diffSec < 60) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay === 1) {
    if (options?.includeTime) {
      return `Yesterday at ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
    }
    return "Yesterday";
  }
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date for a visual separator (chat-style "Today", "Yesterday", full date).
 *
 * @param date - The date to format
 */
export function formatDateSeparator(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Extract initials from a name string (max 2 characters).
 *
 * @param name - Full name (e.g., "John Doe")
 * @returns Uppercase initials (e.g., "JD")
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Access a nested field in an object by dot-separated path.
 *
 * @param obj - The source object
 * @param path - Dot-separated path (e.g., "user.profile.name")
 * @returns The value at the path, or undefined if any segment is missing
 */
export function getNestedField(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
