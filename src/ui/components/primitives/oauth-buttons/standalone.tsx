'use client';

import { useEffect, useRef, type CSSProperties } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Provider icons ───────────────────────────────────────────────────────────

const PROVIDER_ICON_MAP: Record<string, string> = {
  google: "mail",
  github: "globe",
  microsoft: "globe",
  apple: "globe",
  facebook: "globe",
  discord: "globe",
};

// ── Standalone types ─────────────────────────────────────────────────────────

export interface OAuthProvider {
  /** Provider key name (e.g. "google", "github"). */
  name: string;
  /** Pre-resolved display label (e.g. "Continue with Google"). */
  label: string;
  /** Pre-resolved description text. */
  description?: string;
  /** URL to navigate to for OAuth flow. */
  url: string;
  /** When false, prevents auto-redirect even in "auto" providerMode. */
  autoRedirect?: boolean;
}

export interface OAuthButtonsBaseProps {
  /** Pre-resolved heading text. */
  heading?: string;
  /** List of resolved OAuth providers to render. */
  providers?: OAuthProvider[];
  /** Provider mode — "buttons" shows button per provider, "auto" auto-redirects for single provider. */
  providerMode?: "buttons" | "auto";
  /** Callback when a provider is selected — receives the provider URL. */
  onProviderClick?: (url: string, providerName: string) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, heading, providerGroup, provider, providerIcon, providerLabel, providerDescription). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone OAuthButtons — renders OAuth provider buttons with optional
 * heading and auto-redirect support. No manifest context required.
 *
 * @example
 * ```tsx
 * <OAuthButtonsBase
 *   heading="Sign in with"
 *   providers={[
 *     { name: "google", label: "Continue with Google", url: "/auth/google" },
 *     { name: "github", label: "Continue with GitHub", url: "/auth/github" },
 *   ]}
 * />
 * ```
 */
export function OAuthButtonsBase({
  heading,
  providers = [],
  providerMode = "buttons",
  onProviderClick,
  id,
  className,
  style,
  slots,
}: OAuthButtonsBaseProps) {
  const autoRedirectedRef = useRef(false);
  const rootId = id ?? "oauth-buttons";
  const hasProviders = providers.length > 0;
  const componentSurface = className || style ? { className, style } : undefined;

  useEffect(() => {
    if (
      !hasProviders ||
      providerMode !== "auto" ||
      autoRedirectedRef.current ||
      providers.length !== 1
    ) {
      return;
    }

    const provider = providers[0]!;

    // Respect per-provider opt-out of auto-redirect
    if (provider.autoRedirect === false) {
      return;
    }
    autoRedirectedRef.current = true;
    window.dispatchEvent(
      new CustomEvent("snapshot:auth-provider-redirect", {
        detail: {
          provider: provider.name,
          url: provider.url,
        },
      }),
    );

    if (onProviderClick) {
      onProviderClick(provider.url, provider.name);
    } else {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = provider.url;
      document.body.appendChild(form);
      form.submit();
    }
  }, [hasProviders, providerMode, providers, onProviderClick]);

  if (!hasProviders) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
    },
    componentSurface,
    itemSurface: slots?.root,
  });
  const headingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-heading`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: "var(--sn-font-weight-medium, 500)",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: slots?.heading,
  });
  const providerGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-provider-group`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
    },
    componentSurface: slots?.providerGroup,
  });
  const providerButtonSurface = slots?.provider;
  const providerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-provider-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      style: { flexShrink: 0 },
    },
    componentSurface: slots?.providerIcon,
  });
  const providerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-provider-label`,
    implementationBase: {
      flex: 1,
      textAlign: "center",
    },
    componentSurface: slots?.providerLabel,
  });
  const providerDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-provider-description`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      textAlign: "center",
    },
    componentSurface: slots?.providerDescription,
  });

  return (
    <>
      <div
        data-snapshot-component="oauth-buttons"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {heading ? (
          <div
            data-snapshot-id={`${rootId}-heading`}
            className={headingSurface.className}
            style={headingSurface.style}
          >
            {heading}
          </div>
        ) : null}
        {providers.map((provider, index) => {
          const descriptionId = `sn-oauth-provider-${provider.name}`;

          return (
            <div
              key={provider.name}
              data-snapshot-id={`${rootId}-provider-group-${index}`}
              className={providerGroupSurface.className}
              style={providerGroupSurface.style}
            >
              <ButtonControl
                surfaceId={`${rootId}-provider-${index}`}
                surfaceConfig={providerButtonSurface}
                variant="outline"
                size="sm"
                ariaLabel={provider.label}
                ariaDescribedBy={provider.description ? descriptionId : undefined}
                ariaHasPopup={false}
                onClick={() => {
                  if (onProviderClick) {
                    onProviderClick(provider.url, provider.name);
                  } else {
                    const form = document.createElement("form");
                    form.method = "POST";
                    form.action = provider.url;
                    document.body.appendChild(form);
                    form.submit();
                  }
                }}
              >
                <span
                  data-snapshot-id={`${rootId}-provider-icon-${index}`}
                  className={providerIconSurface.className}
                  style={providerIconSurface.style}
                >
                  {renderIcon(
                    PROVIDER_ICON_MAP[provider.name] ?? "globe",
                    16,
                  )}
                </span>
                <span
                  data-snapshot-id={`${rootId}-provider-label-${index}`}
                  className={providerLabelSurface.className}
                  style={providerLabelSurface.style}
                >
                  {provider.label}
                </span>
              </ButtonControl>
              {provider.description ? (
                <div
                  id={descriptionId}
                  data-snapshot-id={`${rootId}-provider-description-${index}`}
                  className={providerDescriptionSurface.className}
                  style={providerDescriptionSurface.style}
                >
                  {provider.description}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headingSurface.scopedCss} />
      <SurfaceStyles css={providerGroupSurface.scopedCss} />
      <SurfaceStyles css={providerIconSurface.scopedCss} />
      <SurfaceStyles css={providerLabelSurface.scopedCss} />
      <SurfaceStyles css={providerDescriptionSurface.scopedCss} />
    </>
  );
}
