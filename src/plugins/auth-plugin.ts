import type { UseMutationResult } from "@tanstack/react-query";
import { atom, useAtomValue } from "jotai";
import type { WritableAtom } from "jotai";
import type { ApiError } from "../api/error";
import { createAccountHooks } from "../auth/account-hooks";
import { mergeContract } from "../auth/contract";
import type { AuthContract } from "../auth/contract";
import { createAuthErrorFormatter } from "../auth/error-format";
import { createAuthHooks } from "../auth/hooks";
import { createMfaHooks } from "../auth/mfa-hooks";
import { createOAuthHooks } from "../auth/oauth-hooks";
import type { TokenStorage } from "../auth/storage";
import { createWebAuthnHooks } from "../auth/webauthn-hooks";
import { createLoaders } from "../routing/loaders";
import { isMfaChallenge } from "../types";
import type {
  AuthContractConfig,
  AuthErrorConfig,
  AuthErrorContext,
  AuthUser,
  DeleteAccountBody,
  ForgotPasswordBody,
  LoginResult,
  LoginVars,
  LogoutVars,
  MagicLinkRequestBody,
  MagicLinkVerifyBody,
  MfaChallenge,
  MfaDisableBody,
  MfaEmailOtpDisableBody,
  MfaEmailOtpEnableResponse,
  MfaEmailOtpVerifySetupBody,
  MfaMethod,
  MfaRecoveryCodesBody,
  MfaRecoveryCodesResponse,
  MfaResendBody,
  MfaSetupResponse,
  MfaVerifyBody,
  MfaVerifySetupBody,
  MfaVerifySetupResponse,
  OAuthProvider,
  PasskeyLoginOptionsBody,
  PasskeyLoginOptionsResponse,
  PasskeyLoginVars,
  ReauthVerifyBody,
  ReauthVerifyResponse,
  RefreshTokenBody,
  RefreshTokenResponse,
  RegisterVars,
  ResendVerificationBody,
  ResetPasswordBody,
  Session,
  SetPasswordBody,
  VerifyEmailBody,
  WebAuthnCredential,
  WebAuthnRegisterBody,
  WebAuthnRegisterOptionsResponse,
} from "../types";
import type { SnapshotPlugin, SnapshotPluginContext } from "./types";

// ── Auth plugin config ───────────────────────────────────────────────────────

export interface AuthPluginConfig {
  loginPath?: string;
  homePath?: string;
  forbiddenPath?: string;
  mfaPath?: string;
  mfaSetupPath?: string;
  onUnauthenticated?: () => void;
  onForbidden?: () => void;
  onLogoutSuccess?: () => void;
  authErrors?: AuthErrorConfig;
  contract?: AuthContractConfig;
}

// ── Shared state ─────────────────────────────────────────────────────────────

export interface AuthSharedState {
  pendingMfaChallengeAtom: WritableAtom<MfaChallenge | null, [MfaChallenge | null], void>;
  contract: AuthContract;
  tokenStorage: TokenStorage;
}

export const AUTH_SHARED_KEY = "auth" as const;

// ── Auth plugin hooks type ───────────────────────────────────────────────────

export interface AuthPluginHooks {
  useUser: () => {
    user: AuthUser | null;
    isLoading: boolean;
    isError: boolean;
  };
  useLogin: () => UseMutationResult<LoginResult, ApiError, LoginVars>;
  useLogout: () => UseMutationResult<void, ApiError, LogoutVars | void>;
  useRegister: () => UseMutationResult<AuthUser, ApiError, RegisterVars>;
  useForgotPassword: () => UseMutationResult<void, ApiError, ForgotPasswordBody>;

  usePendingMfaChallenge: () => MfaChallenge | null;
  useMfaVerify: () => UseMutationResult<AuthUser, ApiError, Omit<MfaVerifyBody, "mfaToken">>;
  useMfaSetup: () => UseMutationResult<MfaSetupResponse, ApiError, void>;
  useMfaVerifySetup: () => UseMutationResult<MfaVerifySetupResponse, ApiError, MfaVerifySetupBody>;
  useMfaDisable: () => UseMutationResult<{ message: string }, ApiError, MfaDisableBody>;
  useMfaRecoveryCodes: () => UseMutationResult<
    MfaRecoveryCodesResponse,
    ApiError,
    MfaRecoveryCodesBody
  >;
  useMfaEmailOtpEnable: () => UseMutationResult<MfaEmailOtpEnableResponse, ApiError, void>;
  useMfaEmailOtpVerifySetup: () => UseMutationResult<
    MfaVerifySetupResponse,
    ApiError,
    MfaEmailOtpVerifySetupBody
  >;
  useMfaEmailOtpDisable: () => UseMutationResult<
    { message: string },
    ApiError,
    MfaEmailOtpDisableBody
  >;
  useMfaResend: () => UseMutationResult<{ message: string }, ApiError, MfaResendBody>;
  useMfaMethods: () => {
    methods: MfaMethod[] | null;
    isLoading: boolean;
    isError: boolean;
  };
  isMfaChallenge: typeof isMfaChallenge;

  useResetPassword: () => UseMutationResult<{ message: string }, ApiError, ResetPasswordBody>;
  useVerifyEmail: () => UseMutationResult<{ message: string }, ApiError, VerifyEmailBody>;
  useResendVerification: () => UseMutationResult<
    { message: string },
    ApiError,
    ResendVerificationBody
  >;
  useSetPassword: () => UseMutationResult<{ message: string }, ApiError, SetPasswordBody>;
  useDeleteAccount: () => UseMutationResult<void, ApiError, DeleteAccountBody | void>;
  useCancelDeletion: () => UseMutationResult<{ message: string }, ApiError, void>;
  useRefreshToken: () => UseMutationResult<RefreshTokenResponse, ApiError, RefreshTokenBody | void>;
  useSessions: () => {
    sessions: Session[];
    isLoading: boolean;
    isError: boolean;
  };
  useRevokeSession: () => UseMutationResult<void, ApiError, string>;
  useMagicLinkRequest: () => UseMutationResult<{ message: string }, ApiError, MagicLinkRequestBody>;
  useMagicLinkVerify: () => UseMutationResult<{ token: string }, ApiError, MagicLinkVerifyBody>;
  useReauthVerify: () => UseMutationResult<ReauthVerifyResponse, ApiError, ReauthVerifyBody>;

  useOAuthUnlink: () => UseMutationResult<void, ApiError, OAuthProvider>;
  getOAuthUrl: (provider: OAuthProvider) => string;
  getLinkUrl: (provider: OAuthProvider) => string;

  useWebAuthnRegisterOptions: () => UseMutationResult<
    WebAuthnRegisterOptionsResponse,
    ApiError,
    void
  >;
  useWebAuthnRegister: () => UseMutationResult<{ message: string }, ApiError, WebAuthnRegisterBody>;
  useWebAuthnCredentials: () => {
    credentials: WebAuthnCredential[];
    isLoading: boolean;
    isError: boolean;
  };
  useWebAuthnRemoveCredential: () => UseMutationResult<{ message: string }, ApiError, string>;
  useWebAuthnDisable: () => UseMutationResult<{ message: string }, ApiError, void>;
  usePasskeyLoginOptions: () => UseMutationResult<
    PasskeyLoginOptionsResponse,
    ApiError,
    PasskeyLoginOptionsBody
  >;
  usePasskeyLogin: () => UseMutationResult<LoginResult, ApiError, PasskeyLoginVars>;

  formatAuthError: (error: ApiError, context: AuthErrorContext) => string;
  protectedBeforeLoad: (ctx: {
    context: { queryClient: import("@tanstack/react-query").QueryClient };
  }) => Promise<void>;
  guestBeforeLoad: (ctx: {
    context: { queryClient: import("@tanstack/react-query").QueryClient };
  }) => Promise<void>;
}

// ── Factory ──────────────────────────────────────────────────────────────────

export function createAuthPlugin(
  pluginConfig: AuthPluginConfig = {},
): SnapshotPlugin<AuthPluginHooks> {
  return {
    name: "auth",

    setup(ctx: SnapshotPluginContext) {
      const contract = mergeContract(ctx.config.apiUrl, pluginConfig.contract);
      const pendingMfaChallengeAtom = atom<MfaChallenge | null>(null);

      // Configure the shared API client with auth concerns
      ctx.api.setContract(contract);
      ctx.api.setCallbacks({
        onUnauthenticated: pluginConfig.onUnauthenticated,
        onForbidden: pluginConfig.onForbidden,
        onMfaSetupRequired: pluginConfig.mfaSetupPath
          ? () => {
              window.location.href = pluginConfig.mfaSetupPath!;
            }
          : undefined,
      });

      ctx.shared.set(AUTH_SHARED_KEY, {
        pendingMfaChallengeAtom,
        contract,
        tokenStorage: ctx.tokenStorage,
      } satisfies AuthSharedState);
    },

    createHooks(ctx: SnapshotPluginContext): AuthPluginHooks {
      const { pendingMfaChallengeAtom, contract, tokenStorage } = ctx.shared.get(
        AUTH_SHARED_KEY,
      ) as AuthSharedState;

      // Cross-plugin callback dispatch — invokes all registered listeners
      const onLoginSuccess = () => {
        for (const cb of ctx.callbacks.onLoginSuccess) cb();
      };
      const onLogoutSuccess = () => {
        pluginConfig.onLogoutSuccess?.();
        for (const cb of ctx.callbacks.onLogoutSuccess) cb();
      };

      const configForAuth = {
        auth: ctx.config.auth,
        staleTime: ctx.config.staleTime,
        onUnauthenticated: pluginConfig.onUnauthenticated,
        loginPath: pluginConfig.loginPath,
        homePath: pluginConfig.homePath,
        mfaPath: pluginConfig.mfaPath,
        onLogoutSuccess: pluginConfig.onLogoutSuccess,
      };

      const authHooks = createAuthHooks({
        api: ctx.api,
        storage: tokenStorage,
        config: configForAuth,
        contract,
        pendingMfaChallengeAtom,
        onLoginSuccess,
        onLogoutSuccess,
      });

      const mfaHooks = createMfaHooks({
        api: ctx.api,
        storage: tokenStorage,
        config: {
          auth: ctx.config.auth,
          homePath: pluginConfig.homePath,
          staleTime: ctx.config.staleTime,
        },
        contract,
        pendingMfaChallengeAtom,
        onLoginSuccess,
      });

      const accountHooks = createAccountHooks({
        api: ctx.api,
        storage: tokenStorage,
        config: { loginPath: pluginConfig.loginPath },
        contract,
        onUnauthenticated: pluginConfig.onUnauthenticated,
        queryClient: ctx.queryClient,
      });

      const oauthHooks = createOAuthHooks({
        api: ctx.api,
        contract,
      });

      const webAuthnHooks = createWebAuthnHooks({
        api: ctx.api,
        storage: tokenStorage,
        config: {
          auth: ctx.config.auth,
          mfaPath: pluginConfig.mfaPath,
          homePath: pluginConfig.homePath,
        },
        contract,
        pendingMfaChallengeAtom,
        onLoginSuccess,
      });

      const { protectedBeforeLoad, guestBeforeLoad } = createLoaders(
        {
          loginPath: pluginConfig.loginPath,
          homePath: pluginConfig.homePath,
          forbiddenPath: pluginConfig.forbiddenPath,
          onUnauthenticated: pluginConfig.onUnauthenticated,
          staleTime: ctx.config.staleTime,
        },
        ctx.api,
        contract,
      );

      const formatAuthError = createAuthErrorFormatter(pluginConfig.authErrors);

      function usePendingMfaChallenge(): MfaChallenge | null {
        return useAtomValue(pendingMfaChallengeAtom);
      }

      return {
        ...authHooks,
        usePendingMfaChallenge,
        ...mfaHooks,
        ...accountHooks,
        ...oauthHooks,
        ...webAuthnHooks,
        isMfaChallenge,
        formatAuthError,
        protectedBeforeLoad,
        guestBeforeLoad,
      };
    },
  };
}
