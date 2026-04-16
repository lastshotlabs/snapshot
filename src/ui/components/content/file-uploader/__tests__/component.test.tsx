// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { ManifestRuntimeProvider } from "../../../../manifest/runtime";
import { FileUploader } from "../component";
import type { FileUploaderConfig } from "../types";

function createTestWrapper(options?: {
  resources?: Record<
    string,
    {
      method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
      endpoint: string;
      params?: Record<string, unknown>;
    }
  >;
}) {
  const registry = new AtomRegistryImpl();
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <ManifestRuntimeProvider
        api={undefined}
        manifest={{
          raw: { routes: [] },
          app: { shell: "full-width", currencyDivisor: 100 },
          resources: options?.resources,
          routes: [],
          routeMap: {},
          firstRoute: null,
        }}
      >
        <AppRegistryContext.Provider value={null}>
          <PageRegistryContext.Provider value={registry}>
            <SnapshotApiContext.Provider value={null}>
              {children}
            </SnapshotApiContext.Provider>
          </PageRegistryContext.Provider>
        </AppRegistryContext.Provider>
      </ManifestRuntimeProvider>
    );
  };
}

const baseConfig: FileUploaderConfig = {
  type: "file-uploader",
};

describe("FileUploader", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("renders with data-snapshot-component attribute", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={{ ...baseConfig, className: "uploader-root" }} />, { wrapper });

    expect(
      screen
        .getByTestId("file-uploader")
        .getAttribute("data-snapshot-component"),
    ).toBe("file-uploader");
    expect(screen.getByTestId("file-uploader").classList.contains("uploader-root")).toBe(
      true,
    );
  });

  it("renders dropzone variant by default", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    expect(
      screen.getByTestId("file-uploader").getAttribute("data-variant"),
    ).toBe("dropzone");
    expect(screen.getByTestId("file-uploader-dropzone")).toBeTruthy();
  });

  it("renders default label text", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    expect(screen.getByTestId("file-uploader-dropzone").textContent).toContain(
      "Drop files here or click to browse",
    );
  });

  it("renders custom label and description", () => {
    const wrapper = createTestWrapper();
    const config: FileUploaderConfig = {
      ...baseConfig,
      label: "Upload photos",
      description: "JPG or PNG, max 2MB",
    };

    render(<FileUploader config={config} />, { wrapper });

    const dropzone = screen.getByTestId("file-uploader-dropzone");
    expect(dropzone.textContent).toContain("Upload photos");
    expect(dropzone.textContent).toContain("JPG or PNG, max 2MB");
  });

  it("renders button variant", () => {
    const wrapper = createTestWrapper();
    const config: FileUploaderConfig = {
      ...baseConfig,
      variant: "button",
    };

    render(<FileUploader config={config} />, { wrapper });

    expect(
      screen.getByTestId("file-uploader").getAttribute("data-variant"),
    ).toBe("button");
    expect(screen.getByTestId("file-uploader-trigger")).toBeTruthy();
  });

  it("renders compact variant", () => {
    const wrapper = createTestWrapper();
    const config: FileUploaderConfig = {
      ...baseConfig,
      variant: "compact",
    };

    render(<FileUploader config={config} />, { wrapper });

    expect(
      screen.getByTestId("file-uploader").getAttribute("data-variant"),
    ).toBe("compact");
    expect(screen.getByTestId("file-uploader-trigger")).toBeTruthy();
  });

  it("has hidden file input", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input");
    expect(input).toBeTruthy();
    expect(input.getAttribute("type")).toBe("file");
    expect((input as HTMLElement).style.display).toBe("none");
  });

  it("sets accept attribute on file input", () => {
    const wrapper = createTestWrapper();
    const config: FileUploaderConfig = {
      ...baseConfig,
      accept: "image/*,.pdf",
    };

    render(<FileUploader config={config} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input");
    expect(input.getAttribute("accept")).toBe("image/*,.pdf");
  });

  it("sets multiple attribute when maxFiles > 1", () => {
    const wrapper = createTestWrapper();
    const config: FileUploaderConfig = {
      ...baseConfig,
      maxFiles: 5,
    };

    render(<FileUploader config={config} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it("does not set multiple when maxFiles is 1", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    expect(input.multiple).toBe(false);
  });

  it("shows file list after file selection", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File(["hello"], "test.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByTestId("file-uploader-list")).toBeTruthy();
    expect(screen.getByTestId("file-uploader-file")).toBeTruthy();
    expect(screen.getByTestId("file-uploader-file").textContent).toContain(
      "test.txt",
    );
  });

  it("shows remove button for each file", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File(["hello"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByTestId("file-uploader-remove")).toBeTruthy();
  });

  it("removes file when remove button is clicked", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File(["hello"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByTestId("file-uploader-file")).toBeTruthy();

    fireEvent.click(screen.getByTestId("file-uploader-remove"));

    expect(screen.queryByTestId("file-uploader-file")).toBeNull();
  });

  it("marks file as error if exceeds maxSize", () => {
    const wrapper = createTestWrapper();
    const config: FileUploaderConfig = {
      ...baseConfig,
      maxSize: 10, // 10 bytes
    };

    render(<FileUploader config={config} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File(["this is more than 10 bytes"], "big.txt", {
      type: "text/plain",
    });
    fireEvent.change(input, { target: { files: [file] } });

    const fileEntry = screen.getByTestId("file-uploader-file");
    expect(fileEntry.getAttribute("data-status")).toBe("error");
  });

  it("dropzone has role=button and tabIndex for accessibility", () => {
    const wrapper = createTestWrapper();
    render(<FileUploader config={baseConfig} />, { wrapper });

    const dropzone = screen.getByTestId("file-uploader-dropzone");
    expect(dropzone.getAttribute("role")).toBe("button");
    expect(dropzone.getAttribute("tabindex")).toBe("0");
  });

  it("resolves resource-backed upload endpoints before sending files", () => {
    const open = vi.fn();
    const send = vi.fn();

    class MockXMLHttpRequest {
      upload = {
        addEventListener: vi.fn(),
      };

      status = 201;

      addEventListener(event: string, callback: () => void) {
        if (event === "load") {
          setTimeout(callback, 0);
        }
      }

      open = open;
      send = send;
    }

    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);

    const wrapper = createTestWrapper({
      resources: {
        uploads: {
          method: "PUT",
          endpoint: "/api/uploads/{folder}",
          params: {
            folder: "docs",
          },
        },
      },
    });
    const config: FileUploaderConfig = {
      ...baseConfig,
      uploadEndpoint: {
        resource: "uploads",
        params: {
          scope: "contracts",
        },
      },
    };

    render(<FileUploader config={config} />, { wrapper });

    const input = screen.getByTestId("file-uploader-input") as HTMLInputElement;
    const file = new File(["hello"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(open).toHaveBeenCalledWith(
      "PUT",
      "/api/uploads/docs?scope=contracts",
    );
    expect(send).toHaveBeenCalled();
  });
});
