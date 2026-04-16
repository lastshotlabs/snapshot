import type { EditorView } from "@codemirror/view";
/**
 * A toolbar item definition for the rich text editor.
 */
export interface ToolbarItem {
    /** Unique name matching the schema enum. */
    name: string;
    /** Lucide icon name from the Icon component. */
    icon: string;
    /** Human-readable label for accessibility. */
    label: string;
    /** Optional keyboard shortcut display string. */
    shortcut?: string;
    /** Whether this is an action button or a visual separator. */
    type: "action" | "separator";
    /** Prefix/suffix to wrap around the selection. */
    wrap?: [string, string];
}
/** All available toolbar items indexed by name. */
export declare const TOOLBAR_ITEMS: Record<string, ToolbarItem>;
/** Default toolbar items in order. */
export declare const DEFAULT_TOOLBAR: string[];
/**
 * Applies a toolbar action to a CodeMirror EditorView by wrapping or
 * prepending the current selection with the specified prefix/suffix.
 *
 * For line-prefix actions (headings, lists, quotes) the prefix is inserted
 * at the beginning of the line. For wrap actions (bold, italic, code) the
 * prefix and suffix surround the selection.
 *
 * @param view - The CodeMirror EditorView instance
 * @param item - The toolbar item to apply
 */
export declare function applyToolbarAction(view: EditorView, item: ToolbarItem): void;
