function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.message === "string") return b.message;
    if (typeof b.error === "string") return b.error;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? extractMessage(body) ?? `HTTP ${status}`);
    this.name = "ApiError";
    // Maintain proper prototype chain in transpiled environments
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
