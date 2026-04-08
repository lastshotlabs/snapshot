import React, { useState, useMemo, useCallback } from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useActionExecutor } from "../../../actions/executor";
import type { CalendarConfig, ResolvedEvent } from "./types";

// ── Date helpers ───────────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Get ISO week number for a date. */
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Get all dates to display in a month grid (includes prev/next month padding). */
function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const dates: Date[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    dates.push(new Date(year, month, -i));
  }

  // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(new Date(year, month, d));
  }

  // Next month padding to fill 6 rows
  while (dates.length < 42) {
    const last = dates[dates.length - 1]!;
    dates.push(
      new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
    );
  }

  return dates;
}

/** Get start-of-week (Sunday) for a given date. */
function getWeekStart(d: Date): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

/** Get 7 days of a week starting from a date's week start. */
function getWeekDates(d: Date): Date[] {
  const start = getWeekStart(d);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

/** Format month/year for display. */
function formatMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

// ── Event pill ─────────────────────────────────────────────────────────────

function EventPill({
  event,
  onClick,
}: {
  event: ResolvedEvent;
  onClick?: () => void;
}) {
  const bg = `var(--sn-color-${event.color}, var(--sn-color-primary, #2563eb))`;
  const fg = `var(--sn-color-${event.color}-foreground, #fff)`;

  return (
    <div
      data-calendar-event
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={event.title}
      style={{
        backgroundColor: bg,
        color: fg,
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        padding: "1px var(--sn-spacing-xs, 4px)",
        borderRadius: "var(--sn-radius-sm, 4px)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        lineHeight: 1.4,
      }}
    >
      {event.title}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * Config-driven Calendar component.
 *
 * Renders a month or week view calendar with events sourced from an API
 * endpoint or static event definitions. Supports prev/next navigation,
 * event click actions, and date cell click actions.
 *
 * @param props - Component props containing the Calendar configuration
 */
export function Calendar({ config }: { config: CalendarConfig }) {
  const { data, isLoading } = useComponentData(config.data ?? "", undefined);
  const execute = useActionExecutor();
  const view = config.view ?? "month";
  const titleField = config.titleField ?? "title";
  const dateField = config.dateField ?? "date";

  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Resolve events from data or static config
  const events: ResolvedEvent[] = useMemo(() => {
    const result: ResolvedEvent[] = [];

    // Static events
    if (config.events) {
      for (const ev of config.events) {
        result.push({
          title: ev.title,
          date: new Date(ev.date),
          endDate: ev.endDate ? new Date(ev.endDate) : undefined,
          color: ev.color ?? "primary",
          allDay: ev.allDay ?? false,
          raw: ev as unknown as Record<string, unknown>,
        });
      }
    }

    // Data events
    if (data) {
      const items: Record<string, unknown>[] = (() => {
        if (Array.isArray(data)) return data as Record<string, unknown>[];
        for (const key of ["data", "items", "results", "events"]) {
          if (Array.isArray(data[key]))
            return data[key] as Record<string, unknown>[];
        }
        return [];
      })();

      for (const item of items) {
        const rawDate = item[dateField];
        if (!rawDate) continue;
        result.push({
          title: String(item[titleField] ?? ""),
          date: new Date(String(rawDate)),
          endDate: item["endDate"]
            ? new Date(String(item["endDate"]))
            : undefined,
          color: config.colorField
            ? String(item[config.colorField] ?? "primary")
            : "primary",
          allDay: Boolean(item["allDay"]),
          raw: item,
        });
      }
    }

    return result;
  }, [data, config.events, titleField, dateField, config.colorField]);

  // Get events for a specific date
  const eventsForDate = useCallback(
    (date: Date): ResolvedEvent[] =>
      events.filter((ev) => isSameDay(ev.date, date)),
    [events],
  );

  // Navigation
  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") {
        return new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }, [view]);

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") {
        return new Date(d.getFullYear(), d.getMonth() - 1, 1);
      }
      const prev = new Date(d);
      prev.setDate(prev.getDate() - 7);
      return prev;
    });
  }, [view]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Handle event click
  const handleEventClick = useCallback(
    (event: ResolvedEvent) => {
      if (config.eventAction) {
        void execute(config.eventAction, { ...event.raw });
      }
    },
    [config.eventAction, execute],
  );

  // Handle date click
  const handleDateClick = useCallback(
    (date: Date) => {
      if (config.dateAction) {
        void execute(config.dateAction, {
          date: date.toISOString(),
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
        });
      }
    },
    [config.dateAction, execute],
  );

  const MAX_VISIBLE_EVENTS = 3;

  // ── Month view ───────────────────────────────────────────────────────────

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const grid = getMonthGrid(year, month);
    const weeks: Date[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
      weeks.push(grid.slice(i, i + 7));
    }

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: config.showWeekNumbers
              ? "40px repeat(7, 1fr)"
              : "repeat(7, 1fr)",
            gap: "1px",
          }}
        >
          {config.showWeekNumbers && <div />}
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              style={{
                textAlign: "center",
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                color: "var(--sn-color-muted-foreground, #64748b)",
                padding: "var(--sn-spacing-xs, 4px)",
                fontWeight: "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Date grid */}
        {weeks.map((week, weekIdx) => (
          <div
            key={weekIdx}
            style={{
              display: "grid",
              gridTemplateColumns: config.showWeekNumbers
                ? "40px repeat(7, 1fr)"
                : "repeat(7, 1fr)",
              gap: "1px",
              borderBottom: "1px solid var(--sn-color-border, #e2e8f0)",
            }}
          >
            {/* Week number */}
            {config.showWeekNumbers && (
              <div
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #94a3b8)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  padding: "var(--sn-spacing-xs, 4px)",
                }}
              >
                {getWeekNumber(week[0]!)}
              </div>
            )}

            {week.map((date, dayIdx) => {
              const dayEvents = eventsForDate(date);
              const isCurrentMonth = date.getMonth() === month;
              const isTodayDate = isToday(date);

              return (
                <div
                  key={dayIdx}
                  data-calendar-cell
                  onClick={() => handleDateClick(date)}
                  style={{
                    minHeight: "80px",
                    padding: "var(--sn-spacing-xs, 4px)",
                    backgroundColor: isWeekend(date)
                      ? "rgba(0,0,0,0.02)"
                      : undefined,
                    cursor: config.dateAction ? "pointer" : "default",
                    borderRight:
                      dayIdx < 6
                        ? "1px solid var(--sn-color-border, #e2e8f0)"
                        : undefined,
                  }}
                >
                  {/* Date number */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginBottom: "var(--sn-spacing-xs, 2px)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--sn-font-size-sm, 0.875rem)",
                        color: isCurrentMonth
                          ? "var(--sn-color-foreground, #0f172a)"
                          : "var(--sn-color-muted-foreground, #94a3b8)",
                        ...(isTodayDate
                          ? {
                              backgroundColor:
                                "var(--sn-color-primary, #2563eb)",
                              color:
                                "var(--sn-color-primary-foreground, #fff)",
                              borderRadius:
                                "var(--sn-radius-full, 9999px)",
                              width: "24px",
                              height: "24px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }
                          : {}),
                      }}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Events */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                    }}
                  >
                    {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((ev, evIdx) => (
                      <EventPill
                        key={evIdx}
                        event={ev}
                        onClick={
                          config.eventAction
                            ? () => handleEventClick(ev)
                            : undefined
                        }
                      />
                    ))}
                    {dayEvents.length > MAX_VISIBLE_EVENTS && (
                      <div
                        style={{
                          fontSize: "var(--sn-font-size-xs, 0.75rem)",
                          color: "var(--sn-color-muted-foreground, #64748b)",
                          paddingLeft: "var(--sn-spacing-xs, 4px)",
                          cursor: "pointer",
                        }}
                      >
                        +{dayEvents.length - MAX_VISIBLE_EVENTS} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // ── Week view ────────────────────────────────────────────────────────────

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
        }}
      >
        {weekDates.map((date, idx) => {
          const dayEvents = eventsForDate(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={idx}
              data-calendar-cell
              onClick={() => handleDateClick(date)}
              style={{
                minHeight: "200px",
                padding: "var(--sn-spacing-sm, 8px)",
                backgroundColor: isWeekend(date)
                  ? "rgba(0,0,0,0.02)"
                  : undefined,
                borderRight:
                  idx < 6
                    ? "1px solid var(--sn-color-border, #e2e8f0)"
                    : undefined,
                cursor: config.dateAction ? "pointer" : "default",
              }}
            >
              {/* Day header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "var(--sn-spacing-sm, 8px)",
                }}
              >
                <div
                  style={{
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    color: "var(--sn-color-muted-foreground, #64748b)",
                    fontWeight: "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                  }}
                >
                  {DAY_NAMES[date.getDay()]}
                </div>
                <span
                  style={{
                    fontSize: "var(--sn-font-size-lg, 1.125rem)",
                    ...(isTodayDate
                      ? {
                          backgroundColor:
                            "var(--sn-color-primary, #2563eb)",
                          color:
                            "var(--sn-color-primary-foreground, #fff)",
                          borderRadius:
                            "var(--sn-radius-full, 9999px)",
                          width: "32px",
                          height: "32px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }
                      : {
                          color: "var(--sn-color-foreground, #0f172a)",
                        }),
                  }}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Events list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--sn-spacing-xs, 4px)",
                }}
              >
                {dayEvents.map((ev, evIdx) => (
                  <EventPill
                    key={evIdx}
                    event={ev}
                    onClick={
                      config.eventAction
                        ? () => handleEventClick(ev)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Header title ─────────────────────────────────────────────────────────

  const headerTitle = useMemo(() => {
    if (view === "month") {
      return formatMonthYear(currentDate.getFullYear(), currentDate.getMonth());
    }
    const weekDates = getWeekDates(currentDate);
    const first = weekDates[0]!;
    const last = weekDates[6]!;
    if (first.getMonth() === last.getMonth()) {
      return `${first.toLocaleDateString(undefined, { month: "long" })} ${first.getDate()}\u2013${last.getDate()}, ${first.getFullYear()}`;
    }
    return `${first.toLocaleDateString(undefined, { month: "short" })} ${first.getDate()} \u2013 ${last.toLocaleDateString(undefined, { month: "short" })} ${last.getDate()}, ${last.getFullYear()}`;
  }, [currentDate, view]);

  return (
    <div data-snapshot-component="calendar" className={config.className}>
      {/* Header */}
      <div
        data-calendar-header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--sn-spacing-md, 12px)",
        }}
      >
        <h2
          style={{
            fontSize: "var(--sn-font-size-lg, 1.125rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
            color: "var(--sn-color-foreground, #0f172a)",
            margin: 0,
          }}
        >
          {headerTitle}
        </h2>

        <div style={{ display: "flex", gap: "var(--sn-spacing-xs, 4px)" }}>
          <button
            onClick={goPrev}
            aria-label={view === "month" ? "Previous month" : "Previous week"}
            style={{
              padding: "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px)",
              borderRadius: "var(--sn-radius-sm, 4px)",
              border: "1px solid var(--sn-color-border, #d1d5db)",
              backgroundColor: "var(--sn-color-card, #fff)",
              cursor: "pointer",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            &#8249;
          </button>
          <button
            onClick={goToday}
            style={{
              padding: "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px)",
              borderRadius: "var(--sn-radius-sm, 4px)",
              border: "1px solid var(--sn-color-border, #d1d5db)",
              backgroundColor: "var(--sn-color-card, #fff)",
              cursor: "pointer",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            Today
          </button>
          <button
            onClick={goNext}
            aria-label={view === "month" ? "Next month" : "Next week"}
            style={{
              padding: "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px)",
              borderRadius: "var(--sn-radius-sm, 4px)",
              border: "1px solid var(--sn-color-border, #d1d5db)",
              backgroundColor: "var(--sn-color-card, #fff)",
              cursor: "pointer",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div
          data-calendar-loading
          style={{
            textAlign: "center",
            padding: "var(--sn-spacing-lg, 16px)",
            color: "var(--sn-color-muted-foreground, #64748b)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
          }}
        >
          Loading events...
        </div>
      )}

      {/* Calendar grid */}
      {!isLoading && (
        <div
          style={{
            border: "1px solid var(--sn-color-border, #e2e8f0)",
            borderRadius: "var(--sn-radius-md, 6px)",
            overflow: "hidden",
            overflowX: "auto",
          }}
        >
          <div style={{ minWidth: "600px" }}>
            {view === "month" ? renderMonthView() : renderWeekView()}
          </div>
        </div>
      )}
    </div>
  );
}
