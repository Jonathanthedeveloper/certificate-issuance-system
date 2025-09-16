import React, { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface AsyncStateProps {
  loading?: boolean;
  error?: Error | string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

export function AsyncState({
  loading,
  error,
  empty,
  emptyMessage = "No data found",
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (empty) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return <>{children}</>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Alert variant="destructive">
            <AlertDescription>
              Something went wrong. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}
