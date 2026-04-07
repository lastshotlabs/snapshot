import { Component, Suspense } from "react";
import type { ErrorInfo, ReactNode } from "react";

/**
 * Props for ComponentWrapper.
 */
interface ComponentWrapperProps {
  /** The component type string (e.g. 'detail-card'). Applied as data-snapshot-component. */
  type: string;
  /** Optional CSS class name. */
  className?: string;
  /** Children to render. */
  children: ReactNode;
}

/**
 * Error boundary state.
 */
interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Error boundary that catches rendering errors in config-driven components
 * and displays a user-friendly error message instead of crashing the page.
 */
class ComponentErrorBoundary extends Component<
  { type: string; children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { type: string; children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      `[snapshot] Error in <${this.props.type}>:`,
      error,
      info.componentStack,
    );
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          data-snapshot-component={this.props.type}
          data-snapshot-error
          role="alert"
          style={{
            padding: "var(--sn-spacing-md, 1rem)",
            border: "1px solid var(--sn-color-danger, #ef4444)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            color: "var(--sn-color-danger, #ef4444)",
            backgroundColor: "var(--sn-color-danger-bg, #fef2f2)",
          }}
        >
          <strong>Error in {this.props.type}:</strong>{" "}
          {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Loading skeleton shown while a component is suspending.
 */
function ComponentSkeleton({ type }: { type: string }) {
  return (
    <div
      data-snapshot-component={type}
      data-snapshot-loading
      style={{
        padding: "var(--sn-spacing-md, 1rem)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        backgroundColor: "var(--sn-color-muted, #f1f5f9)",
        minHeight: "4rem",
        animation: "pulse 2s ease-in-out infinite",
      }}
    />
  );
}

/**
 * Shared wrapper for all config-driven components.
 * Provides: `data-snapshot-component` attribute for token scoping,
 * error boundary, and Suspense boundary.
 *
 * @param props - Wrapper props including type, className, and children
 */
export function ComponentWrapper({
  type,
  className,
  children,
}: ComponentWrapperProps) {
  return (
    <div data-snapshot-component={type} className={className}>
      <ComponentErrorBoundary type={type}>
        <Suspense fallback={<ComponentSkeleton type={type} />}>
          {children}
        </Suspense>
      </ComponentErrorBoundary>
    </div>
  );
}
