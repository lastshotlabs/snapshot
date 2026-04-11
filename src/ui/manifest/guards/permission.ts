import { resolveFromRef } from "../../context/from-ref";
import { evaluatePolicy } from "../../policies/evaluate";
import type { GuardDef } from "../guard-registry";

export const permissionGuard: GuardDef = ({
  guard,
  manifest,
  parentPolicies,
  policies,
  route,
  routeContext,
  user,
}) => {
  const policyName = guard.policy ?? route.id;
  const expression = policies[policyName] ?? parentPolicies?.[policyName];
  if (!expression) {
    return { allow: false };
  }

  return evaluatePolicy(policyName, expression, {
    policies,
    parentPolicies,
    resolveFromRef: (ref) =>
      resolveFromRef(ref, {
        context: {
          global: {
            user,
            auth: {
              user,
              isAuthenticated: Boolean(user),
            },
          },
        },
        route: routeContext,
        manifest: {
          app: manifest.app as Record<string, unknown>,
          auth: (manifest.auth ?? {}) as Record<string, unknown>,
        },
      }),
  })
    ? { allow: true }
    : { allow: false };
};
