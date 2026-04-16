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
export declare function formatRelativeTime(date: Date, options?: {
    includeTime?: boolean;
    short?: boolean;
}): string;
/**
 * Format a date for a visual separator (chat-style "Today", "Yesterday", full date).
 *
 * @param date - The date to format
 */
export declare function formatDateSeparator(date: Date): string;
/**
 * Extract initials from a name string (max 2 characters).
 *
 * @param name - Full name (e.g., "John Doe")
 * @returns Uppercase initials (e.g., "JD")
 */
export declare function getInitials(name: string): string;
/**
 * Access a nested field in an object by dot-separated path.
 *
 * @param obj - The source object
 * @param path - Dot-separated path (e.g., "user.profile.name")
 * @returns The value at the path, or undefined if any segment is missing
 */
export declare function getNestedField(obj: Record<string, unknown>, path: string): unknown;
