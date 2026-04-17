import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { endpointTargetSchema } from "../../../manifest/resources";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod config schema for the FileUploader component.
 *
 * Renders a drag-and-drop file upload zone with file list,
 * progress tracking, and optional endpoint upload.
 *
 * @example
 * ```json
 * {
 *   "type": "file-uploader",
 *   "accept": "image/*,.pdf",
 *   "maxSize": 5242880,
 *   "maxFiles": 5,
 *   "label": "Upload documents",
 *   "description": "PDF or images up to 5MB each",
 *   "uploadEndpoint": "POST /api/uploads"
 * }
 * ```
 */
export const fileUploaderConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("file-uploader"),
    /** File type filter for the native file picker (e.g., "image/*,.pdf"). */
    accept: z.string().optional(),
    /** Maximum file size in bytes. */
    maxSize: z.number().optional(),
    /** Maximum number of files. Default: 1. */
    maxFiles: z.number().optional(),
    /** Label displayed in the dropzone. */
    label: z.union([z.string(), fromRefSchema]).optional(),
    /** Helper text displayed below the label. */
    description: z.union([z.string(), fromRefSchema]).optional(),
    /** Visual layout variant. Default: "dropzone". */
    variant: z.enum(["dropzone", "button", "compact"]).optional(),
    /** Endpoint to POST files to (as FormData). */
    uploadEndpoint: endpointTargetSchema.optional(),
    /** Action dispatched after a successful upload. */
    onUpload: actionSchema.optional(),
    slots: slotsSchema([
      "root",
      "trigger",
      "triggerIcon",
      "selectedText",
      "dropzone",
      "dropzoneIcon",
      "dropzoneLabel",
      "dropzoneDescription",
      "list",
      "item",
      "status",
      "fileInfo",
      "fileName",
      "error",
      "size",
      "remove",
      "progress",
    ]).optional(),
  }).strict();
