import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { ListWebhookDeliveriesParams } from "./types";
export declare function createWebhookHooks({ api, queryClient: _qc, }: {
    api: ApiClient;
    queryClient: QueryClient;
}): {
    useWebhookEndpoints: () => any;
    useWebhookEndpoint: (endpointId: string) => any;
    useCreateWebhookEndpoint: () => any;
    useUpdateWebhookEndpoint: () => any;
    useDeleteWebhookEndpoint: () => any;
    useWebhookDeliveries: ({ endpointId, page, pageSize, }: ListWebhookDeliveriesParams) => any;
    useWebhookDelivery: (deliveryId: string) => any;
    useTestWebhookEndpoint: () => any;
};
export type WebhookHooks = ReturnType<typeof createWebhookHooks>;
