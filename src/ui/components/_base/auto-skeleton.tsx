'use client';

import { useId, type ReactNode } from "react";
import { SurfaceStyles } from "./surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "./style-surfaces";

export interface AutoSkeletonConfig extends Record<string, unknown> {
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
  variant?: "auto" | "table" | "list" | "card" | "text" | "chart" | "stat";
  rows?: number;
  count?: number;
  delay?: number;
  slots?: {
    root?: Record<string, unknown>;
    row?: Record<string, unknown>;
    card?: Record<string, unknown>;
    block?: Record<string, unknown>;
  };
}

function Block({
  surfaceId,
  slot,
  height,
  width = "100%",
  radius = "var(--sn-radius-md, 0.375rem)",
}: {
  surfaceId: string;
  slot?: Record<string, unknown>;
  height: string;
  width?: string;
  radius?: string;
}): ReactNode {
  const blockSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase: {
      style: {
        width,
        height,
        borderRadius: radius,
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        animation:
          "sn-pulse var(--sn-duration-slow, 2s) var(--sn-ease-in-out, ease-in-out) infinite",
      },
    },
    componentSurface: slot,
  });

  return (
    <>
      <div
        data-snapshot-id={surfaceId}
        className={blockSurface.className}
        style={blockSurface.style}
      />
      <SurfaceStyles css={blockSurface.scopedCss} />
    </>
  );
}

function SkeletonRow({
  surfaceId,
  slot,
  implementationBase,
  children,
}: {
  surfaceId: string;
  slot?: Record<string, unknown>;
  implementationBase: Record<string, unknown>;
  children: ReactNode;
}): ReactNode {
  const rowSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase,
    componentSurface: slot,
  });

  return (
    <>
      <div
        data-snapshot-id={surfaceId}
        className={rowSurface.className}
        style={rowSurface.style}
      >
        {children}
      </div>
      <SurfaceStyles css={rowSurface.scopedCss} />
    </>
  );
}

function SkeletonCard({
  surfaceId,
  slot,
  children,
}: {
  surfaceId: string;
  slot?: Record<string, unknown>;
  children: ReactNode;
}): ReactNode {
  const cardSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase: {
      border: "1px solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "var(--sn-radius-lg, 0.75rem)",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      style: {
        padding: "1rem",
      },
    },
    componentSurface: slot,
  });

  return (
    <>
      <div
        data-snapshot-id={surfaceId}
        className={cardSurface.className}
        style={cardSurface.style}
      >
        {children}
      </div>
      <SurfaceStyles css={cardSurface.scopedCss} />
    </>
  );
}

function TableSkeleton({
  rootId,
  rows,
  slots,
}: {
  rootId: string;
  rows: number;
  slots?: AutoSkeletonConfig["slots"];
}): ReactNode {
  return (
    <div
      data-snapshot-id={`${rootId}-table`}
      style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
    >
      <Block
        surfaceId={`${rootId}-block-header`}
        slot={slots?.block}
        height="2.25rem"
        radius="var(--sn-radius-lg, 0.5rem)"
      />
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonRow
          key={index}
          surfaceId={`${rootId}-row-${index}`}
          slot={slots?.row}
          implementationBase={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "0.75rem",
          }}
        >
          {[0, 1, 2, 3].map((cellIndex) => (
            <Block
              key={cellIndex}
              surfaceId={`${rootId}-block-${index}-${cellIndex}`}
              slot={slots?.block}
              height="2rem"
            />
          ))}
        </SkeletonRow>
      ))}
    </div>
  );
}

function ListSkeleton({
  rootId,
  rows,
  slots,
}: {
  rootId: string;
  rows: number;
  slots?: AutoSkeletonConfig["slots"];
}): ReactNode {
  return (
    <div
      data-snapshot-id={`${rootId}-list`}
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
    >
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonRow
          key={index}
          surfaceId={`${rootId}-row-${index}`}
          slot={slots?.row}
          implementationBase={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Block
            surfaceId={`${rootId}-block-avatar-${index}`}
            slot={slots?.block}
            height="2.5rem"
            width="2.5rem"
            radius="9999px"
          />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "0.375rem" }}>
            <Block
              surfaceId={`${rootId}-block-title-${index}`}
              slot={slots?.block}
              height="0.875rem"
              width={index % 2 === 0 ? "55%" : "68%"}
            />
            <Block
              surfaceId={`${rootId}-block-description-${index}`}
              slot={slots?.block}
              height="0.75rem"
              width={index % 2 === 0 ? "82%" : "74%"}
            />
          </div>
        </SkeletonRow>
      ))}
    </div>
  );
}

function CardSkeleton({
  rootId,
  count,
  slots,
}: {
  rootId: string;
  count: number;
  slots?: AutoSkeletonConfig["slots"];
}): ReactNode {
  return (
    <div
      data-snapshot-id={`${rootId}-cards`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.max(1, Math.min(count, 3))}, minmax(0, 1fr))`,
        gap: "1rem",
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard
          key={index}
          surfaceId={`${rootId}-card-${index}`}
          slot={slots?.card}
        >
          <Block
            surfaceId={`${rootId}-block-title-${index}`}
            slot={slots?.block}
            height="1rem"
            width="40%"
          />
          <Block
            surfaceId={`${rootId}-block-value-${index}`}
            slot={slots?.block}
            height="2rem"
            width="65%"
          />
          <Block
            surfaceId={`${rootId}-block-description-${index}`}
            slot={slots?.block}
            height="0.875rem"
            width="52%"
          />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function AutoSkeleton({
  componentType,
  config,
}: {
  componentType?: string;
  config?: AutoSkeletonConfig;
}): ReactNode {
  const generatedId = useId().replace(/:/g, "");
  const rootId = config?.id ?? `${componentType ?? "auto"}-skeleton-${generatedId}`;
  const variant =
    config?.variant && config.variant !== "auto"
      ? config.variant
      : componentType === "data-table"
        ? "table"
        : componentType === "list" || componentType === "feed"
          ? "list"
          : componentType === "chart"
            ? "chart"
            : componentType === "stat-card"
              ? "stat"
            : "card";
  const rows = config?.rows ?? config?.count ?? 5;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config?.slots?.root,
  });

  return (
    <div
      data-snapshot-auto-skeleton=""
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <style>{`
        @keyframes sn-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: var(--sn-opacity-muted, 0.55); }
        }
      `}</style>
      {variant === "table" ? (
        <TableSkeleton rootId={rootId} rows={rows} slots={config?.slots} />
      ) : null}
      {variant === "list" ? (
        <ListSkeleton rootId={rootId} rows={rows} slots={config?.slots} />
      ) : null}
      {variant === "card" ? (
        <CardSkeleton
          rootId={rootId}
          count={Math.max(1, Math.min(rows, 3))}
          slots={config?.slots}
        />
      ) : null}
      {variant === "chart" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Block
            surfaceId={`${rootId}-block-title`}
            slot={config?.slots?.block}
            height="1rem"
            width="30%"
          />
          <Block
            surfaceId={`${rootId}-block-chart`}
            slot={config?.slots?.block}
            height="16rem"
            radius="var(--sn-radius-lg, 0.75rem)"
          />
        </div>
      ) : null}
      {variant === "stat" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Block
            surfaceId={`${rootId}-block-label`}
            slot={config?.slots?.block}
            height="0.875rem"
            width="36%"
          />
          <Block
            surfaceId={`${rootId}-block-value`}
            slot={config?.slots?.block}
            height="2rem"
            width="58%"
          />
          <Block
            surfaceId={`${rootId}-block-trend`}
            slot={config?.slots?.block}
            height="0.75rem"
            width="40%"
          />
        </div>
      ) : null}
      {variant === "text" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {Array.from({ length: rows }, (_, index) => (
            <Block
              key={index}
              surfaceId={`${rootId}-block-${index}`}
              slot={config?.slots?.block}
              height="0.875rem"
              width={index % 3 === 0 ? "92%" : index % 3 === 1 ? "78%" : "64%"}
            />
          ))}
        </div>
      ) : null}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
