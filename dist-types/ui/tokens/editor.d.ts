/**
 * Runtime token editor hook.
 *
 * `useTokenEditor()` provides runtime overrides for design tokens via
 * `document.documentElement.style.setProperty()`. Changes are instant
 * and take priority over CSS file declarations (inline > class specificity).
 */
import type { TokenEditor } from "./types";
/**
 * React hook for runtime token editing.
 *
 * Provides setToken/setFlavor/resetTokens/getTokens/subscribe for live
 * theme customization. Changes are applied instantly via inline styles
 * on document.documentElement.
 *
 * @returns TokenEditor interface for runtime token manipulation
 */
export declare function useTokenEditor(): TokenEditor;
