'use client';

import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import type { PricingTableConfig } from "./types";

type PricingTier = PricingTableConfig["tiers"][number];
type PricingFeature = PricingTier["features"][number];

function TierCard({
  rootId,
  index,
  tier,
  currency,
  execute,
  slots,
}: {
  rootId: string;
  index: number;
  tier: PricingTableConfig["tiers"][number];
  currency: string;
  execute: ReturnType<typeof useActionExecutor>;
  slots: PricingTableConfig["slots"];
}) {
  const isHighlighted = tier.highlighted === true;
  const priceDisplay =
    typeof tier.price === "number" ? `${currency}${tier.price}` : tier.price;
  const ctaLabel = tier.actionLabel ?? "Get Started";
  const cardId = `${rootId}-tier-${index}`;

  const cardSurface = resolveSurfacePresentation({
    surfaceId: cardId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "md",
      bg: "var(--sn-color-card, #ffffff)",
      borderRadius: "lg",
      hover: {
        shadow: "md",
        transform: isHighlighted ? "scale(1.02) translateY(-2px)" : "translateY(-2px)",
      },
      style: {
        position: "relative",
        border: isHighlighted
          ? "var(--sn-border-thick, 2px) solid var(--sn-color-primary, #2563eb)"
          : "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        boxShadow: isHighlighted
          ? "var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))"
          : "var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
        padding: "var(--sn-spacing-lg, 1.5rem)",
        transform: isHighlighted ? "scale(1.02)" : undefined,
        transition:
          "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: slots?.card,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-badge`,
    implementationBase: {
      bg: "var(--sn-color-primary, #2563eb)",
      color: "var(--sn-color-primary-foreground, #fff)",
      fontSize: "xs",
      fontWeight: "semibold",
      borderRadius: "full",
      style: {
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.badge,
  });
  const tierNameSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-tierName`,
    implementationBase: {
      fontSize: "lg",
      fontWeight: "semibold",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: slots?.tierName,
  });
  const priceRowSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-priceRow`,
    implementationBase: {
      display: "flex",
      alignItems: "baseline",
      gap: "xs",
    },
    componentSurface: slots?.priceRow,
  });
  const priceSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-price`,
    implementationBase: {
      fontSize: "xl",
      fontWeight: "bold",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: slots?.price,
  });
  const periodSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-period`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.period,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-description`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.description,
  });
  const featureListSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-featureList`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "xs",
      flex: "1",
      style: {
        listStyle: "none",
        margin: 0,
        padding: 0,
      },
    },
    componentSurface: slots?.featureList,
  });
  const ctaSurface = resolveSurfacePresentation({
    surfaceId: `${cardId}-cta`,
    implementationBase: {
      width: "100%",
      paddingY: "xs",
      paddingX: "md",
      borderRadius: "md",
      fontSize: "sm",
      fontWeight: "semibold",
      cursor: tier.action ? "pointer" : "not-allowed",
      color: isHighlighted
        ? "var(--sn-color-primary-foreground, #fff)"
        : "var(--sn-color-secondary-foreground, #0f172a)",
      bg: isHighlighted
        ? "var(--sn-color-primary, #2563eb)"
        : "var(--sn-color-secondary, #f1f5f9)",
      hover: tier.action
        ? {
            opacity: 0.85,
          }
        : undefined,
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        border: "var(--sn-border-default, 1px) solid transparent",
        fontFamily: "inherit",
        opacity: tier.action ? 1 : 0.6,
      },
    },
    componentSurface: slots?.cta,
  });

  return (
    <>
      <div
        data-pricing-card=""
        data-featured={isHighlighted ? "true" : undefined}
        data-testid="pricing-tier-card"
        data-snapshot-id={cardId}
        className={cardSurface.className}
        style={cardSurface.style}
      >
        {tier.badge ? (
          <div
            data-testid="pricing-tier-badge"
            data-snapshot-id={`${cardId}-badge`}
            className={badgeSurface.className}
            style={badgeSurface.style}
          >
            {tier.badge}
          </div>
        ) : null}
        <div
          data-testid="pricing-tier-name"
          data-snapshot-id={`${cardId}-tierName`}
          className={tierNameSurface.className}
          style={tierNameSurface.style}
        >
          {tier.name}
        </div>
        <div
          data-testid="pricing-tier-price"
          data-snapshot-id={`${cardId}-priceRow`}
          className={priceRowSurface.className}
          style={priceRowSurface.style}
        >
          <span
            data-snapshot-id={`${cardId}-price`}
            className={priceSurface.className}
            style={priceSurface.style}
          >
            {priceDisplay}
          </span>
          {tier.period ? (
            <span
              data-snapshot-id={`${cardId}-period`}
              className={periodSurface.className}
              style={periodSurface.style}
            >
              {tier.period}
            </span>
          ) : null}
        </div>
        {tier.description ? (
          <div
            data-testid="pricing-tier-description"
            data-snapshot-id={`${cardId}-description`}
            className={descriptionSurface.className}
            style={descriptionSurface.style}
          >
            {tier.description}
          </div>
        ) : null}
        <ul
          data-testid="pricing-tier-features"
          data-snapshot-id={`${cardId}-featureList`}
          className={featureListSurface.className}
          style={featureListSurface.style}
        >
          {tier.features.map((feature: PricingFeature, featureIndex: number) => {
            const included = feature.included !== false;
            const itemSurface = resolveSurfacePresentation({
              surfaceId: `${cardId}-feature-${featureIndex}`,
              implementationBase: {
                display: "flex",
                alignItems: "center",
                gap: "xs",
                fontSize: "sm",
                color: included
                  ? "var(--sn-color-foreground, #111827)"
                  : "var(--sn-color-muted-foreground, #6b7280)",
              },
              componentSurface: slots?.featureItem,
            });
            const iconSurface = resolveSurfacePresentation({
              surfaceId: `${cardId}-feature-${featureIndex}-icon`,
              implementationBase: {
                color: included
                  ? "var(--sn-color-success, #16a34a)"
                  : "var(--sn-color-muted-foreground, #6b7280)",
                fontSize: "sm",
                style: {
                  flexShrink: 0,
                },
              },
              componentSurface: slots?.featureIcon,
            });
            const textSurface = resolveSurfacePresentation({
              surfaceId: `${cardId}-feature-${featureIndex}-text`,
              implementationBase: {
                style: {
                  textDecoration: included ? undefined : "line-through",
                },
              },
              componentSurface: slots?.featureText,
            });

            return (
              <li
                key={featureIndex}
                data-snapshot-id={`${cardId}-feature-${featureIndex}`}
                className={itemSurface.className}
                style={itemSurface.style}
              >
                <span
                  aria-hidden="true"
                  data-snapshot-id={`${cardId}-feature-${featureIndex}-icon`}
                  className={iconSurface.className}
                  style={iconSurface.style}
                >
                  {included ? "\u2713" : "\u2014"}
                </span>
                <span
                  data-snapshot-id={`${cardId}-feature-${featureIndex}-text`}
                  className={textSurface.className}
                  style={textSurface.style}
                >
                  {feature.text}
                </span>
                <SurfaceStyles css={itemSurface.scopedCss} />
                <SurfaceStyles css={iconSurface.scopedCss} />
                <SurfaceStyles css={textSurface.scopedCss} />
              </li>
            );
          })}
        </ul>
        <ButtonControl
          type="button"
          testId="pricing-tier-cta"
          onClick={tier.action ? () => void execute(tier.action!) : undefined}
          disabled={!tier.action}
          surfaceId={`${cardId}-cta`}
          variant="ghost"
          size="sm"
          surfaceConfig={ctaSurface.resolvedConfigForWrapper}
        >
          {ctaLabel}
        </ButtonControl>
      </div>
      <SurfaceStyles css={cardSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
      <SurfaceStyles css={tierNameSurface.scopedCss} />
      <SurfaceStyles css={priceRowSurface.scopedCss} />
      <SurfaceStyles css={priceSurface.scopedCss} />
      <SurfaceStyles css={periodSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={featureListSurface.scopedCss} />
    </>
  );
}

function TableVariant({
  rootId,
  config,
  currency,
  execute,
}: {
  rootId: string;
  config: PricingTableConfig;
  currency: string;
  execute: ReturnType<typeof useActionExecutor>;
}) {
  const allFeatures: string[] = [];
  for (const tier of config.tiers) {
    for (const feature of tier.features) {
      if (!allFeatures.includes(feature.text)) {
        allFeatures.push(feature.text);
      }
    }
  }

  const scrollSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-tableScroll`,
    implementationBase: {
      overflow: "auto",
    },
    componentSurface: config.slots?.tableScroll,
  });
  const tableSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-table`,
    implementationBase: {
      width: "100%",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        borderCollapse: "collapse",
      },
    },
    componentSurface: config.slots?.table,
  });

  return (
    <>
      <div
        data-testid="pricing-table-grid"
        data-snapshot-id={`${rootId}-tableScroll`}
        className={scrollSurface.className}
        style={scrollSurface.style}
      >
        <table
          data-snapshot-id={`${rootId}-table`}
          className={tableSurface.className}
          style={tableSurface.style}
        >
          <thead>
            <tr>
              <th
                data-snapshot-id={`${rootId}-header-feature`}
                className={resolveSurfacePresentation({
                  surfaceId: `${rootId}-header-feature`,
                  implementationBase: {
                    textAlign: "left",
                    paddingY: "sm",
                    paddingX: "md",
                    fontSize: "sm",
                    color: "var(--sn-color-muted-foreground, #6b7280)",
                    style: {
                      borderBottom:
                        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                    },
                  },
                  componentSurface: config.slots?.headerCell,
                }).className}
                style={resolveSurfacePresentation({
                  surfaceId: `${rootId}-header-feature`,
                  implementationBase: {
                    textAlign: "left",
                    paddingY: "sm",
                    paddingX: "md",
                    fontSize: "sm",
                    color: "var(--sn-color-muted-foreground, #6b7280)",
                    style: {
                      borderBottom:
                        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                    },
                  },
                  componentSurface: config.slots?.headerCell,
                }).style}
              >
                Features
              </th>
              {config.tiers.map((tier: PricingTier, tierIndex: number) => {
                const headerSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-header-tier-${tierIndex}`,
                  implementationBase: {
                    textAlign: "center",
                    paddingY: "sm",
                    paddingX: "md",
                    fontSize: "sm",
                    fontWeight: "semibold",
                    style: {
                      borderBottom: tier.highlighted
                        ? "var(--sn-border-thick, 2px) solid var(--sn-color-primary, #2563eb)"
                        : "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                    },
                  },
                  componentSurface: config.slots?.headerCell,
                });
                const tierNameSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-header-tier-${tierIndex}-name`,
                  implementationBase: {},
                  componentSurface: config.slots?.headerTierName,
                });
                const priceSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-header-tier-${tierIndex}-price`,
                  implementationBase: {
                    fontSize: "lg",
                    fontWeight: "bold",
                  },
                  componentSurface: config.slots?.headerPrice,
                });

                return (
                  <th
                    key={tierIndex}
                    data-snapshot-id={`${rootId}-header-tier-${tierIndex}`}
                    className={headerSurface.className}
                    style={headerSurface.style}
                  >
                    <div
                      data-snapshot-id={`${rootId}-header-tier-${tierIndex}-name`}
                      className={tierNameSurface.className}
                      style={tierNameSurface.style}
                    >
                      {tier.name}
                    </div>
                    <div
                      data-snapshot-id={`${rootId}-header-tier-${tierIndex}-price`}
                      className={priceSurface.className}
                      style={priceSurface.style}
                    >
                      {typeof tier.price === "number"
                        ? `${currency}${tier.price}`
                        : tier.price}
                      {tier.period ? (
                        <span
                          style={{
                            fontSize: "var(--sn-font-size-xs, 0.75rem)",
                            fontWeight: "var(--sn-font-weight-normal, 400)",
                            color: "var(--sn-color-muted-foreground, #6b7280)",
                          }}
                        >
                          {tier.period}
                        </span>
                      ) : null}
                    </div>
                    <SurfaceStyles css={headerSurface.scopedCss} />
                    <SurfaceStyles css={tierNameSurface.scopedCss} />
                    <SurfaceStyles css={priceSurface.scopedCss} />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((featureText, featureIndex) => (
              <tr key={featureIndex}>
                <td
                  data-snapshot-id={`${rootId}-feature-cell-${featureIndex}`}
                  className={resolveSurfacePresentation({
                    surfaceId: `${rootId}-feature-cell-${featureIndex}`,
                    implementationBase: {
                      paddingY: "xs",
                      paddingX: "md",
                      fontSize: "sm",
                      style: {
                        borderBottom:
                          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                      },
                    },
                    componentSurface: config.slots?.featureCell,
                  }).className}
                  style={resolveSurfacePresentation({
                    surfaceId: `${rootId}-feature-cell-${featureIndex}`,
                    implementationBase: {
                      paddingY: "xs",
                      paddingX: "md",
                      fontSize: "sm",
                      style: {
                        borderBottom:
                          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                      },
                    },
                    componentSurface: config.slots?.featureCell,
                  }).style}
                >
                  {featureText}
                </td>
                {config.tiers.map((tier: PricingTier, tierIndex: number) => {
                  const feature = tier.features.find(
                    (entry: PricingFeature) => entry.text === featureText,
                  );
                  const included = feature ? feature.included !== false : false;
                  const valueSurface = resolveSurfacePresentation({
                    surfaceId: `${rootId}-value-cell-${featureIndex}-${tierIndex}`,
                    implementationBase: {
                      textAlign: "center",
                      paddingY: "xs",
                      paddingX: "md",
                      fontSize: "sm",
                      color: included
                        ? "var(--sn-color-success, #16a34a)"
                        : "var(--sn-color-muted-foreground, #6b7280)",
                      style: {
                        borderBottom:
                          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                      },
                    },
                    componentSurface: config.slots?.valueCell,
                  });

                  return (
                    <td
                      key={tierIndex}
                      data-snapshot-id={`${rootId}-value-cell-${featureIndex}-${tierIndex}`}
                      className={valueSurface.className}
                      style={valueSurface.style}
                    >
                      {included ? "\u2713" : "\u2014"}
                      <SurfaceStyles css={valueSurface.scopedCss} />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td
                data-snapshot-id={`${rootId}-cta-cell-empty`}
                className={resolveSurfacePresentation({
                  surfaceId: `${rootId}-cta-cell-empty`,
                  implementationBase: {
                    paddingY: "sm",
                    paddingX: "md",
                  },
                  componentSurface: config.slots?.ctaCell,
                }).className}
                style={resolveSurfacePresentation({
                  surfaceId: `${rootId}-cta-cell-empty`,
                  implementationBase: {
                    paddingY: "sm",
                    paddingX: "md",
                  },
                  componentSurface: config.slots?.ctaCell,
                }).style}
              />
              {config.tiers.map((tier: PricingTier, tierIndex: number) => {
                const ctaCellSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-cta-cell-${tierIndex}`,
                  implementationBase: {
                    textAlign: "center",
                    paddingY: "sm",
                    paddingX: "md",
                  },
                  componentSurface: config.slots?.ctaCell,
                });
                const ctaSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-cta-${tierIndex}`,
                  implementationBase: {
                    paddingY: "xs",
                    paddingX: "md",
                    borderRadius: "md",
                    fontSize: "sm",
                    fontWeight: "semibold",
                    cursor: tier.action ? "pointer" : "not-allowed",
                    color: tier.highlighted
                      ? "var(--sn-color-primary-foreground, #fff)"
                      : "var(--sn-color-secondary-foreground, #0f172a)",
                    bg: tier.highlighted
                      ? "var(--sn-color-primary, #2563eb)"
                      : "var(--sn-color-secondary, #f1f5f9)",
                    hover: tier.action ? { opacity: 0.85 } : undefined,
                    focus: {
                      ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
                    },
                    style: {
                      border: "var(--sn-border-default, 1px) solid transparent",
                      fontFamily: "inherit",
                      opacity: tier.action ? 1 : 0.6,
                    },
                  },
                  componentSurface: config.slots?.cta,
                });

                return (
                  <td
                    key={tierIndex}
                    data-snapshot-id={`${rootId}-cta-cell-${tierIndex}`}
                    className={ctaCellSurface.className}
                    style={ctaCellSurface.style}
                  >
                    <ButtonControl
                      type="button"
                      testId="pricing-tier-cta"
                      onClick={tier.action ? () => void execute(tier.action!) : undefined}
                      disabled={!tier.action}
                      surfaceId={`${rootId}-cta-${tierIndex}`}
                      variant="ghost"
                      size="sm"
                      surfaceConfig={ctaSurface.resolvedConfigForWrapper}
                    >
                      {tier.actionLabel ?? "Get Started"}
                    </ButtonControl>
                    <SurfaceStyles css={ctaCellSurface.scopedCss} />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <SurfaceStyles css={scrollSurface.scopedCss} />
      <SurfaceStyles css={tableSurface.scopedCss} />
    </>
  );
}

export function PricingTable({ config }: { config: PricingTableConfig }) {
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const currency = config.currency ?? "$";
  const variant = config.variant ?? "cards";
  const rootId = config.id ?? "pricing-table";

  if (visible === false) {
    return null;
  }

  if (variant === "table") {
    const tableRootSurface = resolveSurfacePresentation({
      surfaceId: rootId,
      implementationBase: {
        overflow: "hidden",
        borderRadius: "lg",
        border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        bg: "var(--sn-color-card, #ffffff)",
      },
      componentSurface: extractSurfaceConfig(config),
      itemSurface: config.slots?.root,
    });

    return (
      <>
        <div
          data-snapshot-component="pricing-table"
          data-testid="pricing-table"
          data-variant="table"
          data-snapshot-id={rootId}
          className={tableRootSurface.className}
          style={tableRootSurface.style}
        >
          <TableVariant
            rootId={rootId}
            config={config}
            currency={currency}
            execute={execute}
          />
        </div>
        <SurfaceStyles css={tableRootSurface.scopedCss} />
      </>
    );
  }

  const columnCount =
    config.columns === "auto"
      ? config.tiers.length
      : config.columns
        ? parseInt(config.columns, 10)
        : config.tiers.length;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "grid",
      gap: "lg",
      alignItems: "stretch",
      style: {
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const gridSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-grid`,
    implementationBase: {},
    componentSurface: config.slots?.grid,
  });

  return (
    <>
      <div
        data-snapshot-component="pricing-table"
        data-testid="pricing-table"
        data-variant="cards"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-grid`}
          className={gridSurface.className}
          style={gridSurface.style}
        >
          {config.tiers.map((tier: PricingTier, index: number) => (
            <TierCard
              key={index}
              rootId={rootId}
              index={index}
              tier={tier}
              currency={currency}
              execute={execute}
              slots={config.slots}
            />
          ))}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={gridSurface.scopedCss} />
    </>
  );
}
