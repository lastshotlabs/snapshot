import { describe, it, expect } from "vitest";
import { fileUploaderConfigSchema } from "../schema";

const baseConfig = {
  type: "file-uploader" as const,
};

describe("fileUploaderConfigSchema", () => {
  it("accepts a minimal valid config", () => {
    const result = fileUploaderConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
  });

  it("accepts a fully-specified config", () => {
    const result = fileUploaderConfigSchema.safeParse({
      type: "file-uploader",
      id: "doc-upload",
      className: "uploader",
      accept: "image/*,.pdf",
      maxSize: 5242880,
      maxFiles: 5,
      label: "Upload documents",
      description: "PDF or images up to 5MB each",
      variant: "dropzone",
      uploadEndpoint: "/api/uploads",
      onUpload: { type: "toast", message: "Uploaded!" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts all variant values", () => {
    for (const variant of ["dropzone", "button", "compact"]) {
      const result = fileUploaderConfigSchema.safeParse({
        ...baseConfig,
        variant,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts onUpload action", () => {
    const result = fileUploaderConfigSchema.safeParse({
      ...baseConfig,
      onUpload: { type: "navigate", to: "/files" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a resource-backed upload endpoint", () => {
    const result = fileUploaderConfigSchema.safeParse({
      ...baseConfig,
      uploadEndpoint: {
        resource: "uploads",
        params: { folder: "docs" },
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing type", () => {
    const result = fileUploaderConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects wrong type", () => {
    const result = fileUploaderConfigSchema.safeParse({
      type: "modal",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid variant value", () => {
    const result = fileUploaderConfigSchema.safeParse({
      ...baseConfig,
      variant: "inline",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-number maxSize", () => {
    const result = fileUploaderConfigSchema.safeParse({
      ...baseConfig,
      maxSize: "5MB",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-number maxFiles", () => {
    const result = fileUploaderConfigSchema.safeParse({
      ...baseConfig,
      maxFiles: "many",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extra properties (strict mode)", () => {
    const result = fileUploaderConfigSchema.safeParse({
      ...baseConfig,
      unknownProp: "foo",
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults — optional fields are undefined", () => {
    const result = fileUploaderConfigSchema.safeParse(baseConfig);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accept).toBeUndefined();
      expect(result.data.maxSize).toBeUndefined();
      expect(result.data.maxFiles).toBeUndefined();
      expect(result.data.label).toBeUndefined();
      expect(result.data.description).toBeUndefined();
      expect(result.data.variant).toBeUndefined();
      expect(result.data.uploadEndpoint).toBeUndefined();
      expect(result.data.onUpload).toBeUndefined();
    }
  });
  it("accepts ref-backed label and description", () => {
    const result = fileUploaderConfigSchema.safeParse({
      type: "file-uploader",
      label: { from: "uploader.label" },
      description: { from: "uploader.description" },
    });

    expect(result.success).toBe(true);
  });
});
