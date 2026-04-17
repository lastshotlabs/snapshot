export interface ChartRefValue {
    from: string;
    transform?: string;
    transformArg?: string | number;
}
export interface SeriesConfig {
    key: string;
    label: string | ChartRefValue;
    color?: string;
    divisor?: number;
}
export interface ChartLookupConfig {
    resource: string;
    valueField?: string;
    labelField?: string;
}
export interface ChartEmptyActionConfig {
    label?: string;
    action?: unknown;
    icon?: string;
    variant?: "default" | "primary" | "outline";
}
export interface ChartEmptyConfig {
    id?: string;
    className?: string;
    style?: Record<string, string | number>;
    size?: "sm" | "md" | "lg";
    icon?: string;
    iconColor?: string;
    title?: string;
    description?: string;
    slots?: Record<string, unknown>;
    action?: ChartEmptyActionConfig;
}
export type ChartSlotName = "root" | "legend" | "legendItem" | "tooltip" | "series" | "axis" | "grid";
export interface ChartConfig {
    type: "chart";
    data: unknown;
    chartType: "bar" | "line" | "area" | "pie" | "donut" | "sparkline" | "funnel" | "radar" | "treemap" | "scatter";
    xKey: string;
    xLookup?: ChartLookupConfig;
    series: SeriesConfig[];
    height?: number;
    aspectRatio?: string;
    legend?: boolean;
    grid?: boolean;
    emptyMessage?: string | ChartRefValue;
    empty?: ChartEmptyConfig;
    hideWhenEmpty?: boolean;
    loading?: unknown;
    live?: unknown;
    onClick?: unknown;
    poll?: unknown;
    slots?: Partial<Record<ChartSlotName, Record<string, unknown>>>;
    id?: string;
    [key: string]: unknown;
}
