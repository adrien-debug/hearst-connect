'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // Send to Sentry if available
    if (
      typeof window !== 'undefined' &&
      'Sentry' in window &&
      typeof (window as { Sentry?: { captureException: (err: Error, opts?: unknown) => void } })
        .Sentry?.captureException === 'function'
    ) {
      (
        window as { Sentry: { captureException: (err: Error, opts?: unknown) => void } }
      ).Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: 'var(--dashboard-page)' }}
        >
          <div
            className="flex max-w-md flex-col gap-6 rounded-2xl border p-8 text-center"
            style={{
              borderColor: 'var(--dashboard-border)',
              backgroundColor: 'var(--dashboard-surface)',
            }}
          >
            <div className="flex flex-col gap-2">
              <h1
                className="font-bold tracking-tight"
                style={{
                  color: 'var(--dashboard-text-primary)',
                  fontSize: 'var(--dashboard-text-2xl)',
                }}
              >
                Something went wrong
              </h1>
              <p
                className="leading-relaxed"
                style={{
                  color: 'var(--dashboard-text-muted)',
                  fontSize: 'var(--dashboard-text-sm)',
                }}
              >
                We encountered an unexpected error. Please refresh the page to continue.
              </p>
            </div>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary
                  className="cursor-pointer font-bold"
                  style={{
                    color: 'var(--dashboard-text-ghost)',
                    fontSize: 'var(--dashboard-text-xs)',
                  }}
                >
                  Error details
                </summary>
                <pre
                  className="mt-2 overflow-auto rounded-lg p-3"
                  style={{
                    color: 'var(--dashboard-text-muted)',
                    backgroundColor: 'var(--dashboard-overlay-02)',
                    fontSize: 'var(--dashboard-text-dense-sm)',
                  }}
                >
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="rounded-xl px-6 py-3 font-bold transition-all duration-150 hover:opacity-90"
              style={{
                backgroundColor: 'var(--dashboard-accent)',
                color: 'var(--dashboard-page)',
                fontSize: 'var(--dashboard-text-sm)',
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
