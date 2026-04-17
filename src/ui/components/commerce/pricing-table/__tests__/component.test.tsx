// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { PricingTable } from "../component";
import type { PricingTableConfig } from "../types";

function createTestWrapper() {
  const registry = new AtomRegistryImpl();
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  };
}

const baseConfig: PricingTableConfig = {
  type: "pricing-table",
  tiers: [
    {
      name: "Free",
      price: 0,
      features: [
        { text: "1 project", included: true },
        { text: "API access", included: false },
      ],
    },
    {
      name: "Pro",
      price: 29,
      period: "/month",
      highlighted: true,
      badge: "Most Popular",
      features: [
        { text: "Unlimited projects", included: true },
        { text: "API access", included: true },
      ],
      actionLabel: "Upgrade",
      action: { type: "navigate", to: "/upgrade" },
    },
  ],
};

describe("PricingTable", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("renders with data-snapshot-component attribute", () => {
    const wrapper = createTestWrapper();
    render(
      <PricingTable
        config={{ ...baseConfig, id: "plans", className: "pricing-root" }}
      />,
      { wrapper },
    );

    expect(
      screen
        .getByTestId("pricing-table")
        .getAttribute("data-snapshot-component"),
    ).toBe("pricing-table");
    expect(screen.getByTestId("pricing-table").classList.contains("pricing-root")).toBe(
      true,
    );
  });

  it("renders tier cards in cards variant", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const cards = screen.getAllByTestId("pricing-tier-card");
    expect(cards).toHaveLength(2);
  });

  it("displays tier names", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const names = screen.getAllByTestId("pricing-tier-name");
    expect(names[0]?.textContent).toContain("Free");
    expect(names[1]?.textContent).toContain("Pro");
  });

  it("displays prices with currency", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const prices = screen.getAllByTestId("pricing-tier-price");
    expect(prices[0]?.textContent).toContain("$0");
    expect(prices[1]?.textContent).toContain("$29");
  });

  it("displays custom currency", () => {
    const wrapper = createTestWrapper();
    const config: PricingTableConfig = {
      ...baseConfig,
      currency: "€",
    };

    render(<PricingTable config={config} />, { wrapper });

    const prices = screen.getAllByTestId("pricing-tier-price");
    expect(prices[0]?.textContent).toContain("€0");
  });

  it("displays string prices as-is", () => {
    const wrapper = createTestWrapper();
    const config: PricingTableConfig = {
      ...baseConfig,
      tiers: [
        {
          name: "Enterprise",
          price: "Custom",
          features: [{ text: "Everything" }],
        },
      ],
    };

    render(<PricingTable config={config} />, { wrapper });

    const price = screen.getByTestId("pricing-tier-price");
    expect(price.textContent).toContain("Custom");
  });

  it("renders badge on highlighted tier", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const badge = screen.getByTestId("pricing-tier-badge");
    expect(badge.textContent).toContain("Most Popular");
  });

  it("renders features with check/dash indicators", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const featureLists = screen.getAllByTestId("pricing-tier-features");
    expect(featureLists).toHaveLength(2);

    // Free tier: 1 included, 1 not
    const freeItems = featureLists[0]!.querySelectorAll("li");
    expect(freeItems).toHaveLength(2);
    expect(freeItems[0]?.textContent).toContain("\u2713");
    expect(freeItems[1]?.textContent).toContain("\u2014");
  });

  it("renders CTA buttons", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const ctas = screen.getAllByTestId("pricing-tier-cta");
    expect(ctas).toHaveLength(2);
    expect(ctas[1]?.textContent).toContain("Upgrade");
  });

  it("uses default CTA label when not specified", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const ctas = screen.getAllByTestId("pricing-tier-cta");
    expect(ctas[0]?.textContent).toContain("Get Started");
  });

  it("marks highlighted card with data attribute", () => {
    const wrapper = createTestWrapper();
    render(<PricingTable config={baseConfig} />, { wrapper });

    const cards = screen.getAllByTestId("pricing-tier-card");
    expect(cards[0]?.getAttribute("data-featured")).toBeNull();
    expect(cards[1]?.getAttribute("data-featured")).toBe("true");
  });

  it("renders table variant", () => {
    const wrapper = createTestWrapper();
    const config: PricingTableConfig = {
      ...baseConfig,
      variant: "table",
    };

    render(<PricingTable config={config} />, { wrapper });

    const table = screen.getByTestId("pricing-table");
    expect(table.getAttribute("data-variant")).toBe("table");
    expect(table.querySelector("table")).toBeTruthy();
  });

  it("renders ref-backed currency and tier copy", () => {
    const registry = new AtomRegistryImpl();
    registry.store.set(registry.register("pricing"), {
      currency: "€",
      name: "Scale",
      price: 49,
      period: "/seat",
      description: "For growing teams",
      badge: "Best value",
      cta: "Choose Scale",
      feature: "Priority support",
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );

    render(
      <PricingTable
        config={{
          type: "pricing-table",
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
              action: { type: "navigate", to: "/scale" },
            },
          ],
        }}
      />,
      { wrapper },
    );

    expect(screen.getByTestId("pricing-tier-name").textContent).toContain("Scale");
    expect(screen.getByTestId("pricing-tier-price").textContent).toContain("€49");
    expect(screen.getByTestId("pricing-tier-description").textContent).toContain(
      "For growing teams",
    );
    expect(screen.getByTestId("pricing-tier-badge").textContent).toContain("Best value");
    expect(screen.getByText("Priority support")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Choose Scale" })).toBeTruthy();
  });
});
