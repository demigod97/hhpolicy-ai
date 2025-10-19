import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Component:', this.props.componentName || 'Unknown');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-full bg-red-50 p-8">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Component Error: {this.props.componentName || 'Unknown'}
                </h2>
                <p className="text-gray-700 mb-4">
                  Something went wrong in this component. This is a development error that needs to be fixed.
                </p>

                {import.meta.env.DEV && this.state.error && (
                  <div className="mb-4">
                    <details className="bg-gray-100 rounded p-4">
                      <summary className="font-semibold cursor-pointer text-sm mb-2">
                        Error Details (Development Only)
                      </summary>
                      <div className="space-y-2">
                        <div>
                          <p className="font-mono text-xs text-red-600">
                            {this.state.error.message}
                          </p>
                        </div>
                        {this.state.error.stack && (
                          <div>
                            <p className="text-xs font-semibold mb-1">Stack:</p>
                            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                              {this.state.error.stack}
                            </pre>
                          </div>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <div>
                            <p className="text-xs font-semibold mb-1">Component Stack:</p>
                            <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button onClick={this.handleReset} variant="default">
                    Reload Page
                  </Button>
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
