'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import {
  buildRequestUrl,
  isResourceRef,
  resolveEndpointTarget,
  type EndpointTarget,
  type ResourceMap,
} from "../../../manifest/resources";
import {
  useManifestResourceCache,
  useManifestRuntime,
} from "../../../manifest/runtime";
import { useRouteRuntime } from "../../../manifest/runtime";
import { executeEventAction } from "../../_base/events";
import {
  resolveOptionalPrimitiveValue,
  type PrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { useEvaluateExpression } from "../../../expressions/use-expression";
import { resolveTemplateValue } from "../../../expressions/template";
import { useAutoForm } from "./hook";
import { useApiClient } from "../../../state";
import { AutoFormBase, type AutoFormFieldConfig, type AutoFormSectionConfig } from "./standalone";
import type { AutoFormConfig, FieldConfig, FieldSectionConfig } from "./types";
import type { ApiClient } from "../../../../api/client";

// ── Helpers ──────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNormalizedString(value: unknown): string {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (isRecord(value)) {
    const nested =
      value["value"] ?? value["id"] ?? value["key"] ?? value["name"] ?? "";
    return nested === undefined || nested === null ? "" : String(nested);
  }

  return String(value);
}

function toDateInputValue(value: unknown): string {
  if (typeof value === "string") {
    const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (directMatch?.[1]) {
      return directMatch[1];
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return toNormalizedString(value);
}

function toDateTimeInputValue(value: unknown): string {
  if (typeof value === "string") {
    const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
    if (directMatch?.[1] && directMatch[2]) {
      return `${directMatch[1]}T${directMatch[2]}`;
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 16);
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 16);
  }

  return toNormalizedString(value);
}

function toNumericValue(value: unknown, divisor?: number): number | "" {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  if (divisor && divisor !== 1) {
    return numericValue / divisor;
  }

  return numericValue;
}

function normalizeFieldValue(field: FieldConfig, value: unknown): unknown {
  switch (field.type) {
    case "date":
      return toDateInputValue(value);
    case "datetime":
      return toDateTimeInputValue(value);
    case "number":
      return toNumericValue(value, field.divisor);
    case "select":
    case "radio-group":
    case "combobox":
      return toNormalizedString(value);
    case "multi-select":
      if (Array.isArray(value)) {
        return value.map((item) => toNormalizedString(item)).filter(Boolean);
      }
      return value === undefined || value === null || value === ""
        ? []
        : [toNormalizedString(value)];
    case "tag-input":
      if (Array.isArray(value)) {
        return value.map((item) => toNormalizedString(item)).filter(Boolean);
      }
      return typeof value === "string"
        ? value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
    default:
      return value;
  }
}

function normalizeFormValues(
  fields: FieldConfig[],
  data: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const field of fields) {
    if (!(field.name in data)) {
      continue;
    }
    normalized[field.name] = normalizeFieldValue(field, data[field.name]);
  }

  return normalized;
}

function serializeFieldValue(field: FieldConfig, value: unknown): unknown {
  switch (field.type) {
    case "number": {
      if (value === undefined || value === null || value === "") {
        return value;
      }

      const numericValue = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(numericValue)) {
        return value;
      }

      if (field.divisor && field.divisor !== 1) {
        return Math.round(numericValue * field.divisor);
      }

      return numericValue;
    }
    case "multi-select":
      return Array.isArray(value)
        ? value.map((item) => toNormalizedString(item)).filter(Boolean)
        : [];
    case "select":
    case "radio-group":
    case "combobox":
      return toNormalizedString(value);
    default:
      return value;
  }
}

function serializeFormValues(
  fields: FieldConfig[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const field of fields) {
    if (!(field.name in values)) {
      continue;
    }
    serialized[field.name] = serializeFieldValue(field, values[field.name]);
  }

  return serialized;
}

function isHaltSignal(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return value["halt"] === true;
}

export function toFieldOptions(
  data: unknown,
  labelField = "name",
  valueField = "id",
) {
  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === "string") {
          return { label: item, value: item };
        }
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const label =
          record["label"] ?? record[labelField] ?? record["name"] ?? record["title"];
        const value =
          record["value"] ?? record[valueField] ?? record["id"] ?? record["key"];
        if (label == null || value == null) return null;
        return { label: String(label), value: String(value) };
      })
      .filter(
        (item): item is { label: string; value: string } => item !== null,
      );
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const nested = record["data"] ?? record["items"];
    if (Array.isArray(nested)) {
      return toFieldOptions(nested, labelField, valueField);
    }
  }

  return [];
}

// ── Conditional visibility ────────────────────────────────────────────────

function isFieldVisible(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.visible === false) return false;

  if (
    field.visible &&
    typeof field.visible === "object" &&
    "from" in field.visible
  ) {
    return Boolean(values[field.visible.from]);
  }

  if (field.dependsOn) {
    const dep = field.dependsOn;
    const watchedValue = values[dep.field];

    if (dep.value !== undefined) {
      return watchedValue === dep.value;
    }
    if (dep.notValue !== undefined) {
      return watchedValue !== dep.notValue;
    }
    if (dep.filled) {
      return (
        watchedValue !== undefined &&
        watchedValue !== null &&
        watchedValue !== "" &&
        watchedValue !== false
      );
    }
  }

  return true;
}

function isFieldRequired(
  field: FieldConfig,
  values: Record<string, unknown>,
): boolean {
  if (field.required === true) {
    return true;
  }

  return Boolean(
    field.required &&
      typeof field.required === "object" &&
      "from" in field.required &&
      values[field.required.from],
  );
}

// ── Resolve fields ────────────────────────────────────────────────────────

function resolveFields(config: AutoFormConfig): FieldConfig[] {
  if (config.sections) {
    return config.sections.flatMap((s: FieldSectionConfig) => s.fields);
  }
  if (config.fields === "auto") return [];
  return config.fields;
}

function resolveText(
  value: unknown,
  primitiveOptions: PrimitiveValueOptions,
): string | undefined {
  return resolveOptionalPrimitiveValue(value, primitiveOptions);
}

function resolveStaticFieldOptions(
  field: FieldConfig,
  primitiveOptions: PrimitiveValueOptions,
) {
  if (!Array.isArray(field.options)) {
    return field.options;
  }

  return field.options.map((option) => ({
    ...option,
    label: resolveText(option.label, primitiveOptions) ?? option.value,
  }));
}

function buildTemplateContext(
  runtime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: ReturnType<typeof useRouteRuntime>,
): Record<string, unknown> {
  return {
    app: runtime?.app ?? {},
    auth: {
      ...(runtime?.raw.auth ?? {}),
      ...(runtime?.auth ?? {}),
    },
    route: {
      ...(routeRuntime?.currentRoute ?? {}),
      path: routeRuntime?.currentPath,
      params: routeRuntime?.params,
      query: routeRuntime?.query,
    },
  };
}

function resolveMaybeTemplate(
  value: unknown,
  locale: string | undefined,
  runtime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: ReturnType<typeof useRouteRuntime>,
): unknown {
  return resolveTemplateValue(
    value,
    buildTemplateContext(runtime, routeRuntime),
    {
      locale,
      i18n: runtime?.raw.i18n,
    },
  );
}

function resolveEndpointTemplates<T>(
  value: T,
  locale: string | undefined,
  runtime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: ReturnType<typeof useRouteRuntime>,
): T {
  if (typeof value === "string") {
    return resolveMaybeTemplate(value, locale, runtime, routeRuntime) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      resolveEndpointTemplates(item, locale, runtime, routeRuntime),
    ) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        resolveEndpointTemplates(nested, locale, runtime, routeRuntime),
      ]),
    ) as T;
  }

  return value;
}

function buildPrimitiveOptions(
  locale: string | undefined,
  runtime: ReturnType<typeof useManifestRuntime>,
  routeRuntime: ReturnType<typeof useRouteRuntime>,
): PrimitiveValueOptions {
  return {
    context: buildTemplateContext(runtime, routeRuntime),
    locale,
    i18n: runtime?.raw.i18n,
  };
}

// ── Submit helper ─────────────────────────────────────────────────────────

async function submitToApi(
  api: ApiClient,
  target: EndpointTarget,
  resources: ResourceMap | undefined,
  fallbackMethod: "POST" | "PUT" | "PATCH",
  values: Record<string, unknown>,
): Promise<unknown> {
  const request = resolveEndpointTarget(
    target,
    resources,
    undefined,
    fallbackMethod,
  );
  const endpoint = buildRequestUrl(
    request.endpoint,
    request.params,
    { ...request.params, ...values },
  );
  switch (request.method) {
    case "PUT":
      return api.put(endpoint, values);
    case "PATCH":
      return api.patch(endpoint, values);
    default:
      return api.post(endpoint, values);
  }
}

// ── Dynamic options hook ─────────────────────────────────────────────────

/**
 * Resolves options for a single field. Calls useComponentData unconditionally
 * (hook rules) and returns the resolved option array.
 */
function useFieldOptions(
  field: FieldConfig,
  staticFieldOptions: ReturnType<typeof resolveStaticFieldOptions>,
): { label: string; value: string }[] {
  const dynamicTarget =
    !Array.isArray(staticFieldOptions) && staticFieldOptions
      ? staticFieldOptions
      : "";
  const optionsResult = useComponentData(dynamicTarget);

  if (Array.isArray(staticFieldOptions)) {
    return staticFieldOptions as { label: string; value: string }[];
  }

  return toFieldOptions(
    optionsResult.data,
    field.labelField,
    field.valueField,
  );
}

/**
 * Wrapper component that resolves dynamic options and visibleWhen expression
 * for a single field. This is needed because each field may call
 * useComponentData (a hook) for its dynamic options and
 * useEvaluateExpression for its visibleWhen expression.
 *
 * Returns the resolved standalone field config or null if the field
 * should be hidden (visibleWhen evaluated to false).
 */
function useResolvedFieldConfig(
  field: FieldConfig,
  resolvedField: FieldConfig,
  formValues: Record<string, unknown>,
  primitiveOptions: PrimitiveValueOptions,
): AutoFormFieldConfig | null {
  const staticFieldOptions = resolveStaticFieldOptions(
    resolvedField,
    primitiveOptions,
  );
  const fieldOptions = useFieldOptions(resolvedField, staticFieldOptions);
  const showByExpression = useEvaluateExpression(field.visibleWhen);

  if (!showByExpression) {
    return null;
  }

  if (!isFieldVisible(field, formValues)) {
    return null;
  }

  const label = resolveText(resolvedField.label, primitiveOptions) ?? resolvedField.name;
  const placeholder = resolveText(resolvedField.placeholder, primitiveOptions);
  const helperText = resolveText(resolvedField.helperText, primitiveOptions);
  const description = resolveText(resolvedField.description, primitiveOptions);
  const inlineActionLabel = resolveText(
    resolvedField.inlineAction?.label,
    primitiveOptions,
  );
  const inlineActionTarget = resolveText(
    resolvedField.inlineAction?.to,
    primitiveOptions,
  );

  return {
    name: resolvedField.name,
    type: resolvedField.type ?? "text",
    label,
    placeholder,
    helperText,
    description,
    required: isFieldRequired(field, formValues),
    disabled: resolvedField.disabled,
    readOnly: resolvedField.readOnly,
    hidden: false,
    defaultValue: resolvedField.default,
    options: fieldOptions,
    validate: resolvedField.validate,
    validation: resolvedField.validation,
    divisor: resolvedField.divisor,
    inlineAction:
      inlineActionLabel && inlineActionTarget
        ? { label: inlineActionLabel, to: inlineActionTarget }
        : undefined,
    slots: resolvedField.slots as Record<string, Record<string, unknown>> | undefined,
    autoComplete: resolvedField.autoComplete,
    span: resolvedField.span,
    labelField: resolvedField.labelField,
    valueField: resolvedField.valueField,
  };
}

/**
 * Per-field resolver component. Needed because each field may call hooks
 * (useComponentData, useEvaluateExpression) that must be called at
 * the component level with consistent hook ordering.
 */
function FieldResolver({
  field,
  resolvedField,
  formValues,
  primitiveOptions,
  onResolved,
}: {
  field: FieldConfig;
  resolvedField: FieldConfig;
  formValues: Record<string, unknown>;
  primitiveOptions: PrimitiveValueOptions;
  onResolved: (name: string, config: AutoFormFieldConfig | null) => void;
}) {
  const resolved = useResolvedFieldConfig(
    field,
    resolvedField,
    formValues,
    primitiveOptions,
  );

  const serialized = JSON.stringify(resolved);
  const prevRef = useRef(serialized);

  useEffect(() => {
    if (prevRef.current !== serialized) {
      prevRef.current = serialized;
      onResolved(field.name, resolved);
    }
  });

  // On mount, report the initial resolved config
  useEffect(() => {
    onResolved(field.name, resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// ── Main component ────────────────────────────────────────────────────────

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
export function AutoForm({ config }: { config: AutoFormConfig }) {
  const api = useApiClient();
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const runtime = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const resourceCache = useManifestResourceCache();
  const localeState = useSubscribe({ from: "global.locale" });
  const autoSubmitAllowed = useEvaluateExpression(config.autoSubmitWhen);
  const lastAutoSubmitRef = useRef<string | null>(null);
  const lastPublishedStateRef = useRef<string | null>(null);
  const lastInitialDataRef = useRef<string | null>(null);
  const formRef = useRef<ReturnType<typeof useAutoForm> | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const activeLocale = resolveRuntimeLocale(runtime?.raw.i18n, localeState);
  const primitiveOptions = useMemo(
    () => buildPrimitiveOptions(activeLocale, runtime, routeRuntime),
    [activeLocale, routeRuntime, runtime],
  );
  const resolvedDataTarget = useMemo(
    () =>
      resolveEndpointTemplates(
        config.data ?? "",
        activeLocale,
        runtime,
        routeRuntime,
      ),
    [activeLocale, config.data, routeRuntime, runtime],
  );
  const resolvedSubmitTarget = useMemo(
    () =>
      resolveEndpointTemplates(
        config.submit,
        activeLocale,
        runtime,
        routeRuntime,
      ),
    [activeLocale, config.submit, routeRuntime, runtime],
  );
  const initialData = useComponentData(resolvedDataTarget);

  const allFields = useMemo(() => resolveFields(config), [config]);
  const fieldRefValues = useResolveFrom({ fields: allFields });
  const sectionRefValues = useResolveFrom({ sections: config.sections });
  const formCopyRefValues = useResolveFrom({
    submitLabel: config.submitLabel,
    submitLoadingLabel: config.submitLoadingLabel,
  });
  const fieldRefSignature = JSON.stringify(fieldRefValues.fields ?? allFields);
  const sectionRefSignature = JSON.stringify(
    sectionRefValues.sections ?? config.sections ?? null,
  );
  const fieldsWithRefs = useMemo(
    () => (fieldRefValues.fields as FieldConfig[] | undefined) ?? allFields,
    [allFields, fieldRefSignature],
  );
  const sectionsWithRefs = useMemo(
    () =>
      (sectionRefValues.sections as FieldSectionConfig[] | undefined) ??
      config.sections,
    [config.sections, sectionRefSignature],
  );
  const resolvedFields = useMemo(
    () =>
      fieldsWithRefs.map((field) => ({
        ...field,
        label: resolveText(field.label, primitiveOptions) ?? field.name,
        placeholder: resolveText(field.placeholder, primitiveOptions),
        helperText: resolveText(field.helperText, primitiveOptions),
        description: resolveText(field.description, primitiveOptions),
        default: resolveMaybeTemplate(
          field.default,
          activeLocale,
          runtime,
          routeRuntime,
        ),
        options: Array.isArray(field.options)
          ? field.options.map((option) => ({
              ...option,
              label: resolveText(option.label, primitiveOptions) ?? option.value,
            }))
          : resolveEndpointTemplates(
              field.options,
              activeLocale,
              runtime,
              routeRuntime,
            ),
        inlineAction: field.inlineAction
          ? {
              ...field.inlineAction,
              label:
                resolveText(field.inlineAction.label, primitiveOptions) ?? "",
              to: resolveText(field.inlineAction.to, primitiveOptions) ?? "",
            }
          : undefined,
      })),
    [
      primitiveOptions,
      activeLocale,
      fieldsWithRefs,
      routeRuntime,
      runtime?.app,
      runtime?.auth,
      runtime?.raw.i18n,
    ],
  );
  const resolvedFieldMap = useMemo(
    () => new Map(resolvedFields.map((field) => [field.name, field])),
    [resolvedFields],
  );
  const resolvedSections = useMemo(
    () =>
      sectionsWithRefs?.map((section: FieldSectionConfig) => ({
        ...section,
        title: resolveText(section.title, primitiveOptions) ?? "section",
        description: resolveText(section.description, primitiveOptions),
        fields: section.fields.map(
          (field: FieldConfig) => resolvedFieldMap.get(field.name) ?? field,
        ),
      })),
    [primitiveOptions, resolvedFieldMap, sectionsWithRefs],
  );
  const method = config.method ?? "POST";
  const submitLabel =
    resolveText(
      formCopyRefValues.submitLabel ?? config.submitLabel ?? "Submit",
      primitiveOptions,
    ) ?? "Submit";
  const submitLoadingLabel =
    resolveText(
      formCopyRefValues.submitLoadingLabel ??
        config.submitLoadingLabel ??
        "Submitting...",
      primitiveOptions,
    ) ?? "Submitting...";
  const columns = config.columns ?? 1;
  const gap = (config.gap ?? "md") as "xs" | "sm" | "md" | "lg";
  const rootId = config.id ?? "auto-form";

  const onSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!api) {
        throw new Error(
          "AutoForm: API client not provided. " +
            "Provide it through the app state runtime.",
        );
      }

      const runWorkflow = async (
        workflow: string,
        context: Record<string, unknown>,
      ): Promise<unknown> =>
        (
          executeAction as unknown as (
            action: { type: "run-workflow"; workflow: string },
            context?: Record<string, unknown>,
          ) => Promise<unknown>
        )({ type: "run-workflow", workflow }, context);

      try {
        const serializedValues = serializeFormValues(resolvedFields, values);

        if (config.on?.beforeSubmit) {
          const beforeSubmitResult = await runWorkflow(config.on.beforeSubmit, {
            form: {
              values,
            },
          });
          if (isHaltSignal(beforeSubmitResult)) {
            return;
          }
        }

        await executeEventAction(executeAction, config.on?.submit, {
          id: config.id,
          values,
          serializedValues,
        });

        setSaveStatus("saving");
        const result =
          resourceCache && isResourceRef(resolvedSubmitTarget)
            ? await resourceCache.mutateTarget(resolvedSubmitTarget, {
                method,
                payload: serializedValues,
                pathParams: serializedValues,
              })
            : await submitToApi(
                api,
                resolvedSubmitTarget,
                runtime?.resources,
                method,
                serializedValues,
              );

        await executeEventAction(executeAction, config.on?.success, {
          id: config.id,
          values,
          result,
        });
        if (config.on?.afterSubmit) {
          await runWorkflow(config.on.afterSubmit, {
            form: {
              values,
            },
            result,
          });
        }
        if (!config.resetOnSubmit) {
          formRef.current?.markPristine(values);
        }
        lastAutoSubmitRef.current = JSON.stringify(values);
        setSaveStatus("saved");
      } catch (error) {
        setSaveStatus("error");
        let handled = false;
        if (config.on?.error) {
          await executeEventAction(executeAction, config.on.error, {
            id: config.id,
            values,
            error,
          });
          handled = true;
        }
        if (!handled) {
          throw error;
        }
      }
    },
    [
      api,
      config.on?.afterSubmit,
      config.on?.beforeSubmit,
      config.on?.error,
      config.on?.submit,
      config.on?.success,
      config.id,
      method,
      executeAction,
      config.resetOnSubmit,
      resourceCache,
      resolvedSubmitTarget,
      runtime?.resources,
    ],
  );

  const form = useAutoForm(resolvedFields, onSubmit);
  formRef.current = form;

  useEffect(() => {
    if (
      !initialData.data ||
      typeof initialData.data !== "object" ||
      Array.isArray(initialData.data)
    ) {
      return;
    }

    const serializedInitialData = JSON.stringify(initialData.data);
    if (lastInitialDataRef.current === serializedInitialData) {
      return;
    }

    form.setValues(normalizeFormValues(
      resolvedFields,
      initialData.data as Record<string, unknown>,
    ), {
      markPristine: true,
    });
    lastInitialDataRef.current = serializedInitialData;
    lastAutoSubmitRef.current = null;
    setSaveStatus("idle");
  }, [form.setValues, initialData.data, resolvedFields]);

  // Publish form state when id is set
  useEffect(() => {
    if (config.id) {
      const nextPublishedState = {
        values: form.values,
        isDirty: form.isDirty,
        isValid: form.isValid,
        isSubmitting: form.isSubmitting,
        saveStatus,
        errors: form.errors,
      };
      const nextSerialized = JSON.stringify(nextPublishedState);
      if (lastPublishedStateRef.current === nextSerialized) {
        return;
      }

      lastPublishedStateRef.current = nextSerialized;
      publish(nextPublishedState);
    }
  }, [
    config.id,
    publish,
    form.values,
    form.isDirty,
    form.isValid,
    form.isSubmitting,
    saveStatus,
    form.errors,
  ]);

  const handleSubmit = useCallback(async () => {
    const valuesBefore = { ...form.values };
    await form.handleSubmit();
    if (config.resetOnSubmit && !form.isSubmitting) {
      const submitted = Object.keys(valuesBefore).length > 0 && form.isValid;
      if (submitted) {
        form.reset();
      }
    }
  }, [form, config.resetOnSubmit]);

  useEffect(() => {
    if (!config.id) {
      return;
    }

    const onSubmitEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (detail?.formId === config.id) {
        void handleSubmit();
      }
    };

    const onResetEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (detail?.formId === config.id) {
        form.reset();
      }
    };

    window.addEventListener("snapshot:submit-form", onSubmitEvent);
    window.addEventListener("snapshot:reset-form", onResetEvent);
    return () => {
      window.removeEventListener("snapshot:submit-form", onSubmitEvent);
      window.removeEventListener("snapshot:reset-form", onResetEvent);
    };
  }, [config.id, form, handleSubmit]);

  useEffect(() => {
    const allowPristineAutoSubmit =
      typeof config.autoSubmitWhen === "string" &&
      lastAutoSubmitRef.current === null;

    if (
      !config.autoSubmit ||
      !autoSubmitAllowed ||
      (!form.isDirty && !allowPristineAutoSubmit) ||
      !form.isValid ||
      form.isSubmitting
    ) {
      return;
    }

    const serializedValues = JSON.stringify(form.values);
    if (lastAutoSubmitRef.current === serializedValues) {
      return;
    }

    const timer = window.setTimeout(() => {
      void handleSubmit();
    }, config.autoSubmitDelay ?? 800);

    return () => window.clearTimeout(timer);
  }, [
    autoSubmitAllowed,
    config.autoSubmit,
    config.autoSubmitDelay,
    form.isDirty,
    form.isSubmitting,
    form.isValid,
    form.values,
    handleSubmit,
  ]);

  useEffect(() => {
    if (!config.autoSubmit || !form.isDirty || form.isSubmitting) {
      return;
    }

    if (saveStatus !== "idle") {
      setSaveStatus("idle");
    }
  }, [config.autoSubmit, form.isDirty, form.isSubmitting, saveStatus]);

  // ── Resolve manifest fields to standalone field configs ──────────────

  // Track per-field resolved configs from FieldResolver children
  const [resolvedFieldConfigs, setResolvedFieldConfigs] = useState<
    Record<string, AutoFormFieldConfig | null>
  >({});

  const handleFieldResolved = useCallback(
    (name: string, fieldConfig: AutoFormFieldConfig | null) => {
      setResolvedFieldConfigs((prev) => {
        if (prev[name] === fieldConfig) return prev;
        // Deep compare to avoid unnecessary re-renders
        if (
          fieldConfig !== null &&
          prev[name] !== null &&
          prev[name] !== undefined &&
          JSON.stringify(prev[name]) === JSON.stringify(fieldConfig)
        ) {
          return prev;
        }
        return { ...prev, [name]: fieldConfig };
      });
    },
    [],
  );

  // Build the standalone fields/sections from resolved configs
  const standaloneFields = useMemo((): AutoFormFieldConfig[] => {
    return resolvedFields
      .map((field) => {
        const resolved = resolvedFieldConfigs[field.name];
        if (resolved === null) return null; // hidden by visibleWhen
        if (resolved === undefined) {
          // Not yet resolved by FieldResolver; provide a fallback
          // from the resolved manifest field so we render something
          // on the first frame
          if (!isFieldVisible(field, form.values)) return null;
          return {
            name: field.name,
            type: field.type ?? "text",
            label: typeof field.label === "string" ? field.label : field.name,
            placeholder: typeof field.placeholder === "string" ? field.placeholder : undefined,
            helperText: typeof field.helperText === "string" ? field.helperText : undefined,
            description: typeof field.description === "string" ? field.description : undefined,
            required: isFieldRequired(field, form.values),
            disabled: field.disabled,
            readOnly: field.readOnly,
            hidden: false,
            options: Array.isArray(field.options)
              ? (field.options as { label: string; value: string }[])
              : [],
            validate: field.validate,
            validation: field.validation,
            divisor: field.divisor,
            autoComplete: field.autoComplete,
            span: field.span,
            slots: field.slots as Record<string, Record<string, unknown>> | undefined,
          } satisfies AutoFormFieldConfig;
        }
        return resolved;
      })
      .filter((f): f is AutoFormFieldConfig => f !== null);
  }, [resolvedFields, resolvedFieldConfigs, form.values]);

  const standaloneSections = useMemo((): AutoFormSectionConfig[] | undefined => {
    if (!resolvedSections) return undefined;
    return resolvedSections.map((section: FieldSectionConfig) => ({
      title: typeof section.title === "string" ? section.title : undefined,
      description: typeof section.description === "string" ? section.description : undefined,
      fields: section.fields
        .map((field: FieldConfig) => {
          const resolved = resolvedFieldConfigs[field.name];
          if (resolved === null) return null;
          if (resolved === undefined) {
            if (!isFieldVisible(field, form.values)) return null;
            return {
              name: field.name,
              type: field.type ?? "text",
              label: typeof field.label === "string" ? field.label : field.name,
              required: isFieldRequired(field, form.values),
              disabled: field.disabled,
              readOnly: field.readOnly,
              hidden: false,
              span: field.span,
              slots: field.slots as Record<string, Record<string, unknown>> | undefined,
            } satisfies AutoFormFieldConfig;
          }
          return resolved;
        })
        .filter((f: AutoFormFieldConfig | null): f is AutoFormFieldConfig => f !== null),
      slots: section.slots as Record<string, Record<string, unknown>> | undefined,
      collapsible: section.collapsible,
      defaultCollapsed: section.defaultCollapsed,
    }));
  }, [resolvedSections, resolvedFieldConfigs, form.values]);

  // Inline action handler — delegates to manifest action executor
  const handleInlineAction = useCallback(
    (fieldName: string, to: string) => {
      void executeAction({ type: "navigate", to } as never);
    },
    [executeAction],
  );

  if (visible === false) return null;

  return (
    <>
      {/* Field resolvers — each calls hooks for dynamic options and visibleWhen */}
      {allFields.map((field, index) => (
        <FieldResolver
          key={field.name}
          field={field}
          resolvedField={resolvedFieldMap.get(field.name) ?? field}
          formValues={form.values}
          primitiveOptions={primitiveOptions}
          onResolved={handleFieldResolved}
        />
      ))}
      <AutoFormBase
        id={rootId}
        fields={standaloneSections ? undefined : standaloneFields}
        sections={standaloneSections}
        values={form.values}
        errors={form.errors}
        touched={form.touched}
        isSubmitting={form.isSubmitting}
        isDirty={form.isDirty}
        isValid={form.isValid}
        submitLabel={submitLabel}
        submitLoadingLabel={submitLoadingLabel}
        columns={columns}
        gap={gap}
        layout={config.layout}
        onFieldChange={(name, value) => form.setValue(name, value)}
        onFieldBlur={(name) => form.touchField(name)}
        onSubmit={handleSubmit}
        onReset={form.reset}
        onInlineAction={handleInlineAction}
        submitVariant={config.submitVariant}
        submitSize={config.submitSize}
        submitFullWidth={config.submitFullWidth}
        submitIcon={config.submitIcon}
        dataComponent="form"
        dataTestId="form"
        className={config.className as string | undefined}
        style={config.style as React.CSSProperties | undefined}
        slots={config.slots as Record<string, Record<string, unknown>> | undefined}
      />
    </>
  );
}
