/**
 * Debounce async or sync action execution by key and resolve all pending callers
 * with the final invocation result.
 */
export declare function debounceAction<T>(key: string, fn: () => Promise<T> | T, ms: number): Promise<T>;
/**
 * Throttle async or sync action execution by key and drop calls inside the
 * active throttle window.
 */
export declare function throttleAction<T>(key: string, fn: () => Promise<T> | T, ms: number): Promise<T | undefined>;
