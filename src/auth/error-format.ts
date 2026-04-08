import type { ApiError } from "../api/error";
import type { AuthErrorContext, AuthErrorConfig } from "../types";

const DEFAULT_MESSAGES: Record<AuthErrorContext, string> = {
  login: "Invalid email or password.",
  register: "Unable to create account. Please try again.",
  "forgot-password":
    "If that email is registered, you'll receive a password reset link shortly.",
  "reset-password": "Unable to reset password. The link may have expired.",
  "verify-email":
    "Unable to verify email. The link may have expired or already been used.",
};

function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const { hostname } = window.location;
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
  );
}

export function formatAuthError(
  error: ApiError,
  context: AuthErrorContext,
  config?: AuthErrorConfig,
): string {
  if (config?.format) {
    return config.format(error, context);
  }

  const verbose = config?.verbose ?? isLocalhost();
  if (verbose) {
    return error.message ?? DEFAULT_MESSAGES[context];
  }

  return config?.messages?.[context] ?? DEFAULT_MESSAGES[context];
}

export function createAuthErrorFormatter(config?: AuthErrorConfig) {
  return (error: ApiError, context: AuthErrorContext): string =>
    formatAuthError(error, context, config);
}
