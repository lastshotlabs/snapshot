import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { GifPickerConfig, GifEntry } from "./types";

/**
 * GifPicker — searchable GIF grid with support for API-powered search
 * or static GIF data. Displays a masonry-style grid of GIF previews.
 *
 * @param props - Component props containing the GIF picker configuration
 */
export function GifPicker({ config }: { config: GifPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GifEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const columns = config.columns ?? 2;
  const maxHeight = config.maxHeight ?? "300px";
  const urlField = config.urlField ?? "url";
  const previewField = config.previewField ?? "preview";
  const titleField = config.titleField ?? "title";

  // Static GIFs (for demos)
  const staticGifs = useMemo(() => {
    if (!config.gifs) return [];
    return config.gifs.map((g) => ({
      id: g.id,
      url: g.url,
      preview: g.preview ?? g.url,
      width: g.width,
      height: g.height,
      title: g.title,
    }));
  }, [config.gifs]);

  // Fetch GIFs from API
  const fetchGifs = useCallback(
    async (query: string) => {
      const endpoint = query
        ? config.searchEndpoint
        : config.trendingEndpoint;
      if (!endpoint) return;

      setLoading(true);
      try {
        const separator = endpoint.includes("?") ? "&" : "?";
        const url = query
          ? `${endpoint}${separator}q=${encodeURIComponent(query)}`
          : endpoint;

        // Use fetch directly — this goes through the backend proxy
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Failed to fetch GIFs");
        const data = await resp.json();

        const items = Array.isArray(data)
          ? data
          : data.results ?? data.data ?? data.gifs ?? [];

        setResults(
          items.map((item: Record<string, unknown>, i: number) => ({
            id: String(item.id ?? i),
            url: String(item[urlField] ?? ""),
            preview: String(item[previewField] ?? item[urlField] ?? ""),
            width: item.width as number | undefined,
            height: item.height as number | undefined,
            title: String(item[titleField] ?? ""),
          })),
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [
      config.searchEndpoint,
      config.trendingEndpoint,
      urlField,
      previewField,
      titleField,
    ],
  );

  // Debounced search
  useEffect(() => {
    if (!config.searchEndpoint && !config.trendingEndpoint) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchGifs(search);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search, fetchGifs, config.searchEndpoint, config.trendingEndpoint]);

  // Load trending on mount
  useEffect(() => {
    if (config.trendingEndpoint && !search) {
      void fetchGifs("");
    }
  }, [config.trendingEndpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = useCallback(
    (gif: GifEntry) => {
      if (publish) {
        publish({ url: gif.url, title: gif.title, id: gif.id });
      }
      if (config.selectAction) {
        void execute(config.selectAction, {
          url: gif.url,
          title: gif.title,
          id: gif.id,
        });
      }
    },
    [publish, config.selectAction, execute],
  );

  if (visible === false) return null;

  const displayGifs =
    staticGifs.length > 0 ? staticGifs : results;

  return (
    <div
      data-snapshot-component="gif-picker"
      data-testid="gif-picker"
      className={config.className}
      style={{
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        overflow: "hidden",
        width: "100%",
        maxWidth: "400px",
      }}
    >
      {/* Search */}
      <div
        style={{
          padding: "var(--sn-spacing-xs, 0.25rem)",
          borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
          }}
        >
          <Icon name="search" size={14} />
          <input
            data-testid="gif-search"
            type="text"
            placeholder={config.placeholder ?? "Search GIFs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-foreground, #111827)",
              width: "100%",
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* GIF grid */}
      <div
        style={{
          maxHeight,
          overflowY: "auto",
          padding: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        {loading && (
          <div
            style={{
              padding: "var(--sn-spacing-lg, 1.5rem)",
              textAlign: "center",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            Loading...
          </div>
        )}

        {!loading && displayGifs.length === 0 && (
          <div
            style={{
              padding: "var(--sn-spacing-lg, 1.5rem)",
              textAlign: "center",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            {search ? "No GIFs found" : "Search for GIFs"}
          </div>
        )}

        {!loading && displayGifs.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: "var(--sn-spacing-xs, 0.25rem)",
            }}
          >
            {displayGifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleSelect(gif)}
                title={gif.title}
                style={{
                  display: "block",
                  padding: 0,
                  border: "none",
                  borderRadius: "var(--sn-radius-sm, 0.25rem)",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "var(--sn-color-muted, #f3f4f6)",
                  lineHeight: 0,
                }}
              >
                <img
                  src={gif.preview ?? gif.url}
                  alt={gif.title ?? "GIF"}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    minHeight: "60px",
                    objectFit: "cover",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Attribution */}
      {config.attribution && (
        <div
          style={{
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            textAlign: "center",
          }}
        >
          {config.attribution}
        </div>
      )}
    </div>
  );
}
