
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('StoryStream caught an error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-8">
          <div className="space-y-6 max-w-md">
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 space-y-4">
              <div className="flex justify-center">
                <div className="bg-red-500/20 p-4 rounded-full">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-red-300">שגיאה בלתי צפויה / Unexpected Error</h1>
              {this.state.error?.message && (
                <p className="text-sm text-slate-400 bg-slate-900 rounded-lg px-4 py-3 text-left font-mono break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-900/30"
            >
              <RefreshCw className="w-4 h-4" />
              נסה שוב / Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
