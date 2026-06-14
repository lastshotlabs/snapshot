/**
 * Generate a CSS string that bridges Snapshot's --sn-* design tokens
 * to Tailwind CSS v4 @theme variables.
 *
 * This allows app code to use className: "bg-primary text-foreground"
 * with values driven by the token system.
 */
export function generateTailwindBridge(): string {
  return `@import "tailwindcss";

@theme {
  --color-background: var(--sn-color-background);
  --color-foreground: var(--sn-color-foreground);
  --color-card: var(--sn-color-card);
  --color-card-foreground: var(--sn-color-card-foreground);
  --color-popover: var(--sn-color-popover, var(--sn-color-card));
  --color-popover-foreground: var(--sn-color-popover-foreground, var(--sn-color-card-foreground));
  --color-primary: var(--sn-color-primary);
  --color-primary-foreground: var(--sn-color-primary-foreground);
  --color-secondary: var(--sn-color-secondary);
  --color-secondary-foreground: var(--sn-color-secondary-foreground);
  --color-muted: var(--sn-color-muted);
  --color-muted-foreground: var(--sn-color-muted-foreground);
  --color-accent: var(--sn-color-accent);
  --color-accent-foreground: var(--sn-color-accent-foreground);
  --color-destructive: var(--sn-color-destructive);
  --color-destructive-foreground: var(--sn-color-destructive-foreground);
  --color-success: var(--sn-color-success);
  --color-success-foreground: var(--sn-color-success-foreground);
  --color-warning: var(--sn-color-warning);
  --color-warning-foreground: var(--sn-color-warning-foreground);
  --color-info: var(--sn-color-info);
  --color-info-foreground: var(--sn-color-info-foreground);
  --color-border: var(--sn-color-border);
  --color-input: var(--sn-color-input);
  --color-ring: var(--sn-color-ring);
  --color-sidebar: var(--sn-color-sidebar);
  --color-sidebar-foreground: var(--sn-color-sidebar-foreground);
  --color-chart-1: var(--sn-chart-1);
  --color-chart-2: var(--sn-chart-2);
  --color-chart-3: var(--sn-chart-3);
  --color-chart-4: var(--sn-chart-4);
  --color-chart-5: var(--sn-chart-5);
  --radius-none: var(--sn-radius-none);
  --radius-xs: var(--sn-radius-xs);
  --radius-sm: var(--sn-radius-sm);
  --radius-md: var(--sn-radius-md);
  --radius-lg: var(--sn-radius-lg);
  --radius-xl: var(--sn-radius-xl);
  --radius-full: var(--sn-radius-full);
  --spacing-2xs: var(--sn-spacing-2xs);
  --spacing-xs: var(--sn-spacing-xs);
  --spacing-sm: var(--sn-spacing-sm);
  --spacing-md: var(--sn-spacing-md);
  --spacing-lg: var(--sn-spacing-lg);
  --spacing-xl: var(--sn-spacing-xl);
  --spacing-2xl: var(--sn-spacing-2xl);
  --spacing-3xl: var(--sn-spacing-3xl);
  --font-sans: var(--sn-font-sans);
  --font-mono: var(--sn-font-mono);
  --font-display: var(--sn-font-display);
  --text-xs: var(--sn-font-size-xs);
  --text-sm: var(--sn-font-size-sm);
  --text-base: var(--sn-font-size-md);
  --text-lg: var(--sn-font-size-lg);
  --text-xl: var(--sn-font-size-xl);
  --text-2xl: var(--sn-font-size-2xl);
  --text-3xl: var(--sn-font-size-3xl);
  --text-4xl: var(--sn-font-size-4xl);
  --font-weight-light: var(--sn-font-weight-light);
  --font-weight-normal: var(--sn-font-weight-normal);
  --font-weight-medium: var(--sn-font-weight-medium);
  --font-weight-semibold: var(--sn-font-weight-semibold);
  --font-weight-bold: var(--sn-font-weight-bold);
  --tracking-tight: var(--sn-tracking-tight);
  --tracking-normal: var(--sn-tracking-normal);
  --tracking-wide: var(--sn-tracking-wide);
  --leading-none: var(--sn-leading-none);
  --leading-tight: var(--sn-leading-tight);
  --leading-normal: var(--sn-leading-normal);
  --leading-relaxed: var(--sn-leading-relaxed);
  --leading-loose: var(--sn-leading-loose);
  --shadow-none: var(--sn-shadow-none);
  --shadow-xs: var(--sn-shadow-xs);
  --shadow-sm: var(--sn-shadow-sm);
  --shadow-md: var(--sn-shadow-md);
  --shadow-lg: var(--sn-shadow-lg);
  --shadow-xl: var(--sn-shadow-xl);
  --border-width-none: var(--sn-border-none);
  --border-width-thin: var(--sn-border-thin);
  --border-width-default: var(--sn-border-default);
  --border-width-thick: var(--sn-border-thick);
  --container-xs: var(--sn-container-xs);
  --container-sm: var(--sn-container-sm);
  --container-md: var(--sn-container-md);
  --container-lg: var(--sn-container-lg);
  --container-xl: var(--sn-container-xl);
  --container-2xl: var(--sn-container-2xl);
  --container-prose: var(--sn-container-prose);
  --ease-default: var(--sn-ease-default);
  --ease-in: var(--sn-ease-in);
  --ease-out: var(--sn-ease-out);
  --ease-in-out: var(--sn-ease-in-out);
  --ease-spring: var(--sn-ease-spring);
  --duration-instant: var(--sn-duration-instant);
  --duration-fast: var(--sn-duration-fast);
  --duration-normal: var(--sn-duration-normal);
  --duration-slow: var(--sn-duration-slow);
  --z-base: var(--sn-z-index-base);
  --z-dropdown: var(--sn-z-index-dropdown);
  --z-sticky: var(--sn-z-index-sticky);
  --z-overlay: var(--sn-z-index-overlay);
  --z-modal: var(--sn-z-index-modal);
  --z-popover: var(--sn-z-index-popover);
  --z-toast: var(--sn-z-index-toast);
}
`;
}
