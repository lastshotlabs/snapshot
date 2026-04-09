import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiError } from "../../api/error";
import { mergeContract, type AuthContract } from "../../auth/contract";
import { useSetStateValue } from "../state";
import type {
  AuthErrorContext,
  AuthUser,
  LoginResponse,
  MfaChallenge,
  MfaMethod,
  OAuthProvider,
  RegisterVars,
  ResetPasswordBody,
  SnapshotConfig,
  SnapshotInstance,
  VerifyEmailBody,
} from "../../types";
import type { CompiledManifest, CompiledRoute } from "./types";

const AUTH_QUERY_KEY = ["auth", "me"] as const;

export type AuthScreen =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "mfa";

interface ManifestAuthRuntimeConfig {
  authMode: SnapshotConfig["auth"];
  contract: AuthContract;
}

interface ManifestAuthScreenProps {
  manifest: CompiledManifest;
  route: CompiledRoute;
  screen: AuthScreen;
  snapshot: Pick<
    SnapshotInstance,
    "api" | "queryClient" | "tokenStorage" | "formatAuthError" | "getOAuthUrl"
  >;
  runtimeConfig: ManifestAuthRuntimeConfig;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

function inferAuthScreenPath(
  manifest: CompiledManifest,
  screen: AuthScreen,
): string | undefined {
  const routeById = manifest.routes.find((route) => route.id === screen);
  if (routeById) {
    return routeById.path;
  }

  const candidates: Record<AuthScreen, string[]> = {
    login: ["/login", "/auth/login"],
    register: ["/register", "/auth/register"],
    "forgot-password": ["/forgot-password", "/auth/forgot-password"],
    "reset-password": ["/reset-password", "/auth/reset-password"],
    "verify-email": ["/verify-email", "/auth/verify-email"],
    mfa: ["/mfa", "/auth/mfa"],
  };

  return candidates[screen].find((path) => manifest.routeMap[path] != null);
}

export function resolveAuthScreen(
  manifest: CompiledManifest,
  route: CompiledRoute | null,
): AuthScreen | null {
  if (!manifest.auth || !route) {
    return null;
  }

  for (const screen of manifest.auth.screens) {
    if (route.id === screen) {
      return screen;
    }

    const inferredPath = inferAuthScreenPath(manifest, screen);
    if (inferredPath && route.path === inferredPath) {
      return screen;
    }
  }

  return null;
}

function useLocationSearch(): URLSearchParams {
  const [search, setSearch] = useState(() =>
    typeof window === "undefined" ? "" : window.location.search,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      setSearch(window.location.search);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return useMemo(() => new URLSearchParams(search), [search]);
}

function resolveHomePath(manifest: CompiledManifest): string {
  return manifest.app.home ?? manifest.firstRoute?.path ?? "/";
}

function useApplyAuthenticatedUser(manifest: CompiledManifest) {
  const setUser = useSetStateValue("user", { scope: "app" });
  const setAuth = useSetStateValue("auth", { scope: "app" });

  return (user: AuthUser | null) => {
    setUser(user);
    setAuth({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      isError: false,
      screens: manifest.auth?.screens ?? [],
    });
  };
}

function applyAuthTokens(
  authMode: SnapshotConfig["auth"],
  snapshot: Pick<SnapshotInstance, "tokenStorage">,
  response: LoginResponse | Record<string, unknown>,
): void {
  if (authMode === "cookie") {
    return;
  }

  const token =
    typeof response["token"] === "string" ? response["token"] : null;
  const refreshToken =
    typeof response["refreshToken"] === "string"
      ? response["refreshToken"]
      : null;

  if (token) {
    snapshot.tokenStorage.set(token);
  }

  if (refreshToken) {
    snapshot.tokenStorage.setRefreshToken(refreshToken);
  }
}

function AuthShell({
  manifest,
  screen,
  children,
}: {
  manifest: CompiledManifest;
  screen: AuthScreen;
  children: React.ReactNode;
}) {
  const branding = manifest.auth?.branding;
  const title =
    branding?.title ??
    (
      {
        login: "Sign in",
        register: "Create account",
        "forgot-password": "Forgot password",
        "reset-password": "Reset password",
        "verify-email": "Verify email",
        mfa: "Two-factor verification",
      } as const
    )[screen];
  const description =
    branding?.description ??
    (
      {
        login: "Sign in to continue.",
        register: "Create your account to get started.",
        "forgot-password": "Enter your email and we will send a reset link.",
        "reset-password": "Choose a new password for your account.",
        "verify-email": "Confirm your email address to finish setup.",
        mfa: "Enter the verification code from your authentication method.",
      } as const
    )[screen];

  return (
    <main
      data-snapshot-auth-screen={screen}
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
        background:
          "linear-gradient(180deg, rgba(247,248,250,1) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "28rem",
          background: "#fff",
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: "1rem",
          boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
          padding: "1.5rem",
        }}
      >
        {branding?.logo ? (
          <img
            src={branding.logo}
            alt={branding.title ?? "Brand logo"}
            style={{ height: "2.5rem", width: "auto", marginBottom: "1rem" }}
          />
        ) : null}
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{title}</h1>
        <p
          style={{
            color: "#475569",
            marginTop: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {description}
        </p>
        {children}
      </section>
    </main>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        marginBottom: "0.875rem",
      }}
    >
      <span style={{ fontSize: "0.925rem", fontWeight: 600 }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.currentTarget.value)}
        style={{
          border: "1px solid rgba(15,23,42,0.14)",
          borderRadius: "0.75rem",
          padding: "0.75rem 0.875rem",
          fontSize: "1rem",
        }}
      />
    </label>
  );
}

function ErrorMessage({
  error,
  formatError,
  context,
}: {
  error: ApiError | null;
  formatError: (error: ApiError, context: AuthErrorContext) => string;
  context: AuthErrorContext;
}) {
  if (!error) {
    return null;
  }

  return (
    <p
      role="alert"
      style={{
        color: "#b91c1c",
        marginTop: 0,
        marginBottom: "0.875rem",
        fontSize: "0.925rem",
      }}
    >
      {formatError(error, context)}
    </p>
  );
}

function SuccessMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p
      style={{
        color: "#166534",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "0.75rem",
        padding: "0.75rem 0.875rem",
        marginTop: 0,
        marginBottom: "0.875rem",
        fontSize: "0.925rem",
      }}
    >
      {message}
    </p>
  );
}

function ActionsRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginTop: "1rem",
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        border: 0,
        borderRadius: "0.75rem",
        padding: "0.85rem 1rem",
        fontSize: "1rem",
        fontWeight: 600,
        background: disabled ? "#94a3b8" : "#0f172a",
        color: "#fff",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        width: "100%",
        borderRadius: "0.75rem",
        padding: "0.85rem 1rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.14)",
        color: "#0f172a",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function LinksRow({
  items,
  navigate,
}: {
  items: Array<{ label: string; path: string }>;
  navigate: (to: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        marginTop: "1rem",
      }}
    >
      {items.map((item) => (
        <button
          key={item.path}
          type="button"
          onClick={() => navigate(item.path)}
          style={{
            textAlign: "left",
            background: "transparent",
            border: 0,
            color: "#475569",
            padding: 0,
            cursor: "pointer",
            fontSize: "0.925rem",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function OAuthButtons({
  providers,
  getOAuthUrl,
}: {
  providers: OAuthProvider[];
  getOAuthUrl: (provider: OAuthProvider) => string;
}) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <div
        style={{
          position: "relative",
          marginBottom: "1rem",
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.825rem",
        }}
      >
        Continue with a provider
      </div>
      <div style={{ display: "grid", gap: "0.625rem" }}>
        {providers.map((provider) => (
          <SecondaryButton
            key={provider}
            onClick={() => {
              window.location.href = getOAuthUrl(provider);
            }}
          >
            Continue with {provider[0]?.toUpperCase()}
            {provider.slice(1)}
          </SecondaryButton>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({
  manifest,
  snapshot,
  runtimeConfig,
  navigate,
  setPendingChallenge,
}: {
  manifest: CompiledManifest;
  snapshot: ManifestAuthScreenProps["snapshot"];
  runtimeConfig: ManifestAuthRuntimeConfig;
  navigate: (to: string) => void;
  setPendingChallenge: (challenge: MfaChallenge | null) => void;
}) {
  const applyAuthenticatedUser = useApplyAuthenticatedUser(manifest);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginPath = inferAuthScreenPath(manifest, "login");
  const registerPath = inferAuthScreenPath(manifest, "register");
  const forgotPasswordPath = inferAuthScreenPath(manifest, "forgot-password");
  const mfaPath = inferAuthScreenPath(manifest, "mfa");
  const mutation = useMutation<
    { type: "user"; user: AuthUser } | { type: "mfa"; challenge: MfaChallenge },
    ApiError,
    { email: string; password: string }
  >({
    mutationFn: async (body) => {
      const response = await snapshot.api.post<LoginResponse>(
        runtimeConfig.contract.endpoints.login,
        body,
      );

      if (response.mfaRequired && response.mfaToken) {
        return {
          type: "mfa",
          challenge: {
            mfaToken: response.mfaToken,
            mfaMethods: response.mfaMethods ?? [],
          },
        };
      }

      applyAuthTokens(runtimeConfig.authMode, snapshot, response);
      const user = await snapshot.api.get<AuthUser>(
        runtimeConfig.contract.endpoints.me,
      );
      return { type: "user", user };
    },
    onSuccess: (result) => {
      if (result.type === "mfa") {
        setPendingChallenge(result.challenge);
        if (mfaPath) {
          navigate(mfaPath);
        }
        return;
      }

      setPendingChallenge(null);
      applyAuthenticatedUser(result.user);
      snapshot.queryClient.setQueryData(AUTH_QUERY_KEY, result.user);
      navigate(resolveHomePath(manifest));
    },
  });

  return (
    <AuthShell manifest={manifest} screen="login">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({ email, password });
        }}
      >
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
        />
        <ErrorMessage
          error={mutation.error ?? null}
          formatError={snapshot.formatAuthError}
          context="login"
        />
        <PrimaryButton
          type="submit"
          disabled={
            mutation.isPending || email.length === 0 || password.length === 0
          }
        >
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </PrimaryButton>
      </form>
      <OAuthButtons
        providers={manifest.auth?.providers ?? []}
        getOAuthUrl={snapshot.getOAuthUrl}
      />
      {manifest.auth?.passkey ? (
        <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.9rem" }}>
          Passkey sign-in can be enabled from the Snapshot auth runtime.
        </p>
      ) : null}
      <LinksRow
        items={[
          ...(registerPath && registerPath !== loginPath
            ? [{ label: "Create account", path: registerPath }]
            : []),
          ...(forgotPasswordPath && forgotPasswordPath !== loginPath
            ? [{ label: "Forgot password?", path: forgotPasswordPath }]
            : []),
        ]}
        navigate={navigate}
      />
    </AuthShell>
  );
}

function RegisterScreen({
  manifest,
  snapshot,
  runtimeConfig,
  navigate,
}: {
  manifest: CompiledManifest;
  snapshot: ManifestAuthScreenProps["snapshot"];
  runtimeConfig: ManifestAuthRuntimeConfig;
  navigate: (to: string) => void;
}) {
  const applyAuthenticatedUser = useApplyAuthenticatedUser(manifest);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const loginPath = inferAuthScreenPath(manifest, "login");
  const mutation = useMutation<AuthUser, ApiError, RegisterVars>({
    mutationFn: async (body) => {
      const response = await snapshot.api.post<Record<string, unknown>>(
        runtimeConfig.contract.endpoints.register,
        body,
      );
      applyAuthTokens(runtimeConfig.authMode, snapshot, response);
      return snapshot.api.get<AuthUser>(runtimeConfig.contract.endpoints.me);
    },
    onSuccess: (user) => {
      applyAuthenticatedUser(user);
      snapshot.queryClient.setQueryData(AUTH_QUERY_KEY, user);
      navigate(resolveHomePath(manifest));
    },
  });

  return (
    <AuthShell manifest={manifest} screen="register">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({ email, password, name });
        }}
      >
        <Field
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
        />
        <ErrorMessage
          error={mutation.error ?? null}
          formatError={snapshot.formatAuthError}
          context="register"
        />
        <PrimaryButton
          type="submit"
          disabled={
            mutation.isPending || email.length === 0 || password.length === 0
          }
        >
          {mutation.isPending ? "Creating account..." : "Create account"}
        </PrimaryButton>
      </form>
      <LinksRow
        items={
          loginPath
            ? [{ label: "Already have an account? Sign in", path: loginPath }]
            : []
        }
        navigate={navigate}
      />
    </AuthShell>
  );
}

function ForgotPasswordScreen({
  manifest,
  snapshot,
  runtimeConfig,
  navigate,
}: {
  manifest: CompiledManifest;
  snapshot: ManifestAuthScreenProps["snapshot"];
  runtimeConfig: ManifestAuthRuntimeConfig;
  navigate: (to: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const loginPath = inferAuthScreenPath(manifest, "login");
  const mutation = useMutation<
    { message?: string } | void,
    ApiError,
    { email: string }
  >({
    mutationFn: (body) =>
      snapshot.api.post<{ message?: string } | void>(
        runtimeConfig.contract.endpoints.forgotPassword,
        body,
      ),
    onSuccess: (data) => {
      setMessage(
        data && typeof data === "object" && typeof data["message"] === "string"
          ? String(data["message"])
          : "If that email is registered, you will receive a reset link shortly.",
      );
    },
  });

  return (
    <AuthShell manifest={manifest} screen="forgot-password">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(null);
          mutation.mutate({ email });
        }}
      >
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />
        <SuccessMessage message={message} />
        <ErrorMessage
          error={mutation.error ?? null}
          formatError={snapshot.formatAuthError}
          context="forgot-password"
        />
        <PrimaryButton
          type="submit"
          disabled={mutation.isPending || email.length === 0}
        >
          {mutation.isPending ? "Sending reset link..." : "Send reset link"}
        </PrimaryButton>
      </form>
      <LinksRow
        items={loginPath ? [{ label: "Back to sign in", path: loginPath }] : []}
        navigate={navigate}
      />
    </AuthShell>
  );
}

function ResetPasswordScreen({
  manifest,
  snapshot,
  runtimeConfig,
  navigate,
}: {
  manifest: CompiledManifest;
  snapshot: ManifestAuthScreenProps["snapshot"];
  runtimeConfig: ManifestAuthRuntimeConfig;
  navigate: (to: string) => void;
}) {
  const search = useLocationSearch();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const token = search.get("token") ?? "";
  const loginPath = inferAuthScreenPath(manifest, "login");
  const mutation = useMutation<
    { message?: string },
    ApiError,
    ResetPasswordBody
  >({
    mutationFn: (body) =>
      snapshot.api.post<{ message?: string }>(
        runtimeConfig.contract.endpoints.resetPassword,
        body,
      ),
    onSuccess: (data) => {
      setMessage(data.message ?? "Your password has been reset.");
    },
  });

  return (
    <AuthShell manifest={manifest} screen="reset-password">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!token) {
            return;
          }
          setMessage(null);
          mutation.mutate({ token, password });
        }}
      >
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a new password"
        />
        {!token ? (
          <p role="alert" style={{ color: "#b91c1c", marginTop: 0 }}>
            This reset link is missing a token.
          </p>
        ) : null}
        <SuccessMessage message={message} />
        <ErrorMessage
          error={mutation.error ?? null}
          formatError={snapshot.formatAuthError}
          context="reset-password"
        />
        <PrimaryButton
          type="submit"
          disabled={
            mutation.isPending || password.length === 0 || token.length === 0
          }
        >
          {mutation.isPending ? "Resetting password..." : "Reset password"}
        </PrimaryButton>
      </form>
      <ActionsRow>
        {loginPath ? (
          <SecondaryButton onClick={() => navigate(loginPath)}>
            Back to sign in
          </SecondaryButton>
        ) : null}
      </ActionsRow>
    </AuthShell>
  );
}

function VerifyEmailScreen({
  manifest,
  snapshot,
  runtimeConfig,
  navigate,
}: {
  manifest: CompiledManifest;
  snapshot: ManifestAuthScreenProps["snapshot"];
  runtimeConfig: ManifestAuthRuntimeConfig;
  navigate: (to: string) => void;
}) {
  const search = useLocationSearch();
  const [message, setMessage] = useState<string | null>(null);
  const token = search.get("token") ?? "";
  const loginPath = inferAuthScreenPath(manifest, "login");
  const hasTriggeredRef = useRef(false);
  const mutation = useMutation<{ message?: string }, ApiError, VerifyEmailBody>(
    {
      mutationFn: (body) =>
        snapshot.api.post<{ message?: string }>(
          runtimeConfig.contract.endpoints.verifyEmail,
          body,
        ),
      onSuccess: (data) => {
        setMessage(data.message ?? "Your email has been verified.");
      },
    },
  );

  useEffect(() => {
    if (!token || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    mutation.mutate({ token });
  }, [mutation, token]);

  return (
    <AuthShell manifest={manifest} screen="verify-email">
      {!token ? (
        <p role="alert" style={{ color: "#b91c1c", marginTop: 0 }}>
          This verification link is missing a token.
        </p>
      ) : null}
      <SuccessMessage message={message} />
      <ErrorMessage
        error={mutation.error ?? null}
        formatError={snapshot.formatAuthError}
        context="verify-email"
      />
      <ActionsRow>
        {loginPath ? (
          <PrimaryButton onClick={() => navigate(loginPath)}>
            Continue to sign in
          </PrimaryButton>
        ) : null}
      </ActionsRow>
    </AuthShell>
  );
}

function MfaScreen({
  manifest,
  snapshot,
  runtimeConfig,
  navigate,
  pendingChallenge,
  setPendingChallenge,
}: {
  manifest: CompiledManifest;
  snapshot: ManifestAuthScreenProps["snapshot"];
  runtimeConfig: ManifestAuthRuntimeConfig;
  navigate: (to: string) => void;
  pendingChallenge: MfaChallenge | null;
  setPendingChallenge: (challenge: MfaChallenge | null) => void;
}) {
  const applyAuthenticatedUser = useApplyAuthenticatedUser(manifest);
  const [code, setCode] = useState("");
  const [method, setMethod] = useState<MfaMethod>(
    pendingChallenge?.mfaMethods[0] ?? ("totp" as const),
  );
  const [message, setMessage] = useState<string | null>(null);
  const loginPath = inferAuthScreenPath(manifest, "login");
  const mutation = useMutation<
    AuthUser,
    ApiError,
    { code: string; method: string }
  >({
    mutationFn: async (body) => {
      if (!pendingChallenge) {
        throw new Error("No pending MFA challenge");
      }

      const response = await snapshot.api.post<LoginResponse>(
        runtimeConfig.contract.endpoints.mfaVerify,
        {
          mfaToken: pendingChallenge.mfaToken,
          code: body.code,
          method: body.method,
        },
      );

      applyAuthTokens(runtimeConfig.authMode, snapshot, response);
      return snapshot.api.get<AuthUser>(runtimeConfig.contract.endpoints.me);
    },
    onSuccess: (user) => {
      setPendingChallenge(null);
      applyAuthenticatedUser(user);
      snapshot.queryClient.setQueryData(AUTH_QUERY_KEY, user);
      navigate(resolveHomePath(manifest));
    },
  });
  const resendMutation = useMutation<{ message?: string }, ApiError, void>({
    mutationFn: async () => {
      if (!pendingChallenge) {
        throw new Error("No pending MFA challenge");
      }

      return snapshot.api.post<{ message?: string }>(
        runtimeConfig.contract.endpoints.mfaResend,
        {
          mfaToken: pendingChallenge.mfaToken,
        },
      );
    },
    onSuccess: (data) => {
      setMessage(data.message ?? "A new verification code has been sent.");
    },
  });

  useEffect(() => {
    if (pendingChallenge?.mfaMethods[0]) {
      setMethod(pendingChallenge.mfaMethods[0]);
    }
  }, [pendingChallenge]);

  return (
    <AuthShell manifest={manifest} screen="mfa">
      {!pendingChallenge ? (
        <>
          <p style={{ color: "#475569", marginTop: 0 }}>
            There is no active verification challenge.
          </p>
          <ActionsRow>
            {loginPath ? (
              <PrimaryButton onClick={() => navigate(loginPath)}>
                Back to sign in
              </PrimaryButton>
            ) : null}
          </ActionsRow>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            mutation.mutate({ code, method });
          }}
        >
          <Field
            label="Verification code"
            value={code}
            onChange={setCode}
            placeholder="Enter the code"
          />
          {pendingChallenge.mfaMethods.length > 1 ? (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.375rem",
                marginBottom: "0.875rem",
              }}
            >
              <span style={{ fontSize: "0.925rem", fontWeight: 600 }}>
                Method
              </span>
              <select
                value={method}
                onChange={(event) =>
                  setMethod(event.currentTarget.value as MfaMethod)
                }
                style={{
                  border: "1px solid rgba(15,23,42,0.14)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 0.875rem",
                  fontSize: "1rem",
                }}
              >
                {pendingChallenge.mfaMethods.map((candidate) => (
                  <option key={candidate} value={candidate}>
                    {candidate}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <SuccessMessage message={message} />
          <ErrorMessage
            error={(mutation.error as ApiError | null) ?? null}
            formatError={snapshot.formatAuthError}
            context="login"
          />
          <PrimaryButton
            type="submit"
            disabled={mutation.isPending || code.length === 0}
          >
            {mutation.isPending ? "Verifying..." : "Verify"}
          </PrimaryButton>
          {pendingChallenge.mfaMethods.includes("emailOtp") ? (
            <div style={{ marginTop: "0.75rem" }}>
              <SecondaryButton
                disabled={resendMutation.isPending}
                onClick={() => {
                  setMessage(null);
                  resendMutation.mutate();
                }}
              >
                {resendMutation.isPending ? "Sending..." : "Resend code"}
              </SecondaryButton>
            </div>
          ) : null}
        </form>
      )}
    </AuthShell>
  );
}

export function ManifestAuthScreen({
  manifest,
  route,
  screen,
  snapshot,
  runtimeConfig,
  navigate,
}: ManifestAuthScreenProps) {
  const [pendingChallenge, setPendingChallenge] = useState<MfaChallenge | null>(
    null,
  );

  switch (screen) {
    case "login":
      return (
        <LoginScreen
          manifest={manifest}
          snapshot={snapshot}
          runtimeConfig={runtimeConfig}
          navigate={navigate}
          setPendingChallenge={setPendingChallenge}
        />
      );
    case "register":
      return (
        <RegisterScreen
          manifest={manifest}
          snapshot={snapshot}
          runtimeConfig={runtimeConfig}
          navigate={navigate}
        />
      );
    case "forgot-password":
      return (
        <ForgotPasswordScreen
          manifest={manifest}
          snapshot={snapshot}
          runtimeConfig={runtimeConfig}
          navigate={navigate}
        />
      );
    case "reset-password":
      return (
        <ResetPasswordScreen
          manifest={manifest}
          snapshot={snapshot}
          runtimeConfig={runtimeConfig}
          navigate={navigate}
        />
      );
    case "verify-email":
      return (
        <VerifyEmailScreen
          manifest={manifest}
          snapshot={snapshot}
          runtimeConfig={runtimeConfig}
          navigate={navigate}
        />
      );
    case "mfa":
      return (
        <MfaScreen
          manifest={manifest}
          snapshot={snapshot}
          runtimeConfig={runtimeConfig}
          navigate={navigate}
          pendingChallenge={pendingChallenge}
          setPendingChallenge={setPendingChallenge}
        />
      );
    default:
      return route.page.content ? null : null;
  }
}

export function createManifestAuthRuntimeConfig(
  apiUrl: string,
  snapshotConfig?: Record<string, unknown>,
): ManifestAuthRuntimeConfig {
  const typedConfig = (snapshotConfig ?? {}) as Partial<SnapshotConfig>;
  return {
    authMode: typedConfig.auth ?? "cookie",
    contract: mergeContract(apiUrl, typedConfig.contract),
  };
}
