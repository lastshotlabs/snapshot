import { describe, expect, it } from "vitest";
import {
  mapFieldToColumn,
  mapFieldToDisplay,
  mapFieldToInput,
} from "../field-mappers";
import type { EntityFieldMeta } from "../bunshot-types";
import { postEntityMeta } from "./fixtures";

function getField(name: string): EntityFieldMeta {
  const field = postEntityMeta.fields[name];
  expect(field).toBeDefined();
  return field!;
}

describe("field mappers", () => {
  it("maps enum fields to badge display config", () => {
    expect(mapFieldToDisplay(getField("status"))).toMatchObject({
      type: "badge",
    });
  });

  it("maps string arrays to list display config", () => {
    expect(mapFieldToDisplay(getField("tags"))).toEqual({
      type: "list",
    });
  });

  it("maps booleans to checkbox inputs", () => {
    expect(mapFieldToInput(getField("featured"))).toEqual({
      inputType: "checkbox",
    });
  });

  it("maps enums to select inputs with options", () => {
    expect(mapFieldToInput(getField("status"))).toMatchObject({
      inputType: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    });
  });

  it("maps numeric fields to right-aligned numeric columns", () => {
    expect(mapFieldToColumn(getField("viewCount"))).toEqual({
      columnType: "number",
      align: "right",
    });
  });

  it("maps json fields to code columns", () => {
    expect(mapFieldToColumn(getField("metadata"))).toEqual({
      columnType: "code",
    });
  });
});
