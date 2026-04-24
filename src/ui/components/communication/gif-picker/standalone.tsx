'use client';

import { useState, useMemo, useCallback, useEffect, type CSSProperties } from "react";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { GifEntry } from "./types";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface GifPickerBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Number of grid columns. Default: 2. */
  columns?: number;
  /** Max height of content area. Default: "300px". */
  maxHeight?: string;
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** Attribution text shown at the bottom. */
  attribution?: string;
  /** Static GIF entries. When provided, remote endpoints are not used. */
  gifs?: GifEntry[];
  /** Loading state. */
  loading?: boolean;
  /** Called when a GIF is selected. */
  onSelect?: (gif: GifEntry) => void;
  /** Called when search text changes (debounced). Used by adapter to trigger remote searches. */
  onSearchChange?: (query: string) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone GifPicker — searchable GIF grid with debounced search, loading states,
 * and optional attribution. No manifest context required.
 *
 * @example
 * ```tsx
 * <GifPickerBase
 *   gifs={gifResults}
 *   loading={isSearching}
 *   onSearchChange={(q) => searchGifs(q)}
 *   onSelect={(gif) => insertGif(gif.url)}
 * />
 * ```
 */
export function GifPickerBase({
  id,
  columns = 2,
  maxHeight = "300px",
  placeholder = "Search GIFs...",
  attribution,
  gifs = [],
  loading = false,
  onSelect,
  onSearchChange,
  className,
  style,
  slots,
}: GifPickerBaseProps) {
  const [search, setSearch] = useState("");
  const rootId = id ?? "gif-picker";

  useEffect(() => {
    const timeout = setTimeout(() => onSearchChange?.(search), 300);
    return () => clearTimeout(timeout);
  }, [search, onSearchChange]);

  const handleSelect = useCallback(
    (gif: GifEntry) => onSelect?.(gif),
    [onSelect],
  );

  const rootSurface = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: { width: "100%", maxWidth: "400px", overflow: "hidden", borderRadius: "md", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", bg: "var(--sn-color-card, #ffffff)" }, componentSurface: className || style ? { className, style } : undefined, itemSurface: slots?.root });
  const searchSectionSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchSection`, implementationBase: { padding: "xs", style: { borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.searchSection });
  const searchShellSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchShell`, implementationBase: { display: "flex", alignItems: "center", gap: "xs", paddingY: "xs", paddingX: "sm", borderRadius: "sm", bg: "var(--sn-color-secondary, #f3f4f6)" }, componentSurface: slots?.searchShell });
  const searchIconSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchIcon`, implementationBase: { color: "var(--sn-color-muted-foreground, #6b7280)", style: { flexShrink: 0 } }, componentSurface: slots?.searchIcon });
  const searchInputSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchInput`, implementationBase: { width: "100%", fontSize: "sm", color: "var(--sn-color-foreground, #111827)", focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { border: "none", outline: "none", background: "transparent", padding: 0, minWidth: 0, fontFamily: "inherit" } }, componentSurface: slots?.searchInput });
  const contentSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-content`, implementationBase: { overflow: "auto", padding: "xs", style: { maxHeight } }, componentSurface: slots?.content });
  const loadingStateSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loadingState`, implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", gap: "xs", padding: "lg", textAlign: "center", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.loadingState });
  const loadingIconSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loadingIcon`, implementationBase: { color: "var(--sn-color-muted-foreground, #6b7280)", style: { display: "inline-flex", flexShrink: 0 } }, componentSurface: slots?.loadingIcon });
  const emptyStateSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-emptyState`, implementationBase: { padding: "lg", textAlign: "center", fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.emptyState });
  const gridSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-grid`, implementationBase: { display: "grid", gap: "sm", style: { gridTemplateColumns: `repeat(${columns}, 1fr)` } }, componentSurface: slots?.grid });
  const attributionSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-attribution`, implementationBase: { paddingY: "xs", paddingX: "sm", textAlign: "center", fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)", style: { borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.attribution });

  return (
    <>
      <div data-snapshot-component="gif-picker" data-testid="gif-picker" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        <div data-snapshot-id={`${rootId}-searchSection`} className={searchSectionSurface.className} style={searchSectionSurface.style}>
          <div data-snapshot-id={`${rootId}-searchShell`} className={searchShellSurface.className} style={searchShellSurface.style}>
            <span aria-hidden="true" data-snapshot-id={`${rootId}-searchIcon`} className={searchIconSurface.className} style={searchIconSurface.style}><Icon name="search" size={14} /></span>
            <InputControl testId="gif-search" surfaceId={`${rootId}-searchInput`} type="text" placeholder={placeholder} value={search} onChangeText={setSearch} surfaceConfig={searchInputSurface.resolvedConfigForWrapper} />
          </div>
        </div>

        <div data-snapshot-id={`${rootId}-content`} className={contentSurface.className} style={contentSurface.style}>
          {loading ? (
            <div data-snapshot-id={`${rootId}-loadingState`} className={loadingStateSurface.className} style={loadingStateSurface.style}>
              <span aria-hidden="true" data-snapshot-id={`${rootId}-loadingIcon`} className={loadingIconSurface.className} style={loadingIconSurface.style}><Icon name="loader" size={20} /></span>
              <span>Loading GIFs</span>
            </div>
          ) : null}

          {!loading && gifs.length === 0 ? (
            <div data-snapshot-id={`${rootId}-emptyState`} className={emptyStateSurface.className} style={emptyStateSurface.style}>
              {search ? "No GIFs found" : "Search for GIFs"}
            </div>
          ) : null}

          {!loading && gifs.length > 0 ? (
            <div data-snapshot-id={`${rootId}-grid`} className={gridSurface.className} style={gridSurface.style}>
              {gifs.map((gif) => {
                const itemSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${gif.id}`, implementationBase: { display: "block", overflow: "hidden", borderRadius: "sm", cursor: "pointer", bg: "var(--sn-color-muted, #f3f4f6)", hover: { shadow: "sm" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { padding: 0, border: "none", lineHeight: 0 } }, componentSurface: slots?.item });
                const imageSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${gif.id}-image`, implementationBase: { style: { width: "100%", height: "auto", display: "block", minHeight: "60px", objectFit: "cover", transition: "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)" }, hover: { scale: 1.03 } }, componentSurface: slots?.image });
                return (
                  <div key={gif.id}>
                    <ButtonControl type="button" onClick={() => handleSelect(gif)} title={gif.title} ariaLabel={gif.title ?? "Select GIF"} surfaceId={`${rootId}-item-${gif.id}`} surfaceConfig={itemSurface.resolvedConfigForWrapper} variant="ghost" size="sm">
                      <img src={gif.preview ?? gif.url} alt={gif.title ?? "GIF"} loading="lazy" data-snapshot-id={`${rootId}-item-${gif.id}-image`} className={imageSurface.className} style={imageSurface.style} />
                    </ButtonControl>
                    <SurfaceStyles css={itemSurface.scopedCss} />
                    <SurfaceStyles css={imageSurface.scopedCss} />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {attribution ? <div data-snapshot-id={`${rootId}-attribution`} className={attributionSurface.className} style={attributionSurface.style}>{attribution}</div> : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={searchSectionSurface.scopedCss} />
      <SurfaceStyles css={searchShellSurface.scopedCss} />
      <SurfaceStyles css={searchIconSurface.scopedCss} />
      <SurfaceStyles css={searchInputSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={loadingStateSurface.scopedCss} />
      <SurfaceStyles css={loadingIconSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
      <SurfaceStyles css={gridSurface.scopedCss} />
      <SurfaceStyles css={attributionSurface.scopedCss} />
    </>
  );
}
