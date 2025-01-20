import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Handle Chrome extension errors
    if (error.message.includes('Cannot read properties of null') && 
        error.stack?.includes('chrome-extension')) {
      // Ignore Chrome extension errors
      return;
    }

    // Handle Chrome extension errors
    if (error.message.includes('Cannot read properties of null')) {
      if (error.stack?.includes('chrome-extension')) {
        // Ignore Chrome extension errors
        return;
      }
    }

    // Handle initialization errors
    if (error.message.includes('Cannot read properties of null')) {
      this.setState({
        error: new Error('Application initialization failed. Please refresh the page.')
      });
      return;
    }

    // Handle specific errors
    if (error.message.includes('AudioContext')) {
      this.setState({
        error: new Error('Audio system error. Please refresh the page.')
      });
    } else if (error.message.includes('queue')) {
      this.setState({
        error: new Error('Application state error. Please refresh the page.')
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-white/70 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}