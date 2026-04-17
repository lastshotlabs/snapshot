'use client';

import type { DragEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import {
  buildRequestUrl,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import { useManifestRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { FileUploaderConfig, UploadFileEntry } from "./types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function FileRow({
  config,
  entry,
  index,
  rootId,
  onRemove,
}: {
  config: FileUploaderConfig;
  entry: UploadFileEntry;
  index: number;
  rootId: string;
  onRemove: (id: string) => void;
}) {
  const itemId = `${rootId}-file-${index}`;
  const statusColor =
    entry.status === "completed"
      ? "var(--sn-color-success, #16a34a)"
      : entry.status === "error"
        ? "var(--sn-color-destructive, #dc2626)"
        : "var(--sn-color-muted-foreground, #6b7280)";
  const statusSymbol =
    entry.status === "completed"
      ? "\u2713"
      : entry.status === "error"
        ? "\u2717"
        : "\u25CB";

  const itemSurface = resolveSurfacePresentation({
    surfaceId: itemId,
    implementationBase: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: "sm",
      paddingY: "xs",
      paddingX: "sm",
      borderRadius: "sm",
      bg: "var(--sn-color-muted, #f1f5f9)",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.item,
  });
  const statusSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-status`,
    implementationBase: {
      color: statusColor,
      style: {
        flexShrink: 0,
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
      },
    },
    componentSurface: config.slots?.status,
  });
  const fileInfoSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-fileInfo`,
    implementationBase: {
      flex: "1",
      style: {
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.fileInfo,
  });
  const fileNameSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-fileName`,
    implementationBase: {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "block",
      },
    },
    componentSurface: config.slots?.fileName,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-error`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-destructive, #dc2626)",
      style: {
        display: "block",
      },
    },
    componentSurface: config.slots?.error,
  });
  const sizeSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-size`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.size,
  });
  const removeSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-remove`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      cursor: "pointer",
      hover: {
        color: "var(--sn-color-foreground, #111827)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        flexShrink: 0,
        background: "none",
        border: "none",
        padding: "var(--sn-spacing-xs, 0.25rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-none, 1)",
      },
    },
    componentSurface: config.slots?.remove,
  });
  const progressSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-progress`,
    implementationBase: {
      bg: "var(--sn-color-primary, #2563eb)",
      borderRadius: "full",
      style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "2px",
        width: `${entry.progress}%`,
        transition:
          "width var(--sn-duration-fast, 200ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: config.slots?.progress,
  });

  return (
    <>
      <div
        key={entry.id}
        data-testid="file-uploader-file"
        data-status={entry.status}
        data-snapshot-id={itemId}
        className={itemSurface.className}
        style={itemSurface.style}
      >
        <span
          aria-hidden="true"
          data-snapshot-id={`${itemId}-status`}
          className={statusSurface.className}
          style={statusSurface.style}
        >
          {statusSymbol}
        </span>
        <span
          data-snapshot-id={`${itemId}-fileInfo`}
          className={fileInfoSurface.className}
          style={fileInfoSurface.style}
        >
          <span
            data-snapshot-id={`${itemId}-fileName`}
            className={fileNameSurface.className}
            style={fileNameSurface.style}
          >
            {entry.file.name}
          </span>
          {entry.errorMessage ? (
            <span
              data-snapshot-id={`${itemId}-error`}
              className={errorSurface.className}
              style={errorSurface.style}
            >
              {entry.errorMessage}
            </span>
          ) : null}
        </span>
        <span
          data-snapshot-id={`${itemId}-size`}
          className={sizeSurface.className}
          style={sizeSurface.style}
        >
          {formatFileSize(entry.file.size)}
        </span>
        <ButtonControl
          type="button"
          testId="file-uploader-remove"
          surfaceId={`${itemId}-remove`}
          onClick={() => onRemove(entry.id)}
          ariaLabel={`Remove ${entry.file.name}`}
          variant="ghost"
          size="icon"
          surfaceConfig={removeSurface.resolvedConfigForWrapper}
        >
          {"\u00D7"}
        </ButtonControl>
        {entry.status === "uploading" ? (
          <div
            data-testid="file-uploader-progress"
            data-snapshot-id={`${itemId}-progress`}
            className={progressSurface.className}
            style={progressSurface.style}
          />
        ) : null}
      </div>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={statusSurface.scopedCss} />
      <SurfaceStyles css={fileInfoSurface.scopedCss} />
      <SurfaceStyles css={fileNameSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={sizeSurface.scopedCss} />
      <SurfaceStyles css={progressSurface.scopedCss} />
    </>
  );
}

export function FileUploader({ config }: { config: FileUploaderConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const runtime = useManifestRuntime();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileIdCounterRef = useRef(0);
  const [files, setFiles] = useState<UploadFileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const rootId = config.id ?? "file-uploader";

  const variant = config.variant ?? "dropzone";
  const maxFiles = config.maxFiles ?? 1;
  const label = useSubscribe(config.label) as string | undefined;
  const description = useSubscribe(config.description) as string | undefined;
  const resolvedLabel = label ?? "Drop files here or click to browse";

  useEffect(() => {
    if (publish) {
      publish(
        files.map((file) => ({
          name: file.file.name,
          size: file.file.size,
          status: file.status,
          progress: file.progress,
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
      if (!config.uploadEndpoint) {
        return;
      }

      setFiles((prev) =>
        prev.map((file) =>
          file.id === entry.id
            ? { ...file, status: "uploading" as const, progress: 0 }
            : file,
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
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setFiles((prev) =>
                prev.map((file) =>
                  file.id === entry.id ? { ...file, progress } : file,
                ),
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
          xhr.addEventListener("error", () => reject(new Error("Upload failed")));
          xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

          xhr.open(request.method, endpoint);
          xhr.send(formData);
        });

        setFiles((prev) =>
          prev.map((file) =>
            file.id === entry.id
              ? { ...file, status: "completed" as const, progress: 100 }
              : file,
          ),
        );

        if (config.onUpload) {
          void execute(config.onUpload);
        }
      } catch (error) {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === entry.id
              ? {
                  ...file,
                  status: "error" as const,
                  errorMessage:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : file,
          ),
        );
      }
    },
    [config.onUpload, config.uploadEndpoint, execute, runtime?.resources],
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

      if (config.uploadEndpoint) {
        for (const entry of entries) {
          if (entry.status === "pending") {
            void uploadFile(entry);
          }
        }
      }
    },
    [config.uploadEndpoint, files.length, maxFiles, uploadFile, validateFile],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      if (event.dataTransfer.files) {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: variant === "compact" ? "inline-flex" : "block",
      alignItems: variant === "compact" ? "center" : undefined,
      gap: variant === "compact" ? "sm" : undefined,
      style: variant === "compact" ? { flexWrap: "wrap" } : undefined,
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const triggerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger`,
    implementationBase:
      variant === "button"
        ? {
            display: "inline-flex",
            alignItems: "center",
            gap: "xs",
            paddingY: "xs",
            paddingX: "md",
            borderRadius: "md",
            fontSize: "sm",
            fontWeight: "semibold",
            cursor: "pointer",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            bg: "var(--sn-color-card, #ffffff)",
            color: "var(--sn-color-foreground, #111827)",
            hover: {
              bg: "var(--sn-color-accent, var(--sn-color-muted, #f1f5f9))",
            },
            focus: {
              ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
            },
            style: {
              fontFamily: "inherit",
            },
          }
        : {
            paddingY: "xs",
            paddingX: "sm",
            borderRadius: "sm",
            fontSize: "xs",
            cursor: "pointer",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            bg: "var(--sn-color-card, #ffffff)",
            color: "var(--sn-color-foreground, #111827)",
            hover: {
              bg: "var(--sn-color-accent, var(--sn-color-muted, #f1f5f9))",
            },
            focus: {
              ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
            },
            style: {
              fontFamily: "inherit",
            },
          },
    componentSurface: config.slots?.trigger,
  });
  const triggerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-triggerIcon`,
    implementationBase: {},
    componentSurface: config.slots?.triggerIcon,
  });
  const selectedTextSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-selectedText`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.selectedText,
  });
  const dropzoneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropzone`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "xs",
      cursor: "pointer",
      borderRadius: "lg",
      style: {
        border: `var(--sn-border-thick, 2px) dashed ${
          isDragOver
            ? "var(--sn-color-primary, #2563eb)"
            : "var(--sn-color-border, #e5e7eb)"
        }`,
        backgroundColor: isDragOver
          ? "var(--sn-color-accent, #f1f5f9)"
          : "transparent",
        padding: "var(--sn-spacing-xl, 2rem) var(--sn-spacing-lg, 1.5rem)",
        textAlign: "center",
        transition:
          "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: config.slots?.dropzone,
    activeStates: isDragOver ? ["active"] : [],
  });
  const dropzoneIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropzoneIcon`,
    implementationBase: {
      fontSize: "4xl",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        lineHeight: "var(--sn-leading-none, 1)",
      },
    },
    componentSurface: config.slots?.dropzoneIcon,
  });
  const dropzoneLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropzoneLabel`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.dropzoneLabel,
  });
  const dropzoneDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropzoneDescription`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.dropzoneDescription,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "xs",
      style: {
        marginTop: "var(--sn-spacing-sm, 0.5rem)",
      },
    },
    componentSurface: config.slots?.list,
  });

  const hiddenInput = (
    <InputControl
      inputRef={inputRef}
      type="file"
      testId="file-uploader-input"
      accept={config.accept}
      multiple={maxFiles > 1}
      value=""
      onChangeFiles={(selectedFiles) => {
        if (!selectedFiles) {
          return;
        }
        addFiles(selectedFiles);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }}
      surfaceId={`${rootId}-input`}
      surfaceConfig={{ style: { display: "none" } }}
    />
  );

  const fileList = files.length > 0 ? (
    <>
      <div
        data-testid="file-uploader-list"
        data-snapshot-id={`${rootId}-list`}
        className={listSurface.className}
        style={listSurface.style}
      >
        {files.map((entry, index) => (
          <FileRow
            key={entry.id}
            config={config}
            entry={entry}
            index={index}
            rootId={rootId}
            onRemove={removeFile}
          />
        ))}
      </div>
      <SurfaceStyles css={listSurface.scopedCss} />
    </>
  ) : null;

  const compactSelectedText =
    files.length > 0
      ? files.length === 1
        ? files[0]?.file.name
        : `${files.length} files selected`
      : null;

  if (visible === false) {
    return null;
  }

  if (variant === "button") {
    return (
      <>
        <div
          data-snapshot-component="file-uploader"
          data-testid="file-uploader"
          data-variant="button"
          data-snapshot-id={rootId}
          className={rootSurface.className}
          style={rootSurface.style}
        >
          {hiddenInput}
          <ButtonControl
            type="button"
            testId="file-uploader-trigger"
            surfaceId={`${rootId}-trigger`}
            onClick={openPicker}
            variant="ghost"
            size="sm"
            surfaceConfig={triggerSurface.resolvedConfigForWrapper}
          >
            <span
              aria-hidden="true"
              data-snapshot-id={`${rootId}-triggerIcon`}
              className={triggerIconSurface.className}
              style={triggerIconSurface.style}
            >
              {"\u2191"}
            </span>
            <span>{resolvedLabel}</span>
          </ButtonControl>
          {fileList}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={triggerIconSurface.scopedCss} />
      </>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <div
          data-snapshot-component="file-uploader"
          data-testid="file-uploader"
          data-variant="compact"
          data-snapshot-id={rootId}
          className={rootSurface.className}
          style={rootSurface.style}
        >
          {hiddenInput}
          <ButtonControl
            type="button"
            testId="file-uploader-trigger"
            surfaceId={`${rootId}-trigger`}
            onClick={openPicker}
            variant="ghost"
            size="sm"
            surfaceConfig={triggerSurface.resolvedConfigForWrapper}
          >
            Choose file
          </ButtonControl>
          {compactSelectedText ? (
            <span
              data-snapshot-id={`${rootId}-selectedText`}
              className={selectedTextSurface.className}
              style={selectedTextSurface.style}
            >
              {compactSelectedText}
            </span>
          ) : null}
          {fileList}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={selectedTextSurface.scopedCss} />
      </>
    );
  }

  return (
    <>
      <div
        data-snapshot-component="file-uploader"
        data-testid="file-uploader"
        data-variant="dropzone"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {hiddenInput}
        <div
          data-dropzone=""
          data-drag-active={isDragOver ? "" : undefined}
          data-testid="file-uploader-dropzone"
          data-snapshot-id={`${rootId}-dropzone`}
          onClick={openPicker}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label={resolvedLabel}
          className={dropzoneSurface.className}
          style={dropzoneSurface.style}
        >
          <span
            aria-hidden="true"
            data-snapshot-id={`${rootId}-dropzoneIcon`}
            className={dropzoneIconSurface.className}
            style={dropzoneIconSurface.style}
          >
            {"\u2191"}
          </span>
          <span
            data-snapshot-id={`${rootId}-dropzoneLabel`}
            className={dropzoneLabelSurface.className}
            style={dropzoneLabelSurface.style}
          >
            {resolvedLabel}
          </span>
          {description ? (
            <span
              data-snapshot-id={`${rootId}-dropzoneDescription`}
              className={dropzoneDescriptionSurface.className}
              style={dropzoneDescriptionSurface.style}
            >
              {description}
            </span>
          ) : null}
        </div>
        {fileList}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={dropzoneSurface.scopedCss} />
      <SurfaceStyles css={dropzoneIconSurface.scopedCss} />
      <SurfaceStyles css={dropzoneLabelSurface.scopedCss} />
      <SurfaceStyles css={dropzoneDescriptionSurface.scopedCss} />
    </>
  );
}
