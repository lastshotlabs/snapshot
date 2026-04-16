export declare function normalizeMetricRows(raw: unknown): Record<string, unknown>[];
export declare function resolveMetricFieldName(record: Record<string, unknown>, preferredField?: string): string | undefined;
export declare function resolveMetricFieldNameFromRows(rows: Record<string, unknown>[], preferredField?: string): string | undefined;
export declare function summarizeMetricRows(rows: Record<string, unknown>[], requestedFields: Array<string | undefined>): Record<string, unknown> | null;
export declare function projectMetricRows(rows: Record<string, unknown>[], requestedFields: string[]): Record<string, unknown>[];
