import { token } from "../../tokens/utils";
import type { BreadcrumbConfig, BreadcrumbItemConfig } from "./breadcrumb.schema";

interface BreadcrumbProps {
  config: BreadcrumbConfig;
  currentPath?: string;
  onNavigate: (path: string) => void;
}

/**
 * Config-driven breadcrumb trail.
 *
 * Can be auto-generated from the current path (splits on `/` and capitalizes segments)
 * or explicitly configured with items.
 */
export function Breadcrumb({ config, currentPath, onNavigate }: BreadcrumbProps) {
  const separator = config.separator ?? "/";

  const items: BreadcrumbItemConfig[] =
    config.items ??
    (config.autoGenerate !== false && currentPath ? generateFromPath(currentPath) : []);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={config.className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: token("spacing.1.5"),
        fontSize: token("typography.fontSize.sm"),
        color: token("colors.muted-foreground"),
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span
            key={i}
            style={{ display: "flex", alignItems: "center", gap: token("spacing.1.5") }}
          >
            {i > 0 && (
              <span style={{ color: token("colors.muted-foreground"), opacity: 0.5 }}>
                {separator}
              </span>
            )}
            {isLast || !item.path ? (
              <span
                style={{
                  color: isLast ? token("colors.foreground") : undefined,
                  fontWeight: isLast ? token("typography.fontWeight.medium") : undefined,
                }}
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.path!)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: token("colors.muted-foreground"),
                  fontSize: "inherit",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function generateFromPath(path: string): BreadcrumbItemConfig[] {
  const segments = path.replace(/^\//, "").split("/").filter(Boolean);
  const items: BreadcrumbItemConfig[] = [{ label: "Home", path: "/" }];

  let accumulated = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    accumulated += `/${seg}`;
    const label = seg.startsWith(":")
      ? seg.slice(1)
      : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    items.push({
      label,
      path: i < segments.length - 1 ? accumulated : undefined,
    });
  }

  return items;
}
