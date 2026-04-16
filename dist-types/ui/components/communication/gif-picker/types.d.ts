import type { z } from "zod";
import type { gifPickerConfigSchema } from "./schema";
/** Inferred config type from the GifPicker Zod schema. */
export type GifPickerConfig = z.input<typeof gifPickerConfigSchema>;
/** Shape of a GIF entry. */
export interface GifEntry {
    id: string;
    url: string;
    preview?: string;
    width?: number;
    height?: number;
    title?: string;
}
