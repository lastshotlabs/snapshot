import { describe, expect, it } from "vitest";
import { _testing } from "../sync";

const {
  schemaToTs,
  plainFnName,
  hookName,
  isPaginatedSchema,
  generateOperation,
  collectRefs,
  refName,
} = _testing;

// ── schemaToTs ───────────────────────────────────────────────────────────────

describe("schemaToTs", () => {
  it("converts string schema", () => {
    expect(schemaToTs({ type: "string" })).toBe("string");
  });

  it("converts number schema", () => {
    expect(schemaToTs({ type: "number" })).toBe("number");
  });

  it("converts integer schema", () => {
    expect(schemaToTs({ type: "integer" })).toBe("number");
  });

  it("converts boolean schema", () => {
    expect(schemaToTs({ type: "boolean" })).toBe("boolean");
  });

  it("converts array of strings", () => {
    expect(schemaToTs({ type: "array", items: { type: "string" } })).toBe("string[]");
  });

  it("converts nullable string", () => {
    expect(schemaToTs({ type: "string", nullable: true })).toBe("string | null");
  });

  it("converts enum", () => {
    const result = schemaToTs({ enum: ["active", "inactive"] });
    expect(result).toBe("'active' | 'inactive'");
  });

  it("converts $ref", () => {
    expect(schemaToTs({ $ref: "#/components/schemas/User" })).toBe("User");
  });

  it("converts object with properties", () => {
    const result = schemaToTs({
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
    });
    expect(result).toContain("id: string");
    expect(result).toContain("name?: string");
  });

  it("converts allOf", () => {
    const result = schemaToTs({
      allOf: [{ $ref: "#/components/schemas/Base" }, { $ref: "#/components/schemas/Extra" }],
    });
    expect(result).toBe("Base & Extra");
  });

  it("converts oneOf", () => {
    const result = schemaToTs({
      oneOf: [{ type: "string" }, { type: "number" }],
    });
    expect(result).toBe("string | number");
  });

  it("converts Record type for additionalProperties", () => {
    const result = schemaToTs({
      type: "object",
      additionalProperties: { type: "string" },
    });
    expect(result).toBe("Record<string, string>");
  });

  it("returns unknown for empty schema", () => {
    expect(schemaToTs({})).toBe("unknown");
  });
});

// ── plainFnName ──────────────────────────────────────────────────────────────

describe("plainFnName", () => {
  it("uses operationId when provided", () => {
    expect(plainFnName("get", "/users", "listUsers")).toBe("listUsers");
  });

  it("derives from method + path when no operationId", () => {
    expect(plainFnName("get", "/users")).toBe("getUsers");
  });

  it("handles path params", () => {
    expect(plainFnName("get", "/users/{id}")).toBe("getUsersById");
  });

  it("converts kebab-case operationId to camelCase", () => {
    expect(plainFnName("post", "/auth/login", "auth-login")).toBe("authLogin");
  });

  it("handles nested paths", () => {
    expect(plainFnName("post", "/users/{id}/posts")).toBe("postUsersByIdPosts");
  });
});

// ── hookName ─────────────────────────────────────────────────────────────────

describe("hookName", () => {
  it("adds Query suffix for GET", () => {
    expect(hookName("get", "listUsers")).toBe("useListUsersQuery");
  });

  it("adds Mutation suffix for non-GET", () => {
    expect(hookName("post", "createUser")).toBe("useCreateUserMutation");
  });

  it("does not double-suffix if name already ends with Query", () => {
    expect(hookName("get", "usersQuery")).toBe("useUsersQuery");
  });

  it("does not double-suffix if name already ends with Mutation", () => {
    expect(hookName("post", "createUserMutation")).toBe("useCreateUserMutation");
  });
});

// ── isPaginatedSchema ────────────────────────────────────────────────────────

describe("isPaginatedSchema", () => {
  it("detects paginated schema with data array and total", () => {
    const result = isPaginatedSchema({
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "object", properties: { id: { type: "string" } } },
        },
        total: { type: "integer" },
        page: { type: "integer" },
        perPage: { type: "integer" },
      },
    });
    expect(result).not.toBeNull();
    expect(result!.itemSchema).toEqual({
      type: "object",
      properties: { id: { type: "string" } },
    });
  });

  it("returns null for non-paginated schema", () => {
    const result = isPaginatedSchema({
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
      },
    });
    expect(result).toBeNull();
  });

  it("returns null for array schema (not envelope)", () => {
    const result = isPaginatedSchema({
      type: "array",
      items: { type: "string" },
    });
    expect(result).toBeNull();
  });
});

// ── collectRefs / refName ────────────────────────────────────────────────────

describe("collectRefs", () => {
  it("collects $ref from schema", () => {
    const refs = collectRefs({ $ref: "#/components/schemas/User" });
    expect([...refs]).toEqual(["User"]);
  });

  it("collects refs from nested properties", () => {
    const refs = collectRefs({
      type: "object",
      properties: {
        user: { $ref: "#/components/schemas/User" },
        role: { $ref: "#/components/schemas/Role" },
      },
    });
    expect([...refs].sort()).toEqual(["Role", "User"]);
  });

  it("collects refs from array items", () => {
    const refs = collectRefs({
      type: "array",
      items: { $ref: "#/components/schemas/Item" },
    });
    expect([...refs]).toEqual(["Item"]);
  });

  it("returns empty set for plain types", () => {
    const refs = collectRefs({ type: "string" });
    expect(refs.size).toBe(0);
  });
});

describe("refName", () => {
  it("strips component prefix", () => {
    expect(refName("#/components/schemas/User")).toBe("User");
  });
});

// ── generateOperation ────────────────────────────────────────────────────────

describe("generateOperation", () => {
  it("generates a query hook for GET", () => {
    const result = generateOperation(
      "get",
      "/users",
      {
        operationId: "listUsers",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { id: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
      [],
      {},
    );
    expect(result.apiCode).toContain("export const listUsers");
    expect(result.apiCode).toContain("api.get<");
    expect(result.hookCode).toContain("useListUsersQuery");
    expect(result.hookCode).toContain("useQuery");
    expect(result.fnNames).toEqual(["listUsers"]);
  });

  it("generates a mutation hook for POST", () => {
    const result = generateOperation(
      "post",
      "/users",
      {
        operationId: "createUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "string" } },
                },
              },
            },
          },
        },
      },
      [],
      {},
    );
    expect(result.apiCode).toContain("export const createUser");
    expect(result.apiCode).toContain("body:");
    expect(result.hookCode).toContain("useCreateUserMutation");
    expect(result.hookCode).toContain("useMutation");
  });

  it("handles path parameters", () => {
    const result = generateOperation(
      "get",
      "/users/{id}",
      {
        operationId: "getUser",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { id: { type: "string" } },
                },
              },
            },
          },
        },
      },
      [],
      {},
    );
    expect(result.apiCode).toContain("id: string");
    expect(result.hookCode).toContain("params.id");
  });

  it("handles void response", () => {
    const result = generateOperation(
      "delete",
      "/users/{id}",
      {
        operationId: "deleteUser",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "Deleted" },
        },
      },
      [],
      {},
    );
    expect(result.apiCode).toContain("Promise<void>");
  });
});
