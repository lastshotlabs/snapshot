import type { NavConfig } from "./schema";
import { useNav } from "./hook";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { ResolvedNavItem, AuthUser } from "./types";

/** Props for the Nav component. */
interface NavComponentProps {
  /** Nav configuration from the manifest. */
  config: NavConfig;
  /** Current URL pathname for active route detection. */
  pathname?: string;
  /** Callback when a nav item is clicked. */
  onNavigate?: (path: string) => void;
}

/**
 * Renders a single nav item with active indicator, icon, badge, and children.
 */
function NavItem({
  item,
  onNavigate,
}: {
  item: ResolvedNavItem;
  onNavigate?: (path: string) => void;
}) {
  if (!item.isVisible) return null;

  const handleClick = () => {
    if (item.path && onNavigate) {
      onNavigate(item.path);
    }
  };

  return (
    <li data-nav-item="" data-active={item.isActive ? "true" : undefined}>
      <button
        type="button"
        onClick={handleClick}
        data-nav-link=""
        aria-current={item.isActive ? "page" : undefined}
        aria-expanded={
          item.children && item.children.length > 0 ? true : undefined
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          width: "100%",
          padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
          border: "none",
          background: item.isActive
            ? "var(--sn-nav-active-background, var(--sn-color-accent))"
            : "transparent",
          color: item.isActive
            ? "var(--sn-nav-active-foreground, var(--sn-color-accent-foreground))"
            : "inherit",
          borderRadius: "var(--sn-radius-md, 0.375rem)",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          fontFamily: "inherit",
          transition:
            "background var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
        }}
      >
        {item.icon && (
          <span data-nav-icon="" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span
          data-nav-label=""
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </span>
        {item.resolvedBadge !== null && item.resolvedBadge > 0 && (
          <span
            data-nav-badge=""
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "1.25rem",
              height: "1.25rem",
              padding: "0 0.375rem",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              fontWeight: 600,
              borderRadius: "var(--sn-radius-full, 9999px)",
              background: "var(--sn-color-primary)",
              color: "var(--sn-color-primary-foreground)",
            }}
          >
            {item.resolvedBadge}
          </span>
        )}
      </button>
      {item.children && item.children.length > 0 && (
        <ul
          data-nav-children=""
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            paddingLeft: "var(--sn-spacing-md, 0.75rem)",
          }}
        >
          {item.children.map((child, index) => (
            <NavItem
              key={child.path ?? index}
              item={child}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Renders a user menu section with avatar, name, and optional email.
 */
function UserMenu({
  user,
  config,
}: {
  user: AuthUser;
  config: NavConfig["userMenu"];
}) {
  const execute = useActionExecutor();
  const showAvatar =
    typeof config === "object" ? (config.showAvatar ?? true) : true;
  const showEmail =
    typeof config === "object" ? (config.showEmail ?? false) : false;
  const menuItems = typeof config === "object" ? (config.items ?? []) : [];

  return (
    <div
      data-nav-user-menu=""
      style={{
        borderTop: "1px solid var(--sn-color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          padding: "var(--sn-spacing-md, 0.75rem)",
        }}
      >
        {showAvatar && (
          <span
            data-nav-avatar=""
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2rem",
              height: "2rem",
              borderRadius: "var(--sn-radius-full, 9999px)",
              background: "var(--sn-color-muted)",
              color: "var(--sn-color-muted-foreground)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              fontWeight: 600,
              overflow: "hidden",
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name ?? "User"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              (user.name?.charAt(0)?.toUpperCase() ?? "U")
            )}
          </span>
        )}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {user.name && (
            <div
              data-nav-user-name=""
              style={{
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
          )}
          {showEmail && user.email && (
            <div
              data-nav-user-email=""
              style={{
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                color: "var(--sn-color-muted-foreground)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          )}
        </div>
      </div>
      {menuItems.length > 0 && (
        <ul
          data-nav-user-items=""
          style={{
            listStyle: "none",
            margin: 0,
            padding:
              "0 var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-sm, 0.5rem)",
          }}
        >
          {menuItems.map((item, i) => (
            <li key={item.label ?? i}>
              <button
                type="button"
                data-nav-user-action=""
                onClick={() => {
                  void execute(item.action as Parameters<typeof execute>[0]);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  width: "100%",
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 0.75rem)",
                  border: "none",
                  background: "transparent",
                  color: "inherit",
                  borderRadius: "var(--sn-radius-md, 0.375rem)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  fontFamily: "inherit",
                  transition: `background var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)`,
                }}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Nav component renders navigation items with active state detection,
 * role-based visibility, badge counts, mobile collapse, and user menu.
 *
 * Uses the `useNav` headless hook for all logic. Renders semantic HTML
 * with design token-based styling.
 *
 * @param props - Nav configuration, pathname, and navigation callback
 */
export function Nav({ config, pathname, onNavigate }: NavComponentProps) {
  const currentPath =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const { items, isCollapsed, toggle, user } = useNav(config, currentPath);
  const showUserMenu =
    config.userMenu !== false && config.userMenu !== undefined;

  return (
    <nav
      aria-label="Main navigation"
      data-snapshot-component="nav"
      data-collapsed={isCollapsed ? "true" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Logo / Brand */}
      {config.logo && (
        <div
          data-nav-logo=""
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-sm, 0.5rem)",
            padding: "var(--sn-spacing-md, 0.75rem)",
            borderBottom: "1px solid var(--sn-color-border)",
            cursor: config.logo.path ? "pointer" : undefined,
          }}
          onClick={() => {
            if (config.logo?.path && onNavigate) {
              onNavigate(config.logo.path);
            }
          }}
          onKeyDown={(e) => {
            if (
              (e.key === "Enter" || e.key === " ") &&
              config.logo?.path &&
              onNavigate
            ) {
              e.preventDefault();
              onNavigate(config.logo.path);
            }
          }}
          role={config.logo.path ? "link" : undefined}
          tabIndex={config.logo.path ? 0 : undefined}
        >
          {config.logo.src && (
            <img
              src={config.logo.src}
              alt={config.logo.text ?? "Logo"}
              style={{ height: "var(--sn-spacing-lg, 1.5rem)", width: "auto" }}
            />
          )}
          {config.logo.text && (
            <span
              style={{
                fontSize: "var(--sn-font-size-lg, 1.125rem)",
                fontWeight: 600,
              }}
            >
              {config.logo.text}
            </span>
          )}
        </div>
      )}

      {/* Mobile toggle button */}
      {config.collapsible !== false && (
        <button
          type="button"
          data-nav-toggle=""
          onClick={toggle}
          aria-label={isCollapsed ? "Open navigation" : "Close navigation"}
          style={{
            display: "none", // shown via media query
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--sn-spacing-sm, 0.5rem)",
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {isCollapsed ? "\u2630" : "\u2715"}
        </button>
      )}

      {/* Nav items */}
      <ul
        data-nav-items=""
        style={{
          listStyle: "none",
          margin: 0,
          padding: "var(--sn-spacing-sm, 0.5rem)",
          flex: 1,
          overflow: "auto",
        }}
      >
        {items
          .filter((item) => item.isVisible)
          .map((item, index) => (
            <NavItem
              key={item.path ?? index}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
      </ul>

      {/* User menu */}
      {showUserMenu && user && (
        <UserMenu user={user} config={config.userMenu} />
      )}

      <style>{`
        [data-snapshot-component="nav"] button[data-nav-link]:hover {
          background: var(--sn-color-accent, var(--sn-color-muted));
        }
        [data-snapshot-component="nav"] button[data-nav-link]:focus {
          outline: none;
        }
        [data-snapshot-component="nav"] button[data-nav-link]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        [data-snapshot-component="nav"] [data-nav-logo][role="link"]:focus {
          outline: none;
        }
        [data-snapshot-component="nav"] [data-nav-logo][role="link"]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        [data-snapshot-component="nav"] [data-nav-user-menu]:focus {
          outline: none;
        }
        [data-snapshot-component="nav"] [data-nav-user-menu]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        [data-snapshot-component="nav"] [data-nav-toggle]:focus {
          outline: none;
        }
        [data-snapshot-component="nav"] [data-nav-toggle]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        [data-snapshot-component="nav"] [data-nav-user-action]:hover {
          background: var(--sn-color-accent, var(--sn-color-muted));
        }
        [data-snapshot-component="nav"] [data-nav-user-action]:focus {
          outline: none;
        }
        [data-snapshot-component="nav"] [data-nav-user-action]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        @media (max-width: 768px) {
          [data-nav-toggle] {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}
