import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { resolveTokensToCSS } from "./resolve";
import type { TokenSet } from "./schema";

const STYLE_ID = "snapshot-tokens";

/**
 * Injects the token CSS into the document as a `<style>` element.
 * Updates when the token set changes. Cleans up on unmount.
 *
 * Place this near the root of your React tree, typically inside `QueryProvider`.
 *
 * @example
 * ```tsx
 * const tokens = createTokens({ categories: { colors: 'ocean' } })
 *
 * <TokenProvider tokens={tokens}>
 *   <App />
 * </TokenProvider>
 * ```
 */
export function TokenProvider({ tokens, children }: { tokens: TokenSet; children: ReactNode }) {
  const cssRef = useRef<string>("");

  useEffect(() => {
    const css = resolveTokensToCSS(tokens);

    // Skip DOM update if CSS hasn't changed
    if (css === cssRef.current) return;
    cssRef.current = css;

    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = css;

    return () => {
      // Only remove on full unmount, not on re-render
      const el = document.getElementById(STYLE_ID);
      if (el) el.remove();
    };
  }, [tokens]);

  return <>{children}</>;
}
