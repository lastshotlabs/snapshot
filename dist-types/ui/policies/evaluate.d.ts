import type { FromRef } from "../context/types";
import type { PolicyExpr, PolicyMap } from "./types";
/**
 * Runtime policy evaluation context.
 */
export interface EvaluatePolicyContext {
    /** Named policy map used for nested policy references. */
    policies?: PolicyMap;
    /** Optional parent policy map used by sub-app inheritance. */
    parentPolicies?: PolicyMap;
    /** Optional environment source for resolving EnvRef operands. */
    env?: Record<string, string | undefined>;
    /** Optional FromRef resolver for runtime references. */
    resolveFromRef?: (ref: FromRef) => unknown;
}
/**
 * Evaluate a named policy expression to a boolean.
 *
 * @param name - Policy name (used for nested lookups and error messages)
 * @param expression - Policy expression to evaluate
 * @param context - Runtime resolution context
 * @returns `true` when the policy allows access
 */
export declare function evaluatePolicy(name: string, expression: PolicyExpr | undefined, context: EvaluatePolicyContext): boolean;
