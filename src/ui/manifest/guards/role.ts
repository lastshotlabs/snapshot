import type { GuardDef } from "../guard-registry";

function collectUserRoles(user: Record<string, unknown> | null): string[] {
  if (!user) {
    return [];
  }

  const roles = Array.isArray(user["roles"])
    ? user["roles"].map((value) => String(value))
    : [];
  if (typeof user["role"] === "string") {
    roles.push(String(user["role"]));
  }

  return [...new Set(roles)];
}

export const roleGuard: GuardDef = ({ guard, route, user }) => {
  const requiredRoles =
    guard.roles && guard.roles.length > 0
      ? guard.roles
      : Array.isArray(route.page.roles)
        ? route.page.roles
        : [];

  if (requiredRoles.length === 0) {
    return { allow: true };
  }

  const userRoles = collectUserRoles(user);
  return requiredRoles.some((role) => userRoles.includes(role))
    ? { allow: true }
    : { allow: false };
};
