import type { AutoFormConfig } from "./types";
export declare function toFieldOptions(data: unknown, labelField?: string, valueField?: string): {
    label: string;
    value: string;
}[];
/**
 * Config-driven form component with multi-column layout, conditional
 * field visibility, and section grouping.
 *
 * Supports client-side validation, submission to an API endpoint,
 * manifest-aware resource mutation (invalidation + optimistic handling),
 * workflow lifecycle hooks (`beforeSubmit`, `afterSubmit`, `error`),
 * and action chaining on success/error. Publishes form state to the
 * page context when an `id` is configured.
 *
 * @param props - Component props containing the form config
 */
export declare function AutoForm({ config }: {
    config: AutoFormConfig;
}): import("react/jsx-runtime").JSX.Element | null;
