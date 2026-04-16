/**
 * Community container returned by the community API.
 */
export interface ContainerResponse {
    id: string;
    slug: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    isClosed: boolean;
    createdAt: string;
    updatedAt: string;
}
/**
 * Request body for creating a community container.
 */
export interface CreateContainerBody {
    slug: string;
    name: string;
    description?: string;
    isPrivate?: boolean;
}
/**
 * Request body for updating a community container.
 */
export interface UpdateContainerBody {
    name?: string;
    description?: string;
    isPrivate?: boolean;
    isClosed?: boolean;
}
/**
 * Thread record returned by the community API.
 */
export interface ThreadResponse {
    id: string;
    containerId: string;
    authorId: string;
    title: string;
    body: string;
    isPinned: boolean;
    isLocked: boolean;
    replyCount: number;
    reactionCount: number;
    createdAt: string;
    updatedAt: string;
}
/**
 * Request body for creating a thread in a container.
 */
export interface CreateThreadBody {
    title: string;
    body: string;
}
/**
 * Request body for updating or moderating a thread.
 */
export interface UpdateThreadBody {
    title?: string;
    body?: string;
    isPinned?: boolean;
    isLocked?: boolean;
}
/**
 * Reply record returned by the community API.
 */
export interface ReplyResponse {
    id: string;
    threadId: string;
    authorId: string;
    body: string;
    reactionCount: number;
    createdAt: string;
    updatedAt: string;
}
/**
 * Request body for creating a reply.
 */
export interface CreateReplyBody {
    body: string;
}
/**
 * Request body for updating an existing reply.
 */
export interface UpdateReplyBody {
    body: string;
}
/**
 * Emoji reaction payload for thread and reply reaction endpoints.
 */
export interface ReactionBody {
    emoji: string;
}
/**
 * Request body for filing a community moderation report.
 */
export interface ReportBody {
    reason: string;
    targetType: string;
    targetId: string;
}
/**
 * Report record returned by moderation endpoints.
 */
export interface ReportResponse {
    id: string;
    targetType: string;
    targetId: string;
    reporterId: string;
    reason: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Request body for resolving a moderation report.
 */
export interface ResolveReportBody {
    action: string;
}
/**
 * Request body for creating a user ban.
 */
export interface BanBody {
    userId: string;
    containerId?: string;
    reason?: string;
    expiresAt?: string;
}
/**
 * Ban record returned by moderation endpoints.
 */
export interface BanResponse {
    id: string;
    userId: string;
    containerId?: string;
    reason?: string;
    expiresAt?: string;
    createdAt: string;
}
/**
 * Result returned when checking whether a user is banned.
 */
export interface BanCheckResponse {
    banned: boolean;
    ban?: BanResponse;
}
/**
 * Notification record returned by community notification endpoints.
 */
export interface NotificationResponse {
    id: string;
    userId: string;
    type: string;
    payload: unknown;
    read: boolean;
    createdAt: string;
}
/**
 * Generic paginated list response used by community and webhook list endpoints.
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
/**
 * Search parameters accepted by the community search hooks.
 */
export interface CommunitySearchParams {
    limit?: number;
    cursor?: string;
    containerId?: string;
}
/**
 * Search results returned by the thread and reply search endpoints.
 */
export interface SearchResponse {
    threads?: PaginatedResponse<ThreadResponse>;
    replies?: PaginatedResponse<ReplyResponse>;
}
/**
 * Shared page-based pagination parameters.
 */
export interface ListParams {
    page?: number;
    pageSize?: number;
}
/**
 * List parameters for fetching threads in a specific container.
 */
export interface ThreadListParams extends ListParams {
    containerId: string;
}
/**
 * List parameters for fetching replies in a specific thread.
 */
export interface ReplyListParams extends ListParams {
    threadId: string;
}
