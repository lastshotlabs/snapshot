/**
 * Frontend handler registry — resolves named references in manifests
 * to actual implementations at generation/runtime.
 *
 * Mirrors bunshot's HandlerRegistry with categorized handlers and
 * hierarchical parent/child composition.
 *
 * Categories:
 *   - component: Custom React components referenced by name in manifest
 *   - layout: Custom layout components
 *   - action: Custom actions beyond the built-in vocabulary
 *   - validator: Custom form field validators
 *   - formatter: Custom data display formatters
 *   - guard: Custom route guards / access checks
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type HandlerCategory =
  | "component"
  | "layout"
  | "action"
  | "validator"
  | "formatter"
  | "guard";

export type HandlerFactory<T = unknown> = (params?: Record<string, unknown>) => T;

export interface HandlerRef {
  handler: string;
  params?: Record<string, unknown>;
}

interface HandlerEntry {
  category: HandlerCategory;
  name: string;
  factory: HandlerFactory;
}

// ── Registry ─────────────────────────────────────────────────────────────────

export interface ManifestHandlerRegistry {
  /**
   * Register a handler under a category + name.
   * The factory receives optional params and returns the implementation.
   */
  register(category: HandlerCategory, name: string, factory: HandlerFactory): void;

  /**
   * Resolve a handler reference to its implementation.
   * Calls the factory with the ref's params.
   * Throws if not found.
   */
  resolve<T = unknown>(category: HandlerCategory, ref: HandlerRef | string): T;

  /**
   * Check if a handler exists in this registry or its parents.
   */
  has(category: HandlerCategory, name: string): boolean;

  /**
   * List all handler names for a category (including inherited).
   */
  list(category: HandlerCategory): string[];

  /**
   * List all categories that have at least one handler registered.
   */
  listCategories(): HandlerCategory[];

  /**
   * Create a child registry that inherits all handlers from this one.
   * Child can override parent handlers.
   */
  extend(): ManifestHandlerRegistry;
}

export function createManifestHandlerRegistry(
  parent?: ManifestHandlerRegistry,
): ManifestHandlerRegistry {
  const entries = new Map<string, HandlerEntry>();

  function entryKey(category: HandlerCategory, name: string): string {
    return `${category}:${name}`;
  }

  const registry: ManifestHandlerRegistry = {
    register(category, name, factory) {
      entries.set(entryKey(category, name), { category, name, factory });
    },

    resolve<T = unknown>(category: HandlerCategory, ref: HandlerRef | string): T {
      const name = typeof ref === "string" ? ref : ref.handler;
      const params = typeof ref === "string" ? undefined : ref.params;

      const key = entryKey(category, name);
      const entry = entries.get(key);
      if (entry) return entry.factory(params) as T;

      if (parent) return parent.resolve<T>(category, ref);

      throw new Error(
        `[snapshot] Handler "${name}" not found in category "${category}". ` +
          `Available: ${registry.list(category).join(", ") || "(none)"}`,
      );
    },

    has(category, name) {
      return entries.has(entryKey(category, name)) || (parent?.has(category, name) ?? false);
    },

    list(category) {
      const names = new Set<string>();
      for (const [, entry] of entries) {
        if (entry.category === category) names.add(entry.name);
      }
      if (parent) {
        for (const name of parent.list(category)) names.add(name);
      }
      return [...names].sort();
    },

    listCategories() {
      const cats = new Set<HandlerCategory>();
      for (const [, entry] of entries) cats.add(entry.category);
      if (parent) {
        for (const cat of parent.listCategories()) cats.add(cat);
      }
      return [...cats].sort() as HandlerCategory[];
    },

    extend() {
      return createManifestHandlerRegistry(registry);
    },
  };

  return registry;
}

// ── Built-in handlers ────────────────────────────────────────────────────────

/**
 * Creates a registry pre-loaded with all built-in handlers across categories.
 * Mirrors bunshot's builtinHandlers.ts pattern.
 */
export function createDefaultManifestRegistry(): ManifestHandlerRegistry {
  const registry = createManifestHandlerRegistry();

  // ── Components ─────────────────────────────────────────────────────────────
  // Built-in component types. The handler returns the component type name
  // (resolution to actual React component happens in the ComponentRegistry).
  const builtinComponents = [
    "row",
    "stack",
    "card",
    "sidebar-layout",
    "table",
    "detail",
    "stat-card",
    "feed",
    "chart",
    "form",
    "nav",
    "breadcrumb",
    "modal",
    "empty-state",
    "login",
    "register",
    "forgot-password",
  ];
  for (const name of builtinComponents) {
    registry.register("component", name, () => name);
  }

  // ── Layouts ────────────────────────────────────────────────────────────────
  const builtinLayouts = ["sidebar", "topnav", "full", "split"];
  for (const name of builtinLayouts) {
    registry.register("layout", name, () => name);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const builtinActions = [
    "navigate",
    "api",
    "open-modal",
    "close-modal",
    "refresh",
    "set-value",
    "download",
    "confirm",
    "toast",
  ];
  for (const name of builtinActions) {
    registry.register("action", name, () => name);
  }

  // ── Validators ─────────────────────────────────────────────────────────────
  registry.register(
    "validator",
    "required",
    () => (value: unknown) => (value != null && value !== "" ? null : "This field is required"),
  );

  registry.register("validator", "email", () => (value: unknown) => {
    if (typeof value !== "string") return "Invalid email";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : "Invalid email address";
  });

  registry.register("validator", "min-length", (params) => {
    const min = (params?.min as number) ?? 1;
    return (value: unknown) =>
      typeof value === "string" && value.length >= min ? null : `Minimum ${min} characters`;
  });

  registry.register("validator", "max-length", (params) => {
    const max = (params?.max as number) ?? 255;
    return (value: unknown) =>
      typeof value === "string" && value.length <= max ? null : `Maximum ${max} characters`;
  });

  registry.register("validator", "pattern", (params) => {
    const pattern = new RegExp((params?.pattern as string) ?? ".*");
    const message = (params?.message as string) ?? "Invalid format";
    return (value: unknown) => (typeof value === "string" && pattern.test(value) ? null : message);
  });

  // ── Guards ─────────────────────────────────────────────────────────────────
  registry.register("guard", "authenticated", () => "authenticated");
  registry.register("guard", "guest", () => "guest");

  // ── Formatters ─────────────────────────────────────────────────────────────
  registry.register(
    "formatter",
    "date",
    () => (value: unknown) =>
      value != null ? new Date(value as string | number).toLocaleDateString() : "—",
  );

  registry.register(
    "formatter",
    "datetime",
    () => (value: unknown) =>
      value != null ? new Date(value as string | number).toLocaleString() : "—",
  );

  registry.register("formatter", "currency", (params) => {
    const currency = (params?.currency as string) ?? "USD";
    const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency });
    return (value: unknown) => (value != null ? fmt.format(value as number) : "—");
  });

  registry.register("formatter", "number", () => {
    const fmt = new Intl.NumberFormat();
    return (value: unknown) => (value != null ? fmt.format(value as number) : "—");
  });

  registry.register("formatter", "percent", (params) => {
    const decimals = (params?.decimals as number) ?? 1;
    return (value: unknown) => (value != null ? `${(value as number).toFixed(decimals)}%` : "—");
  });

  registry.register("formatter", "relative-time", () => (value: unknown) => {
    if (value == null) return "—";
    const date = new Date(value as string | number);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  });

  registry.register("formatter", "truncate", (params) => {
    const maxLength = (params?.maxLength as number) ?? 50;
    return (value: unknown) => {
      if (value == null) return "—";
      const str = String(value);
      return str.length > maxLength ? str.slice(0, maxLength) + "…" : str;
    };
  });

  registry.register("formatter", "boolean", () => (value: unknown) => (value ? "Yes" : "No"));

  registry.register(
    "formatter",
    "json",
    () => (value: unknown) => (value != null ? JSON.stringify(value, null, 2) : "—"),
  );

  return registry;
}
