import { useState } from "react";
import { token } from "../../tokens/utils";
import type { LoginConfig } from "./login.schema";

interface LoginProps {
  config: LoginConfig;
  onLogin: (body: { email: string; password: string; redirectTo?: string }) => void;
  onOAuthLogin?: (provider: string) => void;
  onPasskeyLogin?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Config-driven login form.
 * Renders email/password fields, optional OAuth buttons, optional passkey login,
 * and links to register and forgot-password pages.
 */
export function Login({
  config,
  onLogin,
  onOAuthLogin,
  onPasskeyLogin,
  isLoading,
  error,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password, redirectTo: config.redirectTo });
  };

  const oauthProviders = config.oauthProviders ?? ["google", "github"];
  const showOAuth = config.showOAuth !== false && onOAuthLogin;
  const showPasskey = config.showPasskeyLogin && onPasskeyLogin;

  return (
    <div
      className={config.className}
      style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}
    >
      {config.title && (
        <h1
          style={{
            fontSize: token("typography.fontSize.2xl"),
            fontWeight: token("typography.fontWeight.bold"),
            color: token("colors.foreground"),
            textAlign: "center",
            marginBottom: token("spacing.2"),
          }}
        >
          {config.title ?? "Sign in"}
        </h1>
      )}

      {config.description && (
        <p
          style={{
            fontSize: token("typography.fontSize.sm"),
            color: token("colors.muted-foreground"),
            textAlign: "center",
            marginBottom: token("spacing.6"),
          }}
        >
          {config.description}
        </p>
      )}

      {showOAuth && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: token("spacing.2") }}>
            {oauthProviders.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => onOAuthLogin!(provider)}
                style={{
                  width: "100%",
                  padding: `${token("spacing.2.5")} ${token("spacing.4")}`,
                  fontSize: token("typography.fontSize.sm"),
                  fontWeight: token("typography.fontWeight.medium"),
                  borderRadius: token("radius.md"),
                  border: `1px solid ${token("colors.border")}`,
                  backgroundColor: token("colors.background"),
                  color: token("colors.foreground"),
                  cursor: "pointer",
                }}
              >
                Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: token("spacing.3"),
              margin: `${token("spacing.4")} 0`,
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: token("colors.border") }} />
            <span
              style={{
                fontSize: token("typography.fontSize.xs"),
                color: token("colors.muted-foreground"),
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: token("colors.border") }} />
          </div>
        </>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: token("spacing.4") }}
      >
        <div>
          <label style={labelStyle()}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputStyle()}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={labelStyle()}>Password</label>
            {config.showForgotPassword !== false && config.forgotPasswordPath && (
              <a
                href={config.forgotPasswordPath}
                style={{
                  fontSize: token("typography.fontSize.xs"),
                  color: token("colors.primary"),
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle()}
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
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {showPasskey && (
        <button
          type="button"
          onClick={onPasskeyLogin}
          style={{
            width: "100%",
            marginTop: token("spacing.3"),
            padding: `${token("spacing.2.5")} ${token("spacing.4")}`,
            fontSize: token("typography.fontSize.sm"),
            borderRadius: token("radius.md"),
            border: `1px solid ${token("colors.border")}`,
            backgroundColor: token("colors.background"),
            color: token("colors.foreground"),
            cursor: "pointer",
          }}
        >
          Sign in with passkey
        </button>
      )}

      {config.showRegisterLink !== false && config.registerPath && (
        <p
          style={{
            marginTop: token("spacing.6"),
            fontSize: token("typography.fontSize.sm"),
            color: token("colors.muted-foreground"),
            textAlign: "center",
          }}
        >
          Don't have an account?{" "}
          <a
            href={config.registerPath}
            style={{ color: token("colors.primary"), textDecoration: "none" }}
          >
            Sign up
          </a>
        </p>
      )}
    </div>
  );
}

function labelStyle(): React.CSSProperties {
  return {
    display: "block",
    fontSize: token("typography.fontSize.sm"),
    fontWeight: token("typography.fontWeight.medium"),
    color: token("colors.foreground"),
    marginBottom: token("spacing.1.5"),
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: `${token("spacing.2")} ${token("spacing.3")}`,
    fontSize: token("typography.fontSize.sm"),
    borderRadius: token("radius.md"),
    border: `1px solid ${token("colors.input")}`,
    backgroundColor: token("colors.background"),
    color: token("colors.foreground"),
    outline: "none",
  };
}
