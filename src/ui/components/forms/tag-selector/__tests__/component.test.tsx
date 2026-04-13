/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { TagSelector } from "../component";

function createWrapper() {
  const registry = new AtomRegistryImpl();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  }

  return Wrapper;
}

describe("TagSelector", () => {
  it("selects an available tag from the dropdown", () => {
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <TagSelector
          config={{
            type: "tag-selector",
            tags: [
              { label: "React", value: "react" },
              { label: "TypeScript", value: "ts" },
            ],
          }}
        />
      </Wrapper>,
    );

    const input = screen.getByTestId("tag-input");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "React" } });
    fireEvent.click(screen.getByTestId("tag-option"));

    expect(screen.getByText("React")).toBeTruthy();
  });
});
