
/** Inferred config type from the EmojiPicker Zod schema. */
export type EmojiPickerConfig = Record<string, unknown>;

/** Shape of a single emoji entry. */
export interface EmojiEntry {
  native: string;
  name: string;
  keywords: string[];
}

/** Shape of an emoji category. */
export interface EmojiCategory {
  category: string;
  emojis: EmojiEntry[];
}
