import React from "react";
import { bootBuiltins } from "../../manifest/boot-builtins";
import { ComponentRenderer } from "../../manifest/renderer";
import type { ComponentConfig } from "../../manifest/types";
import {
  getComponentFixtures,
  getPrimaryFixture,
  type ComponentConfigRecord,
} from "./component-fixtures";
import { SnapshotStoryProviders } from "./story-providers";

bootBuiltins();

export interface ComponentStoryMeta {
  type: string;
  domain: string;
  path: string;
}

export interface ComponentStoryArgs {
  componentType: string;
  fixtureName: string;
  config: ComponentConfigRecord;
  maxWidth?: string;
}

function RenderSnapshotComponent({
  config,
  maxWidth,
}: {
  config: ComponentConfigRecord;
  maxWidth?: string;
}) {
  return (
    <div
      style={
        maxWidth
          ? ({
              "--snapshot-story-max-width": maxWidth,
            } as React.CSSProperties)
          : undefined
      }
    >
      <ComponentRenderer config={config as ComponentConfig} />
    </div>
  );
}

export function getComponentStoryArgs(type: string): ComponentStoryArgs {
  const fixture = getPrimaryFixture(type);
  return {
    componentType: type,
    fixtureName: fixture.name,
    config: fixture.config,
    maxWidth: fixture.maxWidth,
  };
}

export function ComponentStoryFrame({
  componentType,
  fixtureName,
  config,
  maxWidth,
}: ComponentStoryArgs) {
  const fixtures = getComponentFixtures(componentType);
  const fixture =
    fixtures.find((candidate) => candidate.name === fixtureName) ?? fixtures[0]!;

  return (
    <SnapshotStoryProviders>
      <main className="snapshot-storybook">
        <div className="snapshot-storybook__shell">
          <header className="snapshot-storybook__header">
            <div>
              <p className="snapshot-storybook__eyebrow">Snapshot Component</p>
              <h1 className="snapshot-storybook__title">{componentType}</h1>
              <p className="snapshot-storybook__description">
                {fixture.description}
              </p>
            </div>
            <div className="snapshot-storybook__meta">
              <span className="snapshot-storybook__pill">{fixtureName}</span>
              <span className="snapshot-storybook__pill">
                manifest config
              </span>
            </div>
          </header>

          <section className="snapshot-storybook__stage">
            <div className="snapshot-storybook__stage-toolbar">
              <span className="snapshot-storybook__stage-label">Preview</span>
              <span className="snapshot-storybook__stage-path">
                {componentType}
              </span>
            </div>
            <div className="snapshot-storybook__viewport">
              <RenderSnapshotComponent
                config={config ?? fixture.config}
                maxWidth={maxWidth ?? fixture.maxWidth}
              />
            </div>
          </section>
        </div>
      </main>
    </SnapshotStoryProviders>
  );
}

export function ComponentCatalogFrame({
  components,
}: {
  components: readonly ComponentStoryMeta[];
}) {
  return (
    <SnapshotStoryProviders>
      <main className="snapshot-storybook">
        <div className="snapshot-storybook__shell">
          <header className="snapshot-storybook__header">
            <div>
              <p className="snapshot-storybook__eyebrow">Snapshot Catalog</p>
              <h1 className="snapshot-storybook__title">
                Generated Component Inventory
              </h1>
              <p className="snapshot-storybook__description">
                This Storybook page is generated from the registered manifest
                component inventory and renders each component through the same
                manifest renderer used by Snapshot apps.
              </p>
            </div>
            <div className="snapshot-storybook__meta">
              <span className="snapshot-storybook__pill">
                {components.length} components
              </span>
              <span className="snapshot-storybook__pill">fixture-backed</span>
            </div>
          </header>

          <section className="snapshot-storybook__catalog">
            {components.map((component) => {
              const fixture = getPrimaryFixture(component.type);

              return (
                <article
                  className="snapshot-storybook__tile"
                  key={component.type}
                >
                  <div className="snapshot-storybook__tile-header">
                    <span className="snapshot-storybook__tile-title">
                      {component.type}
                    </span>
                    <span className="snapshot-storybook__tile-domain">
                      {component.domain}
                    </span>
                  </div>
                  <div className="snapshot-storybook__tile-body">
                    <RenderSnapshotComponent
                      config={fixture.config}
                      maxWidth={fixture.maxWidth}
                    />
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </main>
    </SnapshotStoryProviders>
  );
}
