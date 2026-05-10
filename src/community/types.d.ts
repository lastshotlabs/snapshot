export type ContentFormat = 'plain' | 'markdown';
export interface AssetRef {
    readonly key: string;
    readonly mime: string;
    readonly url?: string;
    readonly name?: string;
    readonly size?: number;
    readonly width?: number;
    readonly height?: number;
    readonly durationSec?: number;
    readonly metadata?: Record<string, unknown>;
}
export interface VoiceMetadata {
    readonly durationSec: number;
    readonly waveform?: readonly number[];
    readonly transcript?: string;
}
export interface EmbedData {
    readonly url: string;
    readonly title?: string;
    readonly description?: string;
    readonly image?: string;
    readonly siteName?: string;
    readonly favicon?: string;
    readonly type?: string;
}
export interface QuotePreview {
    readonly authorId?: string;
    readonly authorName?: string;
    readonly body?: string;
    readonly createdAt?: string;
}
export interface LocationData {
    readonly lat: number;
    readonly lng: number;
    readonly label?: string;
}
export interface ContactData {
    readonly name: string;
    readonly phone?: string;
    readonly email?: string;
}
export interface SystemEventData {
    readonly type: string;
    readonly actorId?: string;
    readonly subjectIds?: readonly string[];
    readonly metadata?: Record<string, unknown>;
}
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
    readonly id: string;
    readonly tenantId?: string | null;
    readonly containerId: string;
    readonly authorId: string;
    readonly title: string;
    readonly body?: string;
    readonly format: ContentFormat;
    readonly status: 'draft' | 'published' | 'deleted';
    readonly pinned: boolean;
    readonly locked: boolean;
    readonly score: number;
    readonly reactionSummary?: unknown;
    readonly mentions?: readonly string[];
    readonly broadcastMentions?: readonly ('everyone' | 'here')[];
    readonly mentionedRoleIds?: readonly string[];
    readonly attachments?: readonly AssetRef[];
    readonly embeds?: readonly EmbedData[];
    readonly pollId?: string;
    readonly stickerId?: string;
    readonly replyCount: number;
    readonly lastActivityAt?: string;
    readonly lastReplyById?: string;
    readonly lastReplyAt?: string;
    readonly viewCount: number;
    readonly solutionReplyId?: string;
    readonly solutionMarkedAt?: string;
    readonly tagIds?: readonly string[];
    readonly publishedAt?: string;
    readonly createdAt: string;
    readonly updatedAt: string;
}
/**
 * Request body for creating a thread in a container.
 */
export interface CreateThreadBody {
    title: string;
    body: string;
}
/**
 * Extended create-thread body — accepts optional sidecar fields.
 */
export interface CreateThreadBodyExtended extends CreateThreadBody {
    readonly format?: ContentFormat;
    readonly mentions?: readonly string[];
    readonly broadcastMentions?: readonly ('everyone' | 'here')[];
    readonly mentionedRoleIds?: readonly string[];
    readonly attachments?: readonly AssetRef[];
    readonly tagIds?: readonly string[];
}
/**
 * Request body for updating or moderating a thread.
 */
export interface UpdateThreadBody {
    title?: string;
    body?: string;
    pinned?: boolean;
    locked?: boolean;
    format?: ContentFormat;
    attachments?: readonly AssetRef[];
    tagIds?: readonly string[];
}
/**
 * Reply record returned by the community API.
 */
export interface ReplyResponse {
    readonly id: string;
    readonly tenantId?: string | null;
    readonly threadId: string;
    readonly containerId: string;
    readonly parentId?: string;
    readonly authorId: string;
    readonly body: string;
    readonly format: ContentFormat;
    readonly status: 'published' | 'deleted';
    readonly score: number;
    readonly reactionSummary?: unknown;
    readonly mentions?: readonly string[];
    readonly broadcastMentions?: readonly ('everyone' | 'here')[];
    readonly mentionedRoleIds?: readonly string[];
    readonly attachments?: readonly AssetRef[];
    readonly embeds?: readonly EmbedData[];
    readonly stickerId?: string;
    readonly quotedReplyId?: string;
    readonly quotePreview?: QuotePreview;
    readonly isSolution: boolean;
    readonly depth: number;
    readonly createdAt: string;
    readonly updatedAt: string;
}
/**
 * Request body for creating a reply.
 */
export interface CreateReplyBody {
    body: string;
}
/**
 * Extended create-reply body — accepts optional sidecar fields.
 */
export interface CreateReplyBodyExtended extends CreateReplyBody {
    readonly format?: ContentFormat;
    readonly mentions?: readonly string[];
    readonly broadcastMentions?: readonly ('everyone' | 'here')[];
    readonly mentionedRoleIds?: readonly string[];
    readonly attachments?: readonly AssetRef[];
    readonly parentId?: string;
    readonly quotedReplyId?: string;
}
/**
 * Request body for updating an existing reply.
 */
export interface UpdateReplyBody {
    body: string;
    format?: ContentFormat;
    attachments?: readonly AssetRef[];
}
/**
 * Request body for adding/removing an emoji reaction.
 */
export interface ReactionBody {
    emoji: string;
}
/**
 * Reaction record returned by the read endpoints — full shape with `userId`,
 * `type`, and `createdAt`. Mirrors the slingshot-community `Reaction` entity.
 *
 * The list hooks (`useThreadReactions`, `useReplyReactions`) return arrays
 * of this type. Consumers gating UI on "is this MY reaction" read `userId`.
 */
export interface ReactionResponse {
    id: string;
    tenantId?: string | null;
    targetId: string;
    targetType: 'thread' | 'reply';
    containerId?: string | null;
    userId: string;
    type: 'upvote' | 'downvote' | 'emoji';
    /**
     * Emoji string when `type === 'emoji'`. Some response shapes surface this
     * under `emoji`; the entity's canonical column is `value`. Read both
     * defensively at the call site if needed.
     */
    value?: string | null;
    emoji?: string;
    createdAt: string;
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
