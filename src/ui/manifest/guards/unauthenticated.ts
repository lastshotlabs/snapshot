import type { GuardDef } from "../guard-registry";

export const unauthenticatedGuard: GuardDef = ({ user }) =>
  user ? { allow: false } : { allow: true };
