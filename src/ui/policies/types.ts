import type { FromRef } from "../context/types";
import { isFromRef } from "../context/utils";
import type { EnvRef } from "../manifest/env";
import { isEnvRef } from "../manifest/env";

/** Reference to a named policy declaration. */
export interface PolicyRef {
  /** Policy name in `manifest.policies`. */
  policy: string;
}

/** Primitive or ref value used by policy operations. */
export type PolicyRefOrLiteral =
  | string
  | number
  | boolean
  | null
  | FromRef
  | EnvRef;

/** Policy expression tree used by `manifest.policies`. */
export type PolicyExpr =
  | string
  | { all: PolicyExpr[] }
  | { any: PolicyExpr[] }
  | { not: PolicyExpr }
  | { equals: [PolicyRefOrLiteral, PolicyRefOrLiteral] }
  | { "not-equals": [PolicyRefOrLiteral, PolicyRefOrLiteral] }
  | { exists: PolicyRefOrLiteral }
  | { truthy: PolicyRefOrLiteral }
  | { falsy: PolicyRefOrLiteral }
  | { in: [PolicyRefOrLiteral, PolicyRefOrLiteral[]] };

/** Map of named policy expressions. */
export type PolicyMap = Record<string, PolicyExpr>;

/**
 * Check whether a value is a policy reference object.
 *
 * @param value - Unknown input
 * @returns True when the value matches `{ policy: string }`
 */
export function isPolicyRef(value: unknown): value is PolicyRef {
  return (
    typeof value === "object" &&
    value !== null &&
    "policy" in value &&
    typeof (value as { policy?: unknown }).policy === "string"
  );
}

/**
 * Check whether a value can be used as a policy operation operand.
 *
 * @param value - Unknown input
 * @returns True when the value is a literal, FromRef, or EnvRef
 */
export function isPolicyRefOrLiteral(
  value: unknown,
): value is PolicyRefOrLiteral {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    isFromRef(value) ||
    isEnvRef(value)
  );
}

/**
 * Collect policy-name references from an expression tree.
 *
 * String expressions represent named policy references. String operands inside
 * comparison operations are literals and are not collected.
 *
 * @param expr - Policy expression to inspect
 * @returns Set of referenced policy names
 */
export function collectPolicyRefs(expr: PolicyExpr): Set<string> {
  const refs = new Set<string>();

  const walk = (value: PolicyExpr): void => {
    if (typeof value === "string") {
      refs.add(value);
      return;
    }

    if ("all" in value) {
      value.all.forEach(walk);
      return;
    }

    if ("any" in value) {
      value.any.forEach(walk);
      return;
    }

    if ("not" in value) {
      walk(value.not);
      return;
    }
  };

  walk(expr);
  return refs;
}
