import { useState } from "react";
import { token } from "../../tokens/utils";
import type { ForgotPasswordConfig } from "./forgot-password.schema";

interface ForgotPasswordProps {
  config: ForgotPasswordConfig;
  onSubmit: (body: { email: string }) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
}

/**
 * Config-driven forgot-password form.
 * Shows email input, submits to password reset endpoint, displays success message.
 */
export function ForgotPassword({
  config,
  onSubmit,
  isLoading,
  isSuccess,
  error,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email });
  };

  const inputSt: React.CSSProperties = {
    width: "100%",
    padding: `${token("spacing.2")} ${token("spacing.3")}`,
    fontSize: token("typography.fontSize.sm"),
    borderRadius: token("radius.md"),
    border: `1px solid ${token("colors.input")}`,
    backgroundColor: token("colors.background"),
    color: token("colors.foreground"),
    outline: "none",
  };

  return (
    <div
      className={config.className}
      style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}
    >
      <h1
        style={{
          fontSize: token("typography.fontSize.2xl"),
          fontWeight: token("typography.fontWeight.bold"),
          color: token("colors.foreground"),
          textAlign: "center",
          marginBottom: token("spacing.2"),
        }}
      >
        {config.title ?? "Reset password"}
      </h1>

      <p
        style={{
          fontSize: token("typography.fontSize.sm"),
          color: token("colors.muted-foreground"),
          textAlign: "center",
          marginBottom: token("spacing.6"),
        }}
      >
        {config.description ?? "Enter your email and we'll send you a reset link."}
      </p>

      {isSuccess ? (
        <div
          style={{
            padding: token("spacing.4"),
            borderRadius: token("radius.md"),
            backgroundColor: token("colors.accent"),
            color: token("colors.accent-foreground"),
            fontSize: token("typography.fontSize.sm"),
            textAlign: "center",
          }}
        >
          {config.successMessage ?? "Check your email for a password reset link."}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: token("spacing.4") }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: token("typography.fontSize.sm"),
                fontWeight: token("typography.fontWeight.medium"),
                color: token("colors.foreground"),
                marginBottom: token("spacing.1.5"),
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={inputSt}
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: token("typography.fontSize.sm"),
                color: token("colors.destructive"),
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: `${token("spacing.2.5")} ${token("spacing.4")}`,
              fontSize: token("typography.fontSize.sm"),
              fontWeight: token("typography.fontWeight.medium"),
              borderRadius: token("radius.md"),
              border: "none",
              backgroundColor: token("colors.primary"),
              color: token("colors.primary-foreground"),
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      {config.showLoginLink !== false && config.loginPath && (
        <p
          style={{
            marginTop: token("spacing.6"),
            fontSize: token("typography.fontSize.sm"),
            color: token("colors.muted-foreground"),
            textAlign: "center",
          }}
        >
          <a
            href={config.loginPath}
            style={{ color: token("colors.primary"), textDecoration: "none" }}
          >
            Back to sign in
          </a>
        </p>
      )}
    </div>
  );
}
