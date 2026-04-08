import type { ScaffoldConfig } from "../types";

export function generateSnapshotLib(config: ScaffoldConfig): string {
  const wsConfig = config.webSocket
    ? `
  ws: {
    url: import.meta.env.VITE_WS_URL,
    reconnectOnLogin: true,
    reconnectOnFocus: true,
  },`
    : "";

  const sseConfig = config.sse
    ? `\n  sse: {\n    // Add /__sse/ endpoint keys here. Example: '/__sse/feed': true\n    endpoints: {},\n  },`
    : "";

  const mfaConfig = config.mfaPages
    ? `
  mfaPath: '/auth/mfa-verify',
  mfaSetupPath: '/mfa-setup',`
    : "";

  const wsExports = config.webSocket
    ? `  useSocket,
  useRoom,
  useRoomEvent,
  useWebSocketManager,`
    : "";

  const mfaExports = config.mfaPages
    ? `  useMfaVerify,
  useMfaSetup,
  useMfaVerifySetup,
  useMfaDisable,
  useMfaRecoveryCodes,
  useMfaResend,
  useMfaMethods,
  useMfaEmailOtpEnable,
  useMfaEmailOtpVerifySetup,
  useMfaEmailOtpDisable,
  usePendingMfaChallenge,
  isMfaChallenge,
  useWebAuthnRegisterOptions,
  useWebAuthnRegister,
  useWebAuthnCredentials,
  useWebAuthnRemoveCredential,
  useWebAuthnDisable,`
    : "";

  const authPageExports = config.authPages
    ? `  useResetPassword,
  useVerifyEmail,
  useResendVerification,`
    : "";

  const bearerTokenLine =
    config.securityProfile === "prototype"
      ? `\n  // WARNING: Static API credentials are not supported in production browser deployments.\n  bearerToken: import.meta.env.VITE_BEARER_TOKEN,`
      : "";

  const oauthExchangeExport =
    config.securityProfile === "prototype" ? `  useOAuthExchange,\n` : "";

  const passkeyExports = config.passkeyPages
    ? `  usePasskeyLoginOptions,\n  usePasskeyLogin,\n`
    : "";

  const communityExports = config.communityPages
    ? `  useContainers,\n  useContainer,\n  useContainerThreads,\n  useContainerThread,\n  useCreateContainer,\n  useUpdateContainer,\n  useDeleteContainer,\n  useCreateThread,\n  useUpdateThread,\n  useDeleteThread,\n  usePublishThread,\n  useLockThread,\n  usePinThread,\n  useUnpinThread,\n  useThreadReplies,\n  useReply,\n  useCreateReply,\n  useUpdateReply,\n  useDeleteReply,\n  useThreadReactions,\n  useReplyReactions,\n  useAddThreadReaction,\n  useRemoveThreadReaction,\n  useAddReplyReaction,\n  useRemoveReplyReaction,\n  useContainerMembers,\n  useContainerModerators,\n  useContainerOwners,\n  useAddMember,\n  useRemoveMember,\n  useAssignModerator,\n  useRemoveModerator,\n  useAssignOwner,\n  useRemoveOwner,\n  useNotifications,\n  useNotificationsUnreadCount,\n  useMarkNotificationRead,\n  useMarkAllNotificationsRead,\n  useReports,\n  useReport,\n  useCreateReport,\n  useResolveReport,\n  useDismissReport,\n  useBans,\n  useCheckBan,\n  useCreateBan,\n  useRemoveBan,\n  useSearchThreads,\n  useSearchReplies,`
    : "";

  const sseExports = config.sse ? `  useSSE,\n  useSseEvent,` : "";

  return `import { createSnapshot } from '@lastshotlabs/snapshot'

export const snapshot = createSnapshot({
  apiUrl: import.meta.env.VITE_API_URL,${bearerTokenLine}
  loginPath: '/auth/login',
  homePath: '/',
  forbiddenPath: '/403',${wsConfig}${sseConfig}${mfaConfig}
})

export const {
  useUser,
  useLogin,
  useLogout,
  useRegister,
  useForgotPassword,
${passkeyExports}${wsExports}
${sseExports}
${mfaExports}
${authPageExports}
  useSetPassword,
  useDeleteAccount,
  useCancelDeletion,
  useRefreshToken,
  useSessions,
  useRevokeSession,
${oauthExchangeExport}  getOAuthUrl,
  getLinkUrl,
  useOAuthUnlink,
  useTheme,
  formatAuthError,
  useCommunityNotifications,
${communityExports}
  protectedBeforeLoad,
  guestBeforeLoad,
  QueryProvider,
  api,
  queryClient,
  tokenStorage,
} = snapshot
`;
}
