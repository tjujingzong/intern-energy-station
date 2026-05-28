import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  err: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error('[AppErrorBoundary]', err, info);
  }

  reset = () => this.setState({ err: null });

  render() {
    if (this.state.err) {
      return (
        <div className="card border-rose-200 bg-rose-50 text-rose-700">
          <div className="font-semibold mb-2">页面渲染异常</div>
          <pre className="text-xs whitespace-pre-wrap break-all">
            {String(this.state.err?.stack || this.state.err)}
          </pre>
          <div className="mt-3 flex gap-2">
            <button
              className="btn-primary"
              onClick={() => {
                try {
                  localStorage.removeItem('ies_data');
                  localStorage.removeItem('ies_auth');
                } catch {
                  /* ignore */
                }
                location.reload();
              }}
            >
              清除本地数据并刷新
            </button>
            <button className="btn-ghost" onClick={this.reset}>
              重试
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
