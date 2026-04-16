import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { WebhookEndpointResponse, CreateWebhookEndpointBody, UpdateWebhookEndpointBody, WebhookDeliveryResponse, ListWebhookDeliveriesParams, TestWebhookBody } from "./types";
import type { PaginatedResponse } from "../community/types";
/**
 * Creates a set of React hooks for managing webhook endpoints, deliveries, and testing.
 *
 * @param options - Factory configuration.
 * @param options.api - The API client used to make HTTP requests.
 * @param options.queryClient - The TanStack Query client for cache management.
 * @returns An object containing all webhook-related query and mutation hooks.
 */
export declare function createWebhookHooks({ api, queryClient: _qc, }: {
    api: ApiClient;
    queryClient: QueryClient;
}): {
    useWebhookEndpoints: () => import("@tanstack/react-query").UseQueryResult<WebhookEndpointResponse[], ApiError>;
    useWebhookEndpoint: (endpointId: string) => import("@tanstack/react-query").UseQueryResult<WebhookEndpointResponse, ApiError>;
    useCreateWebhookEndpoint: () => import("@tanstack/react-query").UseMutationResult<WebhookEndpointResponse, ApiError, CreateWebhookEndpointBody, unknown>;
    useUpdateWebhookEndpoint: () => import("@tanstack/react-query").UseMutationResult<WebhookEndpointResponse, ApiError, {
        endpointId: string;
    } & UpdateWebhookEndpointBody, unknown>;
    useDeleteWebhookEndpoint: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        endpointId: string;
    }, unknown>;
    useWebhookDeliveries: ({ endpointId, page, pageSize, }: ListWebhookDeliveriesParams) => import("@tanstack/react-query").UseQueryResult<PaginatedResponse<WebhookDeliveryResponse>, ApiError>;
    useWebhookDelivery: (deliveryId: string) => import("@tanstack/react-query").UseQueryResult<WebhookDeliveryResponse, ApiError>;
    useTestWebhookEndpoint: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, {
        endpointId: string;
    } & TestWebhookBody, unknown>;
};
/**
 * Hook surface returned by `createWebhookHooks()`.
 */
export type WebhookHooks = ReturnType<typeof createWebhookHooks>;
