/**
 * Webhook endpoint record returned by the webhook API.
 */
export interface WebhookEndpointResponse {
    id: string;
    url: string;
    events: string[];
    secretHint: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
/**
 * Request body for creating a webhook endpoint.
 */
export interface CreateWebhookEndpointBody {
    url: string;
    events: string[];
}
/**
 * Request body for updating a webhook endpoint.
 */
export interface UpdateWebhookEndpointBody {
    url?: string;
    events?: string[];
    isActive?: boolean;
}
/**
 * Delivery record returned for a webhook endpoint event attempt.
 */
export interface WebhookDeliveryResponse {
    id: string;
    endpointId: string;
    event: string;
    payload: unknown;
    status: string;
    attempts: number;
    maxAttempts: number;
    lastAttemptAt?: string;
    createdAt: string;
}
/**
 * Page-based pagination parameters for listing webhook endpoints.
 */
export interface ListWebhookEndpointsParams {
    page?: number;
    pageSize?: number;
}
/**
 * Parameters for listing deliveries for a single webhook endpoint.
 */
export interface ListWebhookDeliveriesParams {
    endpointId: string;
    page?: number;
    pageSize?: number;
}
/**
 * Request body for sending a test delivery through a webhook endpoint.
 */
export interface TestWebhookBody {
    event: string;
}
