/**
 * HTTP error thrown by Snapshot API clients for non-success responses.
 */
export declare class ApiError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(status: number, body: unknown, message?: string);
}
