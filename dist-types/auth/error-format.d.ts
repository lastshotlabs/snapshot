import type { ApiError } from "../api/error";
import type { AuthErrorContext, AuthErrorConfig } from "../types";
/**
 * Format a raw auth `ApiError` into the message shown to application code.
 *
 * @example
 * ```ts
 * const message = formatAuthError(apiError, 'login');
 *
 * // With custom config
 * const message = formatAuthError(apiError, 'register', {
 *   verbose: true,
 *   messages: { register: 'Registration failed.' },
 * });
 * ```
 */
export declare function formatAuthError(error: ApiError, context: AuthErrorContext, config?: AuthErrorConfig): string;
/**
 * Create a reusable auth error formatter with shared formatting rules.
 *
 * @example
 * ```ts
 * const format = createAuthErrorFormatter({ verbose: false });
 * const message = format(apiError, 'login');
 * ```
 */
export declare function createAuthErrorFormatter(config?: AuthErrorConfig): (error: ApiError, context: AuthErrorContext) => string;
