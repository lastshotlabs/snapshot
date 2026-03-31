import { token } from "../../tokens/utils";
import type { SidebarLayoutConfig } from "./sidebar.schema";

export function SidebarLayout({
  config,
  sidebarChildren,
  contentChildren,
}: {
  config: SidebarLayoutConfig;
  sidebarChildren?: React.ReactNode;
  contentChildren?: React.ReactNode;
}) {
  const sidebarWidth = config.sidebarWidth ?? "280px";
  const isRight = config.sidebarPosition === "right";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isRight ? "row-reverse" : "row",
    gap: config.gap ? token(`spacing.${config.gap}`) : token("spacing.6"),
    minHeight: "100%",
  };

  const sidebarStyle: React.CSSProperties = {
    width: sidebarWidth,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  return (
    <div style={containerStyle} className={config.className}>
      <aside style={sidebarStyle}>{sidebarChildren}</aside>
      <main style={contentStyle}>{contentChildren}</main>
    </div>
  );
}
