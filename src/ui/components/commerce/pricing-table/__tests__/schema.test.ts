import { describe, it, expect } from "vitest";
import { pricingTableConfigSchema } from "../schema";

const baseConfig = {
  type: "pricing-table" as const,
  tiers: [
    {
      name: "Free",
      price: 0,
      features: [{ text: "1 project", included: true }],
    },
  ],
};

describe("pricingTableConfigSchema", () => {
  it("accepts a minimal valid config", () => {
    const result = pricingTableConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("accepts a fully-specified config", () => {
    const result = pricingTableConfigSchema.safeParse({
      type: "pricing-table",
      id: "pricing",
      className: "my-pricing",
      currency: "€",
      columns: "3",
      variant: "table",
      tiers: [
        {
          name: "Starter",
          price: 9,
          period: "/month",
          description: "For individuals",
          features: [
            { text: "5 projects", included: true },
            { text: "API access", included: false },
          ],
          highlighted: false,
          actionLabel: "Start Free",
          action: { type: "navigate", to: "/signup?plan=starter" },
        },
        {
          name: "Pro",
          price: 29,
          period: "/month",
          description: "For teams",
          highlighted: true,
          badge: "Most Popular",
          features: [
            { text: "Unlimited projects", included: true },
            { text: "API access", included: true },
          ],
          action: { type: "navigate", to: "/signup?plan=pro" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts price as a string", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      tiers: [
        {
          name: "Enterprise",
          price: "Custom",
          features: [{ text: "Everything" }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts FromRef-backed tier copy and currency", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      currency: { from: "pricing.currency" },
      tiers: [
        {
          name: { from: "pricing.name" },
          price: { from: "pricing.price" },
          period: { from: "pricing.period" },
          description: { from: "pricing.description" },
          badge: { from: "pricing.badge" },
          actionLabel: { from: "pricing.cta" },
          features: [{ text: { from: "pricing.feature" } }],
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts features without included field (defaults semantically)", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      tiers: [
        {
          name: "Basic",
          price: 5,
          features: [{ text: "Basic support" }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts all column values", () => {
    for (const columns of ["auto", "2", "3", "4"]) {
      const result = pricingTableConfigSchema.safeParse({
        ...baseConfig,
        columns,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all variant values", () => {
    for (const variant of ["cards", "table"]) {
      const result = pricingTableConfigSchema.safeParse({
        ...baseConfig,
        variant,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects missing type", () => {
    const { type: _, ...noType } = baseConfig;
    const result = pricingTableConfigSchema.safeParse(noType);
    expect(result.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      type: "stat-card",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing tiers", () => {
    const result = pricingTableConfigSchema.safeParse({
      type: "pricing-table",
    });
    expect(result.success).toBe(false);
  });

  it("rejects tier missing name", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      tiers: [{ price: 10, features: [] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects tier missing price", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      tiers: [{ name: "Test", features: [] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects tier missing features", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      tiers: [{ name: "Test", price: 10 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid columns value", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      columns: "5",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid variant value", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      variant: "grid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties (strict mode)", () => {
    const result = pricingTableConfigSchema.safeParse({
      ...baseConfig,
      unknownProp: "foo",
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults — optional fields are undefined", () => {
    const result = pricingTableConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBeUndefined();
      expect(result.data.columns).toBeUndefined();
      expect(result.data.variant).toBeUndefined();
      expect(result.data.id).toBeUndefined();
    }
  });
});
