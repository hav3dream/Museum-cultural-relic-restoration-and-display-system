import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** If true, show a compact inline error instead of full-page */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Compact inline error for per-route boundaries
      if (this.props.inline) {
        return (
          <div
            className="flex items-center justify-center min-h-[60vh] p-8"
            style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
          >
            <div className="flex flex-col items-center w-full max-w-lg p-8 text-center rounded-2xl"
              style={{ backgroundColor: 'rgba(127,50,34,0.04)', border: '1px solid rgba(127,50,34,0.12)' }}
            >
              <div
                className="w-14 h-14 mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(127,50,34,0.08)' }}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#7F3222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="text-lg mb-1" style={{ color: '#4A3428' }}>此功能暂时出错</h3>
              <p className="text-sm mb-5" style={{ color: '#7F3222', opacity: 0.6 }}>
                {this.state.error?.message || '发生了未知错误'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105"
                  style={{ backgroundColor: '#7F3222', color: '#E8E3D1', boxShadow: '0 2px 8px rgba(127,50,34,0.15)' }}
                >
                  重试
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105"
                  style={{ color: '#7F3222', border: '1px solid rgba(127,50,34,0.25)' }}
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Full-page error for the root boundary
      return (
        <div
          className="flex items-center justify-center min-h-screen p-8"
          style={{ backgroundColor: '#E8E3D1', fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
        >
          <div className="flex flex-col items-center w-full max-w-2xl p-8 text-center">
            <div
              className="w-20 h-20 mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(127,50,34,0.1)', border: '2px solid rgba(127,50,34,0.2)' }}
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#7F3222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h2 className="text-xl mb-2" style={{ color: '#4A3428' }}>
              页面出现了意外错误
            </h2>
            <p className="text-sm mb-6" style={{ color: '#7F3222', opacity: 0.7 }}>
              请尝试刷新页面，或返回首页
            </p>

            <div
              className="p-4 w-full rounded-xl overflow-auto mb-6 text-left"
              style={{ backgroundColor: 'rgba(74,52,40,0.06)', border: '1px solid rgba(74,52,40,0.1)' }}
            >
              <pre className="text-xs whitespace-break-spaces" style={{ color: '#4A3428', opacity: 0.6 }}>
                {this.state.error?.message}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: '#7F3222',
                  color: '#E8E3D1',
                  boxShadow: '0 4px 12px rgba(127,50,34,0.2)',
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                刷新页面
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: '#7F3222',
                  border: '1px solid rgba(127,50,34,0.3)',
                }}
              >
                返回首页
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
