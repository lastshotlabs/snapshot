import type { ScaffoldConfig } from "../types";

export function generateSnapshotLib(config: ScaffoldConfig): string {
  const imports: string[] = ["createSnapshot", "createAuthPlugin"];
  const plugins: string[] = [];

  // Auth plugin
  const authConfigParts: string[] = [
    "    loginPath: '/auth/login',",
    "    homePath: '/',",
    "    forbiddenPath: '/403',",
  ];
  if (config.mfaPages) {
    authConfigParts.push("    mfaPath: '/auth/mfa-verify',");
    authConfigParts.push("    mfaSetupPath: '/mfa-setup',");
  }
  plugins.push(`  createAuthPlugin({\n${authConfigParts.join("\n")}\n  }),`);

  // WS plugin
  if (config.webSocket) {
    imports.push("createWsPlugin");
    plugins.push(`  createWsPlugin({
    url: import.meta.env.VITE_WS_URL,
    reconnectOnLogin: true,
    reconnectOnFocus: true,
  }),`);
  }

  // SSE plugin
  if (config.sse) {
    imports.push("createSsePlugin");
    plugins.push(`  createSsePlugin({
    endpoints: {},
  }),`);
  }

  // Community plugin
  if (config.communityPages) {
    imports.push("createCommunityPlugin");
    plugins.push("  createCommunityPlugin(),");
  }

  const bearerTokenLine =
    config.securityProfile === "prototype"
      ? `\n    bearerToken: import.meta.env.VITE_BEARER_TOKEN,`
      : "";

  // ── Build re-exports based on enabled features ─────────────────────────

  const exports: string[] = [
    "  // Core",
    "  useTheme,",
    "  QueryProvider,",
    "  api,",
    "  queryClient,",
    "  tokenStorage,",
    "",
    "  // Auth",
    "  useUser,",
    "  useLogin,",
    "  useLogout,",
    "  useRegister,",
    "  useForgotPassword,",
    "  useSetPassword,",
    "  useDeleteAccount,",
    "  useCancelDeletion,",
    "  useRefreshToken,",
    "  useSessions,",
    "  useRevokeSession,",
    "  getOAuthUrl,",
    "  getLinkUrl,",
    "  useOAuthUnlink,",
    "  formatAuthError,",
    "  protectedBeforeLoad,",
    "  guestBeforeLoad,",
    "  useMagicLinkRequest,",
    "  useMagicLinkVerify,",
    "  useReauthVerify,",
  ];

  if (config.mfaPages) {
    exports.push(
      "",
      "  // MFA",
      "  usePendingMfaChallenge,",
      "  isMfaChallenge,",
      "  useMfaVerify,",
      "  useMfaSetup,",
      "  useMfaVerifySetup,",
      "  useMfaDisable,",
      "  useMfaRecoveryCodes,",
      "  useMfaResend,",
      "  useMfaMethods,",
      "  useMfaEmailOtpEnable,",
      "  useMfaEmailOtpVerifySetup,",
      "  useMfaEmailOtpDisable,",
    );
  }

  if (config.passkeyPages) {
    exports.push(
      "",
      "  // Passkeys / WebAuthn",
      "  usePasskeyLoginOptions,",
      "  usePasskeyLogin,",
      "  useWebAuthnRegisterOptions,",
      "  useWebAuthnRegister,",
      "  useWebAuthnCredentials,",
      "  useWebAuthnRemoveCredential,",
      "  useWebAuthnDisable,",
    );
  }

  if (config.webSocket) {
    exports.push(
      "",
      "  // WebSocket",
      "  useSocket,",
      "  useRoom,",
      "  useRoomEvent,",
      "  useWebSocketManager,",
    );
  }

  if (config.sse) {
    exports.push("", "  // SSE", "  useSSE,", "  useSseEvent,");
  }

  if (config.communityPages) {
    exports.push(
      "",
      "  // Community",
      "  useContainers,",
      "  useContainer,",
      "  useContainerThreads,",
      "  useContainerThread,",
      "  useCreateContainer,",
      "  useUpdateContainer,",
      "  useDeleteContainer,",
      "  useCreateThread,",
      "  useUpdateThread,",
      "  useDeleteThread,",
      "  usePublishThread,",
      "  useLockThread,",
      "  usePinThread,",
      "  useUnpinThread,",
      "  useThreadReplies,",
      "  useReply,",
      "  useCreateReply,",
      "  useUpdateReply,",
      "  useDeleteReply,",
      "  useThreadReactions,",
      "  useReplyReactions,",
      "  useAddThreadReaction,",
      "  useRemoveThreadReaction,",
      "  useAddReplyReaction,",
      "  useRemoveReplyReaction,",
      "  useContainerMembers,",
      "  useContainerModerators,",
      "  useContainerOwners,",
      "  useAddMember,",
      "  useRemoveMember,",
      "  useAssignModerator,",
      "  useRemoveModerator,",
      "  useAssignOwner,",
      "  useRemoveOwner,",
      "  useNotifications,",
      "  useNotificationsUnreadCount,",
      "  useMarkNotificationRead,",
      "  useMarkAllNotificationsRead,",
      "  useReports,",
      "  useReport,",
      "  useCreateReport,",
      "  useResolveReport,",
      "  useDismissReport,",
      "  useBans,",
      "  useCheckBan,",
      "  useCreateBan,",
      "  useRemoveBan,",
      "  useSearchThreads,",
      "  useSearchReplies,",
    );
  }

  return `import { ${imports.join(", ")} } from '@lastshotlabs/snapshot'

export const snapshot = createSnapshot(
  {
    apiUrl: import.meta.env.VITE_API_URL,${bearerTokenLine}
  },
${plugins.join("\n")}
)

export const {
${exports.join("\n")}
} = snapshot
`;
}
