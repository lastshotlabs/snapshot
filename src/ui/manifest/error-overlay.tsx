'use client';

import { ButtonControl } from "../components/forms/button";

interface ManifestErrorOverlayIssue {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}

/**
 * Development overlay for manifest validation and compilation errors.
 */
export function ManifestErrorOverlay({
  errors,
  manifestFile = "snapshot.manifest.json",
}: {
  errors: ManifestErrorOverlayIssue[];
  manifestFile?: string;
}) {
  return (
    <div
      data-snapshot-error-overlay=""
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        overflow: "auto",
        padding: "var(--sn-spacing-2xl, 3rem)",
        background:
          "color-mix(in oklch, var(--sn-color-background, #0b1020) 10%, black 90%)",
        color: "var(--sn-color-primary-foreground, #f8fafc)",
        fontFamily:
          "var(--sn-font-mono, ui-monospace, SFMono-Regular, monospace)",
      }}
    >
      <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--sn-spacing-md, 1rem)",
            marginBottom: "var(--sn-spacing-xl, 2rem)",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding:
                  "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem)",
                borderRadius: "var(--sn-radius-full, 9999px)",
                background:
                  "color-mix(in oklch, var(--sn-color-destructive, #ef4444) 25%, transparent)",
                color: "var(--sn-color-destructive, #f87171)",
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                fontWeight: "var(--sn-font-weight-semibold, 600)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Manifest Error
            </div>
            <h1
              style={{
                marginTop: "var(--sn-spacing-md, 1rem)",
                marginBottom: "var(--sn-spacing-xs, 0.25rem)",
                fontSize: "var(--sn-font-size-2xl, 1.5rem)",
              }}
            >
              {errors.length} validation error{errors.length === 1 ? "" : "s"}
            </h1>
            <p style={{ opacity: 0.8 }}>{manifestFile}</p>
          </div>
          <ButtonControl
            type="button"
            onClick={() => {
              if (typeof document === "undefined") {
                return;
              }
              document
                .querySelector("[data-snapshot-error-overlay]")
                ?.remove();
            }}
            variant="ghost"
            size="sm"
            style={{
              border: "var(--sn-border-thin, 1px) solid rgba(255,255,255,0.15)",
              borderRadius: "var(--sn-radius-md, 0.5rem)",
              background: "transparent",
              color: "inherit",
              padding:
                "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
              cursor: "pointer",
            }}
          >
            Dismiss
          </ButtonControl>
        </div>

        <div
          style={{
            display: "grid",
            gap: "var(--sn-spacing-md, 1rem)",
          }}
        >
          {errors.map((error, index) => (
            <div
              key={`${error.path}:${index}`}
              style={{
                padding: "var(--sn-spacing-lg, 1.5rem)",
                borderRadius: "var(--sn-radius-lg, 0.75rem)",
                border:
                  "var(--sn-border-thin, 1px) solid color-mix(in oklch, var(--sn-color-destructive, #ef4444) 35%, transparent)",
                background:
                  "color-mix(in oklch, var(--sn-color-destructive, #ef4444) 10%, transparent)",
              }}
            >
              <div
                style={{
                  marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                  color: "var(--sn-color-warning, #fbbf24)",
                  fontWeight: "var(--sn-font-weight-semibold, 600)",
                }}
              >
                {error.path || "(root)"}
              </div>
              <div>{error.message}</div>
              {error.expected ? (
                <div style={{ marginTop: "var(--sn-spacing-sm, 0.5rem)", opacity: 0.8 }}>
                  Expected: {error.expected}
                </div>
              ) : null}
              {error.received ? (
                <div style={{ marginTop: "var(--sn-spacing-2xs, 0.125rem)", opacity: 0.8 }}>
                  Received: {error.received}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "var(--sn-spacing-xl, 2rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
          }}
        >
          <a
            href="https://docs.lastshotlabs.com/snapshot/manifest"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--sn-color-info, #93c5fd)" }}
          >
            Manifest documentation
          </a>
        </div>
      </div>
    </div>
  );
}
