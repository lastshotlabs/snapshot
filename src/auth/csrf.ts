const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function getCsrfToken(cookieName = "csrf_token"): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.split("=")[1]!) : null;
}

export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}
