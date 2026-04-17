"use client";

import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { NotFoundConfig } from "./types";

export function DefaultNotFound({ config }: { config: NotFoundConfig }) {
  const resolvedTitle = useSubscribe(config.title) as string | undefined;
  const resolvedDescription = useSubscribe(config.description) as string | undefined;
  const rootId = config.id ?? "not-found";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      minHeight: "100vh",
      display: "grid",
      style: {
        placeItems: "center",
        padding: "var(--sn-spacing-2xl, 3rem)",
        background: "var(--sn-color-background, #f8fafc)",
        color: "var(--sn-color-foreground, #0f172a)",
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const eyebrowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-eyebrow`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      fontSize: "xs",
      style: {
        margin: 0,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      },
    },
    componentSurface: config.slots?.eyebrow,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "4xl",
      fontWeight: "bold",
      style: { margin: 0 },
    },
    componentSurface: config.slots?.title,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-description`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      style: { margin: 0 },
    },
    componentSurface: config.slots?.description,
  });

  return (
    <main
      aria-labelledby="snapshot-not-found-title"
      data-snapshot-feedback="not-found"
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <section
        style={{
          maxWidth: "32rem",
          textAlign: "center",
          display: "grid",
          gap: "var(--sn-spacing-md, 1rem)",
        }}
      >
        <p
          data-snapshot-id={`${rootId}-eyebrow`}
          className={eyebrowSurface.className}
          style={eyebrowSurface.style}
        >
          404
        </p>
        <h1
          id="snapshot-not-found-title"
          data-snapshot-id={`${rootId}-title`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {resolvedTitle ?? "Page not found"}
        </h1>
        <p
          data-snapshot-id={`${rootId}-description`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        >
          {resolvedDescription ?? "The page you are looking for does not exist."}
        </p>
      </section>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={eyebrowSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
    </main>
  );
}
