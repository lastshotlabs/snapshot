import type { FromRef } from "../context/types";
import { isFromRef } from "../context/utils";
import { isEnvRef, resolveEnvRef } from "../manifest/env";
import type { PolicyExpr, PolicyMap, PolicyRefOrLiteral } from "./types";

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

function resolvePolicyOperand(
  value: PolicyRefOrLiteral,
  context: EvaluatePolicyContext,
): unknown {
  if (isFromRef(value)) {
    return context.resolveFromRef ? context.resolveFromRef(value) : undefined;
  }

  if (isEnvRef(value)) {
    return resolveEnvRef(value, context.env ?? {});
  }

  return value;
}

function evaluatePolicyExpression(
  name: string,
  expression: PolicyExpr,
  context: EvaluatePolicyContext,
  stack: Set<string>,
): boolean {
  if (typeof expression === "string") {
    const nested =
      context.policies?.[expression] ?? context.parentPolicies?.[expression];
    if (!nested) {
      throw new Error(
        `Policy "${name}" references missing policy "${expression}". Add it to manifest.policies.`,
      );
    }

    if (stack.has(expression)) {
      const cycle = [...stack, expression].join(" -> ");
      throw new Error(`Circular policy reference: ${cycle}`);
    }

    const nextStack = new Set(stack);
    nextStack.add(expression);
    return evaluatePolicyExpression(expression, nested, context, nextStack);
  }

  if ("all" in expression) {
    return expression.all.every((item) =>
      evaluatePolicyExpression(name, item, context, stack),
    );
  }

  if ("any" in expression) {
    return expression.any.some((item) =>
      evaluatePolicyExpression(name, item, context, stack),
    );
  }

  if ("not" in expression) {
    return !evaluatePolicyExpression(name, expression.not, context, stack);
  }

  if ("equals" in expression) {
    const [left, right] = expression.equals;
    return (
      resolvePolicyOperand(left, context) === resolvePolicyOperand(right, context)
    );
  }

  if ("not-equals" in expression) {
    const [left, right] = expression["not-equals"];
    return (
      resolvePolicyOperand(left, context) !== resolvePolicyOperand(right, context)
    );
  }

  if ("exists" in expression) {
    const value = resolvePolicyOperand(expression.exists, context);
    return value !== undefined && value !== null;
  }

  if ("truthy" in expression) {
    return Boolean(resolvePolicyOperand(expression.truthy, context));
  }

  if ("falsy" in expression) {
    return !resolvePolicyOperand(expression.falsy, context);
  }

  const [candidate, collection] = expression.in;
  const resolvedCandidate = resolvePolicyOperand(candidate, context);
  const resolvedCollection = collection.map((item) =>
    resolvePolicyOperand(item, context),
  );

  return resolvedCollection.some((item) => item === resolvedCandidate);
}

/**
 * Evaluate a named policy expression to a boolean.
 *
 * @param name - Policy name (used for nested lookups and error messages)
 * @param expression - Policy expression to evaluate
 * @param context - Runtime resolution context
 * @returns `true` when the policy allows access
 */
export function evaluatePolicy(
  name: string,
  expression: PolicyExpr | undefined,
  context: EvaluatePolicyContext,
): boolean {
  if (!expression) {
    return false;
  }

  return evaluatePolicyExpression(name, expression, context, new Set([name]));
}
