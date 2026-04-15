'use client';

import { useCallback, useMemo, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { useComponentData } from "../../_base/use-component-data";
import type { CalendarConfig, ResolvedEvent } from "./types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function today(d: Date) {
  return sameDay(d, new Date());
}
function weekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}
function weekNumber(d: Date) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  x.setUTCDate(x.getUTCDate() + 4 - (x.getUTCDay() || 7));
  const start = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x.getTime() - start.getTime()) / 86400000 + 1) / 7);
}
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const dates: Date[] = [];
  for (let i = first.getDay() - 1; i >= 0; i -= 1) dates.push(new Date(year, month, -i));
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d += 1) dates.push(new Date(year, month, d));
  while (dates.length < 42) {
    const last = dates[dates.length - 1]!;
    dates.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return dates;
}
function weekStart(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function weekDates(d: Date) {
  const start = weekStart(d);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x;
  });
}
function monthYear(year: number, month: number) {
  return new Date(year, month).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function EventPill({
  id,
  event,
  clickable,
  onClick,
  slots,
}: {
  id: string;
  event: ResolvedEvent;
  clickable: boolean;
  onClick?: () => void;
  slots: CalendarConfig["slots"];
}) {
  const surface = resolveSurfacePresentation({
    surfaceId: id,
    implementationBase: {
      paddingY: "2xs",
      paddingX: "xs",
      borderRadius: "sm",
      fontSize: "xs",
      cursor: clickable ? "pointer" : "default",
      hover: clickable ? { opacity: 0.85 } : undefined,
      focus: clickable ? { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" } : undefined,
      style: {
        backgroundColor: `var(--sn-color-${event.color}, var(--sn-color-primary, #2563eb))`,
        color: `var(--sn-color-${event.color}-foreground, #fff)`,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: "var(--sn-leading-tight, 1.4)",
        border: "none",
        width: "100%",
        textAlign: "left",
      },
    },
    componentSurface: slots?.event,
  });
  const body = clickable ? (
    <div data-calendar-event data-snapshot-id={id} title={event.title}>
      <ButtonControl
        type="button"
        variant="ghost"
        size="sm"
        surfaceId={id}
        title={event.title}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        surfaceConfig={surface.resolvedConfigForWrapper}
      >
        {event.title}
      </ButtonControl>
    </div>
  ) : (
    <div data-calendar-event data-snapshot-id={id} title={event.title} className={surface.className} style={surface.style}>
      {event.title}
    </div>
  );
  return (
    <>
      {body}
      <SurfaceStyles css={surface.scopedCss} />
    </>
  );
}

export function Calendar({ config }: { config: CalendarConfig }) {
  const { data, isLoading, error } = useComponentData(config.data ?? "", undefined);
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const rootId = config.id ?? "calendar";
  const view = config.view ?? "month";
  const titleField = config.titleField ?? "title";
  const dateField = config.dateField ?? "date";

  const events = useMemo<ResolvedEvent[]>(() => {
    const result: ResolvedEvent[] = [];
    for (const ev of config.events ?? []) {
      result.push({
        title: ev.title,
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
  }, [config.colorField, config.events, data, dateField, titleField]);

  const forDate = useCallback((date: Date) => events.filter((event) => sameDay(event.date, date)), [events]);
  const eventClick = useCallback((event: ResolvedEvent) => {
    if (config.eventAction) void execute(config.eventAction, { ...event.raw });
  }, [config.eventAction, execute]);
  const dateClick = useCallback((date: Date) => {
    if (config.dateAction) {
      void execute(config.dateAction, { date: date.toISOString(), year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    }
  }, [config.dateAction, execute]);
  const goPrev = useCallback(() => {
    setCurrentDate((d) => view === "month" ? new Date(d.getFullYear(), d.getMonth() - 1, 1) : new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
  }, [view]);
  const goNext = useCallback(() => {
    setCurrentDate((d) => view === "month" ? new Date(d.getFullYear(), d.getMonth() + 1, 1) : new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
  }, [view]);
  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  if (visible === false) return null;

  const title = useMemo(() => {
    if (view === "month") return monthYear(currentDate.getFullYear(), currentDate.getMonth());
    const dates = weekDates(currentDate);
    const first = dates[0]!;
    const last = dates[6]!;
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString(undefined, { month: "long" })} ${first.getDate()}-${last.getDate()}, ${first.getFullYear()}`;
    }
    return `${first.toLocaleDateString(undefined, { month: "short" })} ${first.getDate()} - ${last.toLocaleDateString(undefined, { month: "short" })} ${last.getDate()}, ${last.getFullYear()}`;
  }, [currentDate, view]);

  const rootSurface = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: {}, componentSurface: config, itemSurface: config.slots?.root });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: { display: "flex", alignItems: "center", justifyContent: "between", style: { marginBottom: "var(--sn-spacing-md, 12px)" } },
    componentSurface: config.slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: { fontSize: "lg", fontWeight: "semibold", color: "var(--sn-color-foreground, #0f172a)", style: { margin: 0 } },
    componentSurface: config.slots?.title,
  });
  const navGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-navGroup`,
    implementationBase: { display: "flex", gap: "xs" },
    componentSurface: config.slots?.navGroup,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingState`,
    implementationBase: { padding: "lg", textAlign: "center", fontSize: "sm", color: "var(--sn-color-muted-foreground, #64748b)" },
    componentSurface: config.slots?.loadingState,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorState`,
    implementationBase: { padding: "lg", textAlign: "center", fontSize: "sm", color: "var(--sn-color-destructive, #ef4444)" },
    componentSurface: config.slots?.errorState,
  });
  const frameSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-frame`,
    implementationBase: { overflow: "hidden", borderRadius: "md", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)" },
    componentSurface: config.slots?.frame,
  });
  const scrollerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-scroller`,
    implementationBase: { overflow: "auto", style: { minWidth: "600px" } },
    componentSurface: config.slots?.scroller,
  });

  const nav = (id: string, text: string, onClick: () => void, ariaLabel?: string) => {
    const surface = resolveSurfacePresentation({
      surfaceId: `${rootId}-nav-${id}`,
      implementationBase: {
        paddingY: "xs",
        paddingX: "sm",
        borderRadius: "sm",
        border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
        bg: "var(--sn-color-card, #fff)",
        cursor: "pointer",
        fontSize: "sm",
        hover: { bg: "var(--sn-color-secondary, #f3f4f6)" },
        focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
      },
      componentSurface: config.slots?.navButton,
    });
    return (
      <div key={id}>
        <ButtonControl
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClick}
          testId={`calendar-nav-${id}`}
          ariaLabel={ariaLabel}
          surfaceId={`${rootId}-nav-${id}`}
          surfaceConfig={surface.resolvedConfigForWrapper}
        >
          {text}
        </ButtonControl>
        <SurfaceStyles css={surface.scopedCss} />
      </div>
    );
  };

  const cell = (date: Date, cellId: string, monthIndex?: number) => {
    const current = monthIndex == null || date.getMonth() === monthIndex;
    const isCurrent = today(date);
    const dayEvents = forDate(date);
    const cellSurface = resolveSurfacePresentation({
      surfaceId: cellId,
      implementationBase: {
        padding: monthIndex == null ? "sm" : "xs",
        cursor: config.dateAction ? "pointer" : "default",
        hover: { bg: "color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 50%, transparent)" },
        style: {
          minHeight: monthIndex == null ? "200px" : "80px",
          backgroundColor: weekend(date) ? "color-mix(in oklch, var(--sn-color-muted, #f3f4f6) 30%, transparent)" : undefined,
        },
      },
      componentSurface: config.slots?.cell,
    });
    const numSurface = resolveSurfacePresentation({
      surfaceId: `${cellId}-num`,
      implementationBase: { fontSize: monthIndex == null ? "lg" : "sm", color: current ? "var(--sn-color-foreground, #0f172a)" : "var(--sn-color-muted-foreground, #94a3b8)" },
      componentSurface: isCurrent ? config.slots?.currentDateNumber : config.slots?.dateNumber,
    });
    const eventsSurface = resolveSurfacePresentation({
      surfaceId: `${cellId}-events`,
      implementationBase: { display: "flex", flexDirection: "column", gap: monthIndex == null ? "xs" : "2xs" },
      componentSurface: config.slots?.events,
    });
    return (
      <div data-calendar-cell data-snapshot-id={cellId} onClick={() => dateClick(date)} className={cellSurface.className} style={cellSurface.style}>
        <div style={monthIndex == null ? { textAlign: "center", marginBottom: "var(--sn-spacing-sm, 8px)" } : { display: "flex", justifyContent: "flex-end", marginBottom: "var(--sn-spacing-xs, 2px)" }}>
          {monthIndex == null ? (
            <>
              <div
                data-snapshot-id={`${cellId}-day`}
                className={resolveSurfacePresentation({
                  surfaceId: `${cellId}-day`,
                  implementationBase: { fontSize: "xs", fontWeight: "semibold", color: "var(--sn-color-muted-foreground, #64748b)" },
                  componentSurface: config.slots?.dayHeader,
                }).className}
                style={resolveSurfacePresentation({
                  surfaceId: `${cellId}-day`,
                  implementationBase: { fontSize: "xs", fontWeight: "semibold", color: "var(--sn-color-muted-foreground, #64748b)" },
                  componentSurface: config.slots?.dayHeader,
                }).style}
              >
                {DAY_NAMES[date.getDay()]}
              </div>
              <span
                data-snapshot-id={`${cellId}-num`}
                className={numSurface.className}
                style={isCurrent ? { ...(numSurface.style ?? {}), backgroundColor: "var(--sn-color-primary, #2563eb)", color: "var(--sn-color-primary-foreground, #fff)", borderRadius: "var(--sn-radius-full, 9999px)", width: "32px", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center" } : numSurface.style}
              >
                {date.getDate()}
              </span>
            </>
          ) : (
            <span
              data-snapshot-id={`${cellId}-num`}
              className={numSurface.className}
              style={isCurrent ? { ...(numSurface.style ?? {}), backgroundColor: "var(--sn-color-primary, #2563eb)", color: "var(--sn-color-primary-foreground, #fff)", borderRadius: "var(--sn-radius-full, 9999px)", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center" } : numSurface.style}
            >
              {date.getDate()}
            </span>
          )}
        </div>
        <div data-snapshot-id={`${cellId}-events`} className={eventsSurface.className} style={eventsSurface.style}>
          {(monthIndex == null ? dayEvents : dayEvents.slice(0, 3)).map((event, i) => (
            <EventPill key={i} id={`${cellId}-event-${i}`} event={event} clickable={Boolean(config.eventAction)} onClick={config.eventAction ? () => eventClick(event) : undefined} slots={config.slots} />
          ))}
          {monthIndex != null && dayEvents.length > 3 ? (
            <div
              data-snapshot-id={`${cellId}-more`}
              className={resolveSurfacePresentation({
                surfaceId: `${cellId}-more`,
                implementationBase: { paddingX: "xs", fontSize: "xs", color: "var(--sn-color-muted-foreground, #64748b)", style: { cursor: "pointer" } },
                componentSurface: config.slots?.overflowMore,
              }).className}
              style={resolveSurfacePresentation({
                surfaceId: `${cellId}-more`,
                implementationBase: { paddingX: "xs", fontSize: "xs", color: "var(--sn-color-muted-foreground, #64748b)", style: { cursor: "pointer" } },
                componentSurface: config.slots?.overflowMore,
              }).style}
            >
              +{dayEvents.length - 3} more
            </div>
          ) : null}
        </div>
        <SurfaceStyles css={cellSurface.scopedCss} />
        <SurfaceStyles css={numSurface.scopedCss} />
        <SurfaceStyles css={eventsSurface.scopedCss} />
      </div>
    );
  };

  const renderMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dates = monthGrid(year, month);
    const weeks = Array.from({ length: 6 }, (_, i) => dates.slice(i * 7, i * 7 + 7));
    const rowSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-dayHeaderRow`,
      implementationBase: { display: "grid", gap: "2xs", style: { gridTemplateColumns: config.showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)" } },
      componentSurface: config.slots?.dayHeaderRow,
    });
    return (
      <>
        <div data-snapshot-id={`${rootId}-dayHeaderRow`} className={rowSurface.className} style={rowSurface.style}>
          {config.showWeekNumbers ? <div /> : null}
          {DAY_NAMES.map((name) => {
            const surface = resolveSurfacePresentation({
              surfaceId: `${rootId}-dayHeader-${name}`,
              implementationBase: { padding: "xs", textAlign: "center", fontSize: "xs", fontWeight: "semibold", color: "var(--sn-color-muted-foreground, #64748b)" },
              componentSurface: config.slots?.dayHeader,
            });
            return <div key={name} data-snapshot-id={`${rootId}-dayHeader-${name}`} className={surface.className} style={surface.style}>{name}<SurfaceStyles css={surface.scopedCss} /></div>;
          })}
        </div>
        <SurfaceStyles css={rowSurface.scopedCss} />
        {weeks.map((week, wi) => {
          const weekSurface = resolveSurfacePresentation({
            surfaceId: `${rootId}-weekRow-${wi}`,
            implementationBase: { display: "grid", gap: "2xs", style: { gridTemplateColumns: config.showWeekNumbers ? "40px repeat(7, 1fr)" : "repeat(7, 1fr)", borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)" } },
            componentSurface: config.slots?.weekRow,
          });
          return (
            <div key={wi} data-snapshot-id={`${rootId}-weekRow-${wi}`} className={weekSurface.className} style={weekSurface.style}>
              {config.showWeekNumbers ? (
                <div
                  data-snapshot-id={`${rootId}-weekNumber-${wi}`}
                  className={resolveSurfacePresentation({
                    surfaceId: `${rootId}-weekNumber-${wi}`,
                    implementationBase: { padding: "xs", display: "flex", alignItems: "start", justifyContent: "center", fontSize: "xs", color: "var(--sn-color-muted-foreground, #94a3b8)" },
                    componentSurface: config.slots?.weekNumber,
                  }).className}
                  style={resolveSurfacePresentation({
                    surfaceId: `${rootId}-weekNumber-${wi}`,
                    implementationBase: { padding: "xs", display: "flex", alignItems: "start", justifyContent: "center", fontSize: "xs", color: "var(--sn-color-muted-foreground, #94a3b8)" },
                    componentSurface: config.slots?.weekNumber,
                  }).style}
                >
                  {weekNumber(week[0]!)}
                </div>
              ) : null}
              {week.map((date, di) => <div key={di}>{cell(date, `${rootId}-cell-${wi}-${di}`, month)}</div>)}
              <SurfaceStyles css={weekSurface.scopedCss} />
            </div>
          );
        })}
      </>
    );
  };

  const renderWeek = () => {
    const dates = weekDates(currentDate);
    const surface = resolveSurfacePresentation({
      surfaceId: `${rootId}-weekGrid`,
      implementationBase: { display: "grid", gap: "2xs", style: { gridTemplateColumns: "repeat(7, 1fr)" } },
      componentSurface: config.slots?.weekRow,
    });
    return (
      <>
        <div data-snapshot-id={`${rootId}-weekGrid`} className={surface.className} style={surface.style}>
          {dates.map((date, i) => <div key={i}>{cell(date, `${rootId}-weekCell-${i}`)}</div>)}
        </div>
        <SurfaceStyles css={surface.scopedCss} />
      </>
    );
  };

  return (
    <>
      <div data-snapshot-component="calendar" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        <div data-calendar-header data-snapshot-id={`${rootId}-header`} className={headerSurface.className} style={headerSurface.style}>
          <h2 data-snapshot-id={`${rootId}-title`} className={titleSurface.className} style={titleSurface.style}>{title}</h2>
          <div data-snapshot-id={`${rootId}-navGroup`} className={navGroupSurface.className} style={navGroupSurface.style}>
            {nav("prev", "\u2039", goPrev, view === "month" ? "Previous month" : "Previous week")}
            {nav("today", config.todayLabel ?? "Today", goToday)}
            {nav("next", "\u203A", goNext, view === "month" ? "Next month" : "Next week")}
          </div>
        </div>

        {isLoading ? <div data-calendar-loading data-snapshot-id={`${rootId}-loadingState`} className={loadingSurface.className} style={loadingSurface.style}>Loading events...</div> : null}
        {error ? <div data-calendar-error role="alert" data-snapshot-id={`${rootId}-errorState`} className={errorSurface.className} style={errorSurface.style}>Error: {error.message}</div> : null}
        {!isLoading && !error ? (
          <div data-snapshot-id={`${rootId}-frame`} className={frameSurface.className} style={frameSurface.style}>
            <div data-snapshot-id={`${rootId}-scroller`} className={scrollerSurface.className} style={scrollerSurface.style}>
              {view === "month" ? renderMonth() : renderWeek()}
            </div>
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={navGroupSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={frameSurface.scopedCss} />
      <SurfaceStyles css={scrollerSurface.scopedCss} />
    </>
  );
}
