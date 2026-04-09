import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import {
  buildRequestUrl,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import { useManifestRuntime } from "../../../manifest/runtime";
import type { FileUploaderConfig, UploadFileEntry } from "./types";

/**
 * Format bytes into a human-readable string (KB, MB, GB).
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * FileUploader component — a drag-and-drop file upload zone with file list,
 * progress tracking, and optional endpoint upload.
 *
 * Supports three variants: "dropzone" (large dashed area), "button" (styled
 * button), and "compact" (inline button with filename).
 *
 * @param props.config - The file uploader config from the manifest
 *
 * @example
 * ```json
 * {
 *   "type": "file-uploader",
 *   "accept": "image/*,.pdf",
 *   "maxSize": 5242880,
 *   "maxFiles": 5,
 *   "label": "Upload documents",
 *   "variant": "dropzone"
 * }
 * ```
 */
export function FileUploader({ config }: { config: FileUploaderConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const runtime = useManifestRuntime();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileIdCounterRef = useRef(0);
  const [files, setFiles] = useState<UploadFileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const variant = config.variant ?? "dropzone";
  const maxFiles = config.maxFiles ?? 1;
  const label = config.label ?? "Drop files here or click to browse";
  const description = config.description;

  // Publish file list when it changes
  useEffect(() => {
    if (publish) {
      publish(
        files.map((f) => ({
          name: f.file.name,
          size: f.file.size,
          status: f.status,
          progress: f.progress,
        })),
      );
    }
  }, [publish, files]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (config.maxSize && file.size > config.maxSize) {
        return `File "${file.name}" exceeds maximum size of ${formatFileSize(config.maxSize)}`;
      }
      return null;
    },
    [config.maxSize],
  );

  const uploadFile = useCallback(
    async (entry: UploadFileEntry) => {
      if (!config.uploadEndpoint) return;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? { ...f, status: "uploading" as const, progress: 0 }
            : f,
        ),
      );

      try {
        const request = resolveEndpointTarget(
          config.uploadEndpoint,
          runtime?.resources,
          undefined,
          "POST",
        );
        const endpoint = buildRequestUrl(request.endpoint, request.params);
        const formData = new FormData();
        formData.append("file", entry.file);

        const xhr = new XMLHttpRequest();

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setFiles((prev) =>
                prev.map((f) => (f.id === entry.id ? { ...f, progress } : f)),
              );
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Upload failed")),
          );
          xhr.addEventListener("abort", () =>
            reject(new Error("Upload aborted")),
          );

          xhr.open(request.method, endpoint);
          xhr.send(formData);
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "completed" as const, progress: 100 }
              : f,
          ),
        );

        if (config.onUpload) {
          void execute(config.onUpload);
        }
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  status: "error" as const,
                  errorMessage:
                    err instanceof Error ? err.message : "Upload failed",
                }
              : f,
          ),
        );
      }
    },
    [config.uploadEndpoint, config.onUpload, execute, runtime?.resources],
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const remaining = maxFiles - files.length;
      const toAdd = fileArray.slice(0, Math.max(0, remaining));

      const entries: UploadFileEntry[] = [];
      for (const file of toAdd) {
        const validationError = validateFile(file);
        if (validationError) {
          entries.push({
            file,
            id: `file-${++fileIdCounterRef.current}`,
            status: "error",
            progress: 0,
            errorMessage: validationError,
          });
        } else {
          entries.push({
            file,
            id: `file-${++fileIdCounterRef.current}`,
            status: "pending",
            progress: 0,
          });
        }
      }

      setFiles((prev) => [...prev, ...entries]);

      // Auto-upload pending entries if endpoint is configured
      if (config.uploadEndpoint) {
        for (const entry of entries) {
          if (entry.status === "pending") {
            void uploadFile(entry);
          }
        }
      }
    },
    [files.length, maxFiles, validateFile, config.uploadEndpoint, uploadFile],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
        // Reset input so the same file can be re-selected
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  // Hidden file input
  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      data-testid="file-uploader-input"
      accept={config.accept}
      multiple={maxFiles > 1}
      onChange={handleInputChange}
      style={{ display: "none" }}
    />
  );

  // File list rendering
  const fileList =
    files.length > 0 ? (
      <div
        data-testid="file-uploader-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          marginTop: "var(--sn-spacing-sm, 0.5rem)",
        }}
      >
        {files.map((entry) => (
          <div
            key={entry.id}
            data-testid="file-uploader-file"
            data-status={entry.status}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-sm, 0.5rem)",
              padding:
                "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              backgroundColor: "var(--sn-color-muted, #f1f5f9)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-foreground, #111827)",
            }}
          >
            {/* Status icon */}
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color:
                  entry.status === "completed"
                    ? "var(--sn-color-success, #16a34a)"
                    : entry.status === "error"
                      ? "var(--sn-color-destructive, #dc2626)"
                      : "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              {entry.status === "completed"
                ? "\u2713"
                : entry.status === "error"
                  ? "\u2717"
                  : "\u25CB"}
            </span>

            {/* File info */}
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {entry.file.name}
              </span>
              {entry.errorMessage && (
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    color: "var(--sn-color-destructive, #dc2626)",
                  }}
                >
                  {entry.errorMessage}
                </span>
              )}
            </span>

            {/* File size */}
            <span
              style={{
                flexShrink: 0,
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              {formatFileSize(entry.file.size)}
            </span>

            {/* Remove button */}
            <button
              type="button"
              data-testid="file-uploader-remove"
              onClick={() => removeFile(entry.id)}
              aria-label={`Remove ${entry.file.name}`}
              style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "var(--sn-spacing-xs, 0.25rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                lineHeight: "var(--sn-leading-none, 1)",
              }}
            >
              {"\u00D7"}
            </button>

            {/* Progress bar for uploading state */}
            {entry.status === "uploading" && (
              <div
                data-testid="file-uploader-progress"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "2px",
                  width: `${entry.progress}%`,
                  backgroundColor: "var(--sn-color-primary, #2563eb)",
                  borderRadius: "var(--sn-radius-full, 9999px)",
                  transition:
                    "width var(--sn-duration-fast, 200ms) var(--sn-ease-default, ease)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    ) : null;

  // Button variant
  if (variant === "button") {
    return (
      <div
        data-snapshot-component="file-uploader"
        data-testid="file-uploader"
        data-variant="button"
        className={config.className}
        style={{
          ...((config.style as React.CSSProperties) ?? {}),
        }}
      >
        {hiddenInput}
        <button
          type="button"
          data-testid="file-uploader-trigger"
          onClick={openPicker}
          style={{
            padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)",
            cursor: "pointer",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            color: "var(--sn-color-foreground, #111827)",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          <span aria-hidden="true">{"\u2191"}</span>
          <span>{label}</span>
        </button>
        {fileList}
        <style>{`
          [data-snapshot-component="file-uploader"] button:hover {
            background: var(--sn-color-accent, var(--sn-color-muted));
          }
          [data-snapshot-component="file-uploader"] button:focus {
            outline: none;
          }
          [data-snapshot-component="file-uploader"] button:focus-visible {
            outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
            outline-offset: var(--sn-ring-offset, 2px);
          }
          [data-snapshot-component="file-uploader"] [data-testid="file-uploader-dropzone"]:focus {
            outline: none;
          }
          [data-snapshot-component="file-uploader"] [data-testid="file-uploader-dropzone"]:focus-visible {
            outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
            outline-offset: var(--sn-ring-offset, 2px);
          }
        `}</style>
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div
        data-snapshot-component="file-uploader"
        data-testid="file-uploader"
        data-variant="compact"
        className={config.className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          flexWrap: "wrap",
          ...((config.style as React.CSSProperties) ?? {}),
        }}
      >
        {hiddenInput}
        <button
          type="button"
          data-testid="file-uploader-trigger"
          onClick={openPicker}
          style={{
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            cursor: "pointer",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            backgroundColor: "var(--sn-color-card, #ffffff)",
            color: "var(--sn-color-foreground, #111827)",
            fontFamily: "inherit",
          }}
        >
          Choose file
        </button>
        {files.length > 0 && (
          <span
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {files.length === 1
              ? files[0]?.file.name
              : `${files.length} files selected`}
          </span>
        )}
        {fileList}
        <style>{`
          [data-snapshot-component="file-uploader"] button:hover {
            background: var(--sn-color-accent, var(--sn-color-muted));
          }
          [data-snapshot-component="file-uploader"] button:focus {
            outline: none;
          }
          [data-snapshot-component="file-uploader"] button:focus-visible {
            outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
            outline-offset: var(--sn-ring-offset, 2px);
          }
          [data-snapshot-component="file-uploader"] [data-testid="file-uploader-dropzone"]:focus {
            outline: none;
          }
          [data-snapshot-component="file-uploader"] [data-testid="file-uploader-dropzone"]:focus-visible {
            outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
            outline-offset: var(--sn-ring-offset, 2px);
          }
        `}</style>
      </div>
    );
  }

  // Dropzone variant (default)
  return (
    <div
      data-snapshot-component="file-uploader"
      data-testid="file-uploader"
      data-variant="dropzone"
      className={config.className}
      style={{
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {hiddenInput}
      <div
        data-testid="file-uploader-dropzone"
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={label}
        style={{
          border: `var(--sn-border-thick, 2px) dashed ${
            isDragOver
              ? "var(--sn-color-primary, #2563eb)"
              : "var(--sn-color-border, #e5e7eb)"
          }`,
          borderRadius: "var(--sn-radius-lg, 0.75rem)",
          backgroundColor: isDragOver
            ? "var(--sn-color-accent, #f1f5f9)"
            : "transparent",
          padding: "var(--sn-spacing-xl, 2rem) var(--sn-spacing-lg, 1.5rem)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          cursor: "pointer",
          transition:
            "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
          textAlign: "center",
        }}
      >
        {/* Upload icon */}
        <span
          aria-hidden="true"
          style={{
            fontSize: "var(--sn-font-size-4xl, 2.25rem)",
            lineHeight: "var(--sn-leading-none, 1)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          {"\u2191"}
        </span>

        {/* Label */}
        <span
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          {label}
        </span>

        {/* Description */}
        {description && (
          <span
            style={{
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {description}
          </span>
        )}
      </div>

      {fileList}
      <style>{`
        [data-snapshot-component="file-uploader"] button:hover {
          background: var(--sn-color-accent, var(--sn-color-muted));
        }
        [data-snapshot-component="file-uploader"] button:focus {
          outline: none;
        }
        [data-snapshot-component="file-uploader"] button:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        [data-snapshot-component="file-uploader"] [data-testid="file-uploader-dropzone"]:focus {
          outline: none;
        }
        [data-snapshot-component="file-uploader"] [data-testid="file-uploader-dropzone"]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
      `}</style>
    </div>
  );
}
