import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import { ApiError as MemberApiError } from "../api/error";
import { communityContract, communityPath } from "./contract";
import type {
  ContainerResponse,
  CreateContainerBody,
  UpdateContainerBody,
  ThreadResponse,
  CreateThreadBody,
  UpdateThreadBody,
  ReplyResponse,
  CreateReplyBody,
  UpdateReplyBody,
  ReactionBody,
  ReactionResponse,
  ReportBody,
  ReportResponse,
  ResolveReportBody,
  BanBody,
  BanResponse,
  BanCheckResponse,
  PaginatedResponse,
  SearchResponse,
  NotificationResponse,
  ListParams,
  ThreadListParams,
  ReplyListParams,
  ThreadSearchParams,
  ReplySearchParams,
  MemberRecord,
  MemberListResponse,
} from "./types";

// ── Cache key helpers ──────────────────────────────────────────────────────────

/**
 * Query key helpers for the community API surface.
 *
 * SSR loaders can seed the QueryClient under these keys so loader-seeded keys
 * and hook-read keys stay aligned.
 */
export const communityKeys = {
  containers: () => ["community", "containers"] as const,
  container: (containerId: string) =>
    ["community", "containers", containerId] as const,
  threads: (containerId: string) =>
    ["community", "threads", containerId] as const,
  threadDetail: (threadId: string) =>
    ["community", "threads", "detail", threadId] as const,
  replies: (threadId: string) => ["community", "replies", threadId] as const,
  replyDetail: (replyId: string) =>
    ["community", "replies", "detail", replyId] as const,
  reports: () => ["community", "reports"] as const,
  report: (reportId: string) => ["community", "reports", reportId] as const,
  bans: () => ["community", "bans"] as const,
  banCheck: (userId: string, containerId?: string) =>
    ["community", "bans", userId, "check", containerId ?? null] as const,
  banCheckPrefix: (userId: string) =>
    ["community", "bans", userId, "check"] as const,
  notifications: () => ["community", "notifications"] as const,
  notificationsUnread: () => ["community", "notifications", "unread"] as const,
  members: (containerId: string) =>
    ["community", "members", containerId] as const,
  moderators: (containerId: string) =>
    ["community", "moderators", containerId] as const,
  owners: (containerId: string) =>
    ["community", "owners", containerId] as const,
  searchThreads: () => ["community", "search", "threads"] as const,
  searchReplies: () => ["community", "search", "replies"] as const,
};

// Local alias kept for the rest of this file (every existing reference uses `keys`).
const keys = communityKeys;

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create a complete set of React Query hooks for the community API surface.
 *
 * @param options - Factory configuration.
 * @param options.api - The API client used to make HTTP requests.
 * @param options.queryClient - The React Query client used for cache invalidation.
 * @returns An object containing all community hooks for containers, threads, replies, reactions, members, roles, notifications, reports, bans, and search.
 */
export function createCommunityHooks({
  api,
  queryClient: _qc,
}: {
  api: ApiClient;
  queryClient: QueryClient;
}) {
  /**
   * Build the `limit`/`cursor`/`sortDir` query string every Slingshot entity
   * `list` route accepts. Returns "" when nothing is set so the caller emits a
   * bare path rather than a dangling "?".
   */
  function listQuery(params?: ListParams): string {
    const qs = new URLSearchParams();
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.sortDir) qs.set("sortDir", params.sortDir);
    const s = qs.toString();
    return s ? `?${s}` : "";
  }

  // ── Containers ───────────────────────────────────────────────────────────────

  /** Fetch all community containers with optional pagination. */
  function useContainers(params?: ListParams) {
    const query = listQuery(params);
    return useQuery<PaginatedResponse<ContainerResponse>, ApiError>({
      queryKey: keys.containers(),
      queryFn: () =>
        api.get<PaginatedResponse<ContainerResponse>>(
          `${communityContract.listContainers.path}${query}`,
        ),
    });
  }

  /** Fetch a single community container by its ID. */
  function useContainer(containerId: string) {
    return useQuery<ContainerResponse, ApiError>({
      queryKey: keys.container(containerId),
      queryFn: () =>
        api.get<ContainerResponse>(
          communityPath(communityContract.getContainer, { containerId }),
        ),
      enabled: !!containerId,
    });
  }

  /** Create a new community container. */
  function useCreateContainer() {
    const queryClient = useQueryClient();
    return useMutation<ContainerResponse, ApiError, CreateContainerBody>({
      mutationFn: (body) =>
        api.post<ContainerResponse>(
          communityContract.createContainer.path,
          body,
        ),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.containers() });
      },
    });
  }

  /** Update an existing community container by its ID. */
  function useUpdateContainer() {
    const queryClient = useQueryClient();
    return useMutation<
      ContainerResponse,
      ApiError,
      { containerId: string } & UpdateContainerBody
    >({
      mutationFn: ({ containerId, ...body }) =>
        api.patch<ContainerResponse>(
          communityPath(communityContract.updateContainer, { containerId }),
          body,
        ),
      onSuccess: (_data, { containerId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.containers() });
        void queryClient.invalidateQueries({
          queryKey: keys.container(containerId),
        });
      },
    });
  }

  /** Delete a community container by its ID. */
  function useDeleteContainer() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string }>({
      mutationFn: ({ containerId }) =>
        api.delete<void>(
          communityPath(communityContract.deleteContainer, { containerId }),
        ),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.containers() });
      },
    });
  }

  // ── Threads ───────────────────────────────────────────────────────────────────

  /** Fetch paginated threads for a specific container. */
  function useContainerThreads({ containerId, ...params }: ThreadListParams) {
    const query = listQuery({ limit: 20, ...params });
    return useQuery<PaginatedResponse<ThreadResponse>, ApiError>({
      queryKey: keys.threads(containerId),
      queryFn: () =>
        api.get<PaginatedResponse<ThreadResponse>>(
          `${communityPath(communityContract.listThreads, { containerId })}${query}`,
        ),
      enabled: !!containerId,
    });
  }

  /** Fetch a single thread by its ID. */
  function useContainerThread(threadId: string) {
    return useQuery<ThreadResponse, ApiError>({
      queryKey: keys.threadDetail(threadId),
      queryFn: () =>
        api.get<ThreadResponse>(
          communityPath(communityContract.getThread, { threadId }),
        ),
      enabled: !!threadId,
    });
  }

  /** Create a new thread inside a container. */
  function useCreateThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { containerId: string } & CreateThreadBody
    >({
      mutationFn: ({ containerId, ...body }) =>
        api.post<ThreadResponse>(communityContract.createThread.path, {
          containerId,
          ...body,
        }),
      onSuccess: (_data, { containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchThreads() });
      },
    });
  }

  /** Update an existing thread by its ID. */
  function useUpdateThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string } & UpdateThreadBody
    >({
      mutationFn: ({ threadId, containerId: _cid, ...body }) =>
        api.patch<ThreadResponse>(
          communityPath(communityContract.updateThread, { threadId }),
          body,
        ),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchThreads() });
      },
    });
  }

  /** Delete a thread by its ID. */
  function useDeleteThread() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.delete<void>(
          communityPath(communityContract.deleteThread, { threadId }),
        ),
      onSuccess: (_data, { containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchThreads() });
      },
    });
  }

  /** Publish a draft thread, making it visible in the container. */
  function usePublishThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.post<ThreadResponse>(communityContract.publishThread.path, {
          id: threadId,
        }),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
      },
    });
  }

  /** Lock a thread to prevent further replies. */
  function useLockThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.request<ThreadResponse>(
          communityContract.lockThread.method,
          communityContract.lockThread.path,
          {
            id: threadId,
            locked: true,
          },
        ),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
      },
    });
  }

  /** Unlock a thread so replies can be posted again. */
  function useUnlockThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.request<ThreadResponse>(
          communityContract.unlockThread.method,
          communityContract.unlockThread.path,
          {
            id: threadId,
            locked: false,
          },
        ),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
      },
    });
  }

  /** Pin a thread to the top of its container. */
  function usePinThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.request<ThreadResponse>(
          communityContract.pinThread.method,
          communityContract.pinThread.path,
          {
            id: threadId,
            pinned: true,
          },
        ),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
      },
    });
  }

  /** Unpin a previously pinned thread from its container. */
  function useUnpinThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.request<ThreadResponse>(
          communityContract.unpinThread.method,
          communityContract.unpinThread.path,
          {
            id: threadId,
            pinned: false,
          },
        ),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
      },
    });
  }

  // ── Replies ───────────────────────────────────────────────────────────────────

  /** Fetch paginated replies for a specific thread. */
  function useThreadReplies({ threadId, ...params }: ReplyListParams) {
    const query = listQuery({ limit: 20, ...params });
    return useQuery<PaginatedResponse<ReplyResponse>, ApiError>({
      queryKey: keys.replies(threadId),
      queryFn: () =>
        api.get<PaginatedResponse<ReplyResponse>>(
          `${communityPath(communityContract.listReplies, { threadId })}${query}`,
        ),
      enabled: !!threadId,
    });
  }

  /** Fetch a single reply by its ID. */
  function useReply(replyId: string) {
    return useQuery<ReplyResponse, ApiError>({
      queryKey: keys.replyDetail(replyId),
      queryFn: () =>
        api.get<ReplyResponse>(
          communityPath(communityContract.getReply, { replyId }),
        ),
      enabled: !!replyId,
    });
  }

  /** Create a new reply on a thread. */
  function useCreateReply() {
    const queryClient = useQueryClient();
    return useMutation<
      ReplyResponse,
      ApiError,
      { threadId: string } & CreateReplyBody
    >({
      mutationFn: ({ threadId, ...body }) =>
        api.post<ReplyResponse>(communityContract.createReply.path, {
          threadId,
          ...body,
        }),
      onSuccess: (_data, { threadId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.replies(threadId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchReplies() });
      },
    });
  }

  /** Update an existing reply by its ID. */
  function useUpdateReply() {
    const queryClient = useQueryClient();
    return useMutation<
      ReplyResponse,
      ApiError,
      { replyId: string; threadId: string } & UpdateReplyBody
    >({
      mutationFn: ({ replyId, threadId: _tid, ...body }) =>
        api.patch<ReplyResponse>(
          communityPath(communityContract.updateReply, { replyId }),
          body,
        ),
      onSuccess: (_data, { replyId, threadId }) => {
        void queryClient.invalidateQueries({
          queryKey: ["community", "reply-reactions", replyId],
        });
        void queryClient.invalidateQueries({
          queryKey: keys.replyDetail(replyId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.replies(threadId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchReplies() });
      },
    });
  }

  /** Delete a reply by its ID. */
  function useDeleteReply() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { replyId: string; threadId: string }>({
      mutationFn: ({ replyId }) =>
        api.delete<void>(
          communityPath(communityContract.deleteReply, { replyId }),
        ),
      onSuccess: (_data, { threadId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.replies(threadId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchReplies() });
      },
    });
  }

  // ── Thread Reactions ──────────────────────────────────────────────────────────

  /** Fetch all reactions on a specific thread. */
  function useThreadReactions(threadId: string) {
    return useQuery<ReactionResponse[], ApiError>({
      queryKey: ["community", "thread-reactions", threadId] as const,
      queryFn: async () => {
        const res = await api.get<{ items: ReactionResponse[] }>(
          communityPath(communityContract.threadReactions, { threadId }),
        );
        return res.items;
      },
      enabled: !!threadId,
    });
  }

  /** Add an emoji reaction to a thread. */
  function useAddThreadReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { threadId: string; containerId: string } & ReactionBody
    >({
      mutationFn: ({ threadId, containerId, ...body }) =>
        api.post<void>(communityContract.addThreadReaction.path, {
          targetId: threadId,
          targetType: "thread",
          containerId,
          type: "emoji",
          value: body.emoji,
        }),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: ["community", "thread-reactions", threadId],
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
      },
    });
  }

  /** Remove an emoji reaction from a thread. */
  function useRemoveThreadReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { reactionId: string; threadId: string; containerId: string }
    >({
      mutationFn: ({ reactionId }) =>
        api.delete<void>(
          communityPath(communityContract.removeThreadReaction, {
            reactionId,
          }),
        ),
      onSuccess: (_data, { threadId, containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: ["community", "thread-reactions", threadId],
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threadDetail(threadId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
      },
    });
  }

  // ── Reply Reactions ───────────────────────────────────────────────────────────

  /** Fetch all reactions on a specific reply. */
  function useReplyReactions(replyId: string) {
    return useQuery<ReactionResponse[], ApiError>({
      queryKey: ["community", "reply-reactions", replyId] as const,
      queryFn: async () => {
        const res = await api.get<{ items: ReactionResponse[] }>(
          communityPath(communityContract.replyReactions, { replyId }),
        );
        return res.items;
      },
      enabled: !!replyId,
    });
  }

  /** Add an emoji reaction to a reply. */
  function useAddReplyReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { replyId: string; threadId: string; containerId: string } & ReactionBody
    >({
      mutationFn: ({ replyId, containerId, threadId: _tid, ...body }) =>
        api.post<void>(communityContract.addReplyReaction.path, {
          targetId: replyId,
          targetType: "reply",
          containerId,
          type: "emoji",
          value: body.emoji,
        }),
      onSuccess: (_data, { replyId, threadId }) => {
        void queryClient.invalidateQueries({
          queryKey: ["community", "reply-reactions", replyId],
        });
        void queryClient.invalidateQueries({
          queryKey: keys.replyDetail(replyId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.replies(threadId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchReplies() });
      },
    });
  }

  /** Remove an emoji reaction from a reply. */
  function useRemoveReplyReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { reactionId: string; replyId: string; threadId: string }
    >({
      mutationFn: ({ reactionId }) =>
        api.delete<void>(
          communityPath(communityContract.removeReplyReaction, {
            reactionId,
          }),
        ),
      onSuccess: (_data, { replyId, threadId }) => {
        void queryClient.invalidateQueries({
          queryKey: ["community", "reply-reactions", replyId],
        });
        void queryClient.invalidateQueries({
          queryKey: keys.replyDetail(replyId),
        });
        void queryClient.invalidateQueries({
          queryKey: keys.replies(threadId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchReplies() });
      },
    });
  }

  // ── Members / Roles ───────────────────────────────────────────────────────────
  //
  // Membership is the `ContainerMember` entity mounted at
  // `/community/container-members` (flat, not nested under the container):
  //   - POST   /community/container-members                {containerId,userId}  self-join
  //   - GET    /community/container-members?containerId=&userId=&role=&limit=
  //   - GET    /community/container-members/list-by-role/:containerId/:role
  //   - DELETE /community/container-members/:membershipId
  //   - POST   /community/container-members/assign-role    {containerId,userId,role} upsert
  // Moderator/owner assignment is a ROLE on the membership row (assign-role),
  // not a separate collection. "Remove moderator/owner" demotes to `member`.

  function memberList(containerId: string, params?: ListParams) {
    const limit = params?.limit ?? 20;
    return api.get<MemberListResponse>(
      `${communityContract.listMembers.path}?containerId=${encodeURIComponent(containerId)}&limit=${limit}`,
    );
  }

  function membersByRole(
    containerId: string,
    role: "moderator" | "owner",
    params?: ListParams,
  ) {
    const limit = params?.limit ?? 20;
    const route =
      role === "moderator"
        ? communityContract.listModerators
        : communityContract.listOwners;
    return api.get<MemberListResponse>(
      `${communityPath(route, { containerId })}?limit=${limit}`,
    );
  }

  /** Upsert a membership row's role (gated on container manage upstream). */
  function assignRole(
    route:
      | typeof communityContract.assignModerator
      | typeof communityContract.removeModerator
      | typeof communityContract.assignOwner
      | typeof communityContract.removeOwner,
    containerId: string,
    userId: string,
    role: "member" | "moderator" | "owner",
  ) {
    return api.post<MemberRecord>(route.path, { containerId, userId, role });
  }

  /**
   * Resolve a (containerId, userId) pair to its membership row id.
   * The delete route is keyed by membership id; hooks keep the ergonomic
   * pair-based signature and resolve internally.
   */
  async function findMembershipId(
    containerId: string,
    userId: string,
  ): Promise<string> {
    const res = await api.get<MemberListResponse>(
      `${communityContract.listMembers.path}?containerId=${encodeURIComponent(containerId)}&userId=${encodeURIComponent(userId)}&limit=1`,
    );
    const row = res.items[0];
    if (!row) {
      throw new MemberApiError(
        404,
        null,
        `No membership for user ${userId} in container ${containerId}`,
      );
    }
    return row.id;
  }

  /** Fetch paginated members of a container. */
  function useContainerMembers(containerId: string, params?: ListParams) {
    return useQuery<MemberListResponse, ApiError>({
      queryKey: keys.members(containerId),
      queryFn: () => memberList(containerId, params),
      enabled: !!containerId,
    });
  }

  /** Fetch paginated moderators of a container. */
  function useContainerModerators(containerId: string, params?: ListParams) {
    return useQuery<MemberListResponse, ApiError>({
      queryKey: keys.moderators(containerId),
      queryFn: () => membersByRole(containerId, "moderator", params),
      enabled: !!containerId,
    });
  }

  /** Fetch paginated owners of a container. */
  function useContainerOwners(containerId: string, params?: ListParams) {
    return useQuery<MemberListResponse, ApiError>({
      queryKey: keys.owners(containerId),
      queryFn: () => membersByRole(containerId, "owner", params),
      enabled: !!containerId,
    });
  }

  /**
   * Add a user as a member of a container.
   *
   * The create route is a self-join endpoint: the server takes the effective
   * user from the authenticated actor. Community plugins issue the member
   * grant via middleware — invalidate the container's abilities cache after
   * success if UI gating should update immediately.
   */
  function useAddMember() {
    const queryClient = useQueryClient();
    return useMutation<
      MemberRecord,
      ApiError,
      { containerId: string; userId: string }
    >({
      mutationFn: ({ containerId, userId }) =>
        api.post<MemberRecord>(communityContract.addMember.path, {
          containerId,
          userId,
        }),
      onSuccess: (_data, { containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.members(containerId),
        });
      },
    });
  }

  /** Remove a member from a container. */
  function useRemoveMember() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: async ({ containerId, userId }) => {
          const membershipId = await findMembershipId(containerId, userId);
          await api.delete<void>(
            communityPath(communityContract.removeMember, { membershipId }),
          );
        },
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.members(containerId),
          });
        },
      },
    );
  }

  /** Assign moderator role to a user in a container. */
  function useAssignModerator() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: async ({ containerId, userId }) => {
          await assignRole(
            communityContract.assignModerator,
            containerId,
            userId,
            "moderator",
          );
        },
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.moderators(containerId),
          });
          void queryClient.invalidateQueries({
            queryKey: keys.members(containerId),
          });
        },
      },
    );
  }

  /** Remove moderator role from a user in a container (demotes to member). */
  function useRemoveModerator() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: async ({ containerId, userId }) => {
          await assignRole(
            communityContract.removeModerator,
            containerId,
            userId,
            "member",
          );
        },
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.moderators(containerId),
          });
          void queryClient.invalidateQueries({
            queryKey: keys.members(containerId),
          });
        },
      },
    );
  }

  /** Assign owner role to a user in a container. */
  function useAssignOwner() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: async ({ containerId, userId }) => {
          await assignRole(
            communityContract.assignOwner,
            containerId,
            userId,
            "owner",
          );
        },
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.owners(containerId),
          });
          void queryClient.invalidateQueries({
            queryKey: keys.members(containerId),
          });
        },
      },
    );
  }

  /** Remove owner role from a user in a container (demotes to member). */
  function useRemoveOwner() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: async ({ containerId, userId }) => {
          await assignRole(
            communityContract.removeOwner,
            containerId,
            userId,
            "member",
          );
        },
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.owners(containerId),
          });
          void queryClient.invalidateQueries({
            queryKey: keys.members(containerId),
          });
        },
      },
    );
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  //
  // Served by slingshot-notifications (not slingshot-community): the entity
  // is mounted at `/notifications/notifications` with named ops. `list` is
  // dataScoped to the actor; `unread-count` is an aggregate POST;
  // `mark-read` is a fieldUpdate named op (POST, body `{id, read, readAt}`,
  // userId ctx-injected); `mark-all-read` is a batch update (POST).

  /** Fetch the current user's notifications (newest first). */
  function useNotifications(params?: ListParams) {
    const limit = params?.limit ?? 20;
    return useQuery<PaginatedResponse<NotificationResponse>, ApiError>({
      queryKey: keys.notifications(),
      queryFn: () =>
        api.get<PaginatedResponse<NotificationResponse>>(
          `${communityContract.listNotifications.path}?limit=${limit}&sortDir=desc`,
        ),
    });
  }

  /** Fetch the count of unread notifications for the current user. */
  function useNotificationsUnreadCount() {
    return useQuery<{ count: number }, ApiError>({
      queryKey: keys.notificationsUnread(),
      queryFn: () =>
        api.post<{ count: number }>(
          communityContract.getNotificationsUnreadCount.path,
          {},
        ),
    });
  }

  /** Mark every notification as seen without changing its read tint. */
  function useMarkAllNotificationsSeen() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, void>({
      mutationFn: async () => {
        await api.post(communityContract.markAllNotificationsSeen.path, {});
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.notifications() });
        void queryClient.invalidateQueries({
          queryKey: keys.notificationsUnread(),
        });
      },
    });
  }

  /** Mark a single notification as read. */
  function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { notificationId: string }>({
      mutationFn: async ({ notificationId }) => {
        await api.post(communityContract.markNotificationRead.path, {
          id: notificationId,
          read: true,
          // AN ISO STRING, NOT `Date.now()`. `readAt` is a timestamp column,
          // and a millisecond NUMBER makes Postgres reject the write with
          // 22008 (datetime_field_overflow) — so every "mark this read" tap
          // 500s and the notification never clears. Measured against a real
          // api 2026-07-29: number -> 500, ISO string -> 200.
          readAt: new Date().toISOString(),
        });
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.notifications() });
        void queryClient.invalidateQueries({
          queryKey: keys.notificationsUnread(),
        });
      },
    });
  }

  /** Mark all of the current user's notifications as read. */
  function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, void>({
      mutationFn: async () => {
        await api.post(communityContract.markAllNotificationsRead.path, {});
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.notifications() });
        void queryClient.invalidateQueries({
          queryKey: keys.notificationsUnread(),
        });
      },
    });
  }

  /** Dismiss one notification owned by the current user. */
  function useDismissNotification() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { notificationId: string }>({
      mutationFn: async ({ notificationId }) => {
        await api.delete(
          communityPath(communityContract.dismissNotification, {
            notificationId,
          }),
        );
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.notifications() });
        void queryClient.invalidateQueries({
          queryKey: keys.notificationsUnread(),
        });
      },
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────────

  /** Fetch paginated community reports. */
  function useReports(params?: ListParams) {
    const query = listQuery(params);
    return useQuery<PaginatedResponse<ReportResponse>, ApiError>({
      queryKey: keys.reports(),
      queryFn: () =>
        api.get<PaginatedResponse<ReportResponse>>(
          `${communityContract.listReports.path}${query}`,
        ),
    });
  }

  /** Fetch a single report by its ID. */
  function useReport(reportId: string) {
    return useQuery<ReportResponse, ApiError>({
      queryKey: keys.report(reportId),
      queryFn: () =>
        api.get<ReportResponse>(
          communityPath(communityContract.getReport, { reportId }),
        ),
      enabled: !!reportId,
    });
  }

  /** Submit a new community report. */
  function useCreateReport() {
    const queryClient = useQueryClient();
    return useMutation<ReportResponse, ApiError, ReportBody>({
      mutationFn: (body) =>
        api.post<ReportResponse>(communityContract.createReport.path, body),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.reports() });
      },
    });
  }

  /** Resolve a report with a resolution body. */
  function useResolveReport() {
    const queryClient = useQueryClient();
    return useMutation<
      ReportResponse,
      ApiError,
      { reportId: string } & ResolveReportBody
    >({
      mutationFn: ({ reportId, ...body }) =>
        api.post<ReportResponse>(
          communityPath(communityContract.resolveReport, { reportId }),
          body,
        ),
      onSuccess: (_data, { reportId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.reports() });
        void queryClient.invalidateQueries({ queryKey: keys.report(reportId) });
      },
    });
  }

  /** Dismiss a report without taking action. */
  function useDismissReport() {
    const queryClient = useQueryClient();
    return useMutation<ReportResponse, ApiError, { reportId: string }>({
      mutationFn: ({ reportId }) =>
        api.post<ReportResponse>(
          communityPath(communityContract.dismissReport, { reportId }),
          {},
        ),
      onSuccess: (_data, { reportId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.reports() });
        void queryClient.invalidateQueries({ queryKey: keys.report(reportId) });
      },
    });
  }

  // ── Bans ──────────────────────────────────────────────────────────────────────

  /** Fetch paginated community bans. */
  function useBans(params?: ListParams) {
    const query = listQuery(params);
    return useQuery<PaginatedResponse<BanResponse>, ApiError>({
      queryKey: keys.bans(),
      queryFn: () =>
        api.get<PaginatedResponse<BanResponse>>(
          `${communityContract.listBans.path}${query}`,
        ),
    });
  }

  /**
   * Check whether a user is banned, optionally scoped to a container.
   *
   * slingshot-community disables its `isUserBanned` and `getUserBan` operations
   * (`routes.disable` on the Ban entity) and mounts no `/bans/check` route, so
   * this derives the answer from the filtered ban list — the same approach
   * {@link findMembershipId} uses for membership. A ban counts as in force only
   * when it has not been lifted (`unbannedAt`) and has not expired.
   */
  function useCheckBan(userId: string, containerId?: string) {
    const query = new URLSearchParams({ userId, limit: "50" });
    if (containerId) query.set("containerId", containerId);
    return useQuery<BanCheckResponse, ApiError>({
      queryKey: keys.banCheck(userId, containerId),
      queryFn: async () => {
        const res = await api.get<PaginatedResponse<BanResponse>>(
          `${communityContract.checkBan.path}?${query.toString()}`,
        );
        const now = Date.now();
        const ban = res.items.find(
          (b) =>
            !b.unbannedAt &&
            (!b.expiresAt || new Date(b.expiresAt).getTime() > now),
        );
        return ban ? { banned: true, ban } : { banned: false };
      },
      enabled: !!userId,
    });
  }

  /** Ban a user from the community or a specific container. */
  function useCreateBan() {
    const queryClient = useQueryClient();
    return useMutation<BanResponse, ApiError, BanBody>({
      mutationFn: (body) =>
        api.post<BanResponse>(communityContract.createBan.path, body),
      onSuccess: (_data, { userId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.bans() });
        void queryClient.invalidateQueries({
          queryKey: keys.banCheckPrefix(userId),
        });
      },
    });
  }

  /** Remove an existing ban by its ID. */
  function useRemoveBan() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { banId: string; userId: string }>({
      mutationFn: ({ banId }) =>
        api.delete<void>(communityPath(communityContract.deleteBan, { banId })),
      onSuccess: (_data, { userId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.bans() });
        void queryClient.invalidateQueries({
          queryKey: keys.banCheckPrefix(userId),
        });
      },
    });
  }

  // ── Search ────────────────────────────────────────────────────────────────────

  /**
   * Search threads by query string, optionally scoped to a container.
   *
   * Hits the entity search route `GET /community/threads/search`; there is no
   * `/community/search/*` namespace. Results use the shared cursor envelope —
   * pass the previous response's `nextCursor` back as `cursor` to page.
   */
  function useSearchThreads(params: ThreadSearchParams & { q: string }) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.containerId) qs.set("containerId", params.containerId);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return useQuery<SearchResponse<ThreadResponse>, ApiError>({
      queryKey: [...keys.searchThreads(), params] as const,
      queryFn: () =>
        api.get<SearchResponse<ThreadResponse>>(
          `${communityContract.searchThreads.path}?${qs.toString()}`,
        ),
      enabled: !!params.q,
    });
  }

  /**
   * Search replies by query string, optionally scoped to a thread.
   *
   * Hits `GET /community/replies/search`. The Reply entity filters on
   * `threadId`, not `containerId` — a container filter is not available here.
   */
  function useSearchReplies(params: ReplySearchParams & { q: string }) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.threadId) qs.set("threadId", params.threadId);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return useQuery<SearchResponse<ReplyResponse>, ApiError>({
      queryKey: [...keys.searchReplies(), params] as const,
      queryFn: () =>
        api.get<SearchResponse<ReplyResponse>>(
          `${communityContract.searchReplies.path}?${qs.toString()}`,
        ),
      enabled: !!params.q,
    });
  }

  // ── Return all hooks ──────────────────────────────────────────────────────────

  return {
    // Containers
    useContainers,
    useContainer,
    useCreateContainer,
    useUpdateContainer,
    useDeleteContainer,
    // Threads
    useContainerThreads,
    useContainerThread,
    useCreateThread,
    useUpdateThread,
    useDeleteThread,
    usePublishThread,
    useLockThread,
    useUnlockThread,
    usePinThread,
    useUnpinThread,
    // Replies
    useThreadReplies,
    useReply,
    useCreateReply,
    useUpdateReply,
    useDeleteReply,
    // Thread reactions
    useThreadReactions,
    useReplyReactions,
    useAddThreadReaction,
    useRemoveThreadReaction,
    // Reply reactions
    useAddReplyReaction,
    useRemoveReplyReaction,
    // Members / Roles
    useContainerMembers,
    useContainerModerators,
    useContainerOwners,
    useAddMember,
    useRemoveMember,
    useAssignModerator,
    useRemoveModerator,
    useAssignOwner,
    useRemoveOwner,
    // Notifications
    useNotifications,
    useNotificationsUnreadCount,
    useMarkAllNotificationsSeen,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useDismissNotification,
    // Reports
    useReports,
    useReport,
    useCreateReport,
    useResolveReport,
    useDismissReport,
    // Bans
    useBans,
    useCheckBan,
    useCreateBan,
    useRemoveBan,
    // Search
    useSearchThreads,
    useSearchReplies,
  };
}

/**
 * Hook surface returned by `createCommunityHooks()`.
 */
export type CommunityHooks = ReturnType<typeof createCommunityHooks>;
