'use client';

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { LocationInputField } from "./standalone";
import type { LocationResult } from "./standalone";
import type { LocationInputConfig } from "./types";

export function LocationInput({ config }: { config: LocationInputConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const disabled = Boolean(useSubscribe(config.disabled ?? false));
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    label: config.label,
    placeholder: config.placeholder,
    helperText: config.helperText,
    errorText: config.errorText,
  });
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const resolvedHelperText = resolveOptionalPrimitiveValue(
    resolvedConfig.helperText,
    primitiveOptions,
  );
  const errorText =
    resolveOptionalPrimitiveValue(resolvedConfig.errorText, primitiveOptions) ?? "";
  const initialValue = useSubscribe(config.value ?? "") as string;
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const nameField = config.nameField ?? "name";
  const addressField = config.addressField ?? "address";
  const latField = config.latField ?? "lat";
  const lngField = config.lngField ?? "lng";
  const debounceMs = config.debounceMs ?? 300;
  const minChars = config.minChars ?? 2;

  const [debouncedQuery, setDebouncedQuery] = useState(initialValue || "");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        setDebouncedQuery(query);
      }, debounceMs);
    },
    [debounceMs],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const shouldSearch = debouncedQuery.length >= minChars;
  const searchResults = useComponentData(
    shouldSearch ? config.searchEndpoint : "",
    shouldSearch ? { q: debouncedQuery } : undefined,
  );

  const results: LocationResult[] = (() => {
    if (!shouldSearch) return [];
    const payload = searchResults.data as unknown;
    const recordData =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : undefined;
    const items = Array.isArray(payload)
      ? (payload as Record<string, unknown>[])
      : ((recordData?.results ??
          recordData?.data ??
          recordData?.items ??
          []) as Record<string, unknown>[]);

    return items.map((item) => ({
      name: String(item[nameField] ?? ""),
      address: item[addressField] ? String(item[addressField]) : undefined,
      lat: Number(item[latField] ?? 0),
      lng: Number(item[lngField] ?? 0),
    }));
  })();

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <LocationInputField
      id={config.id}
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      helperText={resolvedHelperText}
      errorText={errorText}
      required={config.required}
      disabled={disabled}
      value={initialValue}
      showMapLink={config.showMapLink}
      results={results}
      loading={searchResults.isLoading && shouldSearch}
      onSearch={handleSearch}
      onSelect={(location) => {
        const payload = {
          name: location.name,
          address: location.address ?? "",
          lat: location.lat,
          lng: location.lng,
        };

        publish(payload);

        void executeEventAction(execute, config.on?.change, {
          id: config.id,
          ...payload,
          value: payload,
        });
        void executeEventAction(execute, config.on?.input, {
          id: config.id,
          ...payload,
          value: payload,
        });
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
