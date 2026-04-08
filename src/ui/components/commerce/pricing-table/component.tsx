import React from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import type { PricingTableConfig } from "./types";

/**
 * Renders a single pricing tier as a card.
 */
function TierCard({
  tier,
  currency,
  execute,
}: {
  tier: PricingTableConfig["tiers"][number];
  currency: string;
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const isHighlighted = tier.highlighted === true;
  const priceDisplay =
    typeof tier.price === "number" ? `${currency}${tier.price}` : tier.price;
  const ctaLabel = tier.actionLabel ?? "Get Started";

  return (
    <div
      data-testid="pricing-tier-card"
      data-highlighted={isHighlighted || undefined}
      style={{
        position: "relative",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        border: isHighlighted
          ? "2px solid var(--sn-color-primary, #2563eb)"
          : "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        boxShadow: isHighlighted
          ? "var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))"
          : "var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
        padding: "var(--sn-spacing-lg, 1.5rem)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-md, 1rem)",
        transform: isHighlighted ? "scale(1.02)" : undefined,
        transition:
          "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      }}
    >
      {/* Badge */}
      {tier.badge && (
        <div
          data-testid="pricing-tier-badge"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #fff)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)",
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderRadius: "var(--sn-radius-full, 9999px)",
            whiteSpace: "nowrap",
          }}
        >
          {tier.badge}
        </div>
      )}

      {/* Tier name */}
      <div
        data-testid="pricing-tier-name"
        style={{
          fontSize: "var(--sn-font-size-lg, 1.125rem)",
          fontWeight: "var(--sn-font-weight-semibold, 600)",
          color: "var(--sn-color-foreground, #111827)",
        }}
      >
        {tier.name}
      </div>

      {/* Price */}
      <div
        data-testid="pricing-tier-price"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        <span
          style={{
            fontSize: "var(--sn-font-size-xl, 1.25rem)",
            fontWeight:
              "var(--sn-font-weight-bold, 700)" as React.CSSProperties["fontWeight"],
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          {priceDisplay}
        </span>
        {tier.period && (
          <span
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {tier.period}
          </span>
        )}
      </div>

      {/* Description */}
      {tier.description && (
        <div
          data-testid="pricing-tier-description"
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          {tier.description}
        </div>
      )}

      {/* Features */}
      <ul
        data-testid="pricing-tier-features"
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          flex: 1,
        }}
      >
        {tier.features.map((feature, i) => {
          const included = feature.included !== false;
          return (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sn-spacing-xs, 0.25rem)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: included
                  ? "var(--sn-color-foreground, #111827)"
                  : "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  color: included
                    ? "var(--sn-color-success, #16a34a)"
                    : "var(--sn-color-muted-foreground, #6b7280)",
                  flexShrink: 0,
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                }}
              >
                {included ? "\u2713" : "\u2014"}
              </span>
              <span
                style={{
                  textDecoration: included ? undefined : "line-through",
                }}
              >
                {feature.text}
              </span>
            </li>
          );
        })}
      </ul>

      {/* CTA Button */}
      <button
        type="button"
        data-testid="pricing-tier-cta"
        onClick={tier.action ? () => void execute(tier.action!) : undefined}
        disabled={!tier.action}
        style={{
          width: "100%",
          padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
          borderRadius: "var(--sn-radius-md, 0.375rem)",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          fontWeight: "var(--sn-font-weight-semibold, 600)",
          cursor: tier.action ? "pointer" : "not-allowed",
          border: "1px solid transparent",
          fontFamily: "inherit",
          backgroundColor: isHighlighted
            ? "var(--sn-color-primary, #2563eb)"
            : "var(--sn-color-secondary, #f1f5f9)",
          color: isHighlighted
            ? "var(--sn-color-primary-foreground, #fff)"
            : "var(--sn-color-secondary-foreground, #0f172a)",
          transition:
            "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
          opacity: tier.action ? 1 : 0.6,
        }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

/**
 * Renders pricing tiers as a traditional comparison table.
 */
function TableVariant({
  config,
  currency,
  execute,
}: {
  config: PricingTableConfig;
  currency: string;
  execute: ReturnType<typeof useActionExecutor>;
}) {
  // Collect all unique feature texts across tiers
  const allFeatures: string[] = [];
  for (const tier of config.tiers) {
    for (const feature of tier.features) {
      if (!allFeatures.includes(feature.text)) {
        allFeatures.push(feature.text);
      }
    }
  }

  return (
    <div data-testid="pricing-table-grid" style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          color: "var(--sn-color-foreground, #111827)",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding:
                  "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              Features
            </th>
            {config.tiers.map((tier, i) => (
              <th
                key={i}
                style={{
                  textAlign: "center",
                  padding:
                    "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                  borderBottom: tier.highlighted
                    ? "2px solid var(--sn-color-primary, #2563eb)"
                    : "1px solid var(--sn-color-border, #e5e7eb)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  fontWeight: "var(--sn-font-weight-semibold, 600)",
                }}
              >
                <div>{tier.name}</div>
                <div
                  style={{
                    fontSize: "var(--sn-font-size-lg, 1.125rem)",
                    fontWeight:
                      "var(--sn-font-weight-bold, 700)" as React.CSSProperties["fontWeight"],
                  }}
                >
                  {typeof tier.price === "number"
                    ? `${currency}${tier.price}`
                    : tier.price}
                  {tier.period && (
                    <span
                      style={{
                        fontSize: "var(--sn-font-size-xs, 0.75rem)",
                        fontWeight: 400,
                        color: "var(--sn-color-muted-foreground, #6b7280)",
                      }}
                    >
                      {tier.period}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((featureText, fi) => (
            <tr key={fi}>
              <td
                style={{
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
                  borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                }}
              >
                {featureText}
              </td>
              {config.tiers.map((tier, ti) => {
                const feature = tier.features.find(
                  (f) => f.text === featureText,
                );
                const included = feature ? feature.included !== false : false;
                return (
                  <td
                    key={ti}
                    style={{
                      textAlign: "center",
                      padding:
                        "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
                      borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
                      fontSize: "var(--sn-font-size-sm, 0.875rem)",
                      color: included
                        ? "var(--sn-color-success, #16a34a)"
                        : "var(--sn-color-muted-foreground, #6b7280)",
                    }}
                  >
                    {included ? "\u2713" : "\u2014"}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* CTA row */}
          <tr>
            <td
              style={{
                padding:
                  "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
              }}
            />
            {config.tiers.map((tier, i) => (
              <td
                key={i}
                style={{
                  textAlign: "center",
                  padding:
                    "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
                }}
              >
                <button
                  type="button"
                  data-testid="pricing-tier-cta"
                  onClick={
                    tier.action ? () => void execute(tier.action!) : undefined
                  }
                  disabled={!tier.action}
                  style={{
                    padding:
                      "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
                    borderRadius: "var(--sn-radius-md, 0.375rem)",
                    fontSize: "var(--sn-font-size-sm, 0.875rem)",
                    fontWeight: "var(--sn-font-weight-semibold, 600)",
                    cursor: tier.action ? "pointer" : "not-allowed",
                    border: "1px solid transparent",
                    fontFamily: "inherit",
                    backgroundColor: tier.highlighted
                      ? "var(--sn-color-primary, #2563eb)"
                      : "var(--sn-color-secondary, #f1f5f9)",
                    color: tier.highlighted
                      ? "var(--sn-color-primary-foreground, #fff)"
                      : "var(--sn-color-secondary-foreground, #0f172a)",
                    opacity: tier.action ? 1 : 0.6,
                  }}
                >
                  {tier.actionLabel ?? "Get Started"}
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * PricingTable component — renders a comparison of pricing tiers with features,
 * badges, highlights, and CTA buttons.
 *
 * Supports two variants: "cards" (horizontal card row) and "table"
 * (traditional comparison table with features as rows).
 *
 * @param props.config - The pricing table config from the manifest
 *
 * @example
 * ```json
 * {
 *   "type": "pricing-table",
 *   "currency": "$",
 *   "tiers": [
 *     { "name": "Free", "price": 0, "period": "/month", "features": [{ "text": "Basic", "included": true }] },
 *     { "name": "Pro", "price": 29, "period": "/month", "highlighted": true, "badge": "Popular", "features": [{ "text": "Basic", "included": true }] }
 *   ]
 * }
 * ```
 */
export function PricingTable({ config }: { config: PricingTableConfig }) {
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const currency = config.currency ?? "$";
  const variant = config.variant ?? "cards";

  if (visible === false) return null;

  const focusStyles = `
[data-snapshot-component="pricing-table"] [data-testid="pricing-tier-card"]:hover {
  box-shadow: var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
  transform: translateY(-2px);
}
[data-snapshot-component="pricing-table"] [data-testid="pricing-tier-card"][data-highlighted]:hover {
  transform: scale(1.02) translateY(-2px);
}
[data-snapshot-component="pricing-table"] [data-testid="pricing-tier-cta"]:hover:not(:disabled) {
  opacity: var(--sn-opacity-hover, 0.85);
}
[data-snapshot-component="pricing-table"] [data-testid="pricing-tier-cta"]:focus {
  outline: none;
}
[data-snapshot-component="pricing-table"] [data-testid="pricing-tier-cta"]:focus-visible {
  outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
  outline-offset: var(--sn-ring-offset, 2px);
}
`;

  if (variant === "table") {
    return (
      <div
        data-snapshot-component="pricing-table"
        data-testid="pricing-table"
        data-variant="table"
        className={config.className}
        style={{
          backgroundColor: "var(--sn-color-card, #ffffff)",
          borderRadius: "var(--sn-radius-lg, 0.75rem)",
          border: "1px solid var(--sn-color-border, #e5e7eb)",
          overflow: "hidden",
          ...((config.style as React.CSSProperties) ?? {}),
        }}
      >
        <style>{focusStyles}</style>
        <TableVariant config={config} currency={currency} execute={execute} />
      </div>
    );
  }

  // Cards variant
  const columnCount =
    config.columns === "auto"
      ? config.tiers.length
      : config.columns
        ? parseInt(config.columns, 10)
        : config.tiers.length;

  return (
    <div
      data-snapshot-component="pricing-table"
      data-testid="pricing-table"
      data-variant="cards"
      className={config.className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: "var(--sn-spacing-lg, 1.5rem)",
        alignItems: "stretch",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{focusStyles}</style>
      {config.tiers.map((tier, i) => (
        <TierCard key={i} tier={tier} currency={currency} execute={execute} />
      ))}
    </div>
  );
}
