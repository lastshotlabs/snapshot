"use client";

import { useSubscribe } from "../../../context/index";
import { resolveRuntimeLocale, resolveTRef } from "../../../i18n/resolve";
import { isTRef, type I18nConfig, type TRef } from "../../../i18n/schema";
import { useManifestRuntime } from "../../../manifest/runtime";
import { useActionExecutor } from "../../../actions/executor";
import { NavUserMenuBase } from "./standalone";
import type { NavUserMenuBaseItem } from "./standalone";
import type { NavUserMenuConfig } from "./types";

type NavUserMenuItem = NonNullable<NavUserMenuConfig["items"]>[number];

function resolveMenuText(
  value: string | TRef,
  locale: string | undefined,
  i18n: I18nConfig | undefined,
): string {
  if (typeof value === "string") {
    return value;
  }

  if (isTRef(value)) {
    return resolveTRef(value, locale, i18n);
  }

  return "";
}

export function NavUserMenu({ config }: { config: NavUserMenuConfig }) {
  const manifest = useManifestRuntime();
  const rawUser = useSubscribe({ from: "global.user" });
  const localeState = useSubscribe({ from: "global.locale" });
  const user = rawUser as {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    roles?: string[];
  } | null;
  const execute = useActionExecutor();
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);

  if (!user) {
    return null;
  }

  const userRoles = [...(user.role ? [user.role] : []), ...(user.roles ?? [])];
  const menuItems: NavUserMenuBaseItem[] = (config.items ?? [])
    .filter((item: NavUserMenuItem) =>
      item.roles?.length
        ? item.roles.some((role: string) => userRoles.includes(role))
        : true,
    )
    .map((item: NavUserMenuItem) => ({
      label: resolveMenuText(item.label, activeLocale, manifest?.raw.i18n),
      icon: item.icon,
      onClick: () => {
        void execute(item.action as Parameters<typeof execute>[0]);
      },
    }));

  return (
    <NavUserMenuBase
      id={config.id}
      mode={config.mode}
      showAvatar={config.showAvatar}
      showName={config.showName}
      showEmail={config.showEmail}
      userName={user.name}
      userEmail={user.email}
      userAvatar={user.avatar}
      items={menuItems}
      className={config.className}
      style={config.style}
      slots={config.slots}
    />
  );
}
