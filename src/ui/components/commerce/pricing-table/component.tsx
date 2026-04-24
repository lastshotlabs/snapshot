'use client';

import { useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { PricingTableBase } from "./standalone";
import type { PricingTableConfig } from "./types";
import type { PricingTierEntry } from "./standalone";

type PricingTier = PricingTableConfig["tiers"][number];
type PricingFeature = PricingTier["features"][number];

/**
 * Manifest adapter — resolves config refs and delegates to PricingTableBase.
 */
export function PricingTable({ config }: { config: PricingTableConfig }) {
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const currency = (useSubscribe(config.currency) as string | undefined) ?? "$";
  const resolvedConfig = useResolveFrom({ tiers: config.tiers });
  const surfaceConfig = extractSurfaceConfig(config);

  const tiers = useMemo(
    () =>
      ((resolvedConfig.tiers as PricingTableConfig["tiers"] | undefined) ??
        config.tiers
      ).map((tier: PricingTier): PricingTierEntry => ({
        name: typeof tier.name === "string" ? tier.name : "",
        price:
          typeof tier.price === "string" || typeof tier.price === "number"
            ? tier.price
            : "",
        period: typeof tier.period === "string" ? tier.period : undefined,
        description:
          typeof tier.description === "string" ? tier.description : undefined,
        badge: typeof tier.badge === "string" ? tier.badge : undefined,
        highlighted: tier.highlighted,
        actionLabel:
          typeof tier.actionLabel === "string" ? tier.actionLabel : undefined,
        features: tier.features.map((feature: PricingFeature) => ({
          text: typeof feature.text === "string" ? feature.text : "",
          included: feature.included,
        })),
        onAction: tier.action ? () => void execute(tier.action!) : undefined,
      })),
    [config.tiers, resolvedConfig.tiers, execute],
  );

  if (visible === false) return null;

  return (
    <PricingTableBase
      id={config.id}
      tiers={tiers}
      variant={config.variant}
      currency={currency}
      columns={config.columns}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as React.CSSProperties | undefined}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
