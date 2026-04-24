'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import {
  buildRequestUrl,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import { useManifestRuntime } from "../../../manifest/runtime";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { FileUploaderBase } from "./standalone";
import type { FileUploaderConfig, UploadFileEntry } from "./types";

/**
 * Manifest adapter — resolves config refs, handles manifest-based upload,
 * and delegates rendering to FileUploaderBase.
 */
export function FileUploader({ config }: { config: FileUploaderConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const runtime = useManifestRuntime();
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    label: config.label,
    description: config.description,
  });
  const fileIdCounterRef = useRef(0);
  const [files, setFiles] = useState<UploadFileEntry[]>([]);
  const rootId = config.id ?? "file-uploader";

  const label = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const description = resolveOptionalPrimitiveValue(
    resolvedConfig.description,
    primitiveOptions,
  );

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

  const uploadFile = useCallback(
    async (entry: UploadFileEntry) => {
      if (!config.uploadEndpoint) return;

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
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed with status ${xhr.status}`));
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

  const handleFilesAdded = useCallback(
    (newFiles: File[]) => {
      const entries: UploadFileEntry[] = newFiles.map((file) => {
        const isTooLarge = config.maxSize != null && file.size > config.maxSize;
        return {
          file,
          id: `file-${++fileIdCounterRef.current}`,
          status: isTooLarge ? ("error" as const) : ("pending" as const),
          progress: 0,
          errorMessage: isTooLarge
            ? `File "${file.name}" exceeds maximum size`
            : undefined,
        };
      });
      setFiles((prev) => [...prev, ...entries]);

      if (config.uploadEndpoint) {
        for (const entry of entries) {
          if (entry.status !== "error") {
            void uploadFile(entry);
          }
        }
      }
    },
    [config.maxSize, config.uploadEndpoint, uploadFile],
  );

  const handleFileRemoved = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  if (visible === false) return null;

  return (
    <FileUploaderBase
      id={rootId}
      variant={config.variant}
      label={label}
      description={description}
      maxFiles={config.maxFiles}
      maxSize={config.maxSize}
      accept={config.accept}
      onFilesAdded={handleFilesAdded}
      onFileRemoved={handleFileRemoved}
      files={files}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
