// Subpath entry: `@lastshotlabs/snapshot/ui/rich-input`.
//
// Importing from this subpath instead of the main `./ui` barrel avoids
// pulling the rest of the snapshot UI surface into your bundle when
// you only need the rich-text editor. The entry re-exports the
// standalone, manifest, schema, and mention-list types so a Composer
// implementation can use any of them without crossing the barrel.
export {
  RichInput,
  RichInputBase,
  DefaultMentionList,
  richInputConfigSchema,
} from "./components/content/rich-input/index";
export type {
  RichInputConfig,
  RichInputBaseProps,
  RichInputBaseHandle,
  MentionSuggestion,
  MentionListProps,
  MentionListHandle,
} from "./components/content/rich-input/index";
