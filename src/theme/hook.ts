import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { useEffect } from "react";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  // `atomWithStorage` persists this value JSON-ENCODED (e.g. `"light"` with
  // quotes). Reading it as a raw string made `stored === "light"` always false,
  // so the atom fell back to the OS theme on every load — even when the user had
  // explicitly chosen light — producing a flash/revert to the system theme.
  // Parse it the same way it was written.
  const raw =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("snapshot-theme")
      : null;
  let stored: string | null = raw;
  if (raw && raw.charAt(0) === '"') {
    try {
      stored = JSON.parse(raw) as string;
    } catch {
      stored = raw;
    }
  }
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const themeAtom = atomWithStorage<Theme>("snapshot-theme", getInitialTheme());

// Inject a one-time style rule so we can suppress transitions during theme swap.
let styleInjected = false;
function ensureNoTransitionStyle() {
  if (styleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent =
    ".no-transition, .no-transition * { transition: none !important; }";
  document.head.appendChild(style);
  styleInjected = true;
}

/**
 * Bind the persisted theme to the document root.
 *
 * @returns Theme state and setters for the current app instance
 */
export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom);

  useEffect(() => {
    ensureNoTransitionStyle();
    const root = document.documentElement;

    // Suppress CSS transitions so hundreds of elements don't animate at once
    root.classList.add("no-transition");

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Re-enable after the browser has painted the new theme
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("no-transition");
      });
    });
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    set: (t: Theme) => setTheme(t),
  };
}
