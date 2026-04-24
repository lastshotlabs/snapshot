'use client';

import React, { useMemo } from "react";
import type { CSSProperties } from "react";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { TabsBase } from "./standalone";
import type { TabsBaseTab } from "./standalone";
import { useTabs } from "./hook";
import type { TabsConfig } from "./schema";

/**
 * Manifest adapter — resolves config refs via useTabs hook, renders manifest
 * children in tab panels, delegates layout to TabsBase.
 */
export function TabsComponent({ config }: { config: TabsConfig }) {
  const { activeTab, setActiveTab, tabs } = useTabs(config);

  const baseTabsData = useMemo<TabsBaseTab[]>(
    () =>
      tabs.map((tab) => ({
        label: String(tab.label),
        icon: tab.icon,
        disabled: tab.disabled,
        content: (
          <>
            {tab.content.map((child, childIndex) => (
              <ComponentRenderer
                key={
                  (child as ComponentConfig).id ??
                  `tab-child-${childIndex}`
                }
                config={child as ComponentConfig}
              />
            ))}
          </>
        ),
        slots: tab.slots as Record<string, Record<string, unknown>>,
      })),
    [tabs],
  );

  return (
    <TabsBase
      id={config.id}
      tabs={baseTabsData}
      defaultTab={activeTab}
      variant={config.variant}
      onTabChange={setActiveTab}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
