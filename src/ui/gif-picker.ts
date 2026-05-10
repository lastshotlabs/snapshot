// Subpath entry: `@lastshotlabs/snapshot/ui/gif-picker`.
//
// Standalone GIF picker UI. Backend-agnostic — the picker's
// `onSearchChange` / `gifs` / `loading` props let the consumer wire
// any GIF provider (slingshot-gifs, a custom search endpoint, a
// static gallery). Use this subpath when only the GIF UI is needed.
export {
  GifPicker,
  GifPickerBase,
  gifPickerConfigSchema,
} from "./components/communication/gif-picker/index";
export type {
  GifPickerConfig,
  GifPickerBaseProps,
  GifEntry,
} from "./components/communication/gif-picker/index";
