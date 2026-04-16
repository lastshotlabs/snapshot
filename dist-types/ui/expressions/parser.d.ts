export interface ExpressionContext {
    [key: string]: unknown;
}
/**
 * Safe builtin allowlist available to manifest expressions.
 */
export declare const SAFE_BUILTINS: Record<"Math" | "String", Record<string, (...args: unknown[]) => unknown>>;
export declare function evaluateExpression(expression: string, context: ExpressionContext): unknown;
export declare function extractExpressionRefs(expression: string): string[];
