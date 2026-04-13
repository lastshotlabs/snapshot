// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavLogo } from "../component";

const executeSpy = vi.fn();

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => ({ app: { title: "Snapshot", home: "/" } }),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

describe("NavLogo", () => {
  it("dispatches navigation when clicked", () => {
    executeSpy.mockReset();

    render(<NavLogo config={{ type: "nav-logo", text: "Snapshot", path: "/home" }} />);

    fireEvent.click(screen.getByRole("link"));

    expect(executeSpy).toHaveBeenCalledWith({ type: "navigate", to: "/home" });
  });
});
