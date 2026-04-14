"use client";

import type { CSSProperties } from "react";
import { useManifestRuntime } from "../../../manifest/runtime";
import { useActionExecutor } from "../../../actions/executor";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { NavLogoConfig } from "./types";

function SurfaceStyles({ css }: { css?: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

export function NavLogo({ config }: { config: NavLogoConfig }) {
  const manifest = useManifestRuntime();
  const execute = useActionExecutor();

  const text = config.text ?? manifest?.app?.title;
  const src = config.src;
  const path = config.path ?? manifest?.app?.home ?? "/";
  const logoHeight = config.logoHeight ?? "var(--sn-spacing-lg, 1.5rem)";

  const handleClick = () => {
    if (path) {
      void execute({ type: "navigate", to: path } as Parameters<
        typeof execute
      >[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && path) {
      e.preventDefault();
      handleClick();
    }
  };

  const rootId = config.id ?? "nav-logo";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      cursor: path ? "pointer" : undefined,
      textDecoration: "none",
      flexShrink: 0,
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      height: logoHeight,
      width: "auto",
    },
    componentSurface: config.slots?.icon,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)" as CSSProperties["fontWeight"],
      whiteSpace: "nowrap",
    },
    componentSurface: config.slots?.label,
  });

  return (
    <div
      data-snapshot-component="nav-logo"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={path ? "link" : undefined}
      tabIndex={path ? 0 : undefined}
    >
      {src && (
        <img
          src={src}
          alt={text ?? "Logo"}
          data-snapshot-id={`${rootId}-icon`}
          className={iconSurface.className}
          style={iconSurface.style}
        />
      )}
      {text && (
        <span
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {text}
        </span>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </div>
  );
}
