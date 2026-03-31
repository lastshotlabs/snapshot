import { token } from "../../tokens/utils";
import type { CardConfig } from "./card.schema";

export function Card({ config, children }: { config: CardConfig; children?: React.ReactNode }) {
  const style: React.CSSProperties = {
    padding: token(`spacing.${config.padding ?? "6"}`),
    borderRadius: token(`radius.${config.radius ?? "lg"}`),
    boxShadow: config.shadow ? token(`shadows.${config.shadow}`) : token("shadows.sm"),
    backgroundColor: token("colors.card"),
    color: token("colors.card-foreground"),
    border: `1px solid ${token("colors.border")}`,
  };

  return (
    <div style={style} className={config.className}>
      {config.title && (
        <div
          style={{
            fontSize: token("typography.fontSize.lg"),
            fontWeight: token("typography.fontWeight.semibold"),
            marginBottom: config.description ? token("spacing.1") : token("spacing.4"),
          }}
        >
          {config.title}
        </div>
      )}
      {config.description && (
        <div
          style={{
            fontSize: token("typography.fontSize.sm"),
            color: token("colors.muted-foreground"),
            marginBottom: token("spacing.4"),
          }}
        >
          {config.description}
        </div>
      )}
      {children}
    </div>
  );
}
