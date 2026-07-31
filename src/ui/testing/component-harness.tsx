import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect } from "vitest";

function referencedText(element: Element, attribute: string): string {
  const ids = element.getAttribute(attribute)?.trim().split(/\s+/) ?? [];
  return ids
    .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

function associatedLabelText(element: Element): string {
  if (!(element instanceof HTMLElement)) return "";

  if (element.id) {
    const explicit = Array.from(document.querySelectorAll("label")).find(
      (label) => label.htmlFor === element.id,
    );
    if (explicit?.textContent?.trim()) return explicit.textContent.trim();
  }

  return element.closest("label")?.textContent?.trim() ?? "";
}

function accessibleName(element: Element): string {
  return (
    element.getAttribute("aria-label")?.trim() ||
    referencedText(element, "aria-labelledby") ||
    associatedLabelText(element) ||
    element.getAttribute("alt")?.trim() ||
    element.getAttribute("title")?.trim() ||
    element.textContent?.trim() ||
    ""
  );
}

/**
 * Fast component-level accessibility contract.
 *
 * Full application accessibility still belongs in browser-level axe/manual
 * coverage. This catches the catalog regressions that are actionable at the
 * component boundary: unnamed controls and links, images without alternatives,
 * broken aria references, and duplicate ids.
 */
export function expectAccessibleComponent(container: HTMLElement): void {
  const ids = new Set<string>();
  for (const element of container.querySelectorAll<HTMLElement>("[id]")) {
    expect(ids.has(element.id), `duplicate id "${element.id}"`).toBe(false);
    ids.add(element.id);
  }

  for (const element of container.querySelectorAll<HTMLElement>(
    'button, input:not([type="hidden"]), select, textarea, a[href]',
  )) {
    expect(
      accessibleName(element),
      `${element.tagName.toLowerCase()} must have an accessible name`,
    ).not.toBe("");
  }

  for (const image of container.querySelectorAll<HTMLImageElement>("img")) {
    expect(
      image.hasAttribute("alt"),
      "images must declare alt text (empty is valid for decorative images)",
    ).toBe(true);
  }

  for (const element of container.querySelectorAll<HTMLElement>(
    "[aria-labelledby], [aria-describedby]",
  )) {
    for (const attribute of ["aria-labelledby", "aria-describedby"]) {
      const ids = element.getAttribute(attribute)?.trim().split(/\s+/) ?? [];
      for (const id of ids) {
        expect(
          document.getElementById(id),
          `${attribute} references missing id "${id}"`,
        ).not.toBeNull();
      }
    }
  }
}

/** Render a catalog component and apply the shared DOM/a11y contract. */
export function renderComponentContract(element: ReactElement) {
  const result = render(element);
  expect(result.container.firstElementChild).not.toBeNull();
  expectAccessibleComponent(result.container);
  return result;
}

/** Prove the same component boundary can render without a browser. */
export function expectServerRenderable(element: ReactElement): void {
  const html = renderToStaticMarkup(element);
  expect(html.length).toBeGreaterThan(0);
  expect(html).not.toContain("<undefined");
}
