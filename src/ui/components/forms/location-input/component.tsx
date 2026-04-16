'use client';

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import type { LocationInputConfig } from "./types";

interface LocationResult {
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

function joinClassNames(
  ...values: Array<string | undefined | null | false>
): string | undefined {
  const className = values.filter(Boolean).join(" ");
  return className || undefined;
}

function LocationResultRow({
  config,
  location,
  index,
  rootId,
  onSelect,
  hasBorder,
}: {
  config: LocationInputConfig;
  location: LocationResult;
  index: number;
  rootId: string;
  onSelect: (location: LocationResult) => void;
  hasBorder: boolean;
}) {
  const resultId = `${rootId}-result-${index}`;
  const resultSurface = resolveSurfacePresentation({
    surfaceId: resultId,
    implementationBase: {
      display: "flex",
      alignItems: "start",
      gap: "sm",
      width: "100%",
      cursor: "pointer",
      transition: "colors",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
        border: "none",
        borderBottom: hasBorder
          ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)"
          : undefined,
        backgroundColor: "transparent",
        textAlign: "left",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-foreground, #111827)",
      },
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted, #f3f4f6))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: config.slots?.result,
  });
  const resultIconSurface = resolveSurfacePresentation({
    surfaceId: `${resultId}-icon`,
    implementationBase: {},
    componentSurface: config.slots?.resultIcon,
  });
  const resultContentSurface = resolveSurfacePresentation({
    surfaceId: `${resultId}-content`,
    implementationBase: {
      style: {
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.resultContent,
  });
  const resultNameSurface = resolveSurfacePresentation({
    surfaceId: `${resultId}-name`,
    implementationBase: {
      fontWeight: "medium",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.resultName,
  });
  const resultAddressSurface = resolveSurfacePresentation({
    surfaceId: `${resultId}-address`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.resultAddress,
  });

  return (
    <>
      <ButtonControl
        type="button"
        testId="location-result"
        surfaceId={resultId}
        surfaceConfig={resultSurface.resolvedConfigForWrapper}
        onClick={() => onSelect(location)}
        variant="ghost"
        size="sm"
      >
        <span
          data-snapshot-id={`${resultId}-icon`}
          className={resultIconSurface.className}
          style={resultIconSurface.style}
        >
          <Icon name="map-pin" size={14} />
        </span>
        <div
          data-snapshot-id={`${resultId}-content`}
          className={resultContentSurface.className}
          style={resultContentSurface.style}
        >
          <div
            data-snapshot-id={`${resultId}-name`}
            className={resultNameSurface.className}
            style={resultNameSurface.style}
          >
            {location.name}
          </div>
          {location.address ? (
            <div
              data-snapshot-id={`${resultId}-address`}
              className={resultAddressSurface.className}
              style={resultAddressSurface.style}
            >
              {location.address}
            </div>
          ) : null}
        </div>
      </ButtonControl>
      <SurfaceStyles css={resultIconSurface.scopedCss} />
      <SurfaceStyles css={resultContentSurface.scopedCss} />
      <SurfaceStyles css={resultNameSurface.scopedCss} />
      <SurfaceStyles css={resultAddressSurface.scopedCss} />
    </>
  );
}

export function LocationInput({ config }: { config: LocationInputConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const disabled = Boolean(useSubscribe(config.disabled ?? false));
  const errorText = useSubscribe(config.errorText ?? "") as string;
  const initialValue = useSubscribe(config.value ?? "") as string;
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const rootId = config.id ?? "location-input";

  const [query, setQuery] = useState(initialValue || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<LocationResult | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nameField = config.nameField ?? "name";
  const addressField = config.addressField ?? "address";
  const latField = config.latField ?? "lat";
  const lngField = config.lngField ?? "lng";
  const debounceMs = config.debounceMs ?? 300;
  const minChars = config.minChars ?? 2;
  const showMapLink = config.showMapLink ?? true;

  useEffect(() => {
    if (initialValue && !selected) {
      setQuery(initialValue);
    }
  }, [initialValue, selected]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [debounceMs, query]);

  const shouldSearch = debouncedQuery.length >= minChars;
  const searchResults = useComponentData(
    shouldSearch ? config.searchEndpoint : "",
    shouldSearch ? { q: debouncedQuery } : undefined,
  );

  useEffect(() => {
    if (!shouldSearch) {
      setResults((current) => (current.length === 0 ? current : []));
      setIsOpen(false);
      return;
    }

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

    const mapped: LocationResult[] = items.map((item) => ({
      name: String(item[nameField] ?? ""),
      address: item[addressField] ? String(item[addressField]) : undefined,
      lat: Number(item[latField] ?? 0),
      lng: Number(item[lngField] ?? 0),
    }));

    setResults(mapped);
    setIsOpen(mapped.length > 0);
  }, [
    addressField,
    latField,
    lngField,
    nameField,
    searchResults.data,
    shouldSearch,
  ]);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setSelected(null);
  }, []);

  const handleSelect = useCallback(
    (location: LocationResult) => {
      setQuery(location.name);
      setSelected(location);
      setIsOpen(false);
      setResults([]);

      const payload = {
        name: location.name,
        address: location.address ?? "",
        lat: location.lat,
        lng: location.lng,
      };

      publish(payload);

      if (config.changeAction) {
        void execute(config.changeAction, payload);
      }
    },
    [config.changeAction, execute, publish],
  );

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (visible === false) {
    return null;
  }

  const hasError = Boolean(errorText);
  const mapsUrl = selected
    ? `https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`
    : null;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      display: "block",
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: config.slots?.label,
  });
  const requiredSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-required`,
    implementationBase: {
      color: "var(--sn-color-destructive, #ef4444)",
      style: {
        marginLeft: "var(--sn-spacing-2xs, 0.125rem)",
      },
    },
    componentSurface: config.slots?.required,
  });
  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      border: `var(--sn-border-default, 1px) solid ${
        hasError
          ? "var(--sn-color-destructive, #ef4444)"
          : "var(--sn-color-border, #e5e7eb)"
      }`,
      borderRadius: "md",
      bg: disabled
        ? "var(--sn-color-secondary, #f3f4f6)"
        : "var(--sn-color-card, #ffffff)",
      overflow: "hidden",
    },
    componentSurface: config.slots?.field,
  });
  const leadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-leadingIcon`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        padding: "0 var(--sn-spacing-sm, 0.5rem)",
      },
    },
    componentSurface: config.slots?.leadingIcon,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      flex: "1",
      width: "100%",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        border: "none",
        outline: "none",
        padding:
          "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-sm, 0.5rem) 0",
        backgroundColor: "transparent",
      },
    },
    componentSurface: config.slots?.input,
  });
  const loadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingIcon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        padding: "0 var(--sn-spacing-sm, 0.5rem)",
      },
    },
    componentSurface: config.slots?.loadingIcon,
  });
  const resultsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-results`,
    implementationBase: {
      position: "absolute",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "md",
      bg: "var(--sn-color-card, #ffffff)",
      shadow: "lg",
      overflow: "auto",
      zIndex: "dropdown",
      style: {
        top: "100%",
        left: 0,
        right: 0,
        marginTop: "var(--sn-spacing-xs, 0.25rem)",
        maxHeight: "200px",
      },
    },
    componentSurface: config.slots?.results,
  });
  const mapLinkSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-mapLink`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "xs",
      fontSize: "xs",
      color: "var(--sn-color-info, #3b82f6)",
      style: {
        marginTop: "var(--sn-spacing-xs, 0.25rem)",
        textDecoration: "none",
      },
    },
    componentSurface: config.slots?.mapLink,
  });
  const helperSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-helper`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        marginTop: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: config.slots?.helper,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-destructive, #ef4444)",
      style: {
        marginTop: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: config.slots?.error,
    activeStates: hasError ? ["invalid"] : [],
  });

  return (
    <>
      <div
        ref={containerRef}
        data-snapshot-component="location-input"
        data-snapshot-id={rootId}
        data-testid="location-input"
        className={joinClassNames(config.className, rootSurface.className)}
        style={{
          ...(rootSurface.style ?? {}),
          ...((config.style as CSSProperties | undefined) ?? {}),
        }}
      >
        {config.label ? (
          <label
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {config.label}
            {config.required ? (
              <span
                data-snapshot-id={`${rootId}-required`}
                className={requiredSurface.className}
                style={requiredSurface.style}
              >
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-field`}
          className={fieldSurface.className}
          style={fieldSurface.style}
        >
          <span
            data-snapshot-id={`${rootId}-leadingIcon`}
            className={leadingIconSurface.className}
            style={leadingIconSurface.style}
          >
            <Icon name="map-pin" size={16} />
          </span>
          <InputControl
            testId="location-search"
            type="text"
            value={query}
            disabled={disabled}
            placeholder={config.placeholder ?? "Search for a location..."}
            onChangeText={handleInputChange}
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true);
              }
            }}
            surfaceId={`${rootId}-input`}
            surfaceConfig={inputSurface.resolvedConfigForWrapper}
          />
          {searchResults.isLoading && shouldSearch ? (
            <span
              data-snapshot-id={`${rootId}-loadingIcon`}
              className={loadingIconSurface.className}
              style={loadingIconSurface.style}
            >
              <Icon name="loader" size={16} />
            </span>
          ) : null}
        </div>

        {isOpen && results.length > 0 ? (
          <div
            data-testid="location-results"
            data-snapshot-id={`${rootId}-results`}
            className={resultsSurface.className}
            style={resultsSurface.style}
          >
            {results.map((location, index) => (
              <LocationResultRow
                key={`${location.name}-${location.lat}-${location.lng}-${index}`}
                config={config}
                location={location}
                index={index}
                rootId={rootId}
                onSelect={handleSelect}
                hasBorder={index < results.length - 1}
              />
            ))}
          </div>
        ) : null}

        {showMapLink && selected && mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-snapshot-id={`${rootId}-mapLink`}
            className={mapLinkSurface.className}
            style={mapLinkSurface.style}
          >
            <Icon name="external-link" size={12} />
            Open in Google Maps
          </a>
        ) : null}

        {config.helperText && !hasError ? (
          <div
            data-snapshot-id={`${rootId}-helper`}
            className={helperSurface.className}
            style={helperSurface.style}
          >
            {config.helperText}
          </div>
        ) : null}
        {hasError ? (
          <div
            data-snapshot-id={`${rootId}-error`}
            className={errorSurface.className}
            style={errorSurface.style}
          >
            {errorText}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={requiredSurface.scopedCss} />
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={leadingIconSurface.scopedCss} />
      <SurfaceStyles css={loadingIconSurface.scopedCss} />
      <SurfaceStyles css={resultsSurface.scopedCss} />
      <SurfaceStyles css={mapLinkSurface.scopedCss} />
      <SurfaceStyles css={helperSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
    </>
  );
}
