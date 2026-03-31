import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("snapshot-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const themeAtom = atomWithStorage<Theme>("snapshot-theme", getInitialTheme());

const STYLE_ID = "snapshot-no-transition";

export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom);
  const styleInjected = useRef(false);

  useEffect(() => {
    // Inject a one-time style rule so we can suppress transitions during theme swap
    if (!styleInjected.current && typeof document !== "undefined") {
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = ".no-transition, .no-transition * { transition: none !important; }";
        document.head.appendChild(style);
      }
      styleInjected.current = true;
    }

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
