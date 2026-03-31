import { token } from "../../tokens/utils";
import type { RowConfig } from "./row.schema";

const alignMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const justifyMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export function Row({ config, children }: { config: RowConfig; children?: React.ReactNode }) {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: config.gap ? token(`spacing.${config.gap}`) : undefined,
    alignItems: config.align ? alignMap[config.align] : undefined,
    justifyContent: config.justify ? justifyMap[config.justify] : undefined,
    flexWrap: config.wrap ? "wrap" : undefined,
  };

  return (
    <div style={style} className={config.className}>
      {children}
    </div>
  );
}
