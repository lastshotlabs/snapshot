'use client';

import { useCallback, useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { CalendarBase } from "./standalone";
import type { CalendarEventEntry } from "./standalone";
import type { CalendarConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, fetches data, delegates to CalendarBase.
 */
export function Calendar({ config }: { config: CalendarConfig }) {
  const { data, isLoading, error } = useComponentData(config.data ?? "", undefined);
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const todayLabel = useSubscribe(config.todayLabel) as string | undefined;
  const resolvedConfig = useResolveFrom({ events: config.events });
  const surfaceConfig = extractSurfaceConfig(config);

  const titleField = config.titleField ?? "title";
  const dateField = config.dateField ?? "date";
  const staticEvents =
    ((resolvedConfig.events as CalendarConfig["events"] | undefined) ??
      config.events) as CalendarConfig["events"];

  const events = useMemo<CalendarEventEntry[]>(() => {
    const result: CalendarEventEntry[] = [];
    for (const ev of staticEvents ?? []) {
      result.push({
        title: typeof ev.title === "string" ? ev.title : "",
        date: new Date(ev.date),
        endDate: ev.endDate ? new Date(ev.endDate) : undefined,
        color: ev.color ?? "primary",
        allDay: ev.allDay ?? false,
        raw: ev as unknown as Record<string, unknown>,
      });
    }
    if (data) {
      const items: Record<string, unknown>[] = Array.isArray(data)
        ? (data as Record<string, unknown>[])
        : ["data", "items", "results", "events"].find((key) => Array.isArray((data as Record<string, unknown>)[key]))
          ? ((data as Record<string, unknown>)[["data", "items", "results", "events"].find((key) => Array.isArray((data as Record<string, unknown>)[key]))!] as Record<string, unknown>[])
          : [];
      for (const item of items) {
        const rawDate = item[dateField];
        if (!rawDate) continue;
        result.push({
          title: String(item[titleField] ?? ""),
          date: new Date(String(rawDate)),
          endDate: item.endDate ? new Date(String(item.endDate)) : undefined,
          color: config.colorField ? String(item[config.colorField] ?? "primary") : "primary",
          allDay: Boolean(item.allDay),
          raw: item,
        });
      }
    }
    return result;
  }, [config.colorField, data, dateField, staticEvents, titleField]);

  const handleEventClick = useCallback((event: CalendarEventEntry) => {
    if (config.eventAction) void execute(config.eventAction, { ...event.raw });
  }, [config.eventAction, execute]);

  const handleDateClick = useCallback((date: Date) => {
    if (config.dateAction) {
      void execute(config.dateAction, { date: date.toISOString(), year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    }
  }, [config.dateAction, execute]);

  if (visible === false) return null;

  return (
    <CalendarBase
      id={config.id}
      view={config.view}
      events={events}
      loading={isLoading}
      error={error}
      todayLabel={todayLabel}
      showWeekNumbers={config.showWeekNumbers}
      onDateClick={config.dateAction ? handleDateClick : undefined}
      onEventClick={config.eventAction ? handleEventClick : undefined}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
