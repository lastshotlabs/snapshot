import type { CSSProperties } from "react";

export interface BackgroundGradientStop {
  color: string;
  position?: string;
}

export interface BackgroundGradientConfig {
  type?: "linear" | "radial" | "conic";
  direction?: string;
  stops: BackgroundGradientStop[];
}

export interface BackgroundObjectConfig {
  image?: string;
  overlay?: string;
  gradient?: BackgroundGradientConfig;
  position?: string;
  size?: "cover" | "contain" | "auto";
  fixed?: boolean;
}

export type ComponentBackgroundValue = string | BackgroundObjectConfig;

function buildGradientCss(
  gradient: BackgroundGradientConfig | undefined,
): string {
  if (!gradient) {
    return "";
  }

  const stops = gradient.stops
    .map((stop) => `${stop.color}${stop.position ? ` ${stop.position}` : ""}`)
    .join(", ");

  if ((gradient.type ?? "linear") === "radial") {
    return `radial-gradient(${stops})`;
  }

  if (gradient.type === "conic") {
    return `conic-gradient(from ${gradient.direction ?? "0deg"}, ${stops})`;
  }

  return `linear-gradient(${gradient.direction ?? "135deg"}, ${stops})`;
}

export function resolveComponentBackgroundStyle(
  background: ComponentBackgroundValue | undefined,
): CSSProperties | undefined {
  if (!background) {
    return undefined;
  }

  if (typeof background === "string") {
    return { background };
  }

  const layers: string[] = [];
  if (background.overlay) {
    layers.push(
      `linear-gradient(${background.overlay}, ${background.overlay})`,
    );
  }
  if (background.gradient) {
    layers.push(buildGradientCss(background.gradient));
  }
  if (background.image) {
    layers.push(`url(${background.image})`);
  }

  return {
    ...(layers.length > 0 ? { backgroundImage: layers.join(", ") } : undefined),
    backgroundPosition:
      background.position ?? (background.image ? "center" : undefined),
    backgroundSize: background.size ?? (background.image ? "cover" : undefined),
    backgroundAttachment: background.fixed ? "fixed" : undefined,
  };
}
