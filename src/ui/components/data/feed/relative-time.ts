"use client";

function getFormatter(): Intl.RelativeTimeFormat | null {
  if (
    typeof Intl === "undefined" ||
    typeof Intl.RelativeTimeFormat !== "function"
  ) {
    return null;
  }

  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
}

export function formatRelativeTime(timestamp: string | number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = getFormatter();
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds || unit === "second") {
      const value = Math.round(diffSeconds / seconds);
      if (formatter) {
        return formatter.format(value, unit);
      }

      if (unit === "second" && Math.abs(value) < 10) {
        return "just now";
      }

      const suffix = value < 0 ? "ago" : "from now";
      return `${Math.abs(value)} ${unit}${Math.abs(value) === 1 ? "" : "s"} ${suffix}`;
    }
  }

  return "just now";
}
