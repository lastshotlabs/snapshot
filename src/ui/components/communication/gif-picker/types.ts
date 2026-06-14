
/** Inferred config type from the GifPicker Zod schema. */
export type GifPickerConfig = Record<string, unknown>;

/** Shape of a GIF entry. */
export interface GifEntry {
  id: string;
  url: string;
  preview?: string;
  width?: number;
  height?: number;
  title?: string;
}
