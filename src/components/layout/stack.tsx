import { token } from "../../tokens/utils";
import type { StackConfig } from "./stack.schema";

const alignMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
};

export function Stack({ config, children }: { config: StackConfig; children?: React.ReactNode }) {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: config.gap ? token(`spacing.${config.gap}`) : undefined,
    alignItems: config.align ? alignMap[config.align] : undefined,
  };

  return (
    <div style={style} className={config.className}>
      {children}
    </div>
  );
}
