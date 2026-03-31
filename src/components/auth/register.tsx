import { useState } from "react";
import { token } from "../../tokens/utils";
import type { RegisterConfig } from "./register.schema";

interface RegisterProps {
  config: RegisterConfig;
  onRegister: (body: Record<string, unknown>) => void;
  onOAuthLogin?: (provider: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Config-driven registration form.
 * Renders email/password fields + optional extra fields, OAuth buttons, and login link.
 */
export function Register({ config, onRegister, onOAuthLogin, isLoading, error }: RegisterProps) {
  const [values, setValues] = useState<Record<string, string>>({
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ ...values, redirectTo: config.redirectTo });
  };

  const oauthProviders = config.oauthProviders ?? ["google", "github"];
  const showOAuth = config.showOAuth !== false && onOAuthLogin;

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

  const labelSt: React.CSSProperties = {
    display: "block",
    fontSize: token("typography.fontSize.sm"),
    fontWeight: token("typography.fontWeight.medium"),
    color: token("colors.foreground"),
    marginBottom: token("spacing.1.5"),
  };

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
          {config.title ?? "Create an account"}
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
          <label style={labelSt}>Email</label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            placeholder="you@example.com"
            style={inputSt}
          />
        </div>

        <div>
          <label style={labelSt}>Password</label>
          <input
            type="password"
            value={values.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
            style={inputSt}
          />
        </div>

        {config.extraFields?.map((field) => (
          <div key={field.name}>
            <label style={labelSt}>
              {field.label ?? field.name}
              {field.required && <span style={{ color: token("colors.destructive") }}> *</span>}
            </label>
            {field.type === "select" ? (
              <select
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                style={inputSt}
              >
                <option value="">{field.placeholder ?? "Select..."}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={values[field.name] ?? ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                placeholder={field.placeholder}
                style={inputSt}
              />
            )}
          </div>
        ))}

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
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {config.showLoginLink !== false && config.loginPath && (
        <p
          style={{
            marginTop: token("spacing.6"),
            fontSize: token("typography.fontSize.sm"),
            color: token("colors.muted-foreground"),
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <a
            href={config.loginPath}
            style={{ color: token("colors.primary"), textDecoration: "none" }}
          >
            Sign in
          </a>
        </p>
      )}
    </div>
  );
}
