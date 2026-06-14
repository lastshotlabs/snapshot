// Subpath entry: `@lastshotlabs/snapshot/ui/markdown`.
// Standalone markdown renderer. Pulls react-markdown + rehype-highlight +
// highlight.js + remark-gfm via its own dist chunk so callers that don't
// render markdown never pay for those deps.
export { MarkdownBase } from "./components/content/markdown/standalone";
export type { MarkdownBaseProps } from "./components/content/markdown/standalone";
