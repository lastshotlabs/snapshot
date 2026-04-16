import "./hljs-theme.css";
import type { CodeBlockConfig } from "./types";
/**
 * CodeBlock component — displays code with syntax highlighting,
 * optional line numbers, copy button, and title bar.
 *
 * Syntax highlighting is powered by highlight.js with colors mapped
 * to `--sn-*` design tokens (no stock hljs themes). Highlighting is
 * enabled by default and can be disabled via `highlight: false`.
 *
 * @param props - Component props containing the code block configuration
 *
 * @example
 * ```json
 * {
 *   "type": "code-block",
 *   "code": "console.log('hello');",
 *   "language": "javascript",
 *   "showLineNumbers": true,
 *   "title": "example.js"
 * }
 * ```
 */
export declare function CodeBlock({ config }: {
    config: CodeBlockConfig;
}): import("react/jsx-runtime").JSX.Element | null;
