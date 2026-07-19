import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-card p-6 border border-red-500/20 bg-red-950/10 rounded-2xl my-4 text-left shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/15 rounded-xl text-red-400">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-red-400">
                  Component Error Sheltered
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  An unexpected failure occurred while rendering this interface module. The error has been isolated to prevent a full-application crash.
                </p>
              </div>

              {this.state.error && (
                <div className="p-3 bg-black/45 rounded-xl border border-white/5 font-mono text-[10px] text-red-300 overflow-x-auto max-w-full">
                  <span className="font-bold">{this.state.error.toString()}</span>
                </div>
              )}

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-300 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg border border-red-500/20 transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                Attempt Recovery
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
