import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { ContainerResponse, CreateContainerBody, UpdateContainerBody, ThreadResponse, CreateThreadBody, UpdateThreadBody, ReplyResponse, CreateReplyBody, UpdateReplyBody, ReactionBody, ReactionResponse, ReportBody, ReportResponse, ResolveReportBody, BanBody, BanResponse, BanCheckResponse, PaginatedResponse, SearchResponse, NotificationResponse, ListParams, ThreadListParams, ReplyListParams, CommunitySearchParams } from "./types";

/**
 * Cache-key builders mirroring what the hooks emit. Exported so SSR
 * loaders in any consuming app seed under the same keys the hooks read.
 */
export declare const communityKeys: {
    containers: () => readonly ["community", "containers"];
    container: (containerId: string) => readonly ["community", "containers", string];
    threads: (containerId: string) => readonly ["community", "threads", string];
    threadDetail: (threadId: string) => readonly ["community", "threads", "detail", string];
    replies: (threadId: string) => readonly ["community", "replies", string];
    replyDetail: (replyId: string) => readonly ["community", "replies", "detail", string];
    reports: () => readonly ["community", "reports"];
    report: (reportId: string) => readonly ["community", "reports", string];
    bans: () => readonly ["community", "bans"];
    banCheck: (userId: string, containerId?: string) => readonly ["community", "bans", string, "check", string | null];
    banCheckPrefix: (userId: string) => readonly ["community", "bans", string, "check"];
    notifications: () => readonly ["community", "notifications"];
    notificationsUnread: () => readonly ["community", "notifications", "unread"];
    members: (containerId: string) => readonly ["community", "members", string];
    moderators: (containerId: string) => readonly ["community", "moderators", string];
    owners: (containerId: string) => readonly ["community", "owners", string];
    searchThreads: () => readonly ["community", "search", "threads"];
    searchReplies: () => readonly ["community", "search", "replies"];
};

/**
 * Create a complete set of React Query hooks for the community API surface.
 *
 * @param options - Factory configuration.
 * @param options.api - The API client used to make HTTP requests.
 * @param options.queryClient - The React Query client used for cache invalidation.
 * @returns An object containing all community hooks for containers, threads, replies, reactions, members, roles, notifications, reports, bans, and search.
 */
export declare function createCommunityHooks({ api, queryClient: _qc, }: {
    api: ApiClient;
    queryClient: QueryClient;
}): {
    useContainers: (params?: ListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<ContainerResponse>, ApiError>;
    useContainer: (containerId: string) => import("@tanstack/react-query").UseQueryResult<ContainerResponse, ApiError>;
    useCreateContainer: () => import("@tanstack/react-query").UseMutationResult<ContainerResponse, ApiError, CreateContainerBody, unknown>;
    useUpdateContainer: () => import("@tanstack/react-query").UseMutationResult<ContainerResponse, ApiError, {
        containerId: string;
    } & UpdateContainerBody, unknown>;
    useDeleteContainer: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        containerId: string;
    }, unknown>;
    useContainerThreads: ({ containerId, ...params }: ThreadListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<ThreadResponse>, ApiError>;
    useContainerThread: (threadId: string) => import("@tanstack/react-query").UseQueryResult<ThreadResponse, ApiError>;
    useCreateThread: () => import("@tanstack/react-query").UseMutationResult<ThreadResponse, ApiError, {
        containerId: string;
    } & CreateThreadBody, unknown>;
    useUpdateThread: () => import("@tanstack/react-query").UseMutationResult<ThreadResponse, ApiError, {
        threadId: string;
        containerId: string;
    } & UpdateThreadBody, unknown>;
    useDeleteThread: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        threadId: string;
        containerId: string;
    }, unknown>;
    usePublishThread: () => import("@tanstack/react-query").UseMutationResult<ThreadResponse, ApiError, {
        threadId: string;
        containerId: string;
    }, unknown>;
    useLockThread: () => import("@tanstack/react-query").UseMutationResult<ThreadResponse, ApiError, {
        threadId: string;
        containerId: string;
    }, unknown>;
    usePinThread: () => import("@tanstack/react-query").UseMutationResult<ThreadResponse, ApiError, {
        threadId: string;
        containerId: string;
    }, unknown>;
    useUnpinThread: () => import("@tanstack/react-query").UseMutationResult<ThreadResponse, ApiError, {
        threadId: string;
        containerId: string;
    }, unknown>;
    useThreadReplies: ({ threadId, ...params }: ReplyListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<ReplyResponse>, ApiError>;
    useReply: (replyId: string) => import("@tanstack/react-query").UseQueryResult<ReplyResponse, ApiError>;
    useCreateReply: () => import("@tanstack/react-query").UseMutationResult<ReplyResponse, ApiError, {
        threadId: string;
    } & CreateReplyBody, unknown>;
    useUpdateReply: () => import("@tanstack/react-query").UseMutationResult<ReplyResponse, ApiError, {
        replyId: string;
        threadId: string;
    } & UpdateReplyBody, unknown>;
    useDeleteReply: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        replyId: string;
        threadId: string;
    }, unknown>;
    useThreadReactions: (threadId: string) => import("@tanstack/react-query").UseQueryResult<ReactionResponse[], ApiError>;
    useReplyReactions: (replyId: string) => import("@tanstack/react-query").UseQueryResult<ReactionResponse[], ApiError>;
    useAddThreadReaction: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        threadId: string;
        containerId: string;
    } & ReactionBody, unknown>;
    useRemoveThreadReaction: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        threadId: string;
        containerId: string;
        emoji: string;
    }, unknown>;
    useAddReplyReaction: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        replyId: string;
        threadId: string;
    } & ReactionBody, unknown>;
    useRemoveReplyReaction: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        replyId: string;
        threadId: string;
        emoji: string;
    }, unknown>;
    useContainerMembers: (containerId: string, params?: ListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<{
        userId: string;
    }>, ApiError>;
    useContainerModerators: (containerId: string, params?: ListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<{
        userId: string;
    }>, ApiError>;
    useContainerOwners: (containerId: string, params?: ListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<{
        userId: string;
    }>, ApiError>;
    useAddMember: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        containerId: string;
        userId: string;
    }, unknown>;
    useRemoveMember: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        containerId: string;
        userId: string;
    }, unknown>;
    useAssignModerator: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        containerId: string;
        userId: string;
    }, unknown>;
    useRemoveModerator: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        containerId: string;
        userId: string;
    }, unknown>;
    useAssignOwner: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        containerId: string;
        userId: string;
    }, unknown>;
    useRemoveOwner: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        containerId: string;
        userId: string;
    }, unknown>;
    useNotifications: (params?: ListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<NotificationResponse>, ApiError>;
    useNotificationsUnreadCount: () => import("@tanstack/react-query").UseQueryResult<{
        count: number;
    }, ApiError>;
    useMarkNotificationRead: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        notificationId: string;
    }, unknown>;
    useMarkAllNotificationsRead: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, void, unknown>;
    useReports: (params?: ListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<ReportResponse>, ApiError>;
    useReport: (reportId: string) => import("@tanstack/react-query").UseQueryResult<ReportResponse, ApiError>;
    useCreateReport: () => import("@tanstack/react-query").UseMutationResult<ReportResponse, ApiError, ReportBody, unknown>;
    useResolveReport: () => import("@tanstack/react-query").UseMutationResult<ReportResponse, ApiError, {
        reportId: string;
    } & ResolveReportBody, unknown>;
    useDismissReport: () => import("@tanstack/react-query").UseMutationResult<ReportResponse, ApiError, {
        reportId: string;
    }, unknown>;
    useBans: (params?: ListParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<BanResponse>, ApiError>;
    useCheckBan: (userId: string, containerId?: string) => import("@tanstack/react-query").UseQueryResult<BanCheckResponse, ApiError>;
    useCreateBan: () => import("@tanstack/react-query").UseMutationResult<BanResponse, ApiError, BanBody, unknown>;
    useRemoveBan: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        banId: string;
        userId: string;
    }, unknown>;
    useSearchThreads: (params: CommunitySearchParams & {
        q: string;
    }) => import("@tanstack/react-query").UseQueryResult<SearchResponse, ApiError>;
    useSearchReplies: (params: CommunitySearchParams & {
        q: string;
    }) => import("@tanstack/react-query").UseQueryResult<SearchResponse, ApiError>;
};
/**
 * Hook surface returned by `createCommunityHooks()`.
 */
export type CommunityHooks = ReturnType<typeof createCommunityHooks>;
