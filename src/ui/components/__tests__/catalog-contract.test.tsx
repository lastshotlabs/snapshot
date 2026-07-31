import { cleanup, fireEvent, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import baseline from "./contract-baseline.json";
import { BannerBase } from "../content/banner/standalone";
import { CodeBlockBase } from "../content/code-block/standalone";
import { CodeBase } from "../content/code/standalone";
import { HeadingBase } from "../content/heading/standalone";
import { TimelineBase } from "../content/timeline/standalone";
import { AlertBase } from "../data/alert/standalone";
import { AvatarBase } from "../data/avatar/standalone";
import { BadgeBase } from "../data/badge/standalone";
import { EmptyStateBase } from "../data/empty-state/standalone";
import { HighlightedTextBase } from "../data/highlighted-text/standalone";
import { ProgressBase } from "../data/progress/standalone";
import { SaveIndicatorBase } from "../data/save-indicator/standalone";
import { ScrollAreaBase } from "../data/scroll-area/standalone";
import { SeparatorBase } from "../data/separator/standalone";
import { SkeletonBase } from "../data/skeleton/standalone";
import { StatCardBase } from "../data/stat-card/standalone";
import { DefaultErrorBase } from "../feedback/default-error/standalone";
import { DefaultLoadingBase } from "../feedback/default-loading/standalone";
import { DefaultNotFoundBase } from "../feedback/default-not-found/standalone";
import { DefaultOfflineBase } from "../feedback/default-offline/standalone";
import { ButtonBase } from "../forms/button/standalone";
import { IconButtonBase } from "../forms/icon-button/standalone";
import { InputField } from "../forms/input/standalone";
import { SelectField } from "../forms/select/standalone";
import { SliderField } from "../forms/slider/standalone";
import { SwitchField } from "../forms/switch/standalone";
import { TextareaField } from "../forms/textarea/standalone";
import { ToggleGroupBase } from "../forms/toggle-group/standalone";
import { ToggleField } from "../forms/toggle/standalone";
import { BoxBase } from "../layout/box/standalone";
import { CardBase } from "../layout/card/standalone";
import { CollapsibleBase } from "../layout/collapsible/standalone";
import { ColumnBase } from "../layout/column/standalone";
import { ContainerBase } from "../layout/container/standalone";
import { GridBase } from "../layout/grid/standalone";
import { RowBase } from "../layout/row/standalone";
import { SectionBase } from "../layout/section/standalone";
import { SpacerBase } from "../layout/spacer/standalone";
import { AccordionBase } from "../navigation/accordion/standalone";
import { BreadcrumbBase } from "../navigation/breadcrumb/standalone";
import { StepperBase } from "../navigation/stepper/standalone";
import { TabsBase } from "../navigation/tabs/standalone";
import { DividerBase } from "../primitives/divider/standalone";
import { LinkBase } from "../primitives/link/standalone";
import { StackBase } from "../primitives/stack/standalone";
import { TextBase } from "../primitives/text/standalone";
import {
  expectServerRenderable,
  renderComponentContract,
} from "../../testing/component-harness";

interface CatalogCase {
  name: string;
  path: string;
  element: () => ReactElement;
}

const catalogCases: CatalogCase[] = [
  {
    name: "ButtonBase",
    path: "src/ui/components/forms/button/standalone.tsx",
    element: () => <ButtonBase id="contract-button" label="Save" />,
  },
  {
    name: "IconButtonBase",
    path: "src/ui/components/forms/icon-button/standalone.tsx",
    element: () => (
      <IconButtonBase
        id="contract-icon-button"
        icon="search"
        ariaLabel="Search"
      />
    ),
  },
  {
    name: "InputField",
    path: "src/ui/components/forms/input/standalone.tsx",
    element: () => <InputField id="contract-input" label="Email" />,
  },
  {
    name: "TextareaField",
    path: "src/ui/components/forms/textarea/standalone.tsx",
    element: () => <TextareaField id="contract-textarea" label="Message" />,
  },
  {
    name: "SelectField",
    path: "src/ui/components/forms/select/standalone.tsx",
    element: () => (
      <SelectField
        id="contract-select"
        label="Role"
        options={[{ label: "Admin", value: "admin" }]}
      />
    ),
  },
  {
    name: "SwitchField",
    path: "src/ui/components/forms/switch/standalone.tsx",
    element: () => (
      <SwitchField id="contract-switch" label="Email notifications" />
    ),
  },
  {
    name: "SliderField",
    path: "src/ui/components/forms/slider/standalone.tsx",
    element: () => (
      <SliderField id="contract-slider" label="Volume" defaultValue={40} />
    ),
  },
  {
    name: "ToggleField",
    path: "src/ui/components/forms/toggle/standalone.tsx",
    element: () => <ToggleField id="contract-toggle" label="Bold" />,
  },
  {
    name: "ToggleGroupBase",
    path: "src/ui/components/forms/toggle-group/standalone.tsx",
    element: () => (
      <ToggleGroupBase
        id="contract-toggle-group"
        items={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ]}
      />
    ),
  },
  {
    name: "BoxBase",
    path: "src/ui/components/layout/box/standalone.tsx",
    element: () => <BoxBase id="contract-box">Box</BoxBase>,
  },
  {
    name: "CardBase",
    path: "src/ui/components/layout/card/standalone.tsx",
    element: () => (
      <CardBase id="contract-card" title="Account">
        Details
      </CardBase>
    ),
  },
  {
    name: "RowBase",
    path: "src/ui/components/layout/row/standalone.tsx",
    element: () => <RowBase id="contract-row">Row</RowBase>,
  },
  {
    name: "ColumnBase",
    path: "src/ui/components/layout/column/standalone.tsx",
    element: () => <ColumnBase id="contract-column">Column</ColumnBase>,
  },
  {
    name: "ContainerBase",
    path: "src/ui/components/layout/container/standalone.tsx",
    element: () => (
      <ContainerBase id="contract-container">Container</ContainerBase>
    ),
  },
  {
    name: "GridBase",
    path: "src/ui/components/layout/grid/standalone.tsx",
    element: () => <GridBase id="contract-grid">Grid</GridBase>,
  },
  {
    name: "SectionBase",
    path: "src/ui/components/layout/section/standalone.tsx",
    element: () => <SectionBase id="contract-section">Section</SectionBase>,
  },
  {
    name: "SpacerBase",
    path: "src/ui/components/layout/spacer/standalone.tsx",
    element: () => <SpacerBase id="contract-spacer" />,
  },
  {
    name: "CollapsibleBase",
    path: "src/ui/components/layout/collapsible/standalone.tsx",
    element: () => (
      <CollapsibleBase id="contract-collapsible" trigger={<span>Details</span>}>
        Hidden content
      </CollapsibleBase>
    ),
  },
  {
    name: "AlertBase",
    path: "src/ui/components/data/alert/standalone.tsx",
    element: () => (
      <AlertBase
        id="contract-alert"
        title="Heads up"
        description="Review this message."
      />
    ),
  },
  {
    name: "AvatarBase",
    path: "src/ui/components/data/avatar/standalone.tsx",
    element: () => <AvatarBase id="contract-avatar" name="Ada Lovelace" />,
  },
  {
    name: "BadgeBase",
    path: "src/ui/components/data/badge/standalone.tsx",
    element: () => <BadgeBase id="contract-badge" text="Beta" />,
  },
  {
    name: "ProgressBase",
    path: "src/ui/components/data/progress/standalone.tsx",
    element: () => (
      <ProgressBase id="contract-progress" label="Upload" value={60} />
    ),
  },
  {
    name: "SkeletonBase",
    path: "src/ui/components/data/skeleton/standalone.tsx",
    element: () => <SkeletonBase id="contract-skeleton" />,
  },
  {
    name: "SeparatorBase",
    path: "src/ui/components/data/separator/standalone.tsx",
    element: () => <SeparatorBase id="contract-separator" label="More" />,
  },
  {
    name: "SaveIndicatorBase",
    path: "src/ui/components/data/save-indicator/standalone.tsx",
    element: () => (
      <SaveIndicatorBase id="contract-save-indicator" status="saved" />
    ),
  },
  {
    name: "HighlightedTextBase",
    path: "src/ui/components/data/highlighted-text/standalone.tsx",
    element: () => (
      <HighlightedTextBase
        id="contract-highlight"
        text="Snapshot component"
        highlight="component"
      />
    ),
  },
  {
    name: "EmptyStateBase",
    path: "src/ui/components/data/empty-state/standalone.tsx",
    element: () => (
      <EmptyStateBase
        id="contract-empty"
        title="No results"
        actionLabel="Create"
      />
    ),
  },
  {
    name: "StatCardBase",
    path: "src/ui/components/data/stat-card/standalone.tsx",
    element: () => <StatCardBase id="contract-stat" label="Users" value="42" />,
  },
  {
    name: "ScrollAreaBase",
    path: "src/ui/components/data/scroll-area/standalone.tsx",
    element: () => (
      <ScrollAreaBase id="contract-scroll">Scrollable content</ScrollAreaBase>
    ),
  },
  {
    name: "BannerBase",
    path: "src/ui/components/content/banner/standalone.tsx",
    element: () => <BannerBase id="contract-banner">Welcome</BannerBase>,
  },
  {
    name: "HeadingBase",
    path: "src/ui/components/content/heading/standalone.tsx",
    element: () => (
      <HeadingBase id="contract-heading" text="Settings" level={2} />
    ),
  },
  {
    name: "CodeBase",
    path: "src/ui/components/content/code/standalone.tsx",
    element: () => <CodeBase id="contract-code" value="const ready = true;" />,
  },
  {
    name: "CodeBlockBase",
    path: "src/ui/components/content/code-block/standalone.tsx",
    element: () => (
      <CodeBlockBase
        id="contract-code-block"
        code="const ready = true;"
        language="typescript"
        showCopy={false}
      />
    ),
  },
  {
    name: "TimelineBase",
    path: "src/ui/components/content/timeline/standalone.tsx",
    element: () => (
      <TimelineBase
        id="contract-timeline"
        items={[{ title: "Created", date: "Today" }]}
      />
    ),
  },
  {
    name: "DividerBase",
    path: "src/ui/components/primitives/divider/standalone.tsx",
    element: () => <DividerBase id="contract-divider" label="Or" />,
  },
  {
    name: "StackBase",
    path: "src/ui/components/primitives/stack/standalone.tsx",
    element: () => <StackBase id="contract-stack">Stack</StackBase>,
  },
  {
    name: "TextBase",
    path: "src/ui/components/primitives/text/standalone.tsx",
    element: () => <TextBase id="contract-text" value="Body copy" />,
  },
  {
    name: "LinkBase",
    path: "src/ui/components/primitives/link/standalone.tsx",
    element: () => <LinkBase id="contract-link" text="Home" to="/" />,
  },
  {
    name: "DefaultLoadingBase",
    path: "src/ui/components/feedback/default-loading/standalone.tsx",
    element: () => (
      <DefaultLoadingBase id="contract-loading" label="Loading account" />
    ),
  },
  {
    name: "DefaultErrorBase",
    path: "src/ui/components/feedback/default-error/standalone.tsx",
    element: () => (
      <DefaultErrorBase
        id="contract-error"
        title="Could not load"
        description="Try again."
        showRetry
        retryLabel="Retry"
      />
    ),
  },
  {
    name: "DefaultNotFoundBase",
    path: "src/ui/components/feedback/default-not-found/standalone.tsx",
    element: () => (
      <DefaultNotFoundBase
        id="contract-not-found"
        title="Page not found"
        description="Check the address."
      />
    ),
  },
  {
    name: "DefaultOfflineBase",
    path: "src/ui/components/feedback/default-offline/standalone.tsx",
    element: () => (
      <DefaultOfflineBase
        id="contract-offline"
        title="Offline"
        description="Reconnect to continue."
      />
    ),
  },
  {
    name: "BreadcrumbBase",
    path: "src/ui/components/navigation/breadcrumb/standalone.tsx",
    element: () => (
      <BreadcrumbBase
        id="contract-breadcrumb"
        items={[{ label: "Home", path: "/" }, { label: "Settings" }]}
      />
    ),
  },
  {
    name: "StepperBase",
    path: "src/ui/components/navigation/stepper/standalone.tsx",
    element: () => (
      <StepperBase
        id="contract-stepper"
        steps={[
          { title: "Account", content: "Account content" },
          { title: "Confirm", content: "Confirm content" },
        ]}
      />
    ),
  },
  {
    name: "TabsBase",
    path: "src/ui/components/navigation/tabs/standalone.tsx",
    element: () => (
      <TabsBase
        id="contract-tabs"
        tabs={[
          { label: "Profile", content: "Profile content" },
          { label: "Security", content: "Security content" },
        ]}
      />
    ),
  },
  {
    name: "AccordionBase",
    path: "src/ui/components/navigation/accordion/standalone.tsx",
    element: () => (
      <AccordionBase
        id="contract-accordion"
        items={[{ title: "Question", content: "Answer" }]}
      />
    ),
  },
];

afterEach(cleanup);

describe("component catalog contract", () => {
  it("keeps the executable catalog aligned with the 0.3.0 baseline", () => {
    expect(catalogCases.map(({ path }) => path).sort()).toEqual(
      [...baseline].sort(),
    );
    expect(catalogCases.length).toBeGreaterThanOrEqual(40);
  });

  describe.each(catalogCases)("$name", ({ element }) => {
    it("renders with the shared DOM and accessibility contract", () => {
      renderComponentContract(element());
    });

    it("renders the same public boundary on the server", () => {
      expectServerRenderable(element());
    });
  });

  it("merges consumer and slot token surfaces without discarding either", () => {
    const { container } = renderComponentContract(
      <BoxBase
        id="surface-contract"
        className="consumer-root"
        style={{ padding: "var(--consumer-space)" }}
        slots={{
          root: {
            className: "slot-root",
            style: { color: "var(--consumer-accent)" },
          },
        }}
      >
        Surface
      </BoxBase>,
    );
    const root = container.querySelector<HTMLElement>(
      '[data-snapshot-id="surface-contract"]',
    );

    expect(root?.className).toContain("consumer-root");
    expect(root?.className).toContain("slot-root");
    expect(root?.style.padding).toBe("var(--consumer-space)");
    expect(root?.style.color).toBe("var(--consumer-accent)");
  });

  it("drives the common form and disclosure interactions", () => {
    const onButton = vi.fn();
    const onInput = vi.fn();
    const onSelect = vi.fn();
    const onSwitch = vi.fn();
    const onToggle = vi.fn();
    const onOpen = vi.fn();
    const onAction = vi.fn();

    renderComponentContract(
      <div>
        <ButtonBase label="Save" onClick={onButton} />
        <InputField label="Name" onChange={onInput} />
        <SelectField
          label="Role"
          options={[{ label: "Admin", value: "admin" }]}
          onChange={onSelect}
        />
        <SwitchField label="Updates" onChange={onSwitch} />
        <ToggleField label="Bold" onChange={onToggle} />
        <CollapsibleBase trigger="Details" onOpenChange={onOpen}>
          Disclosure content
        </CollapsibleBase>
        <EmptyStateBase
          title="No records"
          actionLabel="Create record"
          onAction={onAction}
        />
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Role" }), {
      target: { value: "admin" },
    });
    fireEvent.click(screen.getByRole("switch", { name: "Updates" }));
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    fireEvent.click(screen.getByRole("button", { name: "Create record" }));

    expect(onButton).toHaveBeenCalledOnce();
    expect(onInput).toHaveBeenCalledWith("Ada");
    expect(onSelect).toHaveBeenCalledWith("admin");
    expect(onSwitch).toHaveBeenCalledWith(true);
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(onOpen).toHaveBeenCalledWith(true);
    expect(onAction).toHaveBeenCalledOnce();
    expect(screen.getByText("Disclosure content")).not.toBeNull();
  });
});
