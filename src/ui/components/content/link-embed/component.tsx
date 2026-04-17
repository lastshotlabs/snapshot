'use client';

import { useMemo, type CSSProperties } from "react";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { detectPlatform } from "./platform";
import type { PlatformInfo } from "./platform";
import type { LinkEmbedConfig } from "./types";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

function MediaFrame({
  config,
  rootId,
  style,
  children,
}: {
  config: LinkEmbedConfig;
  rootId: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const mediaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-media`,
    implementationBase: {
      borderRadius: "md",
      overflow: "hidden",
      style,
    },
    componentSurface: config.slots?.media,
  });

  return (
    <>
      <div
        data-snapshot-id={`${rootId}-media`}
        className={mediaSurface.className}
        style={mediaSurface.style}
      >
        {children}
      </div>
      <SurfaceStyles css={mediaSurface.scopedCss} />
    </>
  );
}

function YouTubeEmbed({
  config,
  rootId,
  info,
  aspectRatio,
}: {
  config: LinkEmbedConfig;
  rootId: string;
  info: PlatformInfo;
  aspectRatio: string;
}) {
  return (
    <MediaFrame
      config={config}
      rootId={rootId}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        backgroundColor: "var(--sn-color-foreground, #000)",
      }}
    >
      <iframe
        src={info.embedUrl}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </MediaFrame>
  );
}

function InstagramEmbed({ config, rootId, info }: { config: LinkEmbedConfig; rootId: string; info: PlatformInfo }) {
  return (
    <MediaFrame
      config={config}
      rootId={rootId}
      style={{
        maxWidth: "min(540px, 100%)",
      }}
    >
      <iframe
        src={info.embedUrl}
        title="Instagram post"
        allowFullScreen
        style={{
          width: "100%",
          minHeight: "500px",
          border: "none",
          backgroundColor: "var(--sn-color-card, #ffffff)",
        }}
      />
    </MediaFrame>
  );
}

function TikTokEmbed({ config, rootId, info }: { config: LinkEmbedConfig; rootId: string; info: PlatformInfo }) {
  return (
    <MediaFrame
      config={config}
      rootId={rootId}
      style={{
        maxWidth: "min(325px, 100%)",
      }}
    >
      <iframe
        src={info.embedUrl}
        title="TikTok video"
        allowFullScreen
        style={{
          width: "100%",
          height: "min(750px, 80vh)",
          border: "none",
          backgroundColor: "var(--sn-color-card, #ffffff)",
        }}
      />
    </MediaFrame>
  );
}

function TwitterEmbed({ config, rootId, info }: { config: LinkEmbedConfig; rootId: string; info: PlatformInfo }) {
  return (
    <MediaFrame
      config={config}
      rootId={rootId}
      style={{
        maxWidth: "min(550px, 100%)",
      }}
    >
      <iframe
        src={info.embedUrl}
        title="Tweet"
        style={{
          width: "100%",
          minHeight: "250px",
          border: "none",
          backgroundColor: "var(--sn-color-card, #ffffff)",
        }}
      />
    </MediaFrame>
  );
}

function GifEmbed({ config, rootId, url }: { config: LinkEmbedConfig; rootId: string; url: string }) {
  return (
    <MediaFrame
      config={config}
      rootId={rootId}
      style={{
        maxWidth: "min(400px, 100%)",
      }}
    >
      <img
        src={url}
        alt="GIF"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </MediaFrame>
  );
}

function sanitizeOEmbed(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/g, "");
}

function GenericCard({
  config,
  rootId,
  url,
  meta,
}: {
  config: LinkEmbedConfig;
  rootId: string;
  url: string;
  meta?: LinkEmbedConfig["meta"];
}) {
  const siteName = typeof meta?.siteName === "string" ? meta.siteName : undefined;
  const title = typeof meta?.title === "string" ? meta.title : undefined;
  const description =
    typeof meta?.description === "string" ? meta.description : undefined;
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
    componentSurface: config.slots?.card,
  });
  const thumbnailSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-thumbnail`,
    implementationBase: {
      style: {
        width: "clamp(80px, 25%, 120px)",
        minHeight: "80px",
        flexShrink: 0,
        backgroundImage: meta?.image ? `url(${meta.image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
    },
    componentSurface: config.slots?.thumbnail,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "2xs",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.content,
  });
  const siteMetaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-siteMeta`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
    },
    componentSurface: config.slots?.siteMeta,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "semibold",
      color: "var(--sn-color-info, #3b82f6)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      },
    },
    componentSurface: config.slots?.description,
  });
  const urlSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-url`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-info, #3b82f6)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.url,
  });

  if (meta?.html) {
    return (
      <>
        <div
          data-snapshot-id={`${rootId}-card`}
          className={cardSurface.className}
          style={cardSurface.style}
          dangerouslySetInnerHTML={{ __html: sanitizeOEmbed(meta.html) }}
        />
        <SurfaceStyles css={cardSurface.scopedCss} />
      </>
    );
  }

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-snapshot-id={`${rootId}-card`}
        className={cardSurface.className}
        style={cardSurface.style}
      >
        {meta?.image ? (
          <div
            data-snapshot-id={`${rootId}-thumbnail`}
            className={thumbnailSurface.className}
            style={thumbnailSurface.style}
          />
        ) : null}
        <div
          data-snapshot-id={`${rootId}-content`}
          className={contentSurface.className}
          style={contentSurface.style}
        >
          {siteName || meta?.favicon ? (
            <div
              data-snapshot-id={`${rootId}-siteMeta`}
              className={siteMetaSurface.className}
              style={siteMetaSurface.style}
            >
              {meta?.favicon ? (
                <img
                  src={meta.favicon}
                  alt=""
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "var(--sn-radius-xs, 2px)",
                  }}
                />
              ) : null}
              {siteName ? (
                <span
                  style={{
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    color: "var(--sn-color-muted-foreground, #6b7280)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--sn-tracking-wide, 0.05em)",
                  }}
                >
                  {siteName}
                </span>
              ) : null}
            </div>
          ) : null}
          {title ? (
            <div
              data-snapshot-id={`${rootId}-title`}
              className={titleSurface.className}
              style={titleSurface.style}
            >
              {title}
            </div>
          ) : null}
          {description ? (
            <div
              data-snapshot-id={`${rootId}-description`}
              className={descriptionSurface.className}
              style={descriptionSurface.style}
            >
              {description}
            </div>
          ) : null}
          {!title ? (
            <div
              data-snapshot-id={`${rootId}-url`}
              className={urlSurface.className}
              style={urlSurface.style}
            >
              {url}
            </div>
          ) : null}
        </div>
      </a>
      <SurfaceStyles css={cardSurface.scopedCss} />
      <SurfaceStyles css={thumbnailSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={siteMetaSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={urlSurface.scopedCss} />
    </>
  );
}

export function LinkEmbed({ config }: { config: LinkEmbedConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const rawUrl = useSubscribe(config.url) as string;
  const resolvedConfig = useResolveFrom({ meta: config.meta });
  const url = typeof rawUrl === "string" ? rawUrl : "";
  const rootId = config.id ?? "link-embed";
  const meta = (resolvedConfig.meta ?? config.meta) as LinkEmbedConfig["meta"];

  const allowIframe = config.allowIframe ?? true;
  const aspectRatio = config.aspectRatio ?? "16/9";
  const platformInfo = useMemo(() => detectPlatform(url), [url]);
  const platform = platformInfo?.platform ?? "generic";

  if (visible === false || !url) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      style: {
        maxWidth: config.maxWidth ?? "100%",
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["maxWidth"] }),
    itemSurface: config.slots?.root,
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
        {allowIframe && platformInfo?.platform === "youtube" ? (
          <YouTubeEmbed config={config} rootId={rootId} info={platformInfo} aspectRatio={aspectRatio} />
        ) : null}
        {allowIframe && platformInfo?.platform === "instagram" ? (
          <InstagramEmbed config={config} rootId={rootId} info={platformInfo} />
        ) : null}
        {allowIframe && platformInfo?.platform === "tiktok" ? (
          <TikTokEmbed config={config} rootId={rootId} info={platformInfo} />
        ) : null}
        {allowIframe && platformInfo?.platform === "twitter" ? (
          <TwitterEmbed config={config} rootId={rootId} info={platformInfo} />
        ) : null}
        {platformInfo?.platform === "gif" ? (
          <GifEmbed config={config} rootId={rootId} url={platformInfo.embedUrl} />
        ) : null}
        {!platformInfo || (!allowIframe && platformInfo.platform !== "gif") ? (
          <GenericCard config={config} rootId={rootId} url={url} meta={meta} />
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
