'use client';

import { useMemo, type CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface PricingFeatureEntry {
  /** Feature description text displayed in the tier's feature list. */
  text: string;
  /** Whether this feature is included in the tier. Default: true. */
  included?: boolean;
}

export interface PricingTierEntry {
  /** Tier name displayed in the card header (e.g. "Pro", "Enterprise"). */
  name: string;
  /** Price value; numbers are formatted with the currency symbol, strings render as-is. */
  price: string | number;
  /** Billing period label (e.g. "/month", "/year"). */
  period?: string;
  /** Short description shown below the price. */
  description?: string;
  /** Badge text displayed above a highlighted tier card. */
  badge?: string;
  /** Whether this tier is visually emphasized with a primary border and scale effect. */
  highlighted?: boolean;
  /** List of features included or excluded in this tier. */
  features: PricingFeatureEntry[];
  /** CTA button label. Default: "Get Started". */
  actionLabel?: string;
  /** Callback fired when the CTA button is clicked. */
  onAction?: () => void;
}

export interface PricingTableBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Pricing tier definitions to render. */
  tiers: PricingTierEntry[];
  /** "cards" or "table" variant. Default: "cards". */
  variant?: "cards" | "table";
  /** Currency symbol. Default: "$". */
  currency?: string;
  /** Number of columns for card variant. Default: auto (tier count). */
  columns?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── TierCard ──────────────────────────────────────────────────────────────────

function TierCard({ rootId, index, tier, currency, slots }: { rootId: string; index: number; tier: PricingTierEntry; currency: string; slots?: Record<string, Record<string, unknown>> }) {
  const isHighlighted = tier.highlighted === true;
  const priceDisplay = typeof tier.price === "number" ? `${currency}${tier.price}` : tier.price;
  const ctaLabel = tier.actionLabel ?? "Get Started";
  const cardId = `${rootId}-tier-${index}`;

  const cardS = resolveSurfacePresentation({ surfaceId: cardId, implementationBase: { display: "flex", flexDirection: "column", gap: "md", bg: "var(--sn-color-card, #ffffff)", borderRadius: "lg", hover: { shadow: "md", transform: isHighlighted ? "scale(1.02) translateY(-2px)" : "translateY(-2px)" }, style: { position: "relative", border: isHighlighted ? "var(--sn-border-thick, 2px) solid var(--sn-color-primary, #2563eb)" : "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", boxShadow: isHighlighted ? "var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))" : "var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))", padding: "var(--sn-spacing-lg, 1.5rem)", transform: isHighlighted ? "scale(1.02)" : undefined, transition: "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)" } }, componentSurface: slots?.card });
  const badgeS = resolveSurfacePresentation({ surfaceId: `${cardId}-badge`, implementationBase: { bg: "var(--sn-color-primary, #2563eb)", color: "var(--sn-color-primary-foreground, #fff)", fontSize: "xs", fontWeight: "semibold", borderRadius: "full", style: { position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)", whiteSpace: "nowrap" } }, componentSurface: slots?.badge });
  const nameS = resolveSurfacePresentation({ surfaceId: `${cardId}-tierName`, implementationBase: { fontSize: "lg", fontWeight: "semibold", color: "var(--sn-color-foreground, #111827)" }, componentSurface: slots?.tierName });
  const priceRowS = resolveSurfacePresentation({ surfaceId: `${cardId}-priceRow`, implementationBase: { display: "flex", alignItems: "baseline", gap: "xs" }, componentSurface: slots?.priceRow });
  const priceS = resolveSurfacePresentation({ surfaceId: `${cardId}-price`, implementationBase: { fontSize: "xl", fontWeight: "bold", color: "var(--sn-color-foreground, #111827)" }, componentSurface: slots?.price });
  const periodS = resolveSurfacePresentation({ surfaceId: `${cardId}-period`, implementationBase: { fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.period });
  const descS = resolveSurfacePresentation({ surfaceId: `${cardId}-description`, implementationBase: { fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.description });
  const listS = resolveSurfacePresentation({ surfaceId: `${cardId}-featureList`, implementationBase: { display: "flex", flexDirection: "column", gap: "xs", flex: "1", style: { listStyle: "none", margin: 0, padding: 0 } }, componentSurface: slots?.featureList });
  const ctaS = resolveSurfacePresentation({ surfaceId: `${cardId}-cta`, implementationBase: { width: "100%", paddingY: "xs", paddingX: "md", borderRadius: "md", fontSize: "sm", fontWeight: "semibold", cursor: tier.onAction ? "pointer" : "not-allowed", color: isHighlighted ? "var(--sn-color-primary-foreground, #fff)" : "var(--sn-color-secondary-foreground, #0f172a)", bg: isHighlighted ? "var(--sn-color-primary, #2563eb)" : "var(--sn-color-secondary, #f1f5f9)", hover: tier.onAction ? { opacity: 0.85 } : undefined, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { border: "var(--sn-border-default, 1px) solid transparent", fontFamily: "inherit", opacity: tier.onAction ? 1 : 0.6 } }, componentSurface: slots?.cta });

  return (
    <>
      <div data-pricing-card="" data-featured={isHighlighted ? "true" : undefined} data-testid="pricing-tier-card" data-snapshot-id={cardId} className={cardS.className} style={cardS.style}>
        {tier.badge ? <div data-testid="pricing-tier-badge" data-snapshot-id={`${cardId}-badge`} className={badgeS.className} style={badgeS.style}>{tier.badge}</div> : null}
        <div data-testid="pricing-tier-name" data-snapshot-id={`${cardId}-tierName`} className={nameS.className} style={nameS.style}>{tier.name}</div>
        <div data-testid="pricing-tier-price" data-snapshot-id={`${cardId}-priceRow`} className={priceRowS.className} style={priceRowS.style}>
          <span data-snapshot-id={`${cardId}-price`} className={priceS.className} style={priceS.style}>{priceDisplay}</span>
          {tier.period ? <span data-snapshot-id={`${cardId}-period`} className={periodS.className} style={periodS.style}>{tier.period}</span> : null}
        </div>
        {tier.description ? <div data-testid="pricing-tier-description" data-snapshot-id={`${cardId}-description`} className={descS.className} style={descS.style}>{tier.description}</div> : null}
        <ul data-testid="pricing-tier-features" data-snapshot-id={`${cardId}-featureList`} className={listS.className} style={listS.style}>
          {tier.features.map((feature, fi) => {
            const included = feature.included !== false;
            const itemS = resolveSurfacePresentation({ surfaceId: `${cardId}-feature-${fi}`, implementationBase: { display: "flex", alignItems: "center", gap: "xs", fontSize: "sm", color: included ? "var(--sn-color-foreground, #111827)" : "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.featureItem });
            const iconS = resolveSurfacePresentation({ surfaceId: `${cardId}-feature-${fi}-icon`, implementationBase: { color: included ? "var(--sn-color-success, #16a34a)" : "var(--sn-color-muted-foreground, #6b7280)", fontSize: "sm", style: { flexShrink: 0 } }, componentSurface: slots?.featureIcon });
            const textS = resolveSurfacePresentation({ surfaceId: `${cardId}-feature-${fi}-text`, implementationBase: { style: { textDecoration: included ? undefined : "line-through" } }, componentSurface: slots?.featureText });
            return (<li key={fi} data-snapshot-id={`${cardId}-feature-${fi}`} className={itemS.className} style={itemS.style}><span aria-hidden="true" data-snapshot-id={`${cardId}-feature-${fi}-icon`} className={iconS.className} style={iconS.style}>{included ? "\u2713" : "\u2014"}</span><span data-snapshot-id={`${cardId}-feature-${fi}-text`} className={textS.className} style={textS.style}>{feature.text}</span><SurfaceStyles css={itemS.scopedCss} /><SurfaceStyles css={iconS.scopedCss} /><SurfaceStyles css={textS.scopedCss} /></li>);
          })}
        </ul>
        <ButtonControl type="button" testId="pricing-tier-cta" onClick={tier.onAction} disabled={!tier.onAction} surfaceId={`${cardId}-cta`} variant="ghost" size="sm" surfaceConfig={ctaS.resolvedConfigForWrapper}>{ctaLabel}</ButtonControl>
      </div>
      <SurfaceStyles css={cardS.scopedCss} /><SurfaceStyles css={badgeS.scopedCss} /><SurfaceStyles css={nameS.scopedCss} /><SurfaceStyles css={priceRowS.scopedCss} /><SurfaceStyles css={priceS.scopedCss} /><SurfaceStyles css={periodS.scopedCss} /><SurfaceStyles css={descS.scopedCss} /><SurfaceStyles css={listS.scopedCss} />
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone PricingTableBase — renders a responsive pricing comparison as either
 * a card grid or a feature-comparison table with CTA buttons per tier. No manifest context required.
 *
 * @example
 * ```tsx
 * <PricingTableBase
 *   variant="cards"
 *   currency="$"
 *   tiers={[
 *     { name: "Free", price: 0, period: "/month", features: [{ text: "1 project" }], onAction: () => signup("free") },
 *     { name: "Pro", price: 29, period: "/month", highlighted: true, badge: "Popular", features: [{ text: "Unlimited projects" }], onAction: () => signup("pro") },
 *   ]}
 * />
 * ```
 */
export function PricingTableBase({
  id, tiers, variant = "cards", currency = "$", columns,
  className, style, slots,
}: PricingTableBaseProps) {
  const rootId = id ?? "pricing-table";
  const columnCount = columns === "auto" ? tiers.length : columns ? parseInt(columns, 10) : tiers.length;

  if (variant === "table") {
    // Table variant rendering (simplified for standalone)
    const allFeatures: string[] = [];
    for (const tier of tiers) for (const f of tier.features) if (!allFeatures.includes(f.text)) allFeatures.push(f.text);
    const tableRootS = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: { overflow: "hidden", borderRadius: "lg", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", bg: "var(--sn-color-card, #ffffff)" }, componentSurface: className || style ? { className, style } : undefined, itemSurface: slots?.root });
    const scrollS = resolveSurfacePresentation({ surfaceId: `${rootId}-tableScroll`, implementationBase: { overflow: "auto" }, componentSurface: slots?.tableScroll });
    const tableS = resolveSurfacePresentation({ surfaceId: `${rootId}-table`, implementationBase: { width: "100%", fontSize: "sm", color: "var(--sn-color-foreground, #111827)", style: { borderCollapse: "collapse" } }, componentSurface: slots?.table });

    return (
      <>
        <div data-snapshot-component="pricing-table" data-testid="pricing-table" data-variant="table" data-snapshot-id={rootId} className={tableRootS.className} style={tableRootS.style}>
          <div data-testid="pricing-table-grid" data-snapshot-id={`${rootId}-tableScroll`} className={scrollS.className} style={scrollS.style}>
            <table data-snapshot-id={`${rootId}-table`} className={tableS.className} style={tableS.style}>
              <thead><tr><th style={{ textAlign: "left", padding: "var(--sn-spacing-sm) var(--sn-spacing-md)", borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", color: "var(--sn-color-muted-foreground, #6b7280)", fontSize: "var(--sn-font-size-sm)" }}>Features</th>{tiers.map((t, i) => (<th key={i} style={{ textAlign: "center", padding: "var(--sn-spacing-sm) var(--sn-spacing-md)", borderBottom: t.highlighted ? "var(--sn-border-thick, 2px) solid var(--sn-color-primary, #2563eb)" : "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", fontWeight: 600 }}><div>{t.name}</div><div style={{ fontSize: "var(--sn-font-size-lg)", fontWeight: 700 }}>{typeof t.price === "number" ? `${currency}${t.price}` : t.price}{t.period ? <span style={{ fontSize: "var(--sn-font-size-xs)", fontWeight: 400, color: "var(--sn-color-muted-foreground, #6b7280)" }}>{t.period}</span> : null}</div></th>))}</tr></thead>
              <tbody>
                {allFeatures.map((ft, fi) => (<tr key={fi}><td style={{ padding: "var(--sn-spacing-xs) var(--sn-spacing-md)", borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", fontSize: "var(--sn-font-size-sm)" }}>{ft}</td>{tiers.map((t, ti) => { const f = t.features.find((e) => e.text === ft); const inc = f ? f.included !== false : false; return (<td key={ti} style={{ textAlign: "center", padding: "var(--sn-spacing-xs) var(--sn-spacing-md)", borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", color: inc ? "var(--sn-color-success, #16a34a)" : "var(--sn-color-muted-foreground, #6b7280)" }}>{inc ? "\u2713" : "\u2014"}</td>); })}</tr>))}
                <tr><td style={{ padding: "var(--sn-spacing-sm) var(--sn-spacing-md)" }} />{tiers.map((t, ti) => (<td key={ti} style={{ textAlign: "center", padding: "var(--sn-spacing-sm) var(--sn-spacing-md)" }}><ButtonControl type="button" testId="pricing-tier-cta" onClick={t.onAction} disabled={!t.onAction} surfaceId={`${rootId}-cta-${ti}`} variant="ghost" size="sm">{t.actionLabel ?? "Get Started"}</ButtonControl></td>))}</tr>
              </tbody>
            </table>
          </div>
        </div>
        <SurfaceStyles css={tableRootS.scopedCss} /><SurfaceStyles css={scrollS.scopedCss} /><SurfaceStyles css={tableS.scopedCss} />
      </>
    );
  }

  const rootS = resolveSurfacePresentation({ surfaceId: rootId, implementationBase: { display: "grid", gap: "lg", alignItems: "stretch", style: { gridTemplateColumns: `repeat(${columnCount}, 1fr)` } }, componentSurface: className || style ? { className, style } : undefined, itemSurface: slots?.root });

  return (
    <>
      <div data-snapshot-component="pricing-table" data-testid="pricing-table" data-variant="cards" data-snapshot-id={rootId} className={rootS.className} style={rootS.style}>
        {tiers.map((tier, index) => (
          <TierCard key={index} rootId={rootId} index={index} tier={tier} currency={currency} slots={slots} />
        ))}
      </div>
      <SurfaceStyles css={rootS.scopedCss} />
    </>
  );
}
