import type { GuardDef } from "../guard-registry";

export const authenticatedGuard: GuardDef = ({ user }) =>
  user ? { allow: true } : { allow: false };
