'use client';

import type { CSSProperties, DragEvent, KeyboardEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { UploadFileEntry } from "./types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ── FileRow sub-component ────────────────────────────────────────────────────

function FileRow({
  entry,
  index,
  rootId,
  onRemove,
  slots,
}: {
  entry: UploadFileEntry;
  index: number;
  rootId: string;
  onRemove: (id: string) => void;
  slots?: Record<string, Record<string, unknown>>;
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
    componentSurface: slots?.item,
  });
  const statusSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-status`,
    implementationBase: {
      color: statusColor,
      style: { flexShrink: 0, fontSize: "var(--sn-font-size-sm, 0.875rem)" },
    },
    componentSurface: slots?.status,
  });
  const fileInfoSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-fileInfo`,
    implementationBase: { flex: "1", style: { minWidth: 0 } },
    componentSurface: slots?.fileInfo,
  });
  const fileNameSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-fileName`,
    implementationBase: {
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" },
    },
    componentSurface: slots?.fileName,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-error`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-destructive, #dc2626)",
      style: { display: "block" },
    },
    componentSurface: slots?.error,
  });
  const sizeSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-size`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: { flexShrink: 0 },
    },
    componentSurface: slots?.size,
  });
  const removeSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-remove`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      cursor: "pointer",
      hover: { color: "var(--sn-color-foreground, #111827)" },
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
      style: {
        flexShrink: 0,
        background: "none",
        border: "none",
        padding: "var(--sn-spacing-xs, 0.25rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-none, 1)",
      },
    },
    componentSurface: slots?.remove,
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
        transition: "width var(--sn-duration-fast, 200ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: slots?.progress,
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
        <span aria-hidden="true" data-snapshot-id={`${itemId}-status`} className={statusSurface.className} style={statusSurface.style}>
          {statusSymbol}
        </span>
        <span data-snapshot-id={`${itemId}-fileInfo`} className={fileInfoSurface.className} style={fileInfoSurface.style}>
          <span data-snapshot-id={`${itemId}-fileName`} className={fileNameSurface.className} style={fileNameSurface.style}>
            {entry.file.name}
          </span>
          {entry.errorMessage ? (
            <span data-snapshot-id={`${itemId}-error`} className={errorSurface.className} style={errorSurface.style}>
              {entry.errorMessage}
            </span>
          ) : null}
        </span>
        <span data-snapshot-id={`${itemId}-size`} className={sizeSurface.className} style={sizeSurface.style}>
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

// ── Standalone Props ────────────────────���─────────────────────────────────────

export interface FileUploaderBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Display variant. Default: "dropzone". */
  variant?: "dropzone" | "button" | "compact";
  /** Label text for the uploader. */
  label?: string;
  /** Description text shown below the label. */
  description?: string;
  /** Maximum number of files. Default: 1. */
  maxFiles?: number;
  /** Maximum file size in bytes. */
  maxSize?: number;
  /** Accepted file types (e.g. "image/*,.pdf"). */
  accept?: string;
  /** Called when files are added. Receives the new files and should return updated entries with upload status. */
  onFilesAdded?: (files: File[]) => void;
  /** Called when a file is removed. */
  onFileRemoved?: (id: string) => void;
  /** Controlled file entries (for external upload management). */
  files?: UploadFileEntry[];

  // ── Style / Slot overrides ──────────────────���────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────���────────────────────────────���──────────────────────

/**
 * Standalone FileUploader — a file upload component with dropzone, button,
 * and compact variants. No manifest context required.
 *
 * @example
 * ```tsx
 * <FileUploaderBase
 *   variant="dropzone"
 *   label="Upload your files"
 *   maxFiles={5}
 *   accept="image/*"
 *   onFilesAdded={(files) => handleUpload(files)}
 * />
 * ```
 */
export function FileUploaderBase({
  id,
  variant = "dropzone",
  label,
  description,
  maxFiles = 1,
  maxSize,
  accept,
  onFilesAdded,
  onFileRemoved,
  files: controlledFiles,
  className,
  style,
  slots,
}: FileUploaderBaseProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileIdCounterRef = useRef(0);
  const [internalFiles, setInternalFiles] = useState<UploadFileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const rootId = id ?? "file-uploader";

  const files = controlledFiles ?? internalFiles;
  const resolvedLabel = label ?? "Drop files here or click to browse";

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`;
      }
      return null;
    },
    [maxSize],
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const remaining = maxFiles - files.length;
      const toAdd = fileArray.slice(0, Math.max(0, remaining));

      if (onFilesAdded) {
        onFilesAdded(toAdd);
        return;
      }

      // Internal state management when uncontrolled
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

      setInternalFiles((prev) => [...prev, ...entries]);
    },
    [files.length, maxFiles, onFilesAdded, validateFile],
  );

  const removeFile = useCallback(
    (fileId: string) => {
      if (onFileRemoved) {
        onFileRemoved(fileId);
        return;
      }
      setInternalFiles((prev) => prev.filter((file) => file.id !== fileId));
    },
    [onFileRemoved],
  );

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
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
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
            border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            bg: "var(--sn-color-card, #ffffff)",
            color: "var(--sn-color-foreground, #111827)",
            hover: { bg: "var(--sn-color-accent, var(--sn-color-muted, #f1f5f9))" },
            focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
            style: { fontFamily: "inherit" },
          }
        : {
            paddingY: "xs",
            paddingX: "sm",
            borderRadius: "sm",
            fontSize: "xs",
            cursor: "pointer",
            border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            bg: "var(--sn-color-card, #ffffff)",
            color: "var(--sn-color-foreground, #111827)",
            hover: { bg: "var(--sn-color-accent, var(--sn-color-muted, #f1f5f9))" },
            focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
            style: { fontFamily: "inherit" },
          },
    componentSurface: slots?.trigger,
  });
  const triggerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-triggerIcon`,
    implementationBase: {},
    componentSurface: slots?.triggerIcon,
  });
  const selectedTextSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-selectedText`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.selectedText,
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
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
    },
    componentSurface: slots?.dropzone,
    activeStates: isDragOver ? ["active"] : [],
  });
  const dropzoneIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropzoneIcon`,
    implementationBase: {
      fontSize: "4xl",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: { lineHeight: "var(--sn-leading-none, 1)" },
    },
    componentSurface: slots?.dropzoneIcon,
  });
  const dropzoneLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropzoneLabel`,
    implementationBase: { fontSize: "sm", color: "var(--sn-color-foreground, #111827)" },
    componentSurface: slots?.dropzoneLabel,
  });
  const dropzoneDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropzoneDescription`,
    implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)" },
    componentSurface: slots?.dropzoneDescription,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "xs",
      style: { marginTop: "var(--sn-spacing-sm, 0.5rem)" },
    },
    componentSurface: slots?.list,
  });

  const hiddenInput = (
    <InputControl
      inputRef={inputRef}
      type="file"
      testId="file-uploader-input"
      accept={accept}
      multiple={maxFiles > 1}
      value=""
      onChangeFiles={(selectedFiles) => {
        if (!selectedFiles) return;
        addFiles(selectedFiles);
        if (inputRef.current) inputRef.current.value = "";
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
            entry={entry}
            index={index}
            rootId={rootId}
            onRemove={removeFile}
            slots={slots}
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
            <span aria-hidden="true" data-snapshot-id={`${rootId}-triggerIcon`} className={triggerIconSurface.className} style={triggerIconSurface.style}>
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
            <span data-snapshot-id={`${rootId}-selectedText`} className={selectedTextSurface.className} style={selectedTextSurface.style}>
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
          <span aria-hidden="true" data-snapshot-id={`${rootId}-dropzoneIcon`} className={dropzoneIconSurface.className} style={dropzoneIconSurface.style}>
            {"\u2191"}
          </span>
          <span data-snapshot-id={`${rootId}-dropzoneLabel`} className={dropzoneLabelSurface.className} style={dropzoneLabelSurface.style}>
            {resolvedLabel}
          </span>
          {description ? (
            <span data-snapshot-id={`${rootId}-dropzoneDescription`} className={dropzoneDescriptionSurface.className} style={dropzoneDescriptionSurface.style}>
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
