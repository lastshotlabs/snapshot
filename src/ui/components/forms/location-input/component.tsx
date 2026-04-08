import { useState, useCallback, useEffect, useRef, useContext } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import {
  useActionExecutor,
  SnapshotApiContext,
} from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { LocationInputConfig } from "./types";

/** Shape of a resolved location. */
interface LocationResult {
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

/**
 * LocationInput — geocode autocomplete input.
 *
 * Searches a backend endpoint as the user types, displays matching
 * locations in a dropdown, and publishes `{ name, lat, lng, address }`
 * on selection. Optionally shows a Google Maps link after selection.
 *
 * @param props - Component props containing the location input configuration
 */
export function LocationInput({ config }: { config: LocationInputConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const disabled = useSubscribe(config.disabled ?? false) as boolean;
  const errorText = useSubscribe(config.errorText ?? "") as string;
  const initialValue = useSubscribe(config.value ?? "") as string;
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const api = useContext(SnapshotApiContext);

  const [query, setQuery] = useState(initialValue || "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LocationResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const nameField = config.nameField ?? "name";
  const addressField = config.addressField ?? "address";
  const latField = config.latField ?? "lat";
  const lngField = config.lngField ?? "lng";
  const debounceMs = config.debounceMs ?? 300;
  const minChars = config.minChars ?? 2;
  const showMapLink = config.showMapLink ?? true;

  // Sync initial value
  useEffect(() => {
    if (initialValue && !selected) {
      setQuery(initialValue);
    }
  }, [initialValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const search = useCallback(
    async (q: string) => {
      if (q.length < minChars) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        if (!api) throw new Error("API client not available");
        const separator = config.searchEndpoint.includes("?") ? "&" : "?";
        const url = `${config.searchEndpoint}${separator}q=${encodeURIComponent(q)}`;
        const data = (await api.get(url)) as Record<string, unknown>;

        const items = Array.isArray(data)
          ? data
          : ((data.results ?? data.data ?? data.items ?? []) as Record<
              string,
              unknown
            >[]);

        const mapped: LocationResult[] = items.map(
          (item: Record<string, unknown>) => ({
            name: String(item[nameField] ?? ""),
            address: item[addressField]
              ? String(item[addressField])
              : undefined,
            lat: Number(item[latField] ?? 0),
            lng: Number(item[lngField] ?? 0),
          }),
        );

        setResults(mapped);
        setIsOpen(mapped.length > 0);
      } catch {
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [
      api,
      config.searchEndpoint,
      nameField,
      addressField,
      latField,
      lngField,
      minChars,
    ],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelected(null);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void search(value);
      }, debounceMs);
    },
    [search, debounceMs],
  );

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
    [publish, config.changeAction, execute],
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  if (visible === false) return null;

  const hasError = !!errorText;
  const mapsUrl = selected
    ? `https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`
    : null;

  return (
    <div
      ref={containerRef}
      data-snapshot-component="location-input"
      data-testid="location-input"
      className={config.className}
      style={{
        position: "relative",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Label */}
      {config.label && (
        <label
          style={{
            display: "block",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight:
              "var(--sn-font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
            color: "var(--sn-color-foreground, #111827)",
            marginBottom: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {config.label}
          {config.required && (
            <span
              style={{
                color: "var(--sn-color-destructive, #ef4444)",
                marginLeft: "var(--sn-spacing-2xs, 0.125rem)",
              }}
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Input with icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `var(--sn-border-default, 1px) solid ${hasError ? "var(--sn-color-destructive, #ef4444)" : "var(--sn-color-border, #e5e7eb)"}`,
          borderRadius: "var(--sn-radius-md, 0.375rem)",
          backgroundColor: disabled
            ? "var(--sn-color-secondary, #f3f4f6)"
            : "var(--sn-color-card, #ffffff)",
          overflow: "hidden",
          transition:
            "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 var(--sn-spacing-sm, 0.5rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          <Icon name="map-pin" size={16} />
        </span>
        <input
          data-testid="location-search"
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={config.placeholder ?? "Search for a location..."}
          disabled={disabled}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding:
              "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-sm, 0.5rem) 0",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            backgroundColor: "transparent",
            width: "100%",
          }}
        />
        {loading && (
          <span
            style={{
              padding: "0 var(--sn-spacing-sm, 0.5rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            <Icon name="loader" size={16} />
          </span>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div
          data-testid="location-results"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            boxShadow: "var(--sn-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))",
            zIndex: "var(--sn-z-index-dropdown, 40)" as unknown as number,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {results.map((loc, i) => (
            <button
              type="button"
              key={`${loc.name}-${loc.lat}-${loc.lng}-${i}`}
              data-testid="location-result"
              onClick={() => handleSelect(loc)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--sn-spacing-sm, 0.5rem)",
                width: "100%",
                padding:
                  "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                border: "none",
                borderBottom:
                  i < results.length - 1
                    ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)"
                    : undefined,
                backgroundColor: "transparent",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: "var(--sn-color-foreground, #111827)",
              }}
            >
              <Icon name="map-pin" size={14} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight:
                      "var(--sn-font-weight-medium, 500)" as React.CSSProperties["fontWeight"],
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loc.name}
                </div>
                {loc.address && (
                  <div
                    style={{
                      fontSize: "var(--sn-font-size-xs, 0.75rem)",
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {loc.address}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map link after selection */}
      {showMapLink && selected && mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-info, #3b82f6)",
            textDecoration: "none",
          }}
        >
          <Icon name="external-link" size={12} />
          Open in Google Maps
        </a>
      )}

      {/* Helper / Error text */}
      {(config.helperText || hasError) && (
        <div
          style={{
            marginTop: "var(--sn-spacing-xs, 0.25rem)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: hasError
              ? "var(--sn-color-destructive, #ef4444)"
              : "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          {hasError ? errorText : config.helperText}
        </div>
      )}
      <style>{`
        [data-snapshot-component="location-input"] input:focus {
          outline: none;
          border-color: var(--sn-color-primary, #2563eb);
          box-shadow: 0 0 0 var(--sn-ring-width, 2px) color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent);
        }
        [data-snapshot-component="location-input"] input:focus-visible {
          outline: none;
          border-color: var(--sn-color-primary, #2563eb);
          box-shadow: 0 0 0 var(--sn-ring-width, 2px) color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent);
        }
        [data-snapshot-component="location-input"] button:hover {
          background: var(--sn-color-accent, var(--sn-color-muted));
        }
        [data-snapshot-component="location-input"] button:focus {
          outline: none;
        }
        [data-snapshot-component="location-input"] button:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
      `}</style>
    </div>
  );
}
