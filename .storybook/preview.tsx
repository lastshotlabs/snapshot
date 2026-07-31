import React from "react";
import type { Preview } from "@storybook/react-vite";
import "../playground/src/styles.css";
import "../src/ui/components/__stories__/storybook.css";

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    layout: "fullscreen",
    viewport: {
      options: {
        mobile: {
          name: "Mobile",
          styles: { width: "375px", height: "667px" },
          type: "mobile" as const,
        },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
          type: "tablet" as const,
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1280px", height: "900px" },
          type: "desktop" as const,
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "light";
      return (
        <div
          data-theme={theme}
          className={theme === "dark" ? "snapshot-storybook--dark" : ""}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
