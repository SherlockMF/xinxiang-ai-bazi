import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './styles.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="mx-auto max-w-lg p-10 text-center">
          <h1 className="font-display text-3xl">稍作停留</h1>
          <p className="my-6">页面暂时无法显示。请刷新重试，并确认浏览器允许本地存储。</p>
          <button className="button button-primary rounded-2xl px-6 py-3" onClick={() => location.reload()}>
            重新打开
          </button>
        </main>
      );
    return this.props.children;
  }
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
