import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
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
  CommunitySearchParams,
} from "./types";

// ── Cache key helpers ──────────────────────────────────────────────────────────

const keys = {
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

// ── Factory ───────────────────────────────────────────────────────────────────

export function createCommunityHooks({
  api,
  queryClient: _qc,
}: {
  api: ApiClient;
  queryClient: QueryClient;
}) {
  // ── Containers ───────────────────────────────────────────────────────────────

  function useContainers(params?: ListParams) {
    const query = params
      ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
      : "";
    return useQuery<PaginatedResponse<ContainerResponse>, ApiError>({
      queryKey: keys.containers(),
      queryFn: () =>
        api.get<PaginatedResponse<ContainerResponse>>(
          `/community/containers${query}`,
        ),
    });
  }

  function useContainer(containerId: string) {
    return useQuery<ContainerResponse, ApiError>({
      queryKey: keys.container(containerId),
      queryFn: () =>
        api.get<ContainerResponse>(`/community/containers/${containerId}`),
      enabled: !!containerId,
    });
  }

  function useCreateContainer() {
    const queryClient = useQueryClient();
    return useMutation<ContainerResponse, ApiError, CreateContainerBody>({
      mutationFn: (body) =>
        api.post<ContainerResponse>("/community/containers", body),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.containers() });
      },
    });
  }

  function useUpdateContainer() {
    const queryClient = useQueryClient();
    return useMutation<
      ContainerResponse,
      ApiError,
      { containerId: string } & UpdateContainerBody
    >({
      mutationFn: ({ containerId, ...body }) =>
        api.patch<ContainerResponse>(
          `/community/containers/${containerId}`,
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

  function useDeleteContainer() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string }>({
      mutationFn: ({ containerId }) =>
        api.delete<void>(`/community/containers/${containerId}`),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.containers() });
      },
    });
  }

  // ── Threads ───────────────────────────────────────────────────────────────────

  function useContainerThreads({ containerId, ...params }: ThreadListParams) {
    const query = `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`;
    return useQuery<PaginatedResponse<ThreadResponse>, ApiError>({
      queryKey: keys.threads(containerId),
      queryFn: () =>
        api.get<PaginatedResponse<ThreadResponse>>(
          `/community/containers/${containerId}/threads${query}`,
        ),
      enabled: !!containerId,
    });
  }

  function useContainerThread(threadId: string) {
    return useQuery<ThreadResponse, ApiError>({
      queryKey: keys.threadDetail(threadId),
      queryFn: () => api.get<ThreadResponse>(`/community/threads/${threadId}`),
      enabled: !!threadId,
    });
  }

  function useCreateThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { containerId: string } & CreateThreadBody
    >({
      mutationFn: ({ containerId, ...body }) =>
        api.post<ThreadResponse>(
          `/community/containers/${containerId}/threads`,
          body,
        ),
      onSuccess: (_data, { containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchThreads() });
      },
    });
  }

  function useUpdateThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string } & UpdateThreadBody
    >({
      mutationFn: ({ threadId, containerId: _cid, ...body }) =>
        api.patch<ThreadResponse>(`/community/threads/${threadId}`, body),
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

  function useDeleteThread() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.delete<void>(`/community/threads/${threadId}`),
      onSuccess: (_data, { containerId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.threads(containerId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchThreads() });
      },
    });
  }

  function usePublishThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.post<ThreadResponse>(`/community/threads/${threadId}/publish`, {}),
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

  function useLockThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.post<ThreadResponse>(`/community/threads/${threadId}/lock`, {}),
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

  function usePinThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.post<ThreadResponse>(`/community/threads/${threadId}/pin`, {}),
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

  function useUnpinThread() {
    const queryClient = useQueryClient();
    return useMutation<
      ThreadResponse,
      ApiError,
      { threadId: string; containerId: string }
    >({
      mutationFn: ({ threadId }) =>
        api.post<ThreadResponse>(`/community/threads/${threadId}/unpin`, {}),
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

  function useThreadReplies({ threadId, ...params }: ReplyListParams) {
    const query = `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`;
    return useQuery<PaginatedResponse<ReplyResponse>, ApiError>({
      queryKey: keys.replies(threadId),
      queryFn: () =>
        api.get<PaginatedResponse<ReplyResponse>>(
          `/community/threads/${threadId}/replies${query}`,
        ),
      enabled: !!threadId,
    });
  }

  function useReply(replyId: string) {
    return useQuery<ReplyResponse, ApiError>({
      queryKey: keys.replyDetail(replyId),
      queryFn: () => api.get<ReplyResponse>(`/community/replies/${replyId}`),
      enabled: !!replyId,
    });
  }

  function useCreateReply() {
    const queryClient = useQueryClient();
    return useMutation<
      ReplyResponse,
      ApiError,
      { threadId: string } & CreateReplyBody
    >({
      mutationFn: ({ threadId, ...body }) =>
        api.post<ReplyResponse>(`/community/threads/${threadId}/replies`, body),
      onSuccess: (_data, { threadId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.replies(threadId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchReplies() });
      },
    });
  }

  function useUpdateReply() {
    const queryClient = useQueryClient();
    return useMutation<
      ReplyResponse,
      ApiError,
      { replyId: string; threadId: string } & UpdateReplyBody
    >({
      mutationFn: ({ replyId, threadId: _tid, ...body }) =>
        api.patch<ReplyResponse>(`/community/replies/${replyId}`, body),
      onSuccess: (_data, { replyId, threadId }) => {
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

  function useDeleteReply() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { replyId: string; threadId: string }>({
      mutationFn: ({ replyId }) =>
        api.delete<void>(`/community/replies/${replyId}`),
      onSuccess: (_data, { threadId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.replies(threadId),
        });
        void queryClient.invalidateQueries({ queryKey: keys.searchReplies() });
      },
    });
  }

  // ── Thread Reactions ──────────────────────────────────────────────────────────

  function useThreadReactions(threadId: string) {
    return useQuery<ReactionBody[], ApiError>({
      queryKey: ["community", "thread-reactions", threadId] as const,
      queryFn: () =>
        api.get<ReactionBody[]>(`/community/threads/${threadId}/reactions`),
      enabled: !!threadId,
    });
  }

  function useAddThreadReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { threadId: string; containerId: string } & ReactionBody
    >({
      mutationFn: ({ threadId, containerId: _cid, ...body }) =>
        api.post<void>(`/community/threads/${threadId}/reactions`, body),
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

  function useRemoveThreadReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { threadId: string; containerId: string; emoji: string }
    >({
      mutationFn: ({ threadId, emoji }) =>
        api.delete<void>(
          `/community/threads/${threadId}/reactions/${encodeURIComponent(emoji)}`,
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

  // ── Reply Reactions ───────────────────────────────────────────────────────────

  function useReplyReactions(replyId: string) {
    return useQuery<ReactionBody[], ApiError>({
      queryKey: ["community", "reply-reactions", replyId] as const,
      queryFn: () =>
        api.get<ReactionBody[]>(`/community/replies/${replyId}/reactions`),
      enabled: !!replyId,
    });
  }

  function useAddReplyReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { replyId: string; threadId: string } & ReactionBody
    >({
      mutationFn: ({ replyId, threadId: _tid, ...body }) =>
        api.post<void>(`/community/replies/${replyId}/reactions`, body),
      onSuccess: (_data, { replyId, threadId }) => {
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

  function useRemoveReplyReaction() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { replyId: string; threadId: string; emoji: string }
    >({
      mutationFn: ({ replyId, emoji }) =>
        api.delete<void>(
          `/community/replies/${replyId}/reactions/${encodeURIComponent(emoji)}`,
        ),
      onSuccess: (_data, { replyId, threadId }) => {
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

  function useContainerMembers(containerId: string, params?: ListParams) {
    const query = params
      ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
      : "";
    return useQuery<PaginatedResponse<{ userId: string }>, ApiError>({
      queryKey: keys.members(containerId),
      queryFn: () =>
        api.get<PaginatedResponse<{ userId: string }>>(
          `/community/containers/${containerId}/members${query}`,
        ),
      enabled: !!containerId,
    });
  }

  function useContainerModerators(containerId: string, params?: ListParams) {
    const query = params
      ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
      : "";
    return useQuery<PaginatedResponse<{ userId: string }>, ApiError>({
      queryKey: keys.moderators(containerId),
      queryFn: () =>
        api.get<PaginatedResponse<{ userId: string }>>(
          `/community/containers/${containerId}/moderators${query}`,
        ),
      enabled: !!containerId,
    });
  }

  function useContainerOwners(containerId: string, params?: ListParams) {
    const query = params
      ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
      : "";
    return useQuery<PaginatedResponse<{ userId: string }>, ApiError>({
      queryKey: keys.owners(containerId),
      queryFn: () =>
        api.get<PaginatedResponse<{ userId: string }>>(
          `/community/containers/${containerId}/owners${query}`,
        ),
      enabled: !!containerId,
    });
  }

  function useAddMember() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: ({ containerId, userId }) =>
          api.post<void>(`/community/containers/${containerId}/members`, {
            userId,
          }),
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.members(containerId),
          });
        },
      },
    );
  }

  function useRemoveMember() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: ({ containerId, userId }) =>
          api.delete<void>(
            `/community/containers/${containerId}/members/${userId}`,
          ),
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.members(containerId),
          });
        },
      },
    );
  }

  function useAssignModerator() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: ({ containerId, userId }) =>
          api.post<void>(`/community/containers/${containerId}/moderators`, {
            userId,
          }),
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.moderators(containerId),
          });
        },
      },
    );
  }

  function useRemoveModerator() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: ({ containerId, userId }) =>
          api.delete<void>(
            `/community/containers/${containerId}/moderators/${userId}`,
          ),
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.moderators(containerId),
          });
        },
      },
    );
  }

  function useAssignOwner() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: ({ containerId, userId }) =>
          api.post<void>(`/community/containers/${containerId}/owners`, {
            userId,
          }),
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.owners(containerId),
          });
        },
      },
    );
  }

  function useRemoveOwner() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { containerId: string; userId: string }>(
      {
        mutationFn: ({ containerId, userId }) =>
          api.delete<void>(
            `/community/containers/${containerId}/owners/${userId}`,
          ),
        onSuccess: (_data, { containerId }) => {
          void queryClient.invalidateQueries({
            queryKey: keys.owners(containerId),
          });
        },
      },
    );
  }

  // ── Notifications ─────────────────────────────────────────────────────────────

  function useNotifications(params?: ListParams) {
    const query = params
      ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
      : "";
    return useQuery<PaginatedResponse<NotificationResponse>, ApiError>({
      queryKey: keys.notifications(),
      queryFn: () =>
        api.get<PaginatedResponse<NotificationResponse>>(
          `/community/notifications${query}`,
        ),
    });
  }

  function useNotificationsUnreadCount() {
    return useQuery<{ count: number }, ApiError>({
      queryKey: keys.notificationsUnread(),
      queryFn: () =>
        api.get<{ count: number }>("/community/notifications/unread-count"),
    });
  }

  function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { notificationId: string }>({
      mutationFn: ({ notificationId }) =>
        api.patch<void>(`/community/notifications/${notificationId}/read`, {}),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.notifications() });
        void queryClient.invalidateQueries({
          queryKey: keys.notificationsUnread(),
        });
      },
    });
  }

  function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, void>({
      mutationFn: () => api.post<void>("/community/notifications/read-all", {}),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.notifications() });
        void queryClient.invalidateQueries({
          queryKey: keys.notificationsUnread(),
        });
      },
    });
  }

  // ── Reports ───────────────────────────────────────────────────────────────────

  function useReports(params?: ListParams) {
    const query = params
      ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
      : "";
    return useQuery<PaginatedResponse<ReportResponse>, ApiError>({
      queryKey: keys.reports(),
      queryFn: () =>
        api.get<PaginatedResponse<ReportResponse>>(
          `/community/reports${query}`,
        ),
    });
  }

  function useReport(reportId: string) {
    return useQuery<ReportResponse, ApiError>({
      queryKey: keys.report(reportId),
      queryFn: () => api.get<ReportResponse>(`/community/reports/${reportId}`),
      enabled: !!reportId,
    });
  }

  function useCreateReport() {
    const queryClient = useQueryClient();
    return useMutation<ReportResponse, ApiError, ReportBody>({
      mutationFn: (body) =>
        api.post<ReportResponse>("/community/reports", body),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.reports() });
      },
    });
  }

  function useResolveReport() {
    const queryClient = useQueryClient();
    return useMutation<
      ReportResponse,
      ApiError,
      { reportId: string } & ResolveReportBody
    >({
      mutationFn: ({ reportId, ...body }) =>
        api.post<ReportResponse>(
          `/community/reports/${reportId}/resolve`,
          body,
        ),
      onSuccess: (_data, { reportId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.reports() });
        void queryClient.invalidateQueries({ queryKey: keys.report(reportId) });
      },
    });
  }

  function useDismissReport() {
    const queryClient = useQueryClient();
    return useMutation<ReportResponse, ApiError, { reportId: string }>({
      mutationFn: ({ reportId }) =>
        api.post<ReportResponse>(`/community/reports/${reportId}/dismiss`, {}),
      onSuccess: (_data, { reportId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.reports() });
        void queryClient.invalidateQueries({ queryKey: keys.report(reportId) });
      },
    });
  }

  // ── Bans ──────────────────────────────────────────────────────────────────────

  function useBans(params?: ListParams) {
    const query = params
      ? `?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`
      : "";
    return useQuery<PaginatedResponse<BanResponse>, ApiError>({
      queryKey: keys.bans(),
      queryFn: () =>
        api.get<PaginatedResponse<BanResponse>>(`/community/bans${query}`),
    });
  }

  function useCheckBan(userId: string, containerId?: string) {
    const params = containerId
      ? `?userId=${userId}&containerId=${containerId}`
      : `?userId=${userId}`;
    return useQuery<BanCheckResponse, ApiError>({
      queryKey: keys.banCheck(userId, containerId),
      queryFn: () =>
        api.get<BanCheckResponse>(`/community/bans/check${params}`),
      enabled: !!userId,
    });
  }

  function useCreateBan() {
    const queryClient = useQueryClient();
    return useMutation<BanResponse, ApiError, BanBody>({
      mutationFn: (body) => api.post<BanResponse>("/community/bans", body),
      onSuccess: (_data, { userId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.bans() });
        void queryClient.invalidateQueries({
          queryKey: keys.banCheckPrefix(userId),
        });
      },
    });
  }

  function useRemoveBan() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { banId: string; userId: string }>({
      mutationFn: ({ banId }) => api.delete<void>(`/community/bans/${banId}`),
      onSuccess: (_data, { userId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.bans() });
        void queryClient.invalidateQueries({
          queryKey: keys.banCheckPrefix(userId),
        });
      },
    });
  }

  // ── Search ────────────────────────────────────────────────────────────────────

  function useSearchThreads(params: CommunitySearchParams & { q: string }) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.containerId) qs.set("containerId", params.containerId);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return useQuery<SearchResponse, ApiError>({
      queryKey: [...keys.searchThreads(), params] as const,
      queryFn: () =>
        api.get<SearchResponse>(`/community/search/threads?${qs.toString()}`),
      enabled: !!params.q,
    });
  }

  function useSearchReplies(params: CommunitySearchParams & { q: string }) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.containerId) qs.set("containerId", params.containerId);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.cursor) qs.set("cursor", params.cursor);
    return useQuery<SearchResponse, ApiError>({
      queryKey: [...keys.searchReplies(), params] as const,
      queryFn: () =>
        api.get<SearchResponse>(`/community/search/replies?${qs.toString()}`),
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
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
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

export type CommunityHooks = ReturnType<typeof createCommunityHooks>;
