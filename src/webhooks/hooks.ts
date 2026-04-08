import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type {
  WebhookEndpointResponse,
  CreateWebhookEndpointBody,
  UpdateWebhookEndpointBody,
  WebhookDeliveryResponse,
  ListWebhookDeliveriesParams,
  TestWebhookBody,
} from "./types";
import type { PaginatedResponse } from "../community/types";

// ── Cache key helpers ──────────────────────────────────────────────────────────

const keys = {
  endpoints: () => ["webhooks", "endpoints"] as const,
  endpoint: (endpointId: string) =>
    ["webhooks", "endpoints", endpointId] as const,
  deliveries: (endpointId: string) =>
    ["webhooks", "deliveries", endpointId] as const,
  deliveryDetail: (deliveryId: string) =>
    ["webhooks", "deliveries", "detail", deliveryId] as const,
};

// ── Factory ───────────────────────────────────────────────────────────────────

export function createWebhookHooks({
  api,
  queryClient: _qc,
}: {
  api: ApiClient;
  queryClient: QueryClient;
}) {
  // ── Endpoints ─────────────────────────────────────────────────────────────────

  function useWebhookEndpoints() {
    return useQuery<WebhookEndpointResponse[], ApiError>({
      queryKey: keys.endpoints(),
      queryFn: () => api.get<WebhookEndpointResponse[]>("/webhooks/endpoints"),
    });
  }

  function useWebhookEndpoint(endpointId: string) {
    return useQuery<WebhookEndpointResponse, ApiError>({
      queryKey: keys.endpoint(endpointId),
      queryFn: () =>
        api.get<WebhookEndpointResponse>(`/webhooks/endpoints/${endpointId}`),
      enabled: !!endpointId,
    });
  }

  function useCreateWebhookEndpoint() {
    const queryClient = useQueryClient();
    return useMutation<
      WebhookEndpointResponse,
      ApiError,
      CreateWebhookEndpointBody
    >({
      mutationFn: (body) =>
        api.post<WebhookEndpointResponse>("/webhooks/endpoints", body),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.endpoints() });
      },
    });
  }

  function useUpdateWebhookEndpoint() {
    const queryClient = useQueryClient();
    return useMutation<
      WebhookEndpointResponse,
      ApiError,
      { endpointId: string } & UpdateWebhookEndpointBody
    >({
      mutationFn: ({ endpointId, ...body }) =>
        api.patch<WebhookEndpointResponse>(
          `/webhooks/endpoints/${endpointId}`,
          body,
        ),
      onSuccess: (_data, { endpointId }) => {
        void queryClient.invalidateQueries({ queryKey: keys.endpoints() });
        void queryClient.invalidateQueries({
          queryKey: keys.endpoint(endpointId),
        });
      },
    });
  }

  function useDeleteWebhookEndpoint() {
    const queryClient = useQueryClient();
    return useMutation<void, ApiError, { endpointId: string }>({
      mutationFn: ({ endpointId }) =>
        api.delete<void>(`/webhooks/endpoints/${endpointId}`),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.endpoints() });
      },
    });
  }

  // ── Deliveries ────────────────────────────────────────────────────────────────

  function useWebhookDeliveries({
    endpointId,
    page,
    pageSize,
  }: ListWebhookDeliveriesParams) {
    const query = `?page=${page ?? 1}&pageSize=${pageSize ?? 20}`;
    return useQuery<PaginatedResponse<WebhookDeliveryResponse>, ApiError>({
      queryKey: keys.deliveries(endpointId),
      queryFn: () =>
        api.get<PaginatedResponse<WebhookDeliveryResponse>>(
          `/webhooks/endpoints/${endpointId}/deliveries${query}`,
        ),
      enabled: !!endpointId,
    });
  }

  function useWebhookDelivery(deliveryId: string) {
    return useQuery<WebhookDeliveryResponse, ApiError>({
      queryKey: keys.deliveryDetail(deliveryId),
      queryFn: () =>
        api.get<WebhookDeliveryResponse>(`/webhooks/deliveries/${deliveryId}`),
      enabled: !!deliveryId,
    });
  }

  // ── Test ──────────────────────────────────────────────────────────────────────

  function useTestWebhookEndpoint() {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      ApiError,
      { endpointId: string } & TestWebhookBody
    >({
      mutationFn: ({ endpointId, ...body }) =>
        api.post<void>(`/webhooks/endpoints/${endpointId}/test`, body),
      onSuccess: (_data, { endpointId }) => {
        void queryClient.invalidateQueries({
          queryKey: keys.deliveries(endpointId),
        });
      },
    });
  }

  // ── Return all hooks ──────────────────────────────────────────────────────────

  return {
    useWebhookEndpoints,
    useWebhookEndpoint,
    useCreateWebhookEndpoint,
    useUpdateWebhookEndpoint,
    useDeleteWebhookEndpoint,
    useWebhookDeliveries,
    useWebhookDelivery,
    useTestWebhookEndpoint,
  };
}

export type WebhookHooks = ReturnType<typeof createWebhookHooks>;
