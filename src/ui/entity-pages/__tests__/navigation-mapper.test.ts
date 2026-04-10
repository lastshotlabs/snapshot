import { describe, expect, it } from "vitest";
import {
  mapAppConfig,
  mapNavComponentConfig,
  mapNavigation,
} from "../navigation-mapper";
import { navigationFixture } from "./fixtures";

describe("navigation mappers", () => {
  it("maps sidebar shell to Snapshot navigation mode", () => {
    const navigation = mapNavigation(navigationFixture);
    expect(navigation?.mode).toBe("sidebar");
    expect(navigation?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Posts", path: "/posts" }),
      ]),
    );
  });

  it("maps app config title and shell", () => {
    expect(mapAppConfig(navigationFixture)).toEqual({
      title: "Control Center",
      shell: "sidebar",
    });
  });

  it("builds a Nav component config for SSR shell rendering", () => {
    expect(mapNavComponentConfig(navigationFixture)).toMatchObject({
      type: "nav",
      logo: { text: "Control Center", path: "/" },
      userMenu: {
        items: [
          { label: "Profile", action: { type: "navigate", to: "/profile" } },
        ],
      },
    });
  });
});
