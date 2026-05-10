// Subpath entry: `@lastshotlabs/snapshot/ui/emoji-picker`.
//
// Pulls in the bundled emoji dataset (~100 KB) and the picker UI
// without forcing the rest of `./ui`. Use this when a Composer or
// reaction surface needs the picker but nothing else.
export {
  EmojiPicker,
  EmojiPickerBase,
  emojiPickerConfigSchema,
  parseShortcodes,
  buildEmojiMap,
  resolveEmojiRecords,
  CUSTOM_EMOJI_CSS,
} from "./components/communication/emoji-picker/index";
export type {
  EmojiPickerConfig,
  EmojiPickerBaseProps,
  CustomEmoji,
} from "./components/communication/emoji-picker/index";
