'use client';

import { useEffect, useMemo } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import {
  formatValue,
  detectNumericField,
  calculateTrend,
  humanizeFieldName,
} from "./format";
import type { StatCardConfig, UseStatCardResult } from "./types";
import type { FromRef } from "../../../context/types";
import {
  normalizeMetricRows,
  resolveMetricFieldName,
  summarizeMetricRows,
} from "../_shared/metric-fields";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { StatCardBase, type StatCardTrend } from "./standalone";

/**
 * Derive the sentiment label from direction and sentiment config.
 */
function deriveSentiment(
  direction: "up" | "down" | "flat",
  sentiment: "up-is-good" | "up-is-bad",
): "positive" | "negative" | "neutral" {
  if (direction === "flat") return "neutral";
  if (sentiment === "up-is-good") {
    return direction === "up" ? "positive" : "negative";
  }
  return direction === "up" ? "negative" : "positive";
}

/**
 * Internal hook that encapsulates all StatCard logic.
 */
function useStatCardLogic(config: StatCardConfig): UseStatCardResult {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const { data, isLoading, error, refetch } = useComponentData(
    config.data,
    config.params as Record<string, unknown | FromRef> | undefined,
    { poll: config.poll },
  );
  const normalizedData = useMemo(() => {
    if (!data) {
      return null;
    }

    const rawData = data as unknown;
    const usesRowPayload =
      Array.isArray(rawData) ||
      (rawData != null &&
        typeof rawData === "object" &&
        (Array.isArray((rawData as Record<string, unknown>).data) ||
          Array.isArray((rawData as Record<string, unknown>).items)));

    if (!usesRowPayload) {
      return data;
    }

    return summarizeMetricRows(normalizeMetricRows(rawData), [
      config.field,
      config.trend?.field,
    ]);
  }, [config.field, config.trend?.field, data]);

  const result = useMemo((): Omit<UseStatCardResult, "refetch" | "data"> => {
    if (isLoading) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: true,
        error: null,
        trend: null,
      };
    }

    if (error) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: false,
        error,
        trend: null,
      };
    }

    if (!normalizedData) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: false,
        error: null,
        trend: null,
      };
    }

    const fieldName =
      resolveMetricFieldName(normalizedData, config.field) ??
      detectNumericField(normalizedData);
    if (!fieldName) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? "",
        isLoading: false,
        error: new Error("No numeric field found in response"),
        trend: null,
      };
    }

    const rawValue = normalizedData[fieldName];
    const numericValue =
      typeof rawValue === "number" ? rawValue : Number(rawValue);
    if (Number.isNaN(numericValue)) {
      return {
        value: null,
        rawValue: null,
        label: resolvedLabel ?? humanizeFieldName(fieldName),
        isLoading: false,
        error: new Error(`Field "${fieldName}" is not a number`),
        trend: null,
      };
    }

    const label = resolvedLabel ?? humanizeFieldName(fieldName);
    const formatted = formatValue(numericValue, config.format, {
      currency: config.currency,
      decimals: config.decimals,
      prefix: config.prefix,
      suffix: config.suffix,
      divisor: config.divisor,
    });

    let trendResult: UseStatCardResult["trend"] = null;
    if (config.trend) {
      const comparisonField = resolveMetricFieldName(
        normalizedData,
        config.trend.field,
      );
      const comparisonValue = comparisonField
        ? normalizedData[comparisonField]
        : undefined;
      if (
        typeof comparisonValue === "number" &&
        !Number.isNaN(comparisonValue)
      ) {
        const trend = calculateTrend(numericValue, comparisonValue);
        const trendSentiment = config.trend.sentiment ?? "up-is-good";
        const trendFormat = config.trend.format ?? "percent";

        const trendDisplayValue =
          trendFormat === "percent"
            ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Math.abs(trend.percentage))}%`
            : formatValue(trend.value, config.format, {
                currency: config.currency,
                decimals: config.decimals,
              });

        trendResult = {
          direction: trend.direction,
          value: trendDisplayValue,
          percentage: trend.percentage,
          sentiment: deriveSentiment(trend.direction, trendSentiment),
        };
      }
    }

    return {
      value: formatted,
      rawValue: numericValue,
      label,
      isLoading: false,
      error: null,
      trend: trendResult,
    };
  }, [normalizedData, isLoading, error, config, resolvedLabel]);

  return { ...result, refetch, data: normalizedData };
}

export function StatCard({ config }: { config: StatCardConfig }) {
  const { value, rawValue, label, isLoading, error, trend } =
    useStatCardLogic(config);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);

  useEffect(() => {
    if (publish && rawValue !== null) {
      publish({ value: rawValue, label, trend });
    }
  }, [publish, rawValue, label, trend]);

  if (visible === false) return null;

  const surface = extractSurfaceConfig(config);

  return (
    <StatCardBase
      id={config.id}
      value={value}
      label={label}
      isLoading={isLoading}
      error={error ? "Something went wrong" : null}
      icon={config.icon}
      iconColor={config.iconColor}
      loadingVariant={config.loading === "skeleton" || config.loading === "pulse" ? config.loading : undefined}
      trend={trend as StatCardTrend | null | undefined}
      onClick={config.action ? () => void execute(config.action!) : undefined}
      emptyMessage={
        typeof config.empty?.title === "string"
          ? config.empty.title
          : "No data available"
      }
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
