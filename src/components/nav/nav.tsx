import { token } from "../../tokens/utils";
import type { NavConfig, NavItemConfig } from "./nav.schema";

interface NavProps {
  config: NavConfig;
  currentPath?: string;
  onNavigate: (path: string) => void;
  userRoles?: string[];
}

/**
 * Config-driven navigation component.
 * Supports horizontal/vertical orientation, role-based visibility,
 * badges, and nested sub-items.
 */
export function Nav({ config, currentPath, onNavigate, userRoles }: NavProps) {
  const isVertical = config.orientation === "vertical";

  const visibleItems = config.items.filter((item) => isItemVisible(item, userRoles));

  return (
    <nav
      className={config.className}
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        gap: isVertical ? token("spacing.1") : token("spacing.1"),
      }}
    >
      {visibleItems.map((item) => (
        <NavItem
          key={item.path}
          item={item}
          isActive={currentPath === item.path || currentPath?.startsWith(item.path + "/") === true}
          isVertical={isVertical}
          onNavigate={onNavigate}
          userRoles={userRoles}
        />
      ))}
    </nav>
  );
}

function NavItem({
  item,
  isActive,
  isVertical,
  onNavigate,
  userRoles,
}: {
  item: NavItemConfig;
  isActive: boolean;
  isVertical: boolean;
  onNavigate: (path: string) => void;
  userRoles?: string[];
}) {
  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: token("spacing.2"),
    padding: isVertical
      ? `${token("spacing.2")} ${token("spacing.3")}`
      : `${token("spacing.1.5")} ${token("spacing.3")}`,
    borderRadius: token("radius.md"),
    fontSize: token("typography.fontSize.sm"),
    fontWeight: isActive
      ? token("typography.fontWeight.medium")
      : token("typography.fontWeight.normal"),
    color: isActive ? token("colors.foreground") : token("colors.muted-foreground"),
    backgroundColor: isActive ? token("colors.accent") : "transparent",
    cursor: "pointer",
    border: "none",
    textDecoration: "none",
    width: isVertical ? "100%" : undefined,
    textAlign: "left" as const,
  };

  return (
    <div>
      <button style={baseStyle} onClick={() => onNavigate(item.path)}>
        {item.icon && <span>{item.icon}</span>}
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge != null && (
          <span
            style={{
              fontSize: token("typography.fontSize.xs"),
              backgroundColor: token("colors.primary"),
              color: token("colors.primary-foreground"),
              borderRadius: token("radius.full"),
              padding: `${token("spacing.0.5")} ${token("spacing.1.5")}`,
              lineHeight: "1",
            }}
          >
            {item.badge}
          </span>
        )}
      </button>

      {item.children && item.children.length > 0 && (
        <div
          style={{
            paddingLeft: token("spacing.4"),
            display: "flex",
            flexDirection: "column",
            gap: token("spacing.0.5"),
          }}
        >
          {item.children
            .filter((child) => isItemVisible(child, userRoles))
            .map((child) => (
              <button
                key={child.path}
                style={{
                  ...baseStyle,
                  fontSize: token("typography.fontSize.xs"),
                  padding: `${token("spacing.1.5")} ${token("spacing.3")}`,
                }}
                onClick={() => onNavigate(child.path)}
              >
                {child.icon && <span>{child.icon}</span>}
                <span>{child.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function isItemVisible(item: { roles?: string[] }, userRoles?: string[]): boolean {
  if (!item.roles || item.roles.length === 0) return true;
  if (!userRoles) return false;
  return item.roles.some((r) => userRoles.includes(r));
}
