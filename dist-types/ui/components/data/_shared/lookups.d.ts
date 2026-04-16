export interface LookupConfig {
    resource: string;
    valueField?: string;
    labelField?: string;
}
export interface LookupDefinition {
    key: string;
    lookup: LookupConfig;
}
export declare function getFieldValue(record: Record<string, unknown>, field: string): unknown;
export declare function getLookupSignature(lookup: LookupConfig): string;
export declare function resolveLookupValue(value: unknown, lookup: LookupConfig | undefined, lookupMaps: Record<string, Map<string, unknown>>): unknown;
export declare function useLookupMaps(definitions: LookupDefinition[]): Record<string, Map<string, unknown>>;
