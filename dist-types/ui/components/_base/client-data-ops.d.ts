export interface ClientFilter {
    field: string;
    operator: "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte" | "in" | "notEquals";
    value: unknown;
}
export interface ClientSort {
    field: string;
    direction: "asc" | "desc";
}
export declare function applyClientFilters<T extends Record<string, unknown>>(data: T[], filters: ClientFilter[]): T[];
export declare function applyClientSort<T extends Record<string, unknown>>(data: T[], sorts: ClientSort[]): T[];
