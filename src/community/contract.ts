/**
 * Built-in route contract for Snapshot community APIs.
 *
 * The hooks consume this object directly, so the exported contract and the
 * requests sent by Snapshot cannot drift independently.
 */
export const communityContract = {
  // ── Containers ──────────────────────────────────────────────────────────────
  listContainers: { method: "GET", path: "/community/containers" },
  getContainer: {
    method: "GET",
    path: "/community/containers/:containerId",
  },
  createContainer: { method: "POST", path: "/community/containers" },
  updateContainer: {
    method: "PATCH",
    path: "/community/containers/:containerId",
  },
  deleteContainer: {
    method: "DELETE",
    path: "/community/containers/:containerId",
  },

  // ── Threads ─────────────────────────────────────────────────────────────────
  listThreads: {
    method: "GET",
    path: "/community/threads/list-by-container/:containerId",
  },
  getThread: { method: "GET", path: "/community/threads/:threadId" },
  createThread: { method: "POST", path: "/community/threads" },
  updateThread: { method: "PATCH", path: "/community/threads/:threadId" },
  deleteThread: { method: "DELETE", path: "/community/threads/:threadId" },
  publishThread: { method: "POST", path: "/community/threads/publish" },
  lockThread: { method: "POST", path: "/community/threads/lock" },
  unlockThread: { method: "POST", path: "/community/threads/unlock" },
  pinThread: { method: "POST", path: "/community/threads/pin" },
  unpinThread: { method: "POST", path: "/community/threads/unpin" },

  // ── Replies ─────────────────────────────────────────────────────────────────
  listReplies: {
    method: "GET",
    path: "/community/replies/list-by-thread/:threadId",
  },
  getReply: { method: "GET", path: "/community/replies/:replyId" },
  createReply: { method: "POST", path: "/community/replies" },
  updateReply: { method: "PATCH", path: "/community/replies/:replyId" },
  deleteReply: { method: "DELETE", path: "/community/replies/:replyId" },

  // ── Reactions ───────────────────────────────────────────────────────────────
  threadReactions: {
    method: "GET",
    path: "/community/reactions/list-by-target/:threadId/thread",
  },
  replyReactions: {
    method: "GET",
    path: "/community/reactions/list-by-target/:replyId/reply",
  },
  addThreadReaction: { method: "POST", path: "/community/reactions" },
  addReplyReaction: { method: "POST", path: "/community/reactions" },
  removeThreadReaction: {
    method: "DELETE",
    path: "/community/reactions/:reactionId",
  },
  removeReplyReaction: {
    method: "DELETE",
    path: "/community/reactions/:reactionId",
  },

  // ── Members / Roles ─────────────────────────────────────────────────────────
  listMembers: { method: "GET", path: "/community/container-members" },
  addMember: { method: "POST", path: "/community/container-members" },
  removeMember: {
    method: "DELETE",
    path: "/community/container-members/:membershipId",
  },
  listModerators: {
    method: "GET",
    path: "/community/container-members/list-by-role/:containerId/moderator",
  },
  listOwners: {
    method: "GET",
    path: "/community/container-members/list-by-role/:containerId/owner",
  },
  assignModerator: {
    method: "POST",
    path: "/community/container-members/assign-role",
  },
  removeModerator: {
    method: "POST",
    path: "/community/container-members/assign-role",
  },
  assignOwner: {
    method: "POST",
    path: "/community/container-members/assign-role",
  },
  removeOwner: {
    method: "POST",
    path: "/community/container-members/assign-role",
  },

  // ── Notifications ───────────────────────────────────────────────────────────
  listNotifications: {
    method: "GET",
    path: "/notifications/notifications",
  },
  getNotificationsUnreadCount: {
    method: "POST",
    path: "/notifications/notifications/unseen-count",
  },
  markAllNotificationsSeen: {
    method: "POST",
    path: "/notifications/notifications/mark-all-seen",
  },
  markNotificationRead: {
    method: "POST",
    path: "/notifications/notifications/mark-read",
  },
  markAllNotificationsRead: {
    method: "POST",
    path: "/notifications/notifications/mark-all-read",
  },
  dismissNotification: {
    method: "DELETE",
    path: "/notifications/notifications/:notificationId",
  },

  // ── Reports ─────────────────────────────────────────────────────────────────
  listReports: { method: "GET", path: "/community/reports" },
  getReport: { method: "GET", path: "/community/reports/:reportId" },
  createReport: { method: "POST", path: "/community/reports" },
  resolveReport: {
    method: "POST",
    path: "/community/reports/:reportId/resolve",
  },
  dismissReport: {
    method: "POST",
    path: "/community/reports/:reportId/dismiss",
  },

  // ── Bans ────────────────────────────────────────────────────────────────────
  listBans: { method: "GET", path: "/community/bans" },
  // Ban checks are derived client-side from a filtered list because the
  // backend's dedicated check operation is disabled.
  checkBan: { method: "GET", path: "/community/bans" },
  createBan: { method: "POST", path: "/community/bans" },
  deleteBan: { method: "DELETE", path: "/community/bans/:banId" },

  // ── Search ──────────────────────────────────────────────────────────────────
  searchThreads: { method: "GET", path: "/community/threads/search" },
  searchReplies: { method: "GET", path: "/community/replies/search" },
} as const;

type CommunityRoute =
  (typeof communityContract)[keyof typeof communityContract];

/**
 * Resolve a community contract path template with URL-encoded path params.
 *
 * @param route - One route entry from {@link communityContract}.
 * @param params - Values for every `:param` segment in the route path.
 * @returns The resolved request path.
 * @throws When a required path parameter is missing.
 */
export function communityPath(
  route: CommunityRoute,
  params: Readonly<Record<string, string>> = {},
): string {
  return route.path.replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_match, name) => {
    const value = params[name];
    if (value === undefined) {
      throw new Error(`Missing community route parameter: ${name}`);
    }
    return encodeURIComponent(value);
  });
}
