const AGGREGATE_SUFFIXES = ["_sum", "_avg", "_min", "_max", "_count"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toMetricNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function detectNumericKey(record: Record<string, unknown>): string | undefined {
  for (const [key, value] of Object.entries(record)) {
    if (toMetricNumber(value) !== null) {
      return key;
    }
  }
  return undefined;
}

function metricFieldCandidates(field: string): string[] {
  const candidates = new Set<string>([field]);

  for (const suffix of AGGREGATE_SUFFIXES) {
    if (field.endsWith(suffix)) {
      const base = field.slice(0, -suffix.length);
      if (base) {
        candidates.add(base);
      }
      continue;
    }

    candidates.add(`${field}${suffix}`);
  }

  return [...candidates];
}

function assignMetricValue(
  target: Record<string, unknown>,
  requestedField: string | undefined,
  resolvedField: string,
  value: number,
): void {
  target[resolvedField] = value;
  if (requestedField && requestedField !== resolvedField) {
    target[requestedField] = value;
  }
}

export function normalizeMetricRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter(isRecord);
  }

  if (!isRecord(raw)) {
    return [];
  }

  if (Array.isArray(raw.data)) {
    return raw.data.filter(isRecord);
  }

  if (Array.isArray(raw.items)) {
    return raw.items.filter(isRecord);
  }

  return [];
}

export function resolveMetricFieldName(
  record: Record<string, unknown>,
  preferredField?: string,
): string | undefined {
  if (preferredField) {
    for (const candidate of metricFieldCandidates(preferredField)) {
      if (candidate in record && toMetricNumber(record[candidate]) !== null) {
        return candidate;
      }
    }
  }

  return detectNumericKey(record);
}

export function resolveMetricFieldNameFromRows(
  rows: Record<string, unknown>[],
  preferredField?: string,
): string | undefined {
  for (const row of rows) {
    const resolvedField = resolveMetricFieldName(row, preferredField);
    if (resolvedField) {
      return resolvedField;
    }
  }

  return undefined;
}

export function summarizeMetricRows(
  rows: Record<string, unknown>[],
  requestedFields: Array<string | undefined>,
): Record<string, unknown> | null {
  if (rows.length === 0) {
    return null;
  }

  const summary: Record<string, unknown> = {};
  const requested = requestedFields.filter(
    (field): field is string => typeof field === "string" && field.length > 0,
  );

  if (requested.length === 0) {
    const detectedField = resolveMetricFieldNameFromRows(rows);
    if (!detectedField) {
      return null;
    }

    const total = rows.reduce((sum, row) => {
      const value = toMetricNumber(row[detectedField]);
      return sum + (value ?? 0);
    }, 0);
    summary[detectedField] = total;
    return summary;
  }

  for (const requestedField of requested) {
    const resolvedField = resolveMetricFieldNameFromRows(rows, requestedField);
    if (!resolvedField) {
      continue;
    }

    const total = rows.reduce((sum, row) => {
      const value = toMetricNumber(row[resolvedField]);
      return sum + (value ?? 0);
    }, 0);
    assignMetricValue(summary, requestedField, resolvedField, total);
  }

  return Object.keys(summary).length > 0 ? summary : null;
}

export function projectMetricRows(
  rows: Record<string, unknown>[],
  requestedFields: string[],
): Record<string, unknown>[] {
  if (rows.length === 0 || requestedFields.length === 0) {
    return rows;
  }

  const fieldMap = new Map<string, string>();
  for (const requestedField of requestedFields) {
    const resolvedField = resolveMetricFieldNameFromRows(rows, requestedField);
    if (resolvedField) {
      fieldMap.set(requestedField, resolvedField);
    }
  }

  if (fieldMap.size === 0) {
    return rows;
  }

  return rows.map((row) => {
    const next = { ...row };
    for (const [requestedField, resolvedField] of fieldMap.entries()) {
      if (next[requestedField] === undefined && next[resolvedField] !== undefined) {
        next[requestedField] = next[resolvedField];
      }
    }
    return next;
  });
}
