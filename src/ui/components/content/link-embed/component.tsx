import { useMemo } from "react";
import { useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { detectPlatform, PLATFORM_COLORS, PLATFORM_NAMES } from "./platform";
import type { PlatformInfo } from "./platform";
import type { LinkEmbedConfig } from "./types";

// ── Platform-specific renderers ───────────────────────────────────────────

/** YouTube iframe embed. */
function YouTubeEmbed({
  info,
  aspectRatio,
}: {
  info: PlatformInfo;
  aspectRatio: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        overflow: "hidden",
        backgroundColor: "#000",
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
    </div>
  );
}

/** Instagram embed iframe. */
function InstagramEmbed({ info }: { info: PlatformInfo }) {
  return (
    <div
      style={{
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        overflow: "hidden",
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
    </div>
  );
}

/** TikTok embed iframe. */
function TikTokEmbed({ info }: { info: PlatformInfo }) {
  return (
    <div
      style={{
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        overflow: "hidden",
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
    </div>
  );
}

/** Twitter/X embed iframe. */
function TwitterEmbed({ info }: { info: PlatformInfo }) {
  return (
    <div
      style={{
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        overflow: "hidden",
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
    </div>
  );
}

/** GIF inline image. */
function GifEmbed({ url }: { url: string }) {
  return (
    <div
      style={{
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        overflow: "hidden",
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
          borderRadius: "var(--sn-radius-md, 0.5rem)",
        }}
      />
    </div>
  );
}

// ── Generic OG card ───────────────────────────────────────────────────────

function GenericCard({
  url,
  meta,
}: {
  url: string;
  meta?: LinkEmbedConfig["meta"];
}) {
  const title = meta?.title;
  const description = meta?.description;
  const image = meta?.image;
  const siteName = meta?.siteName;
  const favicon = meta?.favicon;
  const color = meta?.color;

  // If we have oEmbed HTML, render it in an iframe
  if (meta?.html) {
    return (
      <div
        style={{
          borderRadius: "var(--sn-radius-md, 0.5rem)",
          overflow: "hidden",
          border: "1px solid var(--sn-color-border, #e5e7eb)",
        }}
        dangerouslySetInnerHTML={{ __html: meta.html }}
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        textDecoration: "none",
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        overflow: "hidden",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        borderLeft: color
          ? `3px solid ${color}`
          : "1px solid var(--sn-color-border, #e5e7eb)",
        maxHeight: "120px",
      }}
    >
      {/* Image thumbnail */}
      {image && (
        <div
          style={{
            width: "clamp(80px, 25%, 120px)",
            minHeight: "80px",
            flexShrink: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Text content */}
      <div
        style={{
          flex: 1,
          padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "2px",
        }}
      >
        {/* Site name */}
        {(siteName || favicon) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-xs, 0.25rem)",
            }}
          >
            {favicon && (
              <img
                src={favicon}
                alt=""
                style={{ width: 14, height: 14, borderRadius: 2 }}
              />
            )}
            {siteName && (
              <span
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {siteName}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        {title && (
          <div
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight:
                "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
              color: "var(--sn-color-info, #3b82f6)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
        )}

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </div>
        )}

        {/* URL fallback when no title */}
        {!title && (
          <div
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-info, #3b82f6)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {url}
          </div>
        )}
      </div>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────

/**
 * LinkEmbed — renders rich URL previews with platform-specific renderers.
 *
 * Supports YouTube, Instagram, TikTok, Twitter/X iframes, inline GIF
 * images, and generic Open Graph cards for all other URLs.
 *
 * @param props - Component props containing the link embed configuration
 */
export function LinkEmbed({ config }: { config: LinkEmbedConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const rawUrl = useSubscribe(config.url) as string;
  const url = typeof rawUrl === "string" ? rawUrl : "";

  const allowIframe = config.allowIframe ?? true;
  const aspectRatio = config.aspectRatio ?? "16/9";

  const platformInfo = useMemo(() => detectPlatform(url), [url]);

  if (visible === false || !url) return null;

  // Determine the platform label for the header
  const platform = platformInfo?.platform ?? "generic";
  const platformName =
    config.meta?.siteName ?? PLATFORM_NAMES[platform] ?? "";
  const accentColor =
    config.meta?.color ?? PLATFORM_COLORS[platform] ?? undefined;

  return (
    <div
      data-snapshot-component="link-embed"
      data-testid="link-embed"
      data-platform={platform}
      className={config.className}
      style={{
        maxWidth: config.maxWidth ?? "100%",
      }}
    >
      {/* Platform-specific iframe embeds */}
      {allowIframe && platformInfo?.platform === "youtube" && (
        <YouTubeEmbed info={platformInfo} aspectRatio={aspectRatio} />
      )}

      {allowIframe && platformInfo?.platform === "instagram" && (
        <InstagramEmbed info={platformInfo} />
      )}

      {allowIframe && platformInfo?.platform === "tiktok" && (
        <TikTokEmbed info={platformInfo} />
      )}

      {allowIframe && platformInfo?.platform === "twitter" && (
        <TwitterEmbed info={platformInfo} />
      )}

      {/* GIF inline */}
      {platformInfo?.platform === "gif" && (
        <GifEmbed url={platformInfo.embedUrl} />
      )}

      {/* Generic OG card — for non-iframe platforms or when iframes disabled */}
      {(!platformInfo || (!allowIframe && platformInfo.platform !== "gif")) && (
        <GenericCard url={url} meta={config.meta} />
      )}
    </div>
  );
}
