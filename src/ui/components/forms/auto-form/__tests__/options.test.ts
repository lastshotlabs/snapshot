import { describe, it, expect } from "vitest";
import { toFieldOptions } from "../component";

describe("toFieldOptions", () => {
  it("maps custom label and value fields from endpoint data", () => {
    const options = toFieldOptions(
      [
        { code: "a", displayName: "Alpha" },
        { code: "b", displayName: "Beta" },
      ],
      "displayName",
      "code",
    );

    expect(options).toEqual([
      { label: "Alpha", value: "a" },
      { label: "Beta", value: "b" },
    ]);
  });

  it("falls back to name and id when custom fields are absent", () => {
    const options = toFieldOptions([{ id: 1, name: "Admin" }]);

    expect(options).toEqual([{ label: "Admin", value: "1" }]);
  });
});
