"use client";

import { useSubscribe } from "../../../context/hooks";
import { useManifestRuntime } from "../../../manifest/runtime";
import { useActionExecutor } from "../../../actions/executor";
import { NavLogoBase } from "./standalone";
import type { NavLogoConfig } from "./types";

export function NavLogo({
  config,
  onNavigate,
}: {
  config: NavLogoConfig;
  onNavigate?: (path: string) => void;
}) {
  const manifest = useManifestRuntime();
  const execute = useActionExecutor();

  const text = useSubscribe(config.text) as string | undefined;
  const path = config.path ?? manifest?.app?.home ?? "/";
  const resolvedText = text ?? manifest?.app?.title;

  const handleNavigate = (navPath: string) => {
    if (onNavigate) {
      onNavigate(navPath);
      return;
    }
    void execute({ type: "navigate", to: navPath } as Parameters<
      typeof execute
    >[0]);
  };

  return (
    <NavLogoBase
      id={config.id}
      text={resolvedText}
      src={config.src}
      path={path}
      logoHeight={config.logoHeight}
      onNavigate={handleNavigate}
      className={config.className}
      style={config.style}
      slots={config.slots}
    />
  );
}
