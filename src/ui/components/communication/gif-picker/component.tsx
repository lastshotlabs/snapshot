'use client';

import { useState, useMemo, useCallback, useEffect } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { GifEntry, GifPickerConfig } from "./types";

function toGifEntries(
  payload: unknown,
  urlField: string,
  previewField: string,
  titleField: string,
): GifEntry[] {
  const recordData =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : undefined;
  const items = Array.isArray(payload)
    ? (payload as Record<string, unknown>[])
    : ((recordData?.results ??
        recordData?.data ??
        recordData?.gifs ??
        []) as Record<string, unknown>[]);

  return items.map((item, index) => ({
    id: String(item.id ?? index),
    url: String(item[urlField] ?? ""),
    preview: String(item[previewField] ?? item[urlField] ?? ""),
    width: item.width as number | undefined,
    height: item.height as number | undefined,
    title: String(item[titleField] ?? ""),
  }));
}

export function GifPicker({ config }: { config: GifPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const placeholder = useSubscribe(config.placeholder) as string | undefined;
  const attribution = useSubscribe(config.attribution) as string | undefined;
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const rootId = config.id ?? "gif-picker";

  const columns = config.columns ?? 2;
  const maxHeight = config.maxHeight ?? "300px";
  const urlField = config.urlField ?? "url";
  const previewField = config.previewField ?? "preview";
  const titleField = config.titleField ?? "title";
  const resolvedConfig = useResolveFrom({ gifs: config.gifs });

  const staticGifs = useMemo(() => {
    const gifs = (resolvedConfig.gifs ?? config.gifs) as GifPickerConfig["gifs"];
    if (!gifs) {
      return [];
    }

    return gifs.map((gif) => ({
      id: gif.id,
      url: gif.url,
      preview: gif.preview ?? gif.url,
      width: gif.width,
      height: gif.height,
      title: typeof gif.title === "string" ? gif.title : undefined,
    }));
  }, [config.gifs, resolvedConfig.gifs]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const remoteTarget =
    staticGifs.length > 0
      ? ""
      : debouncedSearch
        ? (config.searchEndpoint ?? "")
        : (config.trendingEndpoint ?? "");
  const remoteResults = useComponentData(
    remoteTarget,
    debouncedSearch && config.searchEndpoint
      ? { q: debouncedSearch }
      : undefined,
  );
  const results = useMemo(
    () =>
      toGifEntries(remoteResults.data, urlField, previewField, titleField),
    [previewField, remoteResults.data, titleField, urlField],
  );

  const handleSelect = useCallback(
    (gif: GifEntry) => {
      publish?.({ url: gif.url, title: gif.title, id: gif.id });

      if (config.selectAction) {
        void execute(config.selectAction, {
          url: gif.url,
          title: gif.title,
          id: gif.id,
        });
      }
    },
    [config.selectAction, execute, publish],
  );

  if (visible === false) {
    return null;
  }

  const displayGifs = staticGifs.length > 0 ? staticGifs : results;
  const loading = staticGifs.length === 0 && remoteResults.isLoading;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
      maxWidth: "400px",
      overflow: "hidden",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["maxHeight"] }),
    itemSurface: config.slots?.root,
  });
  const searchSectionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchSection`,
    implementationBase: {
      padding: "xs",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.searchSection,
  });
  const searchShellSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchShell`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      paddingY: "xs",
      paddingX: "sm",
      borderRadius: "sm",
      bg: "var(--sn-color-secondary, #f3f4f6)",
    },
    componentSurface: config.slots?.searchShell,
  });
  const searchIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchIcon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.searchIcon,
  });
  const searchInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchInput`,
    implementationBase: {
      width: "100%",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        border: "none",
        outline: "none",
        background: "transparent",
        padding: 0,
        minWidth: 0,
        fontFamily: "inherit",
      },
    },
    componentSurface: config.slots?.searchInput,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      overflow: "auto",
      padding: "xs",
      style: {
        maxHeight,
      },
    },
    componentSurface: config.slots?.content,
  });
  const loadingStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingState`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "xs",
      padding: "lg",
      textAlign: "center",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.loadingState,
  });
  const loadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingIcon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        display: "inline-flex",
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.loadingIcon,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: {
      padding: "lg",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.emptyState,
  });
  const gridSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-grid`,
    implementationBase: {
      display: "grid",
      gap: "sm",
      style: {
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      },
    },
    componentSurface: config.slots?.grid,
  });
  const attributionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-attribution`,
    implementationBase: {
      paddingY: "xs",
      paddingX: "sm",
      textAlign: "center",
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        borderTop:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.attribution,
  });

  return (
    <>
      <div
        data-snapshot-component="gif-picker"
        data-testid="gif-picker"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-searchSection`}
          className={searchSectionSurface.className}
          style={searchSectionSurface.style}
        >
          <div
            data-snapshot-id={`${rootId}-searchShell`}
            className={searchShellSurface.className}
            style={searchShellSurface.style}
          >
            <span
              aria-hidden="true"
              data-snapshot-id={`${rootId}-searchIcon`}
              className={searchIconSurface.className}
              style={searchIconSurface.style}
            >
              <Icon name="search" size={14} />
            </span>
            <InputControl
              testId="gif-search"
              surfaceId={`${rootId}-searchInput`}
              type="text"
              placeholder={placeholder ?? "Search GIFs..."}
              value={search}
              onChangeText={setSearch}
              surfaceConfig={searchInputSurface.resolvedConfigForWrapper}
            />
          </div>
        </div>

        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {loading ? (
            <div
              data-snapshot-id={`${rootId}-loadingState`}
              className={loadingStateSurface.className}
              style={loadingStateSurface.style}
            >
              <span
                aria-hidden="true"
                data-snapshot-id={`${rootId}-loadingIcon`}
                className={loadingIconSurface.className}
                style={loadingIconSurface.style}
              >
                <Icon name="loader" size={20} />
              </span>
              <span>Loading GIFs</span>
            </div>
          ) : null}

          {!loading && displayGifs.length === 0 ? (
            <div
              data-snapshot-id={`${rootId}-emptyState`}
              className={emptyStateSurface.className}
              style={emptyStateSurface.style}
            >
              {search ? "No GIFs found" : "Search for GIFs"}
            </div>
          ) : null}

          {!loading && displayGifs.length > 0 ? (
            <div
              data-snapshot-id={`${rootId}-grid`}
              className={gridSurface.className}
              style={gridSurface.style}
            >
              {displayGifs.map((gif) => {
                const itemSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-item-${gif.id}`,
                  implementationBase: {
                    display: "block",
                    overflow: "hidden",
                    borderRadius: "sm",
                    cursor: "pointer",
                    bg: "var(--sn-color-muted, #f3f4f6)",
                    hover: {
                      shadow: "sm",
                    },
                    focus: {
                      ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
                    },
                    style: {
                      padding: 0,
                      border: "none",
                      lineHeight: 0,
                    },
                  },
                  componentSurface: config.slots?.item,
                });
                const imageSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-item-${gif.id}-image`,
                  implementationBase: {
                    style: {
                      width: "100%",
                      height: "auto",
                      display: "block",
                      minHeight: "60px",
                      objectFit: "cover",
                      transition:
                        "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                    },
                    hover: {
                      scale: 1.03,
                    },
                  },
                  componentSurface: config.slots?.image,
                });

                return (
                  <div key={gif.id}>
                    <ButtonControl
                      type="button"
                      onClick={() => handleSelect(gif)}
                      title={gif.title}
                      ariaLabel={gif.title ?? "Select GIF"}
                      surfaceId={`${rootId}-item-${gif.id}`}
                      surfaceConfig={itemSurface.resolvedConfigForWrapper}
                      variant="ghost"
                      size="sm"
                    >
                      <img
                        src={gif.preview ?? gif.url}
                        alt={gif.title ?? "GIF"}
                        loading="lazy"
                        data-snapshot-id={`${rootId}-item-${gif.id}-image`}
                        className={imageSurface.className}
                        style={imageSurface.style}
                      />
                    </ButtonControl>
                    <SurfaceStyles css={itemSurface.scopedCss} />
                    <SurfaceStyles css={imageSurface.scopedCss} />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {attribution ? (
          <div
            data-snapshot-id={`${rootId}-attribution`}
            className={attributionSurface.className}
            style={attributionSurface.style}
          >
            {attribution}
          </div>
        ) : null}
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
