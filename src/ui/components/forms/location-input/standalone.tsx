"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface LocationResult {
  /** Display name of the location. */
  name: string;
  /** Full address string of the location. */
  address?: string;
  /** Latitude coordinate. */
  lat: number;
  /** Longitude coordinate. */
  lng: number;
}

export interface LocationInputFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed above the input. */
  label?: string;
  /** Placeholder text shown inside the search input. */
  placeholder?: string;
  /** Helper text displayed below the field when there is no error. */
  helperText?: string;
  /** Error message displayed below the field, replacing helper text. */
  errorText?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Controlled text value of the search input. */
  value?: string;
  /** Whether to show a Google Maps link after selecting a location. */
  showMapLink?: boolean;
  /** Search result locations to display in the dropdown. */
  results?: LocationResult[];
  /** Whether search results are currently loading. */
  loading?: boolean;
  /** Called when the user types a search query. */
  onSearch?: (query: string) => void;
  /** Called when the user selects a location from the results. */
  onSelect?: (location: LocationResult) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

function StandaloneLocationResultRow({
  location,
  index,
  rootId,
  onSelect,
  hasBorder,
  slots,
}: {
  location: LocationResult;
  index: number;
  rootId: string;
  onSelect: (location: LocationResult) => void;
  hasBorder: boolean;
  slots?: Record<string, Record<string, unknown>>;
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
    componentSurface: slots?.result,
  });
  const resultIconSurface = resolveSurfacePresentation({
    surfaceId: `${resultId}-icon`,
    implementationBase: {},
    componentSurface: slots?.resultIcon,
  });
  const resultContentSurface = resolveSurfacePresentation({
    surfaceId: `${resultId}-content`,
    implementationBase: {
      style: {
        minWidth: 0,
      },
    },
    componentSurface: slots?.resultContent,
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
    componentSurface: slots?.resultName,
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
    componentSurface: slots?.resultAddress,
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

/**
 * Standalone LocationInputField -- a location search input with results dropdown
 * and optional Google Maps link. No manifest context required.
 *
 * @example
 * ```tsx
 * <LocationInputField
 *   label="Venue"
 *   placeholder="Search for a location..."
 *   results={searchResults}
 *   onSearch={(query) => fetchLocations(query)}
 *   onSelect={(location) => setVenue(location)}
 * />
 * ```
 */
export function LocationInputField({
  id,
  label,
  placeholder: placeholderProp,
  helperText,
  errorText: errorTextProp,
  required = false,
  disabled = false,
  value: valueProp,
  showMapLink = true,
  results: resultsProp,
  loading = false,
  onSearch,
  onSelect,
  className,
  style,
  slots,
}: LocationInputFieldProps) {
  const rootId = id ?? "location-input";
  const errorText = errorTextProp ?? "";

  const [query, setQuery] = useState(valueProp || "");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<LocationResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = resultsProp ?? [];

  useEffect(() => {
    if (valueProp && !selected) {
      setQuery(valueProp);
    }
  }, [valueProp, selected]);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelected(null);
      onSearch?.(value);
      if (value.length > 0) {
        setIsOpen(true);
      }
    },
    [onSearch],
  );

  const handleSelect = useCallback(
    (location: LocationResult) => {
      setQuery(location.name);
      setSelected(location);
      setIsOpen(false);
      onSelect?.(location);
    },
    [onSelect],
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
    if (results.length > 0 && query.length > 0 && !selected) {
      setIsOpen(true);
    }
  }, [results, query, selected]);

  const hasError = Boolean(errorText);
  const mapsUrl = selected
    ? `https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`
    : null;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
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
    componentSurface: slots?.label,
  });
  const requiredSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-required`,
    implementationBase: {
      color: "var(--sn-color-destructive, #ef4444)",
      style: {
        marginLeft: "var(--sn-spacing-2xs, 0.125rem)",
      },
    },
    componentSurface: slots?.required,
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
    componentSurface: slots?.field,
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
    componentSurface: slots?.leadingIcon,
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
    componentSurface: slots?.input,
  });
  const loadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingIcon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        padding: "0 var(--sn-spacing-sm, 0.5rem)",
      },
    },
    componentSurface: slots?.loadingIcon,
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
    componentSurface: slots?.results,
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
    componentSurface: slots?.mapLink,
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
    componentSurface: slots?.helper,
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
    componentSurface: slots?.error,
    activeStates: hasError ? ["invalid"] : [],
  });

  return (
    <>
      <div
        ref={containerRef}
        data-snapshot-component="location-input"
        data-snapshot-id={rootId}
        data-testid="location-input"
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {label ? (
          <label
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
            {required ? (
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
            placeholder={placeholderProp ?? "Search for a location..."}
            onChangeText={handleInputChange}
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true);
              }
            }}
            surfaceId={`${rootId}-input`}
            surfaceConfig={inputSurface.resolvedConfigForWrapper}
          />
          {loading ? (
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
              <StandaloneLocationResultRow
                key={`${location.name}-${location.lat}-${location.lng}-${index}`}
                location={location}
                index={index}
                rootId={rootId}
                onSelect={handleSelect}
                hasBorder={index < results.length - 1}
                slots={slots}
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

        {helperText && !hasError ? (
          <div
            data-snapshot-id={`${rootId}-helper`}
            className={helperSurface.className}
            style={helperSurface.style}
          >
            {helperText}
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
