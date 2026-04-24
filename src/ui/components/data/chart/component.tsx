"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai/react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe, useResolveFrom } from "../../../context/hooks";
import { isFromRef } from "../../../context/utils";
import { wsManagerAtom } from "../../../../ws/atom";
import { AutoSkeleton } from "../../_base/auto-skeleton";
import { useComponentData } from "../../_base/use-component-data";
import { useLiveData } from "../../_base/use-live-data";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { ChartConfig } from "./types";
import {
  normalizeMetricRows,
  projectMetricRows,
} from "../_shared/metric-fields";
import {
  resolveLookupValue,
  useLookupMaps,
} from "../_shared/lookups";
import { ChartBase, type ChartBaseSeries } from "./standalone";

export function Chart({ config }: { config: ChartConfig }) {
  const wsManager = useAtomValue(wsManagerAtom);
  const isRef = isFromRef(config.data);
  const resolvedRef = useSubscribe(config.data);
  const emptyMessage = useSubscribe(config.emptyMessage) as string | undefined;
  const resolvedStaticConfig = useResolveFrom({
    series: config.series,
    empty: config.empty,
  });
  const {
    data: fetchedData,
    isLoading,
    error,
    refetch,
  } = useComponentData(config.data, undefined, { poll: config.poll });

  const rows = useMemo<Record<string, unknown>[]>(() => {
    if (isRef) {
      return normalizeMetricRows(resolvedRef);
    }
    return normalizeMetricRows(fetchedData);
  }, [fetchedData, isRef, resolvedRef]);

  const resolvedSeries =
    ((resolvedStaticConfig.series as ChartConfig["series"] | undefined) ??
      config.series) as ChartConfig["series"];

  const chartRows = useMemo<Record<string, unknown>[]>(() => {
    const projectedRows = projectMetricRows(
      rows,
      resolvedSeries.map((series) => series.key),
    );
    return projectedRows.map((row) => {
      const nextRow: Record<string, unknown> = { ...row };

      for (const series of resolvedSeries) {
        const rawValue = nextRow[series.key];
        const numericValue =
          typeof rawValue === "number" ? rawValue : Number(rawValue);
        if (
          series.divisor &&
          series.divisor !== 1 &&
          !Number.isNaN(numericValue)
        ) {
          nextRow[series.key] = numericValue / series.divisor;
        }
      }

      return nextRow;
    });
  }, [resolvedSeries, rows]);

  const resolvedChartConfig = useMemo(
    () => ({ ...config, series: resolvedSeries }),
    [config, resolvedSeries],
  );

  const lookupMaps = useLookupMaps(
    resolvedChartConfig.xLookup
      ? [{ key: resolvedChartConfig.xKey, lookup: resolvedChartConfig.xLookup }]
      : [],
  );

  const displayRows = useMemo<Record<string, unknown>[]>(() => {
    if (!resolvedChartConfig.xLookup) {
      return chartRows;
    }

    return chartRows.map((row) => ({
      ...row,
      [resolvedChartConfig.xKey]: resolveLookupValue(
        row[resolvedChartConfig.xKey],
        resolvedChartConfig.xLookup,
        lookupMaps,
      ),
    }));
  }, [
    chartRows,
    lookupMaps,
    resolvedChartConfig.xKey,
    resolvedChartConfig.xLookup,
  ]);

  const liveConfig = useMemo(
    () =>
      config.live === true
        ? { event: "*", indicator: false, debounce: undefined }
        : config.live
          ? {
              event: config.live.event,
              indicator: config.live.indicator,
              debounce: config.live.debounce,
            }
          : null,
    [config.live],
  );

  const { hasNewData, refresh } = useLiveData({
    event: liveConfig?.event ?? "*",
    onRefresh: refetch,
    debounce: liveConfig?.debounce,
    indicator: liveConfig?.indicator,
    wsManager,
    enabled: liveConfig !== null,
  });

  const execute = useActionExecutor();

  const loading = !isRef && isLoading;
  const fetchError = !isRef ? error : null;

  const surface = extractSurfaceConfig(config, { omit: ["height"] });

  const series: ChartBaseSeries[] = resolvedSeries.map((s) => ({
    key: s.key,
    label: typeof s.label === "string" ? s.label : undefined,
    color: s.color,
    divisor: s.divisor,
  }));

  return (
    <ChartBase
      id={config.id}
      chartType={config.chartType}
      data={displayRows}
      xKey={config.xKey}
      series={series}
      height={config.height}
      aspectRatio={config.aspectRatio}
      grid={config.grid}
      legend={config.legend}
      isLoading={loading}
      error={fetchError ? fetchError.message : null}
      emptyMessage={emptyMessage}
      hideWhenEmpty={config.hideWhenEmpty}
      hasNewData={hasNewData}
      onRefresh={refresh}
      onPointClick={
        config.onClick
          ? (payload, seriesKey) => {
              void execute(config.onClick!, {
                point: payload,
                item: payload,
                seriesKey,
              });
            }
          : undefined
      }
      loadingContent={
        config.loading && !config.loading.disabled ? (
          <AutoSkeleton componentType="chart" config={config.loading} />
        ) : undefined
      }
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
