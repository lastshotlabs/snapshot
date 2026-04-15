"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { CarouselConfig } from "./types";

export function Carousel({ config }: { config: CarouselConfig }) {
  const [current, setCurrent] = useState(0);
  const children = config.children ?? [];
  const count = children.length;
  const intervalMs = config.interval ?? 5000;
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const rootId = config.id ?? "carousel";

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) {
        return;
      }

      setCurrent(((index % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => {
    setCurrent((currentIndex) => (count <= 0 ? 0 : (currentIndex + 1) % count));
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((currentIndex) =>
      count <= 0 ? 0 : (currentIndex - 1 + count) % count,
    );
  }, [count]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();

    if (!config.autoPlay || count <= 1) {
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrent((currentIndex) => (currentIndex + 1) % count);
    }, intervalMs);
  }, [config.autoPlay, count, intervalMs, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  if (count === 0) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      width: "100%",
      display: "block",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const viewportSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-viewport`,
    implementationBase: {
      overflow: "hidden",
      borderRadius: "lg",
    },
    componentSurface: config.slots?.viewport,
  });
  const trackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-track`,
    implementationBase: {
      display: "flex",
      style: {
        transform: `translateX(-${current * 100}%)`,
        transition:
          "transform var(--sn-duration-normal, 300ms) var(--sn-ease-out, ease-out)",
      },
    },
    componentSurface: config.slots?.track,
  });
  const controlsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-controls`,
    implementationBase: {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      padding: "sm",
      style: {
        pointerEvents: "none",
      },
    },
    componentSurface: config.slots?.controls,
  });
  const indicatorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-indicator`,
    implementationBase: {
      position: "absolute",
      display: "flex",
      gap: "xs",
      style: {
        left: "50%",
        bottom: "var(--sn-spacing-sm, 0.5rem)",
        transform: "translateX(-50%)",
      },
    },
    componentSurface: config.slots?.indicator,
  });
  const prevButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-prev-button`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--sn-color-background, #ffffff)",
      bg: "color-mix(in oklch, var(--sn-color-foreground, #111827) 72%, transparent)",
      borderRadius: "full",
      cursor: count > 1 ? "pointer" : "not-allowed",
      focus: {
        ring: true,
      },
      hover: {
        bg: "color-mix(in oklch, var(--sn-color-foreground, #111827) 84%, transparent)",
      },
      active: {
        scale: 0.96,
      },
      states: {
        disabled: {
          opacity: 0.45,
          cursor: "not-allowed",
        },
      },
      style: {
        width: "2.5rem",
        height: "2.5rem",
        border: "none",
        pointerEvents: "auto",
      },
    },
    componentSurface: config.slots?.prevButton,
    activeStates: count > 1 ? [] : ["disabled"],
  });
  const nextButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-next-button`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--sn-color-background, #ffffff)",
      bg: "color-mix(in oklch, var(--sn-color-foreground, #111827) 72%, transparent)",
      borderRadius: "full",
      cursor: count > 1 ? "pointer" : "not-allowed",
      focus: {
        ring: true,
      },
      hover: {
        bg: "color-mix(in oklch, var(--sn-color-foreground, #111827) 84%, transparent)",
      },
      active: {
        scale: 0.96,
      },
      states: {
        disabled: {
          opacity: 0.45,
          cursor: "not-allowed",
        },
      },
      style: {
        width: "2.5rem",
        height: "2.5rem",
        border: "none",
        pointerEvents: "auto",
      },
    },
    componentSurface: config.slots?.nextButton,
    activeStates: count > 1 ? [] : ["disabled"],
  });

  const slideSurfaces = useMemo(
    () =>
      children.map((_, index) =>
        resolveSurfacePresentation({
          surfaceId: `${rootId}-slide-${index}`,
          implementationBase: {
            style: {
              minWidth: "100%",
              flexShrink: 0,
            },
          },
          componentSurface: config.slots?.slide,
          activeStates:
            index === current ? ["active", "selected", "current"] : [],
        }),
      ),
    [children, config.slots?.slide, current, rootId],
  );

  const indicatorItemSurfaces = useMemo(
    () =>
      children.map((_, index) =>
        resolveSurfacePresentation({
          surfaceId: `${rootId}-indicator-item-${index}`,
          implementationBase: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "color-mix(in oklch, var(--sn-color-background, #ffffff) 48%, transparent)",
            borderRadius: "full",
            cursor: "pointer",
            hover: {
              bg: "color-mix(in oklch, var(--sn-color-background, #ffffff) 72%, transparent)",
            },
            focus: {
              ring: true,
            },
            active: {
              scale: 0.92,
            },
            states: {
              selected: {
                bg: "var(--sn-color-primary, #2563eb)",
              },
              current: {
                bg: "var(--sn-color-primary, #2563eb)",
              },
            },
            style: {
              width: "0.625rem",
              height: "0.625rem",
              border: "none",
              padding: 0,
            },
          },
          componentSurface: config.slots?.indicatorItem,
          activeStates:
            index === current ? ["active", "selected", "current"] : [],
        }),
      ),
    [children, config.slots?.indicatorItem, current, rootId],
  );

  return (
    <div
      data-snapshot-component="carousel"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      onPointerEnter={stopAutoPlay}
      onPointerLeave={startAutoPlay}
      style={rootSurface.style as CSSProperties | undefined}
    >
      <div
        data-snapshot-id={`${rootId}-viewport`}
        className={viewportSurface.className}
        style={viewportSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-track`}
          className={trackSurface.className}
          style={trackSurface.style}
        >
          {children.map((child, index) => (
            <div
              key={child.id ?? `slide-${index}`}
              data-snapshot-id={`${rootId}-slide-${index}`}
              className={slideSurfaces[index]?.className}
              style={slideSurfaces[index]?.style}
            >
              <ComponentRenderer config={child} />
            </div>
          ))}
        </div>
      </div>

      {config.showArrows !== false && count > 1 ? (
        <div
          data-snapshot-id={`${rootId}-controls`}
          className={controlsSurface.className}
          style={controlsSurface.style}
        >
          <ButtonControl
            type="button"
            onClick={prev}
            ariaLabel="Previous slide"
            surfaceId={`${rootId}-prev-button`}
            variant="ghost"
            size="icon"
            surfaceConfig={prevButtonSurface.resolvedConfigForWrapper}
            activeStates={count > 1 ? [] : ["disabled"]}
          >
            &#x2039;
          </ButtonControl>
          <ButtonControl
            type="button"
            onClick={next}
            ariaLabel="Next slide"
            surfaceId={`${rootId}-next-button`}
            variant="ghost"
            size="icon"
            surfaceConfig={nextButtonSurface.resolvedConfigForWrapper}
            activeStates={count > 1 ? [] : ["disabled"]}
          >
            &#x203A;
          </ButtonControl>
        </div>
      ) : null}

      {config.showDots !== false && count > 1 ? (
        <div
          data-snapshot-id={`${rootId}-indicator`}
          className={indicatorSurface.className}
          style={indicatorSurface.style}
        >
          {children.map((_, index) => (
            <ButtonControl
              key={`indicator-${index}`}
              type="button"
              onClick={() => goTo(index)}
              ariaLabel={`Go to slide ${index + 1}`}
              surfaceId={`${rootId}-indicator-item-${index}`}
              variant="ghost"
              size="icon"
              surfaceConfig={indicatorItemSurfaces[index]?.resolvedConfigForWrapper}
              activeStates={
                index === current ? ["active", "selected", "current"] : []
              }
            >
              <span aria-hidden="true" />
            </ButtonControl>
          ))}
        </div>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={viewportSurface.scopedCss} />
      <SurfaceStyles css={trackSurface.scopedCss} />
      <SurfaceStyles css={controlsSurface.scopedCss} />
      <SurfaceStyles css={indicatorSurface.scopedCss} />
      {slideSurfaces.map((surface, index) => (
        <SurfaceStyles key={`slide-css-${index}`} css={surface.scopedCss} />
      ))}
    </div>
  );
}
