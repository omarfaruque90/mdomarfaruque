import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep this log: it's essential for debugging white-screen issues.
    console.error("App crashed:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-xl w-full glass rounded-2xl p-6">
          <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground mt-2">
            The app hit a runtime error on this device/session. Please reload. If it continues,
            the error details will show below.
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={this.handleReload}>Reload</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(this.state.error?.stack || this.state.error?.message || "")}
              >Copy error</Button>
          </div>
          <pre className="mt-4 text-xs bg-secondary/50 rounded-lg p-3 overflow-auto max-h-64">
            {this.state.error?.stack || this.state.error?.message}
          </pre>
        </div>
      </div>
    );
  }
}
