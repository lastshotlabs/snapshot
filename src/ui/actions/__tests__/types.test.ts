// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import {
  actionSchema,
  navigateActionSchema,
  apiActionSchema,
  openModalActionSchema,
  closeModalActionSchema,
  refreshActionSchema,
  setValueActionSchema,
  downloadActionSchema,
  confirmActionSchema,
  toastActionSchema,
  trackActionSchema,
  runWorkflowActionSchema,
} from "../types";

describe("Action Zod Schemas", () => {
  describe("navigateActionSchema", () => {
    it("accepts a valid navigate action", () => {
      const result = navigateActionSchema.safeParse({
        type: "navigate",
        to: "/users",
      });
      expect(result.success).toBe(true);
    });

    it("accepts navigate with replace", () => {
      const result = navigateActionSchema.safeParse({
        type: "navigate",
        to: "/users",
        replace: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects navigate without to", () => {
      const result = navigateActionSchema.safeParse({ type: "navigate" });
      expect(result.success).toBe(false);
    });

    it("rejects extra properties", () => {
      const result = navigateActionSchema.safeParse({
        type: "navigate",
        to: "/users",
        extra: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("apiActionSchema", () => {
    it("accepts a valid api action", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "GET",
        endpoint: "/api/users",
      });
      expect(result.success).toBe(true);
    });

    it("accepts an api action with a resource endpoint", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "GET",
        endpoint: { resource: "users.list" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts api with body and params", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "POST",
        endpoint: "/api/users",
        body: { name: "Alice" },
        params: { page: 1 },
        invalidates: ["users.list"],
      });
      expect(result.success).toBe(true);
    });

    it("accepts api with from-ref body", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "POST",
        endpoint: "/api/users",
        body: { from: "form-data" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts recursive onSuccess", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "DELETE",
        endpoint: "/api/users/{id}",
        onSuccess: {
          type: "toast",
          message: "Deleted",
        },
      });
      expect(result.success).toBe(true);
    });

    it("accepts onSuccess as array", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "DELETE",
        endpoint: "/api/users/{id}",
        onSuccess: [
          { type: "refresh", target: "users-table" },
          { type: "toast", message: "Deleted" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("accepts recursive onError", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "DELETE",
        endpoint: "/api/users/{id}",
        onError: { type: "toast", message: "Failed", variant: "error" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid method", () => {
      const result = apiActionSchema.safeParse({
        type: "api",
        method: "INVALID",
        endpoint: "/api/users",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("openModalActionSchema", () => {
    it("accepts a valid open-modal action", () => {
      const result = openModalActionSchema.safeParse({
        type: "open-modal",
        modal: "edit-user",
        payload: { userId: "1" },
        resultTarget: "global.editResult",
      });
      expect(result.success).toBe(true);
    });

    it("rejects without modal", () => {
      const result = openModalActionSchema.safeParse({ type: "open-modal" });
      expect(result.success).toBe(false);
    });
  });

  describe("closeModalActionSchema", () => {
    it("accepts close-modal with id", () => {
      const result = closeModalActionSchema.safeParse({
        type: "close-modal",
        modal: "edit-user",
        result: { saved: true },
      });
      expect(result.success).toBe(true);
    });

    it("accepts close-modal without id (closes topmost)", () => {
      const result = closeModalActionSchema.safeParse({
        type: "close-modal",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("refreshActionSchema", () => {
    it("accepts a valid refresh action", () => {
      const result = refreshActionSchema.safeParse({
        type: "refresh",
        target: "users-table",
      });
      expect(result.success).toBe(true);
    });

    it("rejects without target", () => {
      const result = refreshActionSchema.safeParse({ type: "refresh" });
      expect(result.success).toBe(false);
    });
  });

  describe("setValueActionSchema", () => {
    it("accepts a valid set-value action", () => {
      const result = setValueActionSchema.safeParse({
        type: "set-value",
        target: "search-input",
        value: "hello",
      });
      expect(result.success).toBe(true);
    });

    it("accepts set-value with object value", () => {
      const result = setValueActionSchema.safeParse({
        type: "set-value",
        target: "filter",
        value: { status: "active" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts set-value with null value", () => {
      const result = setValueActionSchema.safeParse({
        type: "set-value",
        target: "selection",
        value: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("downloadActionSchema", () => {
    it("accepts a valid download action", () => {
      const result = downloadActionSchema.safeParse({
        type: "download",
        endpoint: "/api/report.pdf",
      });
      expect(result.success).toBe(true);
    });

    it("accepts a download action with a resource endpoint", () => {
      const result = downloadActionSchema.safeParse({
        type: "download",
        endpoint: { resource: "reports.latest" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts download with filename", () => {
      const result = downloadActionSchema.safeParse({
        type: "download",
        endpoint: "/api/report.pdf",
        filename: "report.pdf",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("confirmActionSchema", () => {
    it("accepts a valid confirm action", () => {
      const result = confirmActionSchema.safeParse({
        type: "confirm",
        message: "Are you sure?",
      });
      expect(result.success).toBe(true);
    });

    it("accepts confirm with all options", () => {
      const result = confirmActionSchema.safeParse({
        type: "confirm",
        message: "Delete this?",
        confirmLabel: "Yes, delete",
        cancelLabel: "No, keep",
        variant: "destructive",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid variant", () => {
      const result = confirmActionSchema.safeParse({
        type: "confirm",
        message: "Are you sure?",
        variant: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("toastActionSchema", () => {
    it("accepts a valid toast action", () => {
      const result = toastActionSchema.safeParse({
        type: "toast",
        message: "Saved!",
      });
      expect(result.success).toBe(true);
    });

    it("accepts toast with all options", () => {
      const result = toastActionSchema.safeParse({
        type: "toast",
        message: "Saved!",
        variant: "success",
        duration: 3000,
      });
      expect(result.success).toBe(true);
    });

    it("accepts toast with recursive action button", () => {
      const result = toastActionSchema.safeParse({
        type: "toast",
        message: "Deleted",
        variant: "success",
        action: {
          label: "Undo",
          action: {
            type: "api",
            method: "POST",
            endpoint: "/api/users/{id}/restore",
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid variant", () => {
      const result = toastActionSchema.safeParse({
        type: "toast",
        message: "Hello",
        variant: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("runWorkflowActionSchema", () => {
    it("accepts a valid run-workflow action", () => {
      const result = runWorkflowActionSchema.safeParse({
        type: "run-workflow",
        workflow: "users.delete",
      });
      expect(result.success).toBe(true);
    });

    it("accepts run-workflow with input", () => {
      const result = runWorkflowActionSchema.safeParse({
        type: "run-workflow",
        workflow: "users.delete",
        input: { userId: 42 },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("trackActionSchema", () => {
    it("accepts a valid track action", () => {
      const result = trackActionSchema.safeParse({
        type: "track",
        event: "user.signup",
        props: { plan: "pro" },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("actionSchema (discriminated union)", () => {
    it("parses each valid action type", () => {
      const configs = [
        { type: "navigate", to: "/users" },
        { type: "api", method: "GET", endpoint: "/api/users" },
        { type: "open-modal", modal: "edit" },
        { type: "close-modal" },
        { type: "refresh", target: "table" },
        { type: "set-value", target: "x", value: 1 },
        { type: "download", endpoint: "/file" },
        { type: "confirm", message: "Sure?" },
        { type: "toast", message: "Done" },
        { type: "track", event: "button.clicked" },
        { type: "run-workflow", workflow: "users.delete" },
      ];
      for (const config of configs) {
        const result = actionSchema.safeParse(config);
        expect(result.success).toBe(true);
      }
    });

    it("rejects unknown action type", () => {
      const result = actionSchema.safeParse({
        type: "unknown",
        foo: "bar",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid configs", () => {
      const result = actionSchema.safeParse({ type: "navigate" }); // missing 'to'
      expect(result.success).toBe(false);
    });

    it("validates deeply nested recursive actions", () => {
      const result = actionSchema.safeParse({
        type: "api",
        method: "DELETE",
        endpoint: "/api/items/{id}",
        onSuccess: [
          { type: "refresh", target: "items" },
          {
            type: "toast",
            message: "Deleted",
            action: {
              label: "Undo",
              action: {
                type: "api",
                method: "POST",
                endpoint: "/api/items/{id}/restore",
                onSuccess: { type: "refresh", target: "items" },
              },
            },
          },
        ],
        onError: { type: "toast", message: "Failed", variant: "error" },
      });
      expect(result.success).toBe(true);
    });
  });
});
