import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { endpointTargetSchema } from "../../../manifest/resources";

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
export const fileUploaderConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("file-uploader"),
    /** File type filter for the native file picker (e.g., "image/*,.pdf"). */
    accept: z.string().optional(),
    /** Maximum file size in bytes. */
    maxSize: z.number().optional(),
    /** Maximum number of files. Default: 1. */
    maxFiles: z.number().optional(),
    /** Label displayed in the dropzone. */
    label: z.string().optional(),
    /** Helper text displayed below the label. */
    description: z.string().optional(),
    /** Visual layout variant. Default: "dropzone". */
    variant: z.enum(["dropzone", "button", "compact"]).optional(),
    /** Endpoint to POST files to (as FormData). */
    uploadEndpoint: endpointTargetSchema.optional(),
    /** Action dispatched after a successful upload. */
    onUpload: actionSchema.optional(),
    // --- BaseComponentConfig fields ---
    /** Component id for publishing/subscribing. */
    id: z.string().optional(),
    /** Inline style overrides. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
    /** Additional CSS class name. */
    className: z.string().optional(),
  })
  .strict();
