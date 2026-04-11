import { beforeAll, describe, expect, it } from "vitest";
import { bootBuiltins } from "../../manifest/boot-builtins";
import { pageConfigSchema } from "../../manifest/schema";
import { mapEntityFormPage } from "../form-mapper";
import { buildFormCreateResult, buildFormEditResult } from "./fixtures";

beforeAll(() => {
  bootBuiltins();
});

describe("mapEntityFormPage", () => {
  it("returns a valid create page config", () => {
    const result = mapEntityFormPage(buildFormCreateResult());
    expect(() => pageConfigSchema.parse(result.page)).not.toThrow();
  });

  it("builds create form with defaults and redirect action", () => {
    const result = mapEntityFormPage(buildFormCreateResult());
    const form = result.page.content[1] as Record<string, unknown>;
    const fields = form.fields as Array<Record<string, unknown>>;
    expect(form).toMatchObject({
      type: "form",
      submit: "/posts",
      method: "POST",
      onSuccess: { type: "navigate", to: "/posts/{result.id}" },
    });
    expect(fields.find((field) => field.name === "status")?.default).toBe(
      "draft",
    );
  });

  it("builds edit form with preload data and immutable disabled fields", () => {
    const result = mapEntityFormPage(buildFormEditResult());
    const form = result.page.content[1] as Record<string, unknown>;
    const fields = form.fields as Array<Record<string, unknown>>;
    expect(form).toMatchObject({
      data: { from: "entityPageData.item" },
      method: "PATCH",
      submit: "/posts/1",
    });
    expect(fields.find((field) => field.name === "createdAt")?.disabled).toBe(
      true,
    );
  });

  it("stores edit item data in route state", () => {
    const result = mapEntityFormPage(buildFormEditResult());
    expect(result.state.entityPageData?.default).toMatchObject({
      item: expect.objectContaining({
        metadata: JSON.stringify({ hero: true }, null, 2),
      }),
    });
  });
});
