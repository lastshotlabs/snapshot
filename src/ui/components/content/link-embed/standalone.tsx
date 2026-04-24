'use client';

import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { detectPlatform } from "./platform";
import type { PlatformInfo } from "./platform";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Link embed meta type ─────────────────────────────────────────────────────

export interface LinkEmbedMeta {
  /** Page title extracted from meta tags. */
  title?: string;
  /** Page description extracted from meta tags. */
  description?: string;
  /** Open Graph or preview image URL. */
  image?: string;
  /** Site favicon URL. */
  favicon?: string;
  /** Site name (e.g. from `og:site_name`). */
  siteName?: string;
  /** Theme or accent color for the embed card. */
  color?: string;
  /** Raw HTML for rich embeds (e.g. oEmbed). */
  html?: string;
}

// ── Internal sub-components ──────────────────────────────────────────────────

function MediaFrame({
  rootId,
  frameBase,
  children,
  slots,
}: {
  rootId: string;
  frameBase?: Record<string, unknown>;
  children: ReactNode;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const mediaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-media`,
    implementationBase: { borderRadius: "md", overflow: "hidden", ...frameBase },
    componentSurface: slots?.media,
  });
  return (
    <>
      <div data-snapshot-id={`${rootId}-media`} className={mediaSurface.className} style={mediaSurface.style}>{children}</div>
      <SurfaceStyles css={mediaSurface.scopedCss} />
    </>
  );
}

function EmbedFrame({
  rootId,
  title,
  src,
  frameBase,
  allow,
  allowFullScreen,
  slots,
}: {
  rootId: string;
  title: string;
  src: string;
  frameBase?: Record<string, unknown>;
  allow?: string;
  allowFullScreen?: boolean;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const frameSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-embed-frame`,
    implementationBase: frameBase,
    componentSurface: slots?.embedFrame,
  });
  return (
    <>
      <iframe src={src} title={title} allow={allow} allowFullScreen={allowFullScreen} data-snapshot-id={`${rootId}-embed-frame`} className={frameSurface.className} style={frameSurface.style} />
      <SurfaceStyles css={frameSurface.scopedCss} />
    </>
  );
}

function YouTubeEmbed({ rootId, info, aspectRatio, slots }: { rootId: string; info: PlatformInfo; aspectRatio: string; slots?: Record<string, Record<string, unknown>> }) {
  return (
    <MediaFrame rootId={rootId} frameBase={{ position: "relative", width: "100%", aspectRatio, bg: "var(--sn-color-foreground, #000)" }} slots={slots}>
      <EmbedFrame rootId={rootId} title="YouTube video" src={info.embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen frameBase={{ position: "absolute", inset: 0, width: "100%", height: "100%", style: { border: "none" } }} slots={slots} />
    </MediaFrame>
  );
}

function InstagramEmbed({ rootId, info, slots }: { rootId: string; info: PlatformInfo; slots?: Record<string, Record<string, unknown>> }) {
  return (
    <MediaFrame rootId={rootId} frameBase={{ maxWidth: "min(540px, 100%)" }} slots={slots}>
      <EmbedFrame rootId={rootId} title="Instagram post" src={info.embedUrl} allowFullScreen frameBase={{ width: "100%", minHeight: "500px", bg: "var(--sn-color-card, #ffffff)", style: { border: "none" } }} slots={slots} />
    </MediaFrame>
  );
}

function TikTokEmbed({ rootId, info, slots }: { rootId: string; info: PlatformInfo; slots?: Record<string, Record<string, unknown>> }) {
  return (
    <MediaFrame rootId={rootId} frameBase={{ maxWidth: "min(325px, 100%)" }} slots={slots}>
      <EmbedFrame rootId={rootId} title="TikTok video" src={info.embedUrl} allowFullScreen frameBase={{ width: "100%", height: "min(750px, 80vh)", bg: "var(--sn-color-card, #ffffff)", style: { border: "none" } }} slots={slots} />
    </MediaFrame>
  );
}

function TwitterEmbed({ rootId, info, slots }: { rootId: string; info: PlatformInfo; slots?: Record<string, Record<string, unknown>> }) {
  return (
    <MediaFrame rootId={rootId} frameBase={{ maxWidth: "min(550px, 100%)" }} slots={slots}>
      <EmbedFrame rootId={rootId} title="Tweet" src={info.embedUrl} frameBase={{ width: "100%", minHeight: "250px", bg: "var(--sn-color-card, #ffffff)", style: { border: "none" } }} slots={slots} />
    </MediaFrame>
  );
}

function GifEmbed({ rootId, url, slots }: { rootId: string; url: string; slots?: Record<string, Record<string, unknown>> }) {
  const imageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-gif-image`,
    implementationBase: { width: "100%", height: "auto", display: "block" },
    componentSurface: slots?.gifImage,
  });
  return (
    <MediaFrame rootId={rootId} frameBase={{ maxWidth: "min(400px, 100%)" }} slots={slots}>
      <img src={url} alt="GIF" data-snapshot-id={`${rootId}-gif-image`} className={imageSurface.className} style={imageSurface.style} />
      <SurfaceStyles css={imageSurface.scopedCss} />
    </MediaFrame>
  );
}

function sanitizeOEmbed(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/g, "");
}

function GenericCard({ rootId, url, meta, slots }: { rootId: string; url: string; meta?: LinkEmbedMeta; slots?: Record<string, Record<string, unknown>> }) {
  const siteName = meta?.siteName;
  const title = meta?.title;
  const description = meta?.description;
  const cardSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-card`,
    implementationBase: {
      display: "flex",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "md",
      overflow: "hidden",
      bg: "var(--sn-color-card, #ffffff)",
      style: {
        textDecoration: "none",
        maxHeight: "120px",
        borderLeft: meta?.color
          ? `var(--sn-border-thick, 3px) solid ${meta.color}`
          : "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: slots?.card,
  });
  const thumbnailSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-thumbnail`, implementationBase: { style: { width: "clamp(80px, 25%, 120px)", minHeight: "80px", flexShrink: 0, backgroundImage: meta?.image ? `url(${meta.image})` : undefined, backgroundSize: "cover", backgroundPosition: "center" } }, componentSurface: slots?.thumbnail });
  const contentSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-content`, implementationBase: { flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "2xs", padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)", minWidth: 0 }, componentSurface: slots?.content });
  const siteMetaSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-siteMeta`, implementationBase: { display: "flex", alignItems: "center", gap: "xs" }, componentSurface: slots?.siteMeta });
  const faviconSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-favicon`, implementationBase: { width: "14px", height: "14px", borderRadius: "var(--sn-radius-xs, 2px)" }, componentSurface: slots?.favicon });
  const siteNameSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-site-name`, implementationBase: { fontSize: "var(--sn-font-size-xs, 0.75rem)", color: "var(--sn-color-muted-foreground, #6b7280)", letterSpacing: "var(--sn-tracking-wide, 0.05em)", style: { textTransform: "uppercase" } }, componentSurface: slots?.siteName });
  const titleSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-title`, implementationBase: { fontSize: "sm", fontWeight: "semibold", color: "var(--sn-color-info, #3b82f6)", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, componentSurface: slots?.title });
  const descriptionSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-description`, implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)", style: { overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } }, componentSurface: slots?.description });
  const urlSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-url`, implementationBase: { fontSize: "xs", color: "var(--sn-color-info, #3b82f6)", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, componentSurface: slots?.url });

  if (meta?.html) {
    return (
      <>
        <div data-snapshot-id={`${rootId}-card`} className={cardSurface.className} style={cardSurface.style} dangerouslySetInnerHTML={{ __html: sanitizeOEmbed(meta.html) }} />
        <SurfaceStyles css={cardSurface.scopedCss} />
      </>
    );
  }

  return (
    <>
      <a href={url} target="_blank" rel="noopener noreferrer" data-snapshot-id={`${rootId}-card`} className={cardSurface.className} style={cardSurface.style}>
        {meta?.image ? <div data-snapshot-id={`${rootId}-thumbnail`} className={thumbnailSurface.className} style={thumbnailSurface.style} /> : null}
        <div data-snapshot-id={`${rootId}-content`} className={contentSurface.className} style={contentSurface.style}>
          {siteName || meta?.favicon ? (
            <div data-snapshot-id={`${rootId}-siteMeta`} className={siteMetaSurface.className} style={siteMetaSurface.style}>
              {meta?.favicon ? <img src={meta.favicon} alt="" data-snapshot-id={`${rootId}-favicon`} className={faviconSurface.className} style={faviconSurface.style} /> : null}
              {siteName ? <span data-snapshot-id={`${rootId}-site-name`} className={siteNameSurface.className} style={siteNameSurface.style}>{siteName}</span> : null}
            </div>
          ) : null}
          {title ? <div data-snapshot-id={`${rootId}-title`} className={titleSurface.className} style={titleSurface.style}>{title}</div> : null}
          {description ? <div data-snapshot-id={`${rootId}-description`} className={descriptionSurface.className} style={descriptionSurface.style}>{description}</div> : null}
          {!title ? <div data-snapshot-id={`${rootId}-url`} className={urlSurface.className} style={urlSurface.style}>{url}</div> : null}
        </div>
      </a>
      <SurfaceStyles css={cardSurface.scopedCss} />
      <SurfaceStyles css={thumbnailSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={siteMetaSurface.scopedCss} />
      <SurfaceStyles css={faviconSurface.scopedCss} />
      <SurfaceStyles css={siteNameSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={urlSurface.scopedCss} />
    </>
  );
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface LinkEmbedBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** URL to display as a link embed. */
  url: string;
  /** Metadata for the link preview. */
  meta?: LinkEmbedMeta;
  /** Whether to allow iframe embeds for supported platforms. Default: true. */
  allowIframe?: boolean;
  /** Aspect ratio for video embeds. Default: "16/9". */
  aspectRatio?: string;
  /** Maximum width for the embed. */
  maxWidth?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone LinkEmbed — renders rich link previews with platform-specific
 * embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <LinkEmbedBase url="https://www.youtube.com/watch?v=xyz" />
 * ```
 */
export function LinkEmbedBase({
  id,
  url,
  meta,
  allowIframe = true,
  aspectRatio = "16/9",
  maxWidth,
  className,
  style,
  slots,
}: LinkEmbedBaseProps) {
  const rootId = id ?? "link-embed";
  const platformInfo = useMemo(() => detectPlatform(url), [url]);
  const platform = platformInfo?.platform ?? "generic";

  if (!url) return null;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: { maxWidth: maxWidth ?? "100%" },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <>
      <div
        data-snapshot-component="link-embed"
        data-testid="link-embed"
        data-platform={platform}
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {allowIframe && platformInfo?.platform === "youtube" ? <YouTubeEmbed rootId={rootId} info={platformInfo} aspectRatio={aspectRatio} slots={slots} /> : null}
        {allowIframe && platformInfo?.platform === "instagram" ? <InstagramEmbed rootId={rootId} info={platformInfo} slots={slots} /> : null}
        {allowIframe && platformInfo?.platform === "tiktok" ? <TikTokEmbed rootId={rootId} info={platformInfo} slots={slots} /> : null}
        {allowIframe && platformInfo?.platform === "twitter" ? <TwitterEmbed rootId={rootId} info={platformInfo} slots={slots} /> : null}
        {platformInfo?.platform === "gif" ? <GifEmbed rootId={rootId} url={platformInfo.embedUrl} slots={slots} /> : null}
        {!platformInfo || (!allowIframe && platformInfo.platform !== "gif") ? <GenericCard rootId={rootId} url={url} meta={meta} slots={slots} /> : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
