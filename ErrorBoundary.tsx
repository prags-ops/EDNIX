import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="max-w-md w-full glass-card p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-rose-600 dark:text-rose-400" size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The intelligence core encountered an unexpected state. This has been logged for recovery.
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-left overflow-auto max-h-32">
                <code className="text-xs text-rose-500 font-mono">{this.state.error.message}</code>
              </div>
            )}
            <div className="flex gap-4">
               <button 
                onClick={() => window.location.href = '/'}
                className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-200 dark:bg-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-300 transition-all text-slate-900 dark:text-white"
               >
                 <Home size={16} /> Home
               </button>
               <button 
                onClick={() => this.setState({ hasError: false })}
                className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
               >
                 <RefreshCw size={16} /> Retry
               </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
