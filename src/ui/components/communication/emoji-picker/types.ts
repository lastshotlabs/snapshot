import type { z } from "zod";
import type { emojiPickerConfigSchema } from "./schema";

/** Inferred config type from the EmojiPicker Zod schema. */
export type EmojiPickerConfig = z.infer<typeof emojiPickerConfigSchema>;

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
