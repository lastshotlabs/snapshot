/**
 * Replace `{key}` placeholders with values from context.
 * Supports nested paths: `{user.name}`, `{result.id}`.
 * Missing keys are preserved as-is: `{unknown}` stays `{unknown}`.
 *
 * @param template - The template string with `{key}` placeholders
 * @param context - The context object to resolve values from
 * @returns The interpolated string
 *
 * @example
 * ```ts
 * interpolate('/users/{id}', { id: 5 }) // → '/users/5'
 * interpolate('{user.name}', { user: { name: 'Jo' } }) // → 'Jo'
 * interpolate('{missing}', {}) // → '{missing}'
 * ```
 */
export declare function interpolate(template: string, context: Record<string, unknown>): string;
